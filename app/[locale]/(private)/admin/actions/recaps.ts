"use server";

import { revalidateTag } from "next/cache";
import { _CACHE_RECAPS } from "@/constants/cache";
import type { RecapData, RecapTimelineItem } from "@/lib/recap-data";
import { handleErrorServerWithAuth, prisma, requireAdmin } from "./_helpers";

// ── List all recaps ──
export const adminGetRecaps = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.yearRecap.findMany({
        orderBy: { year: "desc" },
        select: {
          year: true,
          name: true,
          description: true,
          isPublished: true,
          createdAt: true
        }
      });
    }
  });

// ── Get single recap ──
export const adminGetRecap = async (year: number) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const recap = await prisma.yearRecap.findUnique({ where: { year } });
      return recap ?? { notFound: true };
    }
  });

// ── Create recap ──
export const adminCreateRecap = async (data: {
  year: number;
  name: string;
  description?: string;
  coverImage?: string | null;
  coverImage2?: string | null;
  coverImage3?: string | null;
  endImage?: string | null;
  musicUrl?: string | null;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const created = await prisma.yearRecap.create({
        data: {
          year: data.year,
          name: data.name,
          description: data.description || null,
          coverImage: data.coverImage ?? null,
          coverImage2: data.coverImage2 ?? null,
          coverImage3: data.coverImage3 ?? null,
          endImage: data.endImage ?? null,
          musicUrl: data.musicUrl ?? null
        }
      });
      revalidateTag(_CACHE_RECAPS, "default");
      return created;
    }
  });

// ── Update recap (partial) ──
export const adminUpdateRecap = async (
  year: number,
  data: {
    name?: string;
    description?: string;
    coverImage?: string | null;
    coverImage2?: string | null;
    coverImage3?: string | null;
    endImage?: string | null;
    musicUrl?: string | null;
    isPublished?: boolean;
    data?: any;
  }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const updated = await prisma.yearRecap.update({
        where: { year },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
          ...(data.coverImage2 !== undefined && { coverImage2: data.coverImage2 }),
          ...(data.coverImage3 !== undefined && { coverImage3: data.coverImage3 }),
          ...(data.endImage !== undefined && { endImage: data.endImage }),
          ...(data.musicUrl !== undefined && { musicUrl: data.musicUrl }),
          ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
          ...(data.data !== undefined && { data: data.data })
        }
      });
      revalidateTag(_CACHE_RECAPS, "default");
      return updated;
    }
  });

// ── Delete recap ──
export const adminDeleteRecap = async (year: number) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      await prisma.yearRecap.delete({ where: { year } });
      revalidateTag(_CACHE_RECAPS, "default");
      return { success: true };
    }
  });

// ── Get candidates for a year ──
// Returns events, achievements, projects that fall within the given year
export const adminGetRecapCandidates = async (year: number) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);

      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

      const [events, achievements, projects] = await Promise.all([
        prisma.event.findMany({
          where: { startAt: { gte: startOfYear, lte: endOfYear } },
          orderBy: { startAt: "asc" },
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            description: true,
            startAt: true,
            status: true,
            type: true,
            location: true,
            images: true
          }
        }),
        prisma.achievement.findMany({
          where: { date: { gte: startOfYear, lte: endOfYear } },
          orderBy: { date: "asc" },
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            summary: true,
            date: true,
            type: true,
            images: true,
            members: {
              include: {
                member: { select: { firstName: true, lastName: true, avatar: true } }
              }
            }
          }
        }),
        prisma.project.findMany({
          where: {
            OR: [{ startDate: { gte: startOfYear, lte: endOfYear } }, { endDate: { gte: startOfYear, lte: endOfYear } }]
          },
          orderBy: { startDate: "asc" },
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            description: true,
            startDate: true,
            technologies: true,
            members: {
              include: {
                member: { select: { firstName: true, lastName: true, avatar: true } }
              }
            }
          }
        })
      ]);

      return {
        events: events.map((e) => ({ ...e, startAt: e.startAt.toISOString() })),
        achievements: achievements.map((a) => ({ ...a, date: a.date.toISOString() })),
        projects: projects.map((p) => ({
          ...p,
          startDate: p.startDate?.toISOString() ?? null
        }))
      };
    }
  });

