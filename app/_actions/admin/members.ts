"use server";

import { revalidateTag } from "next/cache";
import type { Member, Prisma } from "@/configs/prisma/generated/prisma/client";
import { _CACHE_MEMBERS } from "@/constants/cache";
import { isRootAdmin } from "@/utils/admin";
import { adminUpdateSsoUser } from "@/utils/sso";
import { handleErrorServerWithAuth, prisma, requireAdmin } from "./helpers";

const SLUG_REGEX = /^[a-z0-9_-]+$/;
const SEARCH_SPLIT_REGEX = /\s+/;
type ClubRolePosition =
  | "PRESIDENT"
  | "VICE_PRESIDENT"
  | "DEPARTMENT_LEADER"
  | "DEPARTMENT_VICE_LEADER"
  | "DEPARTMENT_MEMBER"
  | "COLLABORATOR"
  | "ADVISOR";

export const adminGetMembers = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const members = await prisma.member.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          clubRoles: { include: { department: true }, where: { endAt: null } }
        }
      });
      return members.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
        dob: m.dob ? m.dob.toISOString() : null,
        leftClubAt: m.leftClubAt ? m.leftClubAt.toISOString() : null,
        joinedClubAt: m.joinedClubAt ? m.joinedClubAt.toISOString() : null,
        isActive: !m.leftClubAt,
        clubRoles: m.clubRoles.map((cr) => ({
          ...cr,
          createdAt: cr.createdAt.toISOString(),
          updatedAt: cr.updatedAt.toISOString(),
          startAt: cr.startAt.toISOString(),
          endAt: cr.endAt ? cr.endAt.toISOString() : null
        }))
      }));
    }
  });

export const adminBackupUserData = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);

      const [departments, members] = await Promise.all([
        prisma.department.findMany({
          orderBy: { order: "asc" }
        }),
        prisma.member.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            clubRoles: {
              include: {
                department: true
              },
              orderBy: { startAt: "desc" }
            }
          }
        })
      ]);

      return {
        exportedAt: new Date().toISOString(),
        version: "1.1",
        departments: departments.map((d) => ({
          ...d,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString()
        })),
        members: members.map((m) => ({
          id: m.id,
          authId: m.id,
          email: m.email,
          firstName: m.firstName,
          middleName: m.middleName,
          lastName: m.lastName,
          avatar: m.avatar,
          coverImage: m.coverImage,
          slug: m.slug,
          dob: m.dob ? m.dob.toISOString() : null,
          phone: m.phone,
          studentId: m.studentId,
          socials: m.socials,
          joinedClubAt: m.joinedClubAt ? m.joinedClubAt.toISOString() : null,
          leftClubAt: m.leftClubAt ? m.leftClubAt.toISOString() : null,
          webRole: m.webRole,
          isActive: !m.leftClubAt,
          spotifyUri: m.spotifyUri,
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
          roles: m.clubRoles.map((cr) => ({
            id: cr.id,
            position: cr.position,
            departmentId: cr.departmentId,
            departmentNameVi: cr.department?.nameVi || null,
            departmentNameEn: cr.department?.nameEn || null,
            term: cr.term,
            note: cr.note,
            startAt: cr.startAt.toISOString(),
            endAt: cr.endAt ? cr.endAt.toISOString() : null,
            createdAt: cr.createdAt.toISOString(),
            updatedAt: cr.updatedAt.toISOString()
          }))
        }))
      };
    }
  });

