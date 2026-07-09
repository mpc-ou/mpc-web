import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/configs/prisma/db";
import { setSession } from "@/utils/session";
import { exchangeOidcCode, verifyOidcIdToken } from "@/utils/sso";

async function linkAndMigrateMember(oldId: string, ssoSub: string) {
  await prisma.$transaction(async (tx) => {
    const oldMember = await tx.member.findUnique({
      where: { id: oldId }
    });
    if (!oldMember) {
      return;
    }

    const tempEmail = `migrating-${Date.now()}-${oldMember.email}`;
    await tx.member.update({
      where: { id: oldId },
      data: { email: tempEmail }
    });

    await tx.member.create({
      data: {
        id: ssoSub,
        email: oldMember.email,
        firstName: oldMember.firstName,
        middleName: oldMember.middleName,
        lastName: oldMember.lastName,
        slug: oldMember.slug || undefined,
        avatar: oldMember.avatar || undefined,
        coverImage: oldMember.coverImage || undefined,
        bio: oldMember.bio || undefined,
        socials: oldMember.socials || undefined,
        spotifyUri: oldMember.spotifyUri || undefined,
        showDob: oldMember.showDob,
        showPhone: oldMember.showPhone,
        showStudentId: oldMember.showStudentId,
        joinedClubAt: oldMember.joinedClubAt,
        leftClubAt: oldMember.leftClubAt,
        webRole: oldMember.webRole,
        isActive: oldMember.isActive
      }
    });

    await tx.post.updateMany({
      where: { authorId: oldId },
      data: { authorId: ssoSub }
    });
    await tx.post.updateMany({
      where: { reviewerId: oldId },
      data: { reviewerId: ssoSub }
    });
    await tx.postRevision.updateMany({
      where: { editorId: oldId },
      data: { editorId: ssoSub }
    });
    await tx.postOrganizer.updateMany({
      where: { memberId: oldId },
      data: { memberId: ssoSub }
    });
    await tx.postAchievementMember.updateMany({
      where: { memberId: oldId },
      data: { memberId: ssoSub }
    });
    await tx.projectMember.updateMany({
      where: { memberId: oldId },
      data: { memberId: ssoSub }
    });
    await tx.notification.updateMany({
      where: { memberId: oldId },
      data: { memberId: ssoSub }
    });

    await tx.member.delete({
      where: { id: oldId }
    });
  });
}

const generateUniqueSlug = async (email: string) => {
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
    const candidate = `${base}${Math.floor(Math.random() * 900 + 100)}`;
    const exists = await prisma.member.findUnique({ where: { slug: candidate } });
    if (!exists) {
      return candidate;
    }
  }
  return `${base}${Date.now().toString().slice(-6)}`;
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const next = searchParams.get("next") ?? "/";

  const cookieStore = await cookies();
  const savedState = cookieStore.get("oidc_state")?.value;
  const codeVerifier = cookieStore.get("oidc_code_verifier")?.value;

  cookieStore.delete("oauth_state");
  cookieStore.delete("oauth_code_verifier");
  cookieStore.delete("oidc_state");
  cookieStore.delete("oidc_code_verifier");

  if (!(code && state && savedState && codeVerifier) || state !== savedState) {
    return NextResponse.redirect(`${origin}/auth#error_description=Yeu%20cau%20xac%20thuc%20khong%20hop%20le.`);
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const redirectUri = `${siteUrl}/api/auth/callback`;

    const tokenRes = await exchangeOidcCode(code, codeVerifier, redirectUri);
    const { id_token, access_token, refresh_token, expires_in } = tokenRes;

    const claims = await verifyOidcIdToken(id_token);
    const sub = claims.sub as string;
    const email = claims.email as string;
    const name = (claims.name as string) || "";
    const role = (claims.role as "ADMIN" | "COLLABORATOR" | "MEMBER" | "GUEST") || "GUEST";

    const nameParts = name.trim().split(/\s+/);
    let firstName = "";
    let middleName: string | null = null;
    let lastName = "";

    if (nameParts.length === 1) {
      firstName = nameParts[0];
    } else if (nameParts.length === 2) {
      lastName = nameParts[0];
      firstName = nameParts[1];
    } else if (nameParts.length >= 3) {
      lastName = nameParts[0];
      middleName = nameParts.slice(1, -1).join(" ");
      firstName = nameParts.at(-1) ?? "";
    }

    const localByEmail = await prisma.member.findUnique({
      where: { email }
    });

    if (localByEmail && localByEmail.id !== sub) {
      await linkAndMigrateMember(localByEmail.id, sub);
    }

    const localMember = await prisma.member.findUnique({
      where: { id: sub }
    });

    const memberData = {
      email,
      firstName,
      middleName,
      lastName,
      webRole: role,
      isActive: true
    };

    if (localMember) {
      await prisma.member.update({
        where: { id: sub },
        data: memberData
      });
    } else {
      const slug = await generateUniqueSlug(email);
      await prisma.member.create({
        data: {
          id: sub,
          slug,
          ...memberData
        }
      });
    }

    await setSession({
      id: sub,
      email,
      name,
      role,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + expires_in * 1000
    });

    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    }
    return NextResponse.redirect(`${origin}${next}`);
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(`${origin}/auth#error_description=Loi%20khi%20xac%20thuc%20voi%20SSO.`);
  }
}
