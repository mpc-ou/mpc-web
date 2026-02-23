"use server";

import { handleErrorServerNoAuth } from "@/utils/handle-error-server";
import { prisma } from "@/configs/prisma/db";

export const getAchievementsPageData = async (validPage: number, take: number) =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      const skip = (validPage - 1) * take;

      const [total, achievements] = await Promise.all([
        prisma.achievement.count(),
        prisma.achievement.findMany({
          skip,
          take,
          orderBy: { date: "desc" },
          include: {
            members: {
              include: { member: true }
            }
          }
        })
      ]);

      const totalPages = Math.ceil(total / take);

      const historicalRoles = await prisma.clubRole.findMany({
        where: {
          position: {
            in: ["PRESIDENT", "VICE_PRESIDENT", "DEPARTMENT_LEADER", "DEPARTMENT_VICE_LEADER", "ADVISOR"]
          },
          member: {
            isActive: true
          }
        },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              slug: true,
              socials: true
            }
          },
          department: true
        },
        orderBy: { startAt: "asc" }
      });

      const leaderMap = new Map<string, any>();
      historicalRoles.forEach((r) => {
        if (!leaderMap.has(r.member.id)) {
          leaderMap.set(r.member.id, {
            member: r.member,
            roles: []
          });
        }
        leaderMap.get(r.member.id).roles.push({
          id: r.id,
          position: r.position,
          startAt: r.startAt.toISOString(),
          endAt: r.endAt?.toISOString() || null,
          departmentName: r.department?.name || null
        });
      });

      const leaders = Array.from(leaderMap.values()).map((l) => {
        l.roles.sort((a: any, b: any) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
        return l;
      });

      return { achievements, totalPages, leaders };
    }
  });

export const getSponsorsPageData = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      const sponsors = await prisma.sponsor.findMany({
        where: { isActive: true },
        include: {
          sponsorships: {
            orderBy: { startAt: "asc" }
          }
        },
        orderBy: { createdAt: "desc" }
      });
      return { sponsors };
    }
  });

export const getAboutPageData = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      const topMembers = await prisma.member.findMany({
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          slug: true,
          socials: true,
          achievements: true,
          clubRoles: {
            orderBy: { startAt: "desc" },
            include: { department: true }
          }
        },
        orderBy: {
          achievements: {
            _count: "desc"
          }
        },
        take: 20
      });

      // Transform topMembers for client so that new Date() isn't triggered in the page
      const transformedMembers = topMembers.map((member: any) => {
        const currentRole = member.clubRoles?.[0] || null;
        return {
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          avatar: member.avatar,
          slug: member.slug,
          socials: member.socials,
          currentRole,
          achievementCount: member.achievements?.length || 0
        };
      });

      return { topMembers: transformedMembers };
    }
  });
