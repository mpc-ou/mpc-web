"use server";

import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/configs/supabase/admin";
import { _CACHE_MEMBERS } from "@/constants/cache";
import { isRootAdmin } from "@/utils/admin";
import { getDiceBearUrl } from "@/utils/dicebear-avatar";
import { generateUniqueSlug, handleErrorServerWithAuth, prisma, requireAdmin } from "./_helpers";

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
  webRole?: "MEMBER" | "COLLABORATOR";
  phone?: string;
  dob?: string | null;
  studentId?: string;
  bio?: string;
  githubEmail?: string;
  password?: string;
  socials?: string;
  randomAvatar?: boolean;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const admin = await requireAdmin(user);
      // Check if email already exists
      const existing = await prisma.member.findUnique({ where: { email: data.email } });
      if (existing) {
        throw new Error("Email đã tồn tại trong hệ thống");
      }
      const slug = await generateUniqueSlug(data.email);
      const supabaseAdmin = createAdminClient();
      let authId = `pending-${Date.now()}`;

      // Create user in Supabase Auth directly if we have an admin client ready
      if (data.password) {
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email: data.email,
          password: data.password,
          email_confirm: true,
          user_metadata: { full_name: `${data.firstName} ${data.lastName}` }
        });
        if (userError) {
          throw new Error("Không thể tạo người dùng trên hệ thống xác thực. " + userError.message);
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
          avatar: data.randomAvatar !== false ? getDiceBearUrl(data.email) : null
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
            throw new Error("Cập nhật mật khẩu trên hệ thống xác thực thất bại: " + error.message);
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
          })
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
      revalidateTag(_CACHE_MEMBERS, "default");
      return role;
    }
  });

export const adminRemoveClubRole = async (roleId: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      await prisma.clubRole.delete({ where: { id: roleId } });
      revalidateTag(_CACHE_MEMBERS, "default");
      return { success: true };
    }
  });
