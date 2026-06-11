import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { prisma } from "@/configs/prisma/db";
import type { Member } from "@/configs/prisma/generated/prisma/client";
import { createClientSsr } from "@/configs/supabase/server";
import { isRootAdmin } from "@/utils/admin";
import { validateEmailAllowed } from "@/utils/auth-val";

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
  if (!taken) {
    return base;
  }

  for (let i = 0; i < 20; i++) {
    const suffix = Math.floor(Math.random() * 900 + 100).toString();
    const candidate = `${base}${suffix}`;
    const exists = await prisma.member.findUnique({ where: { slug: candidate } });
    if (!exists) {
      return candidate;
    }
  }
  return `${base}${Date.now().toString().slice(-6)}`;
}

const SPLIT_WHITESPACE_REGEX = /\s+/;

type SocialLink = {
  id?: string;
  platform: string;
  url: string;
};

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
      lastName: (meta.given_name ?? "").trim()
    };
  }
  const full = (meta.full_name ?? meta.name ?? "").trim();
  if (!full) {
    return { firstName: "", lastName: "" };
  }
  const parts = full.split(SPLIT_WHITESPACE_REGEX);
  if (parts.length === 1) {
    return { firstName: "", lastName: parts[0] };
  }
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.at(-1) ?? ""
  };
}

/**
 * Find existing member matching any of the user's provider emails.
 */
async function findExistingMember(user: User, email: string): Promise<Member | null> {
  const oauthEmails = new Set<string>();
  oauthEmails.add(email.toLowerCase());

  if (user.identities) {
    for (const identity of user.identities) {
      const idEmail = identity.identity_data?.email;
      if (idEmail) {
        oauthEmails.add(idEmail.toLowerCase());
      }
    }
  }

  for (const oEmail of oauthEmails) {
    const matched = await prisma.member.findFirst({
      where: {
        OR: [{ email: oEmail }, { githubEmail: oEmail }]
      }
    });
    if (matched) {
      return matched;
    }
  }
  return null;
}

/**
 * Update an existing member record with OAuth details.
 */
async function updateExistingMember(user: User, existing: Member, googleAvatar: string | null): Promise<void> {
  const updates: Record<string, unknown> = {};

  if (existing.authId.startsWith("pending-")) {
    updates.authId = user.id;
  }

  if (!existing.avatar && googleAvatar) {
    updates.avatar = googleAvatar;
  }

  if (!existing.slug) {
    updates.slug = await generateUniqueSlug(existing.email);
  }

  const githubIdentity = user.identities?.find((id) => id.provider === "github");
  if (githubIdentity) {
    const githubUsername = githubIdentity.identity_data?.preferred_username || githubIdentity.identity_data?.user_name;
    if (githubUsername) {
      const existingSocials = Array.isArray(existing.socials) ? (existing.socials as unknown as SocialLink[]) : [];
      const hasGithub = existingSocials.some((s) => s.platform === "GitHub");

      if (!hasGithub) {
        updates.socials = [
          ...existingSocials,
          {
            id: Math.random().toString(36).substring(2, 9),
            platform: "GitHub",
            url: `https://github.com/${githubUsername}`
          }
        ];
      }
    }
    const githubEmailVal = githubIdentity.identity_data?.email;
    if (githubEmailVal && !existing.githubEmail) {
      updates.githubEmail = githubEmailVal;
    }
  }

  if (isRootAdmin(existing.email) && existing.webRole !== "ADMIN") {
    updates.webRole = "ADMIN";
  }

  if (Object.keys(updates).length > 0) {
    await prisma.member.update({ where: { id: existing.id }, data: updates });
  }
}

/**
 * Create a new member record with GUEST role.
 */
async function createNewMember(
  user: User,
  email: string,
  googleAvatar: string | null,
  meta: Record<string, string>
): Promise<void> {
  const { firstName, lastName } = parseGoogleName(meta);
  const slug = await generateUniqueSlug(email);

  const socials: SocialLink[] = [];
  const githubIdentity = user.identities?.find((id) => id.provider === "github");
  let githubEmailVal: string | undefined;
  if (githubIdentity) {
    const githubUsername = githubIdentity.identity_data?.preferred_username || githubIdentity.identity_data?.user_name;
    if (githubUsername) {
      socials.push({
        id: Math.random().toString(36).substring(2, 9),
        platform: "GitHub",
        url: `https://github.com/${githubUsername}`
      });
    }
    githubEmailVal = githubIdentity.identity_data?.email;
  }

  const isRoot = isRootAdmin(email);

  await prisma.member.create({
    data: {
      authId: user.id,
      email,
      firstName: firstName || email.split("@")[0],
      lastName,
      avatar: googleAvatar || undefined,
      slug,
      socials: socials.length > 0 ? socials : undefined,
      webRole: isRoot ? "ADMIN" : "GUEST",
      githubEmail: githubEmailVal || undefined,
      createdBy: null
    }
  });
}

/**
 * Sync the Prisma member record after a successful Google or GitHub OAuth login/link.
 */
async function syncMemberFromOAuth(user: User): Promise<void> {
  if (!user.email) {
    return;
  }

  const meta = (user.user_metadata ?? {}) as Record<string, string>;
  const googleAvatar = meta.avatar_url || meta.picture || null;
  const email = user.email;

  const existing = await findExistingMember(user, email);

  if (existing) {
    await updateExistingMember(user, existing, googleAvatar);
  } else {
    await createNewMember(user, email, googleAvatar, meta);
  }
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
        data: { user }
      } = await supabase.auth.getUser();

      if (user?.email) {
        const check = await validateEmailAllowed(user.email);
        if (!check.allowed) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/auth#error_description=${encodeURIComponent(check.reason || "Đăng nhập bị từ chối.")}`
          );
        }

        try {
          await syncMemberFromOAuth(user);
        } catch (syncErr) {
          // Non-fatal: log and continue — user can still navigate the site
          console.error("[auth/callback] member sync failed:", syncErr);
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth`);
}