function buildMemberWhereClause({
  role,
  dept,
  year,
  search
}: {
  role?: string;
  dept?: string;
  year?: string;
  search?: string;
}): Prisma.MemberWhereInput {
  const whereClause: Prisma.MemberWhereInput = {};

  if (role && role !== "ALL") {
    whereClause.webRole = role as Member["webRole"];
  }

  if (dept && dept !== "ALL") {
    whereClause.clubRoles =
      dept === "NONE"
        ? { none: { departmentId: { not: null }, endAt: null } }
        : { some: { department: { slug: dept }, endAt: null } };
  }

  if (year && year !== "ALL") {
    const targetYear = Number.parseInt(year, 10);
    const startOfYear = new Date(`${targetYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${targetYear}-12-31T23:59:59.999Z`);

    whereClause.OR = [
      { joinedClubAt: { gte: startOfYear, lte: endOfYear } },
      { joinedClubAt: null, createdAt: { gte: startOfYear, lte: endOfYear } },
      { clubRoles: { some: { startAt: { gte: startOfYear, lte: endOfYear } } } }
    ];
  }

  if (search?.trim()) {
    const s = search.trim();
    const parts = s.split(SEARCH_SPLIT_REGEX).filter(Boolean);

    const searchOR: Prisma.MemberWhereInput[] = [
      { email: { contains: s, mode: "insensitive" } },
      { studentId: { contains: s, mode: "insensitive" } },
      { firstName: { contains: s, mode: "insensitive" } },
      { lastName: { contains: s, mode: "insensitive" } }
    ];

    if (parts.length > 1) {
      searchOR.push({
        AND: parts.map((p) => ({
          OR: [{ firstName: { contains: p, mode: "insensitive" } }, { lastName: { contains: p, mode: "insensitive" } }]
        }))
      });
    }
    whereClause.AND = [{ OR: searchOR }];
  }

  return whereClause;
}

function computeRoleStats(roleStats: Array<{ webRole: string; _count: { _all: number } }>) {
  const stats = { total: 0, admins: 0, collab: 0, members: 0, guests: 0 };

  for (const stat of roleStats) {
    const count = stat._count._all;
    stats.total += count;
    if (stat.webRole === "ADMIN") {
      stats.admins = count;
    } else if (stat.webRole === "COLLABORATOR") {
      stats.collab = count;
    } else if (stat.webRole === "MEMBER") {
      stats.members = count;
    } else if (stat.webRole === "GUEST") {
      stats.guests = count;
    }
  }

  return stats;
}

export const adminGetMembersPaginated = async ({
  search,
  role,
  dept,
  year,
  page = 1,
  limit = 10
}: {
  search?: string;
  role?: string;
  dept?: string;
  year?: string;
  page?: number;
  limit?: number;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const whereClause = buildMemberWhereClause({ role, dept, year, search });

      const skip = (page - 1) * limit;
      const take = limit;

      const [totalCount, members, roleStats] = await Promise.all([
        prisma.member.count({ where: whereClause }),
        prisma.member.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          include: {
            clubRoles: {
              include: { department: true },
              where: { endAt: null }
            }
          },
          skip,
          take
        }),
        prisma.member.groupBy({
          by: ["webRole"],
          _count: { _all: true }
        })
      ]);

      const stats = computeRoleStats(roleStats);

      const payload = members.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
        dob: m.dob ? m.dob.toISOString() : null,
        leftClubAt: m.leftClubAt ? m.leftClubAt.toISOString() : null,
        joinedClubAt: m.joinedClubAt ? m.joinedClubAt.toISOString() : null,
        isActive: !m.leftClubAt,
        clubRoles: m.clubRoles.map((cr) => ({
          ...cr,
          createdAt: cr.createdAt.toISOString(),
          updatedAt: cr.updatedAt.toISOString(),
          startAt: cr.startAt.toISOString(),
          endAt: cr.endAt ? cr.endAt.toISOString() : null
        }))
      }));

      return {
        payload,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        stats
      };
    }
  });

export const adminUpdateMemberRole = async (memberId: string, webRole: "ADMIN" | "COLLABORATOR" | "MEMBER" | "GUEST") =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const admin = await requireAdmin(user);
      const target = await prisma.member.findUnique({
        where: { id: memberId }
      });
      if (!target) {
        throw new Error("Member not found");
      }
      if (isRootAdmin(target.email) && !isRootAdmin(admin.email)) {
        throw new Error("Cannot modify root admin");
      }
      const updated = await prisma.member.update({
        where: { id: memberId },
        data: { webRole }
      });
      revalidateTag(_CACHE_MEMBERS, "default");
      return updated;
    }
  });

