"use server";

import { prisma } from "@/configs/prisma/db";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";
import { groupRolesByTerm, LEADERSHIP_POSITIONS } from "@/utils/leadership-terms";

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
          middleName: true,
          avatar: true,
          slug: true
        }
      }
    }
  },
  author: {
    select: { firstName: true, lastName: true, middleName: true, avatar: true, slug: true }
  },
  tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
  gallery: { orderBy: { order: "asc" } }
} as const;

const PUBLISHED_ACHIEVEMENT = { type: "ACHIEVEMENT", status: "PUBLISHED" } as const;

const HONOREE_SELECT = {
  id: true,
  firstName: true,
  middleName: true,
  lastName: true,
  avatar: true,
  coverImage: true,
  slug: true,
  socials: true,
  _count: { select: { achievementEntries: { where: { post: PUBLISHED_ACHIEVEMENT } }, projects: true } },
  clubRoles: {
    include: { department: { select: { nameVi: true, nameEn: true } } },
    orderBy: { startAt: "desc" }
  }
} as const;

export const getAchievementsPageData = async (validPage: number, take: number, locale = "vi") =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      const isEn = locale === "en";
      const deptName = (d: { nameVi: string; nameEn: string | null } | null) => {
        if (!d) {
          return null;
        }
        return isEn && d.nameEn ? d.nameEn : d.nameVi;
      };

      const skip = (validPage - 1) * take;
      const where = PUBLISHED_ACHIEVEMENT;

      const [total, achievements, leadershipRoles, goldBoardMembers] = await Promise.all([
        prisma.post.count({ where }),
        prisma.post.findMany({
          where,
          skip,
          take,
          orderBy: [{ isHighlight: "desc" }, { achievementDate: "desc" }],
          select: ACHIEVEMENT_SELECT
        }),
        prisma.clubRole.findMany({
          where: {
            position: { in: [...LEADERSHIP_POSITIONS] },
            member: { isActive: true }
          },
          select: {
            memberId: true,
            position: true,
            startAt: true,
            endAt: true,
            department: { select: { nameVi: true, nameEn: true } }
          }
        }),
        prisma.member.findMany({
          where: { isActive: true, achievementEntries: { some: { post: where } } },
          select: { id: true, _count: { select: { achievementEntries: { where: { post: where } } } } },
          orderBy: { achievementEntries: { _count: "desc" } },
          take: 12
        })
      ]);

      const terms = groupRolesByTerm(
        leadershipRoles.map((r) => ({
          memberId: r.memberId,
          position: r.position,
          startAt: r.startAt,
          endAt: r.endAt,
          departmentName: deptName(r.department)
        }))
      );

      const goldBoard: { memberId: string; count: number; rank: number }[] = [];
      for (const [i, m] of goldBoardMembers.entries()) {
        const count = m._count.achievementEntries;
        const prev = goldBoard[i - 1];
        goldBoard.push({ memberId: m.id, count, rank: prev && prev.count === count ? prev.rank : i + 1 });
      }

      const memberIds = [...new Set([...goldBoard.map((g) => g.memberId), ...leadershipRoles.map((r) => r.memberId)])];
      const members = await prisma.member.findMany({
        where: { id: { in: memberIds } },
        select: HONOREE_SELECT
      });

      const people = Object.fromEntries(
        members.map((m) => [
          m.id,
          {
            id: m.id,
            firstName: m.firstName,
            middleName: m.middleName,
            lastName: m.lastName,
            avatar: m.avatar,
            coverImage: m.coverImage,
            slug: m.slug,
            socials: m.socials,
            achievementCount: m._count.achievementEntries,
            projectCount: m._count.projects,
            roles: m.clubRoles.map((r) => ({
              id: r.id,
              position: r.position,
              startAt: r.startAt.toISOString(),
              endAt: r.endAt?.toISOString() ?? null,
              departmentName: deptName(r.department)
            }))
          }
        ])
      );

      return {
        achievements: achievements.map((a) => ({
          id: a.id,
          slug: a.slug,
          title: isEn && a.titleEn ? a.titleEn : a.titleVi,
          thumbnail: a.thumbnail,
          date: a.achievementDate?.toISOString() ?? null,
          type: a.achievementType,
          isHighlight: a.isHighlight,
          members: a.achievementMembers.map((am) => ({
            id: am.member.id,
            firstName: am.member.firstName,
            lastName: am.member.lastName,
            avatar: am.member.avatar
          }))
        })),
        total,
        totalPages: Math.ceil(total / take),
        people,
        goldBoard,
        terms
      };
    }
  });

export const getAchievementBySlug = async (slug: string, locale = "vi") =>
  handleErrorServerNoAuth({
    cb: async () => {
      const post = await prisma.post.findUnique({
        where: {
          slug,
          type: "ACHIEVEMENT",
          status: { in: ["PUBLISHED", "UNLISTED"] }
        },
        select: ACHIEVEMENT_SELECT
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
          tags: post.tags
        }
      };
    }
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
          isHighlight: true
        }
      });
      const isEn = locale === "en";
      return {
        achievements: achievements.map((a) => ({
          ...a,
          title: isEn && a.titleEn ? a.titleEn : a.titleVi,
          summary: isEn && a.summaryEn ? a.summaryEn : a.summaryVi,
          date: a.achievementDate?.toISOString() ?? null,
          type: a.achievementType
        }))
      };
    }
  });

export const getSponsorsPageData = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      return {
        sponsors: await prisma.sponsor.findMany({
          where: { isActive: true },
          include: { sponsorships: { orderBy: { startAt: "asc" } } },
          orderBy: { createdAt: "desc" }
        })
      };
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
          middleName: true,
          avatar: true,
          slug: true,
          socials: true,
          achievementEntries: true,
          clubRoles: {
            orderBy: { startAt: "desc" },
            include: { department: true }
          }
        },
        orderBy: { achievementEntries: { _count: "desc" } },
        take: 20
      });

      return {
        topMembers: topMembers.map((member) => {
          const currentRole = member.clubRoles?.[0] ?? null;
          return {
            id: member.id,
            firstName: member.firstName,
            middleName: member.middleName,
            lastName: member.lastName,
            avatar: member.avatar,
            slug: member.slug,
            socials: member.socials,
            currentRole,
            achievementCount: member.achievementEntries?.length ?? 0
          };
        })
      };
    }
  });

export const getActivitiesPageData = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      const activities = await prisma.activity.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" }
      });
      return { activities };
    }
  });

export const getDepartmentsPageData = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      const departments = await prisma.department.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" }
      });
      return { departments };
    }
  });
