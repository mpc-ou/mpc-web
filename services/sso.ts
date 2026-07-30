import { createRemoteJWKSet, jwtVerify } from "jose";
import { prisma } from "@/configs/prisma/db";
import type { ClubPosition, Prisma } from "@/configs/prisma/generated/prisma/client";

const issuer = process.env.SSO_ISSUER || "https://auth.mpclub.dev";
const clientId = process.env.SSO_CLIENT_ID || "";
const clientSecret = process.env.SSO_CLIENT_SECRET || "";
const apiKey = process.env.SSO_SERVICE_API_KEY || "";

const JWKS = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));

export type SsoMemberRole = {
  id: string;
  position:
    | "COLLABORATOR"
    | "PRESIDENT"
    | "VICE_PRESIDENT"
    | "DEPARTMENT_LEADER"
    | "DEPARTMENT_VICE_LEADER"
    | "DEPARTMENT_MEMBER"
    | "ADVISOR";
  term?: number;
  note?: string;
  startAt: string;
  endAt?: string | null;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
};

export type SsoMember = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob?: string | null;
  address?: string | null;
  className?: string | null;
  mssv?: string | null; // Student ID
  faculty?: string | null;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
  webRole: "ADMIN" | "COLLABORATOR" | "MEMBER" | "GUEST";
  isAlumni: boolean;
  roles: SsoMemberRole[];
};

export async function verifyOidcIdToken(idToken: string) {
  if (!clientId) {
    throw new Error("Missing SSO_CLIENT_ID configuration");
  }
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer,
    audience: clientId,
    algorithms: ["ES256"]
  });
  return payload;
}

