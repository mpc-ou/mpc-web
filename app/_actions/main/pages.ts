"use server";

import { cacheTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import {
  _CACHE_ACHIEVEMENTS,
  _CACHE_ACTIVITIES,
  _CACHE_DEPARTMENTS,
  _CACHE_MEMBERS,
  _CACHE_POSTS,
  _CACHE_PROJECTS,
  _CACHE_SPONSORS
} from "@/constants/cache";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";
import { groupRolesByTerm, LEADERSHIP_POSITIONS, vnYear } from "@/utils/leadership-terms";

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

const rankHonorees = (counts: Map<string, number>) => {
  const sorted = [...counts.entries()].sort(([a, x], [b, y]) => y - x || a.localeCompare(b));
  const ranked: { memberId: string; count: number; rank: number }[] = [];
  for (const [i, [memberId, count]] of sorted.entries()) {
    const prev = ranked[i - 1];
    ranked.push({ memberId, count, rank: prev && prev.count === count ? prev.rank : i + 1 });
  }
  return ranked;
};

export const getAchievementsPageData = async (validPage: number, take: number, locale = "vi") =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache: remote";
      cacheTag(_CACHE_ACHIEVEMENTS);
      cacheTag(_CACHE_MEMBERS);
      const isEn = locale === "en";
      const deptName = (d: { nameVi: string; nameEn: string | null } | null) => {
        if (!d) {
          return null;
        }
        return isEn && d.nameEn ? d.nameEn : d.nameVi;
      };

      const skip = (validPage - 1) * take;
      const where = PUBLISHED_ACHIEVEMENT;

      const [total, achievements, leadershipRoles, honorEntries] = await Promise.all([
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
        prisma.postAchievementMember.findMany({
          where: { post: where, member: { isActive: true } },
          select: { memberId: true, post: { select: { achievementDate: true, createdAt: true } } }
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

      const allCounts = new Map<string, number>();
      const yearCounts = new Map<number, Map<string, number>>();
      for (const e of honorEntries) {
        const year = vnYear(e.post.achievementDate ?? e.post.createdAt);
        allCounts.set(e.memberId, (allCounts.get(e.memberId) ?? 0) + 1);
        const bucket = yearCounts.get(year) ?? new Map<string, number>();
        bucket.set(e.memberId, (bucket.get(e.memberId) ?? 0) + 1);
        yearCounts.set(year, bucket);
      }
      const goldBoard = rankHonorees(allCounts);
      const goldBoardByYear = Object.fromEntries(
        [...yearCounts.entries()].sort(([a], [b]) => b - a).map(([year, counts]) => [year, rankHonorees(counts)])
      );

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
        goldBoardByYear,
        terms
      };
    }
  });

export const getAchievementBySlug = async (slug: string, locale = "vi") =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache: remote";
      cacheTag(_CACHE_ACHIEVEMENTS);
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
      "use cache: remote";
      cacheTag(_CACHE_ACHIEVEMENTS);
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

export const getJourneyTimeline = async (locale = "vi") =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache: remote";
      cacheTag(_CACHE_POSTS);
      cacheTag(_CACHE_PROJECTS);

      const postSelect = {
        id: true,
        slug: true,
        titleVi: true,
        titleEn: true,
        thumbnail: true,
        startAt: true,
        achievementDate: true,
        publishedAt: true,
        createdAt: true
      } as const;

      const [events, achievements, projects] = await Promise.all([
        prisma.post.findMany({
          where: { type: "EVENT", status: "PUBLISHED", eventStatus: { not: "CANCELLED" } },
          select: postSelect
        }),
        prisma.post.findMany({ where: PUBLISHED_ACHIEVEMENT, select: postSelect }),
        prisma.project.findMany({
          where: { isActive: true },
          select: {
            id: true,
            slug: true,
            title: true,
            titleEn: true,
            thumbnail: true,
            startDate: true,
            createdAt: true
          }
        })
      ]);

      const isEn = locale === "en";
      const items = [
        ...events.map((e) => ({
          id: e.id,
          kind: "event" as const,
          href: `/events/${e.slug}`,
          title: isEn && e.titleEn ? e.titleEn : e.titleVi,
          thumbnail: e.thumbnail,
          date: (e.startAt ?? e.publishedAt ?? e.createdAt).toISOString()
        })),
        ...achievements.map((a) => ({
          id: a.id,
          kind: "achievement" as const,
          href: `/achievements/${a.slug}`,
          title: isEn && a.titleEn ? a.titleEn : a.titleVi,
          thumbnail: a.thumbnail,
          date: (a.achievementDate ?? a.publishedAt ?? a.createdAt).toISOString()
        })),
        ...projects.map((p) => ({
          id: p.id,
          kind: "project" as const,
          href: `/projects/${p.slug}`,
          title: isEn && p.titleEn ? p.titleEn : p.title,
          thumbnail: p.thumbnail,
          date: (p.startDate ?? p.createdAt).toISOString()
        }))
      ].sort((x, y) => y.date.localeCompare(x.date));

      return { items };
    }
  });

export const getSponsorLogos = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache: remote";
      cacheTag(_CACHE_SPONSORS);
      const sponsors = await prisma.sponsor.findMany({
        where: { isActive: true, logo: { not: null } },
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, nameEn: true, logo: true }
      });
      return { sponsors };
    }
  });

export const getSponsorsPageData = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache: remote";
      cacheTag(_CACHE_SPONSORS);
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
      "use cache: remote";
      cacheTag(_CACHE_MEMBERS);
      cacheTag(_CACHE_DEPARTMENTS);
      cacheTag(_CACHE_ACTIVITIES);
      cacheTag(_CACHE_PROJECTS);
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
      "use cache: remote";
      cacheTag(_CACHE_ACTIVITIES);
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
      "use cache: remote";
      cacheTag(_CACHE_DEPARTMENTS);
      cacheTag(_CACHE_MEMBERS);
      const departments = await prisma.department.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" }
      });
      return { departments };
    }
  });
