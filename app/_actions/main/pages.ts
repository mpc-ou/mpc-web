"use server";

import { prisma } from "@/configs/prisma/db";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

const ACHIEVEMENT_SELECT = {
  id: true,
  titleVi: true,
  titleEn: true,
  slug: true,
  summaryVi: true,
  summaryEn: true,
  contentVi: true,
  contentEn: true,
  thumbnail: true,
  images: true,
  achievementType: true,
  achievementDate: true,
  isHighlight: true,
  relatedUrl: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  achievementMembers: {
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          slug: true,
        },
      },
    },
  },
  author: {
    select: { firstName: true, lastName: true, avatar: true, slug: true },
  },
  tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
  gallery: { orderBy: { order: "asc" } },
} as const;

export const getAchievementsPageData = async (
  validPage: number,
  take: number,
  locale = "vi",
) =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      const skip = (validPage - 1) * take;
      const where = {
        type: "ACHIEVEMENT" as const,
        status: "PUBLISHED" as const,
      };

      const [total, achievements] = await Promise.all([
        prisma.post.count({ where }),
        prisma.post.findMany({
          where,
          skip,
          take,
          orderBy: { achievementDate: "desc" },
          select: ACHIEVEMENT_SELECT,
        }),
      ]);

      const totalPages = Math.ceil(total / take);

      const historicalRoles = await prisma.clubRole.findMany({
        where: {
          position: {
            in: [
              "PRESIDENT",
              "VICE_PRESIDENT",
              "DEPARTMENT_LEADER",
              "DEPARTMENT_VICE_LEADER",
              "ADVISOR",
            ],
          },
          member: { isActive: true },
        },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              slug: true,
              socials: true,
              coverImage: true,
              _count: { select: { achievementEntries: true, projects: true } },
            },
          },
          department: true,
        },
        orderBy: { startAt: "asc" },
      });

      const leaderMap = new Map<string, unknown>();
      for (const r of historicalRoles) {
        if (!leaderMap.has(r.member.id)) {
          leaderMap.set(r.member.id, {
            member: r.member,
            roles: [] as Record<string, unknown>[],
          });
        }
        (
          leaderMap.get(r.member.id) as { roles: Record<string, unknown>[] }
        ).roles.push({
          id: r.id,
          position: r.position,
          startAt: r.startAt.toISOString(),
          endAt: r.endAt?.toISOString() ?? null,
          departmentName:
            locale === "en" && r.department?.nameEn
              ? r.department.nameEn
              : (r.department?.nameVi ?? null),
        });
      }

      const leaders = Array.from(leaderMap.values()).map((l) => {
        (l as { roles: Record<string, unknown>[] }).roles.sort(
          (a, b) =>
            new Date(b.startAt as string).getTime() -
            new Date(a.startAt as string).getTime(),
        );
        return l;
      });

      // Gold board — all members with achievements, not just leadership
      const goldBoardMembers = await prisma.member.findMany({
        where: {
          achievementEntries: { some: {} },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          slug: true,
          _count: { select: { achievementEntries: true, projects: true } },
          clubRoles: {
            include: { department: true },
            orderBy: { startAt: "desc" },
            take: 1,
          },
        },
        orderBy: { achievementEntries: { _count: "desc" } },
        take: 12,
      });

      const goldBoard = goldBoardMembers.map((m) => ({
        member: {
          id: m.id,
          firstName: m.firstName,
          lastName: m.lastName,
          avatar: m.avatar,
          slug: m.slug,
          _count: m._count,
        },
        roles: m.clubRoles.map((r) => ({
          position: r.position,
          departmentName:
            locale === "en" && r.department?.nameEn
              ? r.department.nameEn
              : (r.department?.nameVi ?? null),
        })),
      }));

      const isEn = locale === "en";
      return {
        achievements: achievements.map((a) => ({
          ...a,
          title: isEn && a.titleEn ? a.titleEn : a.titleVi,
          summary: isEn && a.summaryEn ? a.summaryEn : a.summaryVi,
          content: isEn && a.contentEn ? a.contentEn : a.contentVi,
          date: a.achievementDate?.toISOString() ?? null,
          type: a.achievementType,
          members: a.achievementMembers,
        })),
        totalPages,
        leaders,
        goldBoard,
      };
    },
  });

export const getAchievementBySlug = async (slug: string, locale = "vi") =>
  handleErrorServerNoAuth({
    cb: async () => {
      const post = await prisma.post.findUnique({
        where: {
          slug,
          type: "ACHIEVEMENT",
          status: { in: ["PUBLISHED", "UNLISTED"] },
        },
        select: ACHIEVEMENT_SELECT,
      });

      if (!post) {
        return { achievement: null };
      }

      const isEn = locale === "en";
      return {
        achievement: {
          ...post,
          title: isEn && post.titleEn ? post.titleEn : post.titleVi,
          summary: isEn && post.summaryEn ? post.summaryEn : post.summaryVi,
          content: isEn && post.contentEn ? post.contentEn : post.contentVi,
          date: post.achievementDate?.toISOString() ?? null,
          type: post.achievementType,
          members: post.achievementMembers,
          creator: post.author,
          tags: post.tags,
        },
      };
    },
  });

export const getRecentAchievements = async (take = 4, locale = "vi") =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      const achievements = await prisma.post.findMany({
        where: { type: "ACHIEVEMENT", status: "PUBLISHED" },
        take,
        orderBy: { achievementDate: "desc" },
        select: {
          id: true,
          titleVi: true,
          titleEn: true,
          slug: true,
          summaryVi: true,
          summaryEn: true,
          thumbnail: true,
          achievementDate: true,
          achievementType: true,
          isHighlight: true,
        },
      });
      const isEn = locale === "en";
      return {
        achievements: achievements.map((a) => ({
          ...a,
          title: isEn && a.titleEn ? a.titleEn : a.titleVi,
          summary: isEn && a.summaryEn ? a.summaryEn : a.summaryVi,
          date: a.achievementDate?.toISOString() ?? null,
          type: a.achievementType,
        })),
      };
    },
  });

export const getSponsorsPageData = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      return {
        sponsors: await prisma.sponsor.findMany({
          where: { isActive: true },
          include: { sponsorships: { orderBy: { startAt: "asc" } } },
          orderBy: { createdAt: "desc" },
        }),
      };
    },
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
          achievementEntries: true,
          clubRoles: {
            orderBy: { startAt: "desc" },
            include: { department: true },
          },
        },
        orderBy: { achievementEntries: { _count: "desc" } },
        take: 20,
      });

      return {
        topMembers: topMembers.map((member) => {
          const currentRole = member.clubRoles?.[0] ?? null;
          return {
            id: member.id,
            firstName: member.firstName,
            lastName: member.lastName,
            avatar: member.avatar,
            slug: member.slug,
            socials: member.socials,
            currentRole,
            achievementCount: member.achievementEntries?.length ?? 0,
          };
        }),
      };
    },
  });

export const getActivitiesPageData = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      const activities = await prisma.activity.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      });
      return { activities };
    },
  });

export const getDepartmentsPageData = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      const departments = await prisma.department.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      });
      return { departments };
    },
  });