export const adminDeleteMember = async (memberId: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const admin = await requireAdmin(user);
      const target = await prisma.member.findUnique({
        where: { id: memberId }
      });
      if (!target) {
        throw new Error("Member not found");
      }
      if (isRootAdmin(target.email)) {
        throw new Error("Cannot delete root admin");
      }
      await prisma.member.delete({ where: { id: memberId } });
      revalidateTag(_CACHE_MEMBERS, "default");
      return { success: true };
    }
  });

export const adminAddMember = async (_data: unknown) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      throw new Error("Vui lòng thêm thành viên mới tại trang quản lý SSO (auth.mpclub.dev)");
    }
  });

async function validateAndCheckSlug(rawSlug: string, memberId: string) {
  const slug = rawSlug.trim();
  if (!slug) {
    throw new Error("Slug không được để trống");
  }
  if (slug === "me") {
    throw new Error('Slug không được là "me"');
  }
  if (!SLUG_REGEX.test(slug)) {
    throw new Error("Slug chỉ được chứa chữ thường, số, dấu gạch ngang và gạch dưới");
  }
  const slugTaken = await prisma.member.findFirst({
    where: { slug, id: { not: memberId } }
  });
  if (slugTaken) {
    throw new Error("Slug đã được sử dụng bởi thành viên khác");
  }
  return slug;
}

type AdminUpdateMemberInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dob?: string | null;
  studentId?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  socials?: string; // JSON string
  webRole?: "ADMIN" | "COLLABORATOR" | "MEMBER" | "GUEST";
  slug?: string;
  leftClubAt?: string | null;
  joinedClubAt?: string | null;
  spotifyUri?: string | null;
};

function buildMemberProfileUpdateData(data: AdminUpdateMemberInput): Prisma.MemberUpdateInput {
  return {
    ...(data.firstName && { firstName: data.firstName }),
    ...(data.lastName && { lastName: data.lastName }),
    ...(data.phone !== undefined && { phone: data.phone || null }),
    ...(data.studentId !== undefined && { studentId: data.studentId || null }),
    ...(data.bio !== undefined && { bio: data.bio || null }),
    ...(data.webRole && { webRole: data.webRole }),
    ...(data.avatar !== undefined && { avatar: data.avatar || null }),
    ...(data.coverImage !== undefined && { coverImage: data.coverImage || null }),
    ...(data.socials !== undefined && { socials: data.socials ? JSON.parse(data.socials) : {} }),
    ...(data.slug !== undefined && { slug: data.slug.trim() }),
    ...(data.spotifyUri !== undefined && { spotifyUri: data.spotifyUri || null })
  };
}

function buildMemberDateUpdateData(data: AdminUpdateMemberInput): Prisma.MemberUpdateInput {
  return {
    ...(data.dob !== undefined && { dob: data.dob ? new Date(data.dob) : null }),
    ...(data.leftClubAt !== undefined && { leftClubAt: data.leftClubAt ? new Date(data.leftClubAt) : null }),
    ...(data.joinedClubAt !== undefined && { joinedClubAt: data.joinedClubAt ? new Date(data.joinedClubAt) : null })
  };
}

function buildMemberUpdateData(data: AdminUpdateMemberInput): Prisma.MemberUpdateInput {
  return {
    ...buildMemberProfileUpdateData(data),
    ...buildMemberDateUpdateData(data)
  };
}

export const adminUpdateMember = async (memberId: string, data: AdminUpdateMemberInput) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const admin = await requireAdmin(user);
      const target = await prisma.member.findUnique({
        where: { id: memberId }
      });
      if (!target) {
        throw new Error("Member not found");
      }
      if (isRootAdmin(target.email) && !isRootAdmin(admin.email)) {
        throw new Error("Cannot modify root admin");
      }

      if (data.slug !== undefined) {
        await validateAndCheckSlug(data.slug, memberId);
      }

      const updated = await prisma.member.update({
        where: { id: memberId },
        data: buildMemberUpdateData(data)
      });
      revalidateTag(_CACHE_MEMBERS, "default");
      return updated;
    }
  });

