"use server";

import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/configs/supabase/admin";
import { _CACHE_MEMBERS } from "@/constants/cache";
import { isRootAdmin } from "@/utils/admin";
import { getDiceBearUrl } from "@/utils/dicebear-avatar";
import { generateUniqueSlug, handleErrorServerWithAuth, prisma, requireAdmin } from "./helpers";

const SLUG_REGEX = /^[a-z0-9_-]+$/;

export const adminGetMembers = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const members = await prisma.member.findMany({
        orderBy: { createdAt: "desc" },
        include: { clubRoles: { include: { department: true }, where: { endAt: null } } }
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
      const whereClause: any = {};

      // Role filter
      if (role && role !== "ALL") {
        whereClause.webRole = role;
      }

      // Dept filter
      if (dept && dept !== "ALL") {
        if (dept === "NONE") {
          whereClause.clubRoles = {
            none: {
              departmentId: { not: null },
              endAt: null
            }
          };
        } else {
          whereClause.clubRoles = {
            some: {
              department: { slug: dept },
              endAt: null
            }
          };
        }
      }

      // Year filter
      if (year && year !== "ALL") {
        const targetYear = Number.parseInt(year, 10);
        const startOfYear = new Date(`${targetYear}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${targetYear}-12-31T23:59:59.999Z`);

        whereClause.OR = [
          {
            joinedClubAt: {
              gte: startOfYear,
              lte: endOfYear
            }
          },
          {
            joinedClubAt: null,
            createdAt: {
              gte: startOfYear,
              lte: endOfYear
            }
          },
          {
            clubRoles: {
              some: {
                startAt: {
                  gte: startOfYear,
                  lte: endOfYear
                }
              }
            }
          }
        ];
      }

      // Search filter
      if (search?.trim()) {
        const s = search.trim();
        const parts = s.split(/\s+/).filter(Boolean);
        whereClause.AND = whereClause.AND || [];

        const searchOR: any[] = [
          { email: { contains: s, mode: "insensitive" } },
          { studentId: { contains: s, mode: "insensitive" } },
          { firstName: { contains: s, mode: "insensitive" } },
          { lastName: { contains: s, mode: "insensitive" } }
        ];

        if (parts.length > 1) {
          searchOR.push({
            AND: parts.map((p) => ({
              OR: [
                { firstName: { contains: p, mode: "insensitive" } },
                { lastName: { contains: p, mode: "insensitive" } }
              ]
            }))
          });
        }
        whereClause.AND.push({ OR: searchOR });
      }

      const skip = (page - 1) * limit;
      const take = limit;

      const [totalCount, members, roleStats] = await Promise.all([
        prisma.member.count({ where: whereClause }),
        prisma.member.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          include: { clubRoles: { include: { department: true }, where: { endAt: null } } },
          skip,
          take
        }),
        prisma.member.groupBy({
          by: ["webRole"],
          _count: { _all: true }
        })
      ]);

      const stats = {
        total: 0,
        admins: 0,
        collab: 0,
        members: 0,
        guests: 0
      };

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
      const target = await prisma.member.findUnique({ where: { id: memberId } });
      if (!target) {
        throw new Error("Member not found");
      }
      if (isRootAdmin(target.email) && !isRootAdmin(admin.email)) {
        throw new Error("Cannot modify root admin");
      }
      const updated = await prisma.member.update({ where: { id: memberId }, data: { webRole } });
      revalidateTag(_CACHE_MEMBERS, "default");
      return updated;
    }
  });

export const adminDeleteMember = async (memberId: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const admin = await requireAdmin(user);
      const target = await prisma.member.findUnique({ where: { id: memberId } });
      if (!target) {
        throw new Error("Member not found");
      }
      if (isRootAdmin(target.email)) {
        throw new Error("Cannot delete root admin");
      }
      if (target.createdBy === null && !isRootAdmin(admin.email)) {
        throw new Error("Only root admin can delete self-registered members");
      }
      await prisma.member.delete({ where: { id: memberId } });
      revalidateTag(_CACHE_MEMBERS, "default");
      return { success: true };
    }
  });

