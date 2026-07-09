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
          id: user?.id
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
  middleName?: string | null;
  lastName?: string;
  bio?: string;
  phone?: string;
  studentId?: string;
  socials?: any;
  dob?: Date;
  avatar?: string;
  coverImage?: string;
  slug?: string;
  spotifyUri?: string;
  showDob?: boolean;
  showPhone?: boolean;
  showStudentId?: boolean;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      if (!user) {
        throw new Error("User Not Found!");
      }

      const existing = await prisma.member.findFirst({
        where: {
          OR: [{ id: user.id }, { email: user.email ?? "" }]
        }
      });

      let updatedMember;

      if (existing) {
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
            ...data
          }
        });
      } else {
        updatedMember = await prisma.member.create({
          data: {
            id: user.id,
            email: user.email ?? "",
            firstName: data.firstName ?? "",
            middleName: data.middleName,
            lastName: data.lastName ?? "",
            bio: data.bio,
            phone: data.phone,
            studentId: data.studentId,
            socials: data.socials,
            dob: data.dob,
            showDob: data.showDob,
            showPhone: data.showPhone,
            showStudentId: data.showStudentId,
            avatar: data.avatar,
            coverImage: data.coverImage,
            slug: data.slug,
            spotifyUri: data.spotifyUri
          }
        });
      }

      updateTag(_CACHE_MEMBERS);
      updateTag(`${_CACHE_PROFILE}::${user.id}`);
      return updatedMember;
    }
  });

export { getProfile, updateProfile };