// ── Build & save recap data JSON ──
export const adminBuildRecapData = async (
  year: number,
  selectedEventIds: string[],
  selectedAchievementIds: string[],
  selectedProjectIds: string[]
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);

      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

      // Fetch selected items with full details
      const [events, achievements, projects] = await Promise.all([
        prisma.event.findMany({
          where: { id: { in: selectedEventIds } },
          include: { gallery: { orderBy: { order: "asc" } } }
        }),
        prisma.achievement.findMany({
          where: { id: { in: selectedAchievementIds } },
          include: {
            members: {
              include: { member: { select: { firstName: true, lastName: true, avatar: true } } }
            }
          }
        }),
        prisma.project.findMany({
          where: { id: { in: selectedProjectIds } },
          include: {
            members: {
              include: { member: { select: { firstName: true, lastName: true, avatar: true } } }
            }
          }
        })
      ]);

      // ── Stats ──
      const eventsByType: Record<string, number> = {};
      for (const e of events) {
        const t = e.type ?? "OTHER";
        eventsByType[t] = (eventsByType[t] || 0) + 1;
      }

      // New members: members whose earliest ClubRole startAt falls within `year`
      const allMembersWithRoles = await prisma.member.findMany({
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          clubRoles: {
            orderBy: { startAt: "asc" },
            take: 1,
            select: { startAt: true }
          }
        }
      });

      let totalMembersBefore = 0;
      let newMembersInYear = 0;
      const newMembersList: RecapData["newMembers"] = [];

      for (const m of allMembersWithRoles) {
        const earliest = m.clubRoles[0]?.startAt;
        if (!earliest) {
          continue;
        }
        if (earliest < startOfYear) {
          totalMembersBefore++;
        } else if (earliest >= startOfYear && earliest <= endOfYear) {
          newMembersInYear++;
          newMembersList.push({
            id: m.id,
            firstName: m.firstName,
            lastName: m.lastName,
            avatar: m.avatar
          });
        }
      }

      // Executive Board
      const execRoles = await prisma.clubRole.findMany({
        where: {
          position: {
            in: ["PRESIDENT", "VICE_PRESIDENT", "DEPARTMENT_LEADER", "DEPARTMENT_VICE_LEADER"]
          },
          OR: [
            { term: year },
            {
              startAt: { lte: endOfYear },
              OR: [{ endAt: null }, { endAt: { gte: startOfYear } }]
            }
          ]
        },
        include: {
          member: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          department: { select: { nameVi: true } }
        }
      });

      const execBoardMap = new Map();
      const posOrder: Record<string, number> = {
        PRESIDENT: 1,
        VICE_PRESIDENT: 2,
        DEPARTMENT_LEADER: 3,
        DEPARTMENT_VICE_LEADER: 4
      };

      for (const role of execRoles) {
        let posStr: string = role.position;
        if (role.position === "PRESIDENT") {
          posStr = "Chủ nhiệm";
        } else if (role.position === "VICE_PRESIDENT") {
          posStr = "Phó Chủ nhiệm";
        } else if (role.position === "DEPARTMENT_LEADER") {
          posStr = "Trưởng ban";
        } else if (role.position === "DEPARTMENT_VICE_LEADER") {
          posStr = "Phó ban";
        }

        const mappedRole = {
          id: role.member.id,
          firstName: role.member.firstName,
          lastName: role.member.lastName,
          avatar: role.member.avatar,
          position: posStr,
          department: role.department?.nameVi ?? null,
          _order: posOrder[role.position] || 99
        };

        if (execBoardMap.has(role.member.id)) {
          // If a member has multiple exec roles, keep the higher rank one
          const existing = execBoardMap.get(role.member.id);
          if (mappedRole._order < existing._order) {
            execBoardMap.set(role.member.id, mappedRole);
          }
        } else {
          execBoardMap.set(role.member.id, mappedRole);
        }
      }

      const executiveBoardList = Array.from(execBoardMap.values())
        .sort((a, b) => a._order - b._order)
        .map(({ _order, ...rest }) => rest);

      // ── Timeline ──
      const timeline: RecapTimelineItem[] = [];

      for (const e of events) {
        timeline.push({
          type: "event",
          id: e.id,
          title: e.title,
          date: e.startAt.toISOString(),
          thumbnail: e.thumbnail,
          description: e.content || e.description,
          eventType: e.type ?? undefined,
          images: [...(e.images || []), ...(e.gallery?.map((g) => g.url) || [])],
          location: e.location ?? undefined
        });
      }

      for (const a of achievements) {
        timeline.push({
          type: "achievement",
          id: a.id,
          title: a.title,
          date: a.date.toISOString(),
          thumbnail: a.thumbnail,
          description: a.content || a.summary,
          achievementType: a.type,
          images: a.images?.filter(Boolean) ?? [],
          members: a.members.map((am) => ({
            firstName: am.member.firstName,
            lastName: am.member.lastName,
            avatar: am.member.avatar,
            role: am.role
          }))
        });
      }

      for (const p of projects) {
        timeline.push({
          type: "project",
          id: p.id,
          title: p.title,
          date: (p.startDate ?? p.createdAt).toISOString(),
          thumbnail: p.thumbnail,
          description: p.content || p.description,
          projectMembers: p.members.map((pm) => ({
            firstName: pm.member.firstName,
            lastName: pm.member.lastName,
            avatar: pm.member.avatar,
            role: pm.role
          })),
          technologies: (p.technologies as string[]) ?? []
        });
      }

      // Sort timeline by date ascending
      timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const recapData: RecapData = {
        stats: {
          totalEvents: events.length,
          eventsByType,
          totalAchievements: achievements.length,
          totalProjects: projects.length,
          totalMembersBefore,
          newMembersInYear
        },
        executiveBoard: executiveBoardList,
        newMembers: newMembersList,
        timeline
      };

      // Save to DB
      await prisma.yearRecap.update({
        where: { year },
        data: { data: recapData as any }
      });

      revalidateTag(_CACHE_RECAPS, "default");
      return recapData;
    }
  });