export const adminAddMember = async (data: {
  email: string;
  firstName: string;
  lastName: string;
  webRole?: "ADMIN" | "COLLABORATOR" | "MEMBER" | "GUEST";
  phone?: string;
  dob?: string | null;
  studentId?: string;
  bio?: string;
  githubEmail?: string;
  password?: string;
  socials?: string;
  randomAvatar?: boolean;
  avatar?: string;
  coverImage?: string;
  slug?: string;
  spotifyUri?: string;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const admin = await requireAdmin(user);
      // Check if email already exists
      const existing = await prisma.member.findUnique({ where: { email: data.email } });
      if (existing) {
        throw new Error("Email đã tồn tại trong hệ thống");
      }
      const slug = data.slug?.trim() ? await validateAndCheckSlug(data.slug, "") : await generateUniqueSlug(data.email);
      const supabaseAdmin = createAdminClient();
      let authId = `pending-${Date.now()}`;

      if (data.password) {
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email: data.email,
          password: data.password,
          email_confirm: true,
          user_metadata: { full_name: `${data.firstName} ${data.lastName}` }
        });
        if (userError) {
          throw new Error(`Không thể tạo người dùng trên hệ thống xác thực. ${userError.message}`);
        }
        if (userData?.user) {
          authId = userData.user.id;
        }
      }

      const created = await prisma.member.create({
        data: {
          authId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          webRole: data.webRole ?? "MEMBER",
          createdBy: admin.id,
          slug,
          phone: data.phone || null,
          dob: data.dob ? new Date(data.dob) : null,
          studentId: data.studentId || null,
          bio: data.bio || null,
          githubEmail: data.githubEmail || null,
          socials: data.socials ? JSON.parse(data.socials) : [],
          avatar: data.avatar || (data.randomAvatar !== false ? getDiceBearUrl(data.email) : null),
          coverImage: data.coverImage || null,
          spotifyUri: data.spotifyUri || null
        }
      });
      revalidateTag(_CACHE_MEMBERS, "default");
      return created;
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

