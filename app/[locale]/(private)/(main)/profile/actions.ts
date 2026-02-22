"use server";

import { cacheTag, updateTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_MEMBERS, _CACHE_PROFILE } from "@/constants/cache";
import { handleErrorServerWithAuth } from "@/utils/handle-error-server";

const getProfile = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      "use cache";
      cacheTag(`${_CACHE_PROFILE}::${user?.id}`);

      const member = await prisma.member.findUnique({
        where: {
          authId: user?.id
        },
        include: {
          clubRoles: {
            include: { department: true },
            orderBy: { startAt: "desc" }
          }
        }
      });

      return {
        ...user,
        member
      };
    }
  });

const updateProfile = async (data: {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
  studentId?: string;
  socials?: any;
  dob?: Date;
  avatar?: string;
  coverImage?: string;
  slug?: string;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      if (!user) {
        throw new Error("User Not Found!");
      }

      // Look up by authId first, then fall back to email (handles admin pre-created members
      // whose authId is still "pending-*" and hasn't been synced yet via auth callback)
      const existing = await prisma.member.findFirst({
        where: {
          OR: [{ authId: user.id }, { email: user.email ?? "" }]
        }
      });

      let updatedMember;

      if (existing) {
        // Validate slug uniqueness (exclude current member)
        if (data.slug) {
          const slugTaken = await prisma.member.findFirst({
            where: { slug: data.slug, id: { not: existing.id } }
          });
          if (slugTaken) {
            throw new Error("Slug đã được sử dụng bởi thành viên khác");
          }
          if (data.slug === "me") {
            throw new Error('Slug không được là "me"');
          }
        }

        updatedMember = await prisma.member.update({
          where: { id: existing.id },
          data: {
            ...data,
            // Always bind the real authId if it was still a placeholder
            ...(existing.authId.startsWith("pending-") ? { authId: user.id } : {})
          }
        });
      } else {
        // Completely new self-registered user — create member
        updatedMember = await prisma.member.create({
          data: {
            authId: user.id,
            email: user.email ?? "",
            firstName: data.firstName ?? "",
            lastName: data.lastName ?? "",
            bio: data.bio,
            phone: data.phone,
            studentId: data.studentId,
            socials: data.socials,
            dob: data.dob,
            avatar: data.avatar,
            coverImage: data.coverImage,
            slug: data.slug
          }
        });
      }

      updateTag(_CACHE_MEMBERS);
      updateTag(`${_CACHE_PROFILE}::${user.id}`);
      return updatedMember;
    }
  });

export { getProfile, updateProfile };
