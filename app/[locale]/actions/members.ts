"use server";

import { cacheTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_MEMBERS } from "@/constants/cache";
import { handleErrorServerNoAuth, handleErrorServerWithAuth } from "@/utils/handle-error-server";

export const getLeadership = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_MEMBERS);

      const leaders = await prisma.member.findMany({
        where: {
          isActive: true,
          clubRoles: {
            some: {
              endAt: null,
              position: {
                in: ["PRESIDENT", "VICE_PRESIDENT", "DEPARTMENT_LEADER", "DEPARTMENT_VICE_LEADER"]
              }
            }
          }
        },
        select: {
          id: true,
          slug: true,
          firstName: true,
          lastName: true,
          avatar: true,
          bio: true,
          socials: true,
          clubRoles: {
            where: {
              endAt: null,
              position: {
                in: ["PRESIDENT", "VICE_PRESIDENT", "DEPARTMENT_LEADER", "DEPARTMENT_VICE_LEADER"]
              }
            },
            include: { department: true },
            orderBy: { startAt: "desc" }
          }
        },
        orderBy: { createdAt: "asc" }
      });

      return leaders;
    }
  });

export const getMemberCount = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_MEMBERS);
      return { count: await prisma.member.count({ where: { isActive: true, webRole: { not: "GUEST" } } }) };
    }
  });

export const getMembersGroupedByYear = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_MEMBERS);

      const members = await prisma.member.findMany({
        where: {
          isActive: true,
          clubRoles: { some: {} }
        },
        include: {
          clubRoles: {
            orderBy: { startAt: "desc" },
            include: { department: true }
          }
        }
      });

      const groupedByYear = members.reduce(
        (acc, member) => {
          if (member.clubRoles.length === 0) {
            return acc;
          }
          const entryRole = member.clubRoles.at(-1);
          if (!entryRole) {
            return acc;
          }
          const year =
            entryRole.startAt instanceof Date
              ? entryRole.startAt.getFullYear()
              : new Date(entryRole.startAt).getFullYear();

          if (!acc[year]) {
            acc[year] = [];
          }

          acc[year].push({
            id: member.id,
            firstName: member.firstName,
            lastName: member.lastName,
            avatar: member.avatar,
            slug: member.slug,
            socials: member.socials,
            currentRole: member.clubRoles[0]
          });
          return acc;
        },
        {} as Record<number, any[]>
      );

      const sortedYears = Object.keys(groupedByYear)
        .map(Number)
        .sort((a, b) => b - a);

      return { groupedByYear, sortedYears };
    }
  });

export const getHeaderProfile = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const member = await prisma.member.findUnique({
        where: { authId: user?.id },
        select: {
          firstName: true,
          lastName: true,
          avatar: true,
          webRole: true,
          slug: true
        }
      });

      return {
        fullName: member ? `${member.firstName} ${member.lastName}` : (user?.user_metadata.full_name ?? null),
        avatarUrl: member?.avatar ?? user?.user_metadata.avatar_url ?? null,
        isAdmin: member?.webRole === "ADMIN",
        webRole: member?.webRole ?? "GUEST",
        slug: member?.slug ?? null
      };
    }
  });
