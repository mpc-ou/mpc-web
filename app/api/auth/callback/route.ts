import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { prisma } from "@/configs/prisma/db";
import { createClientSsr } from "@/configs/supabase/server";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a unique slug from an email address (same logic as the admin helper).
 * Keeps only lowercase alphanumeric chars from the email prefix.
 * Appends a random 3-digit suffix if the base is already taken.
 */
async function generateUniqueSlug(email: string): Promise<string> {
  const base =
    email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "member";

  const taken = await prisma.member.findUnique({ where: { slug: base } });
  if (!taken) return base;

  for (let i = 0; i < 20; i++) {
    const suffix = Math.floor(Math.random() * 900 + 100).toString();
    const candidate = `${base}${suffix}`;
    const exists = await prisma.member.findUnique({ where: { slug: candidate } });
    if (!exists) return candidate;
  }
  return `${base}${Date.now().toString().slice(-6)}`;
}

/**
 * Parse Google user_metadata into firstName / lastName.
 * Google may provide full_name (e.g. "Nguyễn Văn An") or separate given/family fields.
 * Vietnamese convention: last token = tên (given name), rest = họ (family name).
 */
function parseGoogleName(meta: Record<string, string>): { firstName: string; lastName: string } {
  // Supabase passes Google's given_name / family_name when available
  if (meta.given_name ?? meta.family_name) {
    return {
      firstName: (meta.family_name ?? "").trim(),
      lastName: (meta.given_name ?? "").trim(),
    };
  }
  const full = (meta.full_name ?? meta.name ?? "").trim();
  if (!full) return { firstName: "", lastName: "" };
  const parts = full.split(/\s+/);
  if (parts.length === 1) return { firstName: "", lastName: parts[0] };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.at(-1) ?? "",
  };
}

/**
 * Sync the Prisma member record after a successful Google OAuth login.
 *
 * Cases:
 *  1. Member was pre-created by admin (authId = "pending-*"):
 *     - Replace authId with real Supabase user id
 *     - Fill avatar from Google if still null
 *     - Generate slug if still null
 *  2. Member already fully set up (returning user):
 *     - Fill any still-null avatar / slug
 *  3. Completely new user (never pre-created):
 *     - Create member record with GUEST role, data from Google
 */
async function syncMemberFromGoogle(user: User): Promise<void> {
  if (!user.email) return;

  const meta = (user.user_metadata ?? {}) as Record<string, string>;
  const googleAvatar = meta.avatar_url ?? meta.picture ?? null;
  const email = user.email;

  const existing = await prisma.member.findUnique({ where: { email } });

  if (existing) {
    const updates: Record<string, unknown> = {};

    // 1. Replace pending authId placeholder with the real Supabase UID
    if (existing.authId.startsWith("pending-")) {
      updates.authId = user.id;
    }

    // 2. Fill avatar from Google if the member doesn't have one yet
    if (!existing.avatar && googleAvatar) {
      updates.avatar = googleAvatar;
    }

    // 3. Auto-generate slug if it's still missing
    if (!existing.slug) {
      updates.slug = await generateUniqueSlug(email);
    }

    if (Object.keys(updates).length > 0) {
      await prisma.member.update({ where: { email }, data: updates });
    }
    return;
  }

  // New user — auto-create with GUEST role (admin can promote later)
  const { firstName, lastName } = parseGoogleName(meta);
  const slug = await generateUniqueSlug(email);

  await prisma.member.create({
    data: {
      authId: user.id,
      email,
      firstName: firstName || email.split("@")[0],
      lastName,
      avatar: googleAvatar ?? undefined,
      slug,
      webRole: "GUEST",
      createdBy: null, // self-registered via Google
    },
  });
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClientSsr();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Sync member profile from Google metadata
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          await syncMemberFromGoogle(user);
        } catch (syncErr) {
          // Non-fatal: log and continue — user can still navigate the site
          console.error("[auth/callback] member sync failed:", syncErr);
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) return NextResponse.redirect(`${origin}${next}`);
      if (forwardedHost) return NextResponse.redirect(`http://${forwardedHost}${next}`);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