export const adminGetMemberClubRoles = async (memberId: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.clubRole.findMany({
        where: { memberId },
        include: { department: true },
        orderBy: { startAt: "desc" }
      });
    }
  });

async function syncMemberActiveStatus(memberId: string) {
  const roles = await prisma.clubRole.findMany({
    where: { memberId }
  });
  const activeRole = roles.find((r) => r.endAt === null);
  if (activeRole) {
    await prisma.member.update({
      where: { id: memberId },
      data: {
        leftClubAt: null,
        isActive: true
      }
    });
  } else if (roles.length > 0) {
    const endDates = roles.map((r) => r.endAt).filter((d): d is Date => d !== null);
    const latestEndAt = endDates.length > 0 ? new Date(Math.max(...endDates.map((d) => d.getTime()))) : new Date();
    await prisma.member.update({
      where: { id: memberId },
      data: {
        leftClubAt: latestEndAt,
        isActive: false
      }
    });
  } else {
    await prisma.member.update({
      where: { id: memberId },
      data: {
        leftClubAt: null,
        isActive: true
      }
    });
  }
}

export const adminAddClubRole = async (
  memberId: string,
  data: {
    position: string;
    departmentId?: string;
    term?: number;
    startAt: string;
    endAt?: string;
    note?: string;
  }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const role = await prisma.clubRole.create({
        data: {
          memberId,
          position: data.position as ClubRolePosition,
          departmentId: data.departmentId || null,
          term: data.term || null,
          startAt: new Date(data.startAt),
          endAt: data.endAt ? new Date(data.endAt) : null,
          note: data.note || null
        }
      });
      await syncMemberActiveStatus(memberId);
      revalidateTag(_CACHE_MEMBERS, "default");
      return role;
    }
  });

export const adminUpdateClubRole = async (
  roleId: string,
  data: {
    position: string;
    departmentId?: string;
    term?: number;
    startAt: string;
    endAt?: string;
    note?: string;
  }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const role = await prisma.clubRole.update({
        where: { id: roleId },
        data: {
          position: data.position as ClubRolePosition,
          departmentId: data.departmentId || null,
          term: data.term || null,
          startAt: new Date(data.startAt),
          endAt: data.endAt ? new Date(data.endAt) : null,
          note: data.note || null
        }
      });
      await syncMemberActiveStatus(role.memberId);
      revalidateTag(_CACHE_MEMBERS, "default");
      return role;
    }
  });

export const adminRemoveClubRole = async (roleId: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const role = await prisma.clubRole.findUnique({
        where: { id: roleId },
        select: { memberId: true }
      });
      if (role) {
        await prisma.clubRole.delete({ where: { id: roleId } });
        await syncMemberActiveStatus(role.memberId);
      }
      revalidateTag(_CACHE_MEMBERS, "default");
      return { success: true };
    }
  });

type AdminSaveMemberProfileInput = {
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  webRole?: "ADMIN" | "COLLABORATOR" | "MEMBER" | "GUEST";
  phone?: string;
  dob?: string | null;
  studentId?: string;
  bio?: string;
  avatar?: string | null;
  coverImage?: string | null;
  slug?: string;
  leftClubAt?: string | null;
  joinedClubAt?: string | null;
  spotifyUri?: string | null;
  showDob?: boolean;
  showPhone?: boolean;
  showStudentId?: boolean;
};

type AdminSaveMemberClubRoleInput = {
  id?: string;
  position: string;
  departmentId?: string | null;
  term?: number | null;
  startAt: string;
  endAt?: string | null;
  note?: string | null;
};

