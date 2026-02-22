"use server";

import { revalidateTag } from "next/cache";
import { _CACHE_MEMBERS } from "@/constants/cache";
import { isRootAdmin } from "@/utils/admin";
import { generateUniqueSlug, handleErrorServerWithAuth, prisma, requireAdmin } from "./_helpers";

export const adminGetMembers = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.member.findMany({
        orderBy: { createdAt: "desc" },
        include: { clubRoles: { include: { department: true }, where: { endAt: null } } }
      });
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
      const created = await prisma.member.create({
        data: {
          authId: `pending-${Date.now()}`, // Placeholder until user logs in
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          webRole: data.webRole ?? "MEMBER",
          createdBy: admin.id,
          slug
        }
      });
      revalidateTag(_CACHE_MEMBERS, "default");
      return created;
    }
  });

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
        const slug = data.slug.trim();
        if (!slug) {
          throw new Error("Slug không được để trống");
        }
        if (slug === "me") {
          throw new Error('Slug không được là "me"');
        }
        if (!/^[a-z0-9_-]+$/.test(slug)) {
          throw new Error("Slug chỉ được chứa chữ thường, số, dấu gạch ngang và gạch dưới");
        }
        const slugTaken = await prisma.member.findFirst({
          where: { slug, id: { not: memberId } }
        });
        if (slugTaken) {
          throw new Error("Slug đã được sử dụng bởi thành viên khác");
        }
      }

      const updated = await prisma.member.update({
        where: { id: memberId },
        data: {
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
          ...(data.slug !== undefined && { slug: data.slug.trim() })
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