export async function exchangeOidcCode(code: string, codeVerifier: string, redirectUri: string) {
  const response = await fetch(`${issuer}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
      code_verifier: codeVerifier
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(`${issuer}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token refresh failed: ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

export async function revokeSsoSession(accessToken: string, refreshToken: string) {
  try {
    await fetch(`${issuer}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken
      })
    });
  } catch (err) {
    console.error("Failed to revoke session on SSO:", err);
  }
}

async function linkAndMigrateMember(oldId: string, ssoSub: string, _email: string) {
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

export async function syncFromSso() {
  if (!apiKey) {
    throw new Error("Missing SSO_SERVICE_API_KEY environment variable");
  }

  const adminSecret = process.env.SSO_ADMIN_SECRET || "";

  if (adminSecret) {
    try {
      const deptRes = await fetch(`${issuer}/admin/departments`, {
        headers: { "X-Admin-Secret": adminSecret }
      });
      if (deptRes.ok) {
        const deptJson = await deptRes.json();
        const ssoDeptList: Array<{ id: string; name: string; code?: string }> = Array.isArray(deptJson)
          ? deptJson
          : (deptJson?.items ?? deptJson?.data ?? []);

        for (const d of ssoDeptList) {
          if (!d.id) {
            continue;
          }
          const existing = await prisma.department.findUnique({ where: { id: d.id } });
          if (!existing) {
            const slug = d.code ? d.code.toLowerCase() : `dept-${d.id}`;
            await prisma.department.create({
              data: { id: d.id, slug, nameVi: d.name || "", nameEn: d.name || "", isActive: true }
            });
          }
        }
      }
    } catch {
      // Non-fatal: fall through to member-based sync
    }
  }

  let page = 1;
  const limit = 100;
  let ssoList: SsoMember[] = [];
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${issuer}/api/members?page=${page}&limit=${limit}`, {
      headers: {
        "X-Service-Key": apiKey
      }
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(
        `Failed to fetch members from SSO (Status: ${response.status}): ${errorBody || response.statusText}`
      );
    }

    const resJson = await response.json();
    let currentBatch: SsoMember[] = [];
    if (Array.isArray(resJson)) {
      currentBatch = resJson;
    } else if (resJson && Array.isArray(resJson.data)) {
      currentBatch = resJson.data;
    } else if (resJson && Array.isArray(resJson.items)) {
      currentBatch = resJson.items;
    } else if (resJson && Array.isArray(resJson.payload)) {
      currentBatch = resJson.payload;
    }

    if (currentBatch.length === 0) {
      hasMore = false;
    } else {
      ssoList = ssoList.concat(currentBatch);
      if (currentBatch.length < limit) {
        hasMore = false;
      } else {
        page++;
      }
    }
  }

  const ssoDepartments = new Map<string, NonNullable<SsoMemberRole["department"]>>();
  for (const ssoUser of ssoList) {
    if (ssoUser.roles && Array.isArray(ssoUser.roles)) {
      for (const ssoRole of ssoUser.roles) {
        if (ssoRole.department) {
          ssoDepartments.set(ssoRole.department.id, ssoRole.department);
        }
      }
    }
  }

  const localDepts = await prisma.department.findMany();
  const localDeptMap = new Map(localDepts.map((d) => [d.id, d]));

  for (const [deptId, ssoDept] of ssoDepartments.entries()) {
    const existing = localDeptMap.get(deptId);
    const slug = ssoDept.code ? ssoDept.code.toLowerCase() : `dept-${ssoDept.id}`;
    const data = {
      slug,
      nameVi: ssoDept.name || "",
      nameEn: ssoDept.name || "",
      isActive: true
    };

    if (!existing) {
      await prisma.department.create({
        data: {
          id: deptId,
          slug,
          nameVi: ssoDept.name || "",
          nameEn: ssoDept.name || "",
          isActive: true
        }
      });
    }
  }

  const allLocalMembers = await prisma.member.findMany();
  const localMemberMap = new Map(allLocalMembers.map((m) => [m.id, m]));
  const localMemberEmailMap = new Map(allLocalMembers.map((m) => [m.email, m]));

  const syncedIds = new Set<string>();
  const rolesToCreate: Prisma.ClubRoleCreateManyInput[] = [];

  for (const ssoUser of ssoList) {
    if (!(ssoUser?.id && ssoUser.email)) {
      console.warn("Skipping invalid SSO user:", ssoUser);
      continue;
    }

    syncedIds.add(ssoUser.id);

    const localByEmail = localMemberEmailMap.get(ssoUser.email);
    if (localByEmail && localByEmail.id !== ssoUser.id) {
      await linkAndMigrateMember(localByEmail.id, ssoUser.id, ssoUser.email);
    }

    const localMember = localMemberMap.get(ssoUser.id);
    const mappedFirstName = ssoUser.firstName || "";
    const mappedMiddleName = ssoUser.middleName || null;
    const mappedLastName = ssoUser.lastName || "";

    if (ssoUser.roles && Array.isArray(ssoUser.roles)) {
      for (const ssoRole of ssoUser.roles) {
        rolesToCreate.push({
          memberId: ssoUser.id,
          departmentId: ssoRole.department?.id || null,
          position: ssoRole.position as ClubPosition,
          term: ssoRole.term || null,
          note: ssoRole.note || null,
          startAt: ssoRole.startAt ? new Date(ssoRole.startAt) : new Date(),
          endAt: ssoRole.endAt && ssoRole.endAt !== "" ? new Date(ssoRole.endAt) : null
        });
      }
    }

    const userRoles = rolesToCreate.filter((r) => r.memberId === ssoUser.id);
    const joinedClubAt =
      userRoles.length > 0 ? new Date(Math.min(...userRoles.map((r) => new Date(r.startAt).getTime()))) : null;

    let leftClubAt: Date | null = null;
    if (ssoUser.isAlumni) {
      const endDates = userRoles.map((r) => r.endAt).filter((d): d is Date | string => d !== null && d !== undefined);
      leftClubAt = endDates.length > 0 ? new Date(Math.max(...endDates.map((d) => new Date(d).getTime()))) : new Date();
    }

    const memberData = {
      email: ssoUser.email,
      firstName: mappedFirstName,
      middleName: mappedMiddleName,
      lastName: mappedLastName,
      dob: ssoUser.dob ? new Date(ssoUser.dob) : null,
      phone: ssoUser.phone || null,
      studentId: ssoUser.mssv || null,
      webRole: ssoUser.webRole,
      isActive: !ssoUser.isAlumni,
      joinedClubAt,
      leftClubAt,
      avatar: ssoUser.avatar || null,
      bio: ssoUser.bio || null
    };

    if (localMember) {
      await prisma.member.update({
        where: { id: ssoUser.id },
        data: memberData
      });
    } else {
      const slug = await generateUniqueSlug(ssoUser.email);
      await prisma.member.create({
        data: {
          id: ssoUser.id,
          slug,
          ...memberData
        }
      });
    }
  }

  for (const localMem of allLocalMembers) {
    if (!syncedIds.has(localMem.id) && localMem.isActive) {
      await prisma.member.update({
        where: { id: localMem.id },
        data: { isActive: false }
      });
    }
  }

  await prisma.clubRole.deleteMany({
    where: { memberId: { in: Array.from(syncedIds) } }
  });

  if (rolesToCreate.length > 0) {
    await prisma.clubRole.createMany({
      data: rolesToCreate
    });
  }
}

export async function adminUpdateSsoUser(
  userId: string,
  data: {
    firstName?: string;
    middleName?: string | null;
    lastName?: string;
    dob?: string | null;
    phone?: string | null;
    studentId?: string | null;
  }
) {
  const adminSecret = process.env.SSO_ADMIN_SECRET || "";
  if (!adminSecret) {
    throw new Error("Missing SSO_ADMIN_SECRET environment variable");
  }

  const payload: Record<string, string | null> = {};
  if (data.firstName !== undefined) {
    payload.firstName = data.firstName;
  }
  if (data.middleName !== undefined) {
    payload.middleName = data.middleName || null;
  }
  if (data.lastName !== undefined) {
    payload.lastName = data.lastName;
  }
  if (data.dob !== undefined) {
    payload.dob = data.dob || null;
  }
  if (data.phone !== undefined) {
    payload.phone = data.phone || null;
  }
  if (data.studentId !== undefined) {
    payload.mssv = data.studentId || null;
  }

  const response = await fetch(`${issuer}/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Secret": adminSecret
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let errorMsg = "Cập nhật SSO thất bại";
    try {
      const errBody = await response.json();
      errorMsg = errBody?.message || errBody?.error || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return await response.json();
}