function buildFullMemberUpdateData(
  profile: AdminSaveMemberProfileInput,
  finalSlug: string | null,
  socials: Array<{ platform: string; url: string }>
): Prisma.MemberUpdateInput {
  return {
    email: profile.email,
    firstName: profile.firstName,
    middleName: profile.middleName || null,
    lastName: profile.lastName,
    webRole: profile.webRole ?? "MEMBER",
    phone: profile.phone || null,
    dob: profile.dob ? new Date(profile.dob) : null,
    studentId: profile.studentId || null,
    bio: profile.bio || null,
    avatar: profile.avatar || null,
    coverImage: profile.coverImage || null,
    slug: finalSlug,
    socials,
    leftClubAt: profile.leftClubAt ? new Date(profile.leftClubAt) : null,
    joinedClubAt: profile.joinedClubAt ? new Date(profile.joinedClubAt) : null,
    spotifyUri: profile.spotifyUri || null,
    ...(profile.showDob !== undefined && { showDob: profile.showDob }),
    ...(profile.showPhone !== undefined && { showPhone: profile.showPhone }),
    ...(profile.showStudentId !== undefined && { showStudentId: profile.showStudentId })
  };
}

async function syncClubRoles(
  tx: Prisma.TransactionClient,
  memberId: string,
  clubRoles: AdminSaveMemberClubRoleInput[]
) {
  const dbRoles = await tx.clubRole.findMany({ where: { memberId } });
  const incomingIds = clubRoles.map((r) => r.id).filter(Boolean);

  const toDelete = dbRoles.filter((r) => !incomingIds.includes(r.id));
  if (toDelete.length > 0) {
    await tx.clubRole.deleteMany({
      where: { id: { in: toDelete.map((r) => r.id) } }
    });
  }

  for (const role of clubRoles) {
    const roleData = {
      position: role.position as ClubRolePosition,
      departmentId: role.departmentId || null,
      term: role.term || null,
      startAt: new Date(role.startAt),
      endAt: role.endAt ? new Date(role.endAt) : null,
      note: role.note || null
    };

    if (role.id) {
      await tx.clubRole.update({ where: { id: role.id }, data: roleData });
    } else {
      await tx.clubRole.create({ data: { ...roleData, memberId } });
    }
  }
}

export const adminSaveMemberFull = async (
  memberId: string | null,
  data: {
    profile: AdminSaveMemberProfileInput;
    socials: Array<{ platform: string; url: string }>;
    clubRoles: AdminSaveMemberClubRoleInput[];
  }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const admin = await requireAdmin(user);
      const { profile, socials, clubRoles } = data;

      let member: Member;
      if (memberId) {
        const target = await prisma.member.findUnique({
          where: { id: memberId }
        });
        if (!target) {
          throw new Error("Không tìm thấy thành viên");
        }
        if (isRootAdmin(target.email) && !isRootAdmin(admin.email)) {
          throw new Error("Không thể chỉnh sửa Root Admin");
        }

        let finalSlug = target.slug;
        if (profile.slug !== undefined) {
          finalSlug = await validateAndCheckSlug(profile.slug, memberId);
        }

        await adminUpdateSsoUser(memberId, {
          firstName: profile.firstName,
          middleName: profile.middleName,
          lastName: profile.lastName,
          dob: profile.dob,
          phone: profile.phone,
          studentId: profile.studentId
        });

        member = await prisma.$transaction(async (tx) => {
          const updatedMember = await tx.member.update({
            where: { id: memberId },
            data: buildFullMemberUpdateData(profile, finalSlug, socials)
          });
          await syncClubRoles(tx, memberId, clubRoles);
          return updatedMember;
        });
      } else {
        throw new Error("Vui lòng thêm thành viên mới tại trang quản lý SSO (auth.mpclub.dev)");
      }

      await syncMemberActiveStatus(member.id);
      revalidateTag(_CACHE_MEMBERS, "default");
      return member;
    }
  });

export const adminSyncMembersFromSso = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const { syncFromSso } = await import("@/utils/sso");
      await syncFromSso();
      revalidateTag(_CACHE_MEMBERS, "default");
      return { success: true };
    }
  });