export const adminUpdateMember = async (
  memberId: string,
  data: {
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
    githubEmail?: string;
    password?: string;
    leftClubAt?: string | null;
    joinedClubAt?: string | null;
    spotifyUri?: string | null;
  }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const admin = await requireAdmin(user);
      const target = await prisma.member.findUnique({ where: { id: memberId } });
      if (!target) {
        throw new Error("Member not found");
      }
      if (isRootAdmin(target.email) && !isRootAdmin(admin.email)) {
        throw new Error("Cannot modify root admin");
      }

      // Validate slug if provided
      if (data.slug !== undefined) {
        await validateAndCheckSlug(data.slug, memberId);
      }

      // Sync password to Supabase Auth Admin if requested
      if (data.password) {
        const supabaseAdmin = createAdminClient();
        if (target.authId && !target.authId.startsWith("pending")) {
          const { error } = await supabaseAdmin.auth.admin.updateUserById(target.authId, { password: data.password });
          if (error) {
            throw new Error(`Cập nhật mật khẩu trên hệ thống xác thực thất bại: ${error.message}`);
          }
        } else {
          // It's a pending user, let's create them on supabase if we can
          const { data: userData, error } = await supabaseAdmin.auth.admin.createUser({
            email: target.email,
            password: data.password,
            email_confirm: true,
            user_metadata: { full_name: `${data.firstName || target.firstName} ${data.lastName || target.lastName}` }
          });
          if (!error && userData?.user) {
            target.authId = userData.user.id; // prepare to update authId in prisma
          }
        }
      }

      const updated = await prisma.member.update({
        where: { id: memberId },
        data: {
          ...(target.authId && !target.authId.startsWith("pending") ? { authId: target.authId } : {}),
          ...(data.firstName && { firstName: data.firstName }),
          ...(data.lastName && { lastName: data.lastName }),
          ...(data.phone !== undefined && { phone: data.phone || null }),
          ...(data.dob !== undefined && { dob: data.dob ? new Date(data.dob) : null }),
          ...(data.studentId !== undefined && { studentId: data.studentId || null }),
          ...(data.bio !== undefined && { bio: data.bio || null }),
          ...(data.webRole && { webRole: data.webRole }),
          ...(data.avatar !== undefined && { avatar: data.avatar || null }),
          ...(data.coverImage !== undefined && { coverImage: data.coverImage || null }),
          ...(data.socials !== undefined && { socials: data.socials ? JSON.parse(data.socials) : {} }),
          ...(data.slug !== undefined && { slug: data.slug.trim() }),
          ...(data.githubEmail !== undefined && { githubEmail: data.githubEmail || null }),
          ...(data.leftClubAt !== undefined && { leftClubAt: data.leftClubAt ? new Date(data.leftClubAt) : null }),
          ...(data.joinedClubAt !== undefined && {
            joinedClubAt: data.joinedClubAt ? new Date(data.joinedClubAt) : null
          }),
          ...(data.spotifyUri !== undefined && { spotifyUri: data.spotifyUri || null })
        }
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
  data: { position: string; departmentId?: string; term?: number; startAt: string; endAt?: string; note?: string }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const role = await prisma.clubRole.create({
        data: {
          memberId,
          position: data.position as
            | "PRESIDENT"
            | "VICE_PRESIDENT"
            | "DEPARTMENT_LEADER"
            | "DEPARTMENT_VICE_LEADER"
            | "DEPARTMENT_MEMBER"
            | "COLLABORATOR"
            | "ADVISOR",
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
  data: { position: string; departmentId?: string; term?: number; startAt: string; endAt?: string; note?: string }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const role = await prisma.clubRole.update({
        where: { id: roleId },
        data: {
          position: data.position as
            | "PRESIDENT"
            | "VICE_PRESIDENT"
            | "DEPARTMENT_LEADER"
            | "DEPARTMENT_VICE_LEADER"
            | "DEPARTMENT_MEMBER"
            | "COLLABORATOR"
            | "ADVISOR",
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

export const adminSaveMemberFull = async (
  memberId: string | null,
  data: {
    profile: {
      email: string;
      firstName: string;
      lastName: string;
      webRole?: "ADMIN" | "COLLABORATOR" | "MEMBER" | "GUEST";
      phone?: string;
      dob?: string | null;
      studentId?: string;
      bio?: string;
      githubEmail?: string;
      password?: string;
      avatar?: string | null;
      coverImage?: string | null;
      slug?: string;
      leftClubAt?: string | null;
      joinedClubAt?: string | null;
      spotifyUri?: string | null;
    };
    socials: Array<{ platform: string; url: string }>;
    clubRoles: Array<{
      id?: string;
      position: string;
      departmentId?: string | null;
      term?: number | null;
      startAt: string;
      endAt?: string | null;
      note?: string | null;
    }>;
  }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const admin = await requireAdmin(user);
      const { profile, socials, clubRoles } = data;

      let member;
      if (memberId) {
        const target = await prisma.member.findUnique({ where: { id: memberId } });
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

        if (profile.password) {
          const supabaseAdmin = createAdminClient();
          if (target.authId && !target.authId.startsWith("pending")) {
            const { error } = await supabaseAdmin.auth.admin.updateUserById(target.authId, {
              password: profile.password
            });
            if (error) {
              throw new Error(`Cập nhật mật khẩu trên hệ thống xác thực thất bại: ${error.message}`);
            }
          } else {
            const { data: userData, error } = await supabaseAdmin.auth.admin.createUser({
              email: target.email,
              password: profile.password,
              email_confirm: true,
              user_metadata: { full_name: `${profile.firstName} ${profile.lastName}` }
            });
            if (!error && userData?.user) {
              target.authId = userData.user.id;
            }
          }
        }

        member = await prisma.$transaction(async (tx) => {
          const updatedMember = await tx.member.update({
            where: { id: memberId },
            data: {
              ...(target.authId && !target.authId.startsWith("pending") ? { authId: target.authId } : {}),
              email: profile.email,
              firstName: profile.firstName,
              lastName: profile.lastName,
              webRole: profile.webRole ?? "MEMBER",
              phone: profile.phone || null,
              dob: profile.dob ? new Date(profile.dob) : null,
              studentId: profile.studentId || null,
              bio: profile.bio || null,
              avatar: profile.avatar || null,
              coverImage: profile.coverImage || null,
              slug: finalSlug,
              githubEmail: profile.githubEmail || null,
              socials,
              leftClubAt: profile.leftClubAt ? new Date(profile.leftClubAt) : null,
              joinedClubAt: profile.joinedClubAt ? new Date(profile.joinedClubAt) : null,
              spotifyUri: profile.spotifyUri || null
            }
          });

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
              position: role.position as any,
              departmentId: role.departmentId || null,
              term: role.term || null,
              startAt: new Date(role.startAt),
              endAt: role.endAt ? new Date(role.endAt) : null,
              note: role.note || null
            };

            if (role.id) {
              await tx.clubRole.update({
                where: { id: role.id },
                data: roleData
              });
            } else {
              await tx.clubRole.create({
                data: {
                  ...roleData,
                  memberId
                }
              });
            }
          }

          return updatedMember;
        });
      } else {
        // Create mode
        const existing = await prisma.member.findUnique({ where: { email: profile.email } });
        if (existing) {
          throw new Error("Email đã tồn tại trong hệ thống");
        }

        const finalSlug = profile.slug?.trim()
          ? await validateAndCheckSlug(profile.slug, "")
          : await generateUniqueSlug(profile.email);

        const supabaseAdmin = createAdminClient();
        let authId = `pending-${Date.now()}`;

        if (profile.password) {
          const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: profile.email,
            password: profile.password,
            email_confirm: true,
            user_metadata: { full_name: `${profile.firstName} ${profile.lastName}` }
          });
          if (userError) {
            throw new Error(`Không thể tạo người dùng trên hệ thống xác thực: ${userError.message}`);
          }
          if (userData?.user) {
            authId = userData.user.id;
          }
        }

        member = await prisma.$transaction(async (tx) => {
          const createdMember = await tx.member.create({
            data: {
              authId,
              email: profile.email,
              firstName: profile.firstName,
              lastName: profile.lastName,
              webRole: profile.webRole ?? "MEMBER",
              createdBy: admin.id,
              slug: finalSlug,
              phone: profile.phone || null,
              dob: profile.dob ? new Date(profile.dob) : null,
              studentId: profile.studentId || null,
              bio: profile.bio || null,
              avatar: profile.avatar || (profile.avatar !== null ? getDiceBearUrl(profile.email) : null),
              coverImage: profile.coverImage || null,
              socials,
              githubEmail: profile.githubEmail || null,
              leftClubAt: profile.leftClubAt ? new Date(profile.leftClubAt) : null,
              joinedClubAt: profile.joinedClubAt ? new Date(profile.joinedClubAt) : null,
              spotifyUri: profile.spotifyUri || null
            }
          });

          for (const role of clubRoles) {
            await tx.clubRole.create({
              data: {
                memberId: createdMember.id,
                position: role.position as any,
                departmentId: role.departmentId || null,
                term: role.term || null,
                startAt: new Date(role.startAt),
                endAt: role.endAt ? new Date(role.endAt) : null,
                note: role.note || null
              }
            });
          }

          return createdMember;
        });
      }

      await syncMemberActiveStatus(member.id);
      revalidateTag(_CACHE_MEMBERS, "default");
      return member;
    }
  });
