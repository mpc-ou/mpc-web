"use server";

import { prisma } from "@/configs/prisma/db";

import { cacheTag } from "next/cache";
import { _CACHE_MEMBERS } from "@/constants/cache";
import { handleErrorServerNoAuth, handleErrorServerWithAuth } from "@/utils/handle-error-server";

export const getMemberBySlug = async (slug: string) =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_MEMBERS);

      const member = await prisma.member.findUnique({
        where: { slug },
        include: {
          clubRoles: {
            include: { department: true },
            orderBy: { startAt: "desc" }
          },
          achievements: {
            include: { achievement: true },
            take: 6,
            orderBy: { achievement: { date: "desc" } }
          },
          projects: {
            include: { project: true },
            take: 6
          },
          authoredPosts: {
            where: { status: "PUBLISHED" },
            take: 4,
            orderBy: { publishedAt: "desc" }
          }
        }
      });
      return { member };
    }
  });

export const getMemberSlugByAuthId = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const member = await prisma.member.findUnique({
        where: { authId: user!.id },
        select: { slug: true }
      });
      return { slug: member?.slug ?? null };
    }
  });
