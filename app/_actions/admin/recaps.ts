"use server";

import { revalidateTag } from "next/cache";
import { _CACHE_RECAPS } from "@/constants/cache";
import type { RecapData, RecapTimelineItem } from "@/lib/recap-data";
import { handleErrorServerWithAuth, prisma, requireAdmin } from "./helpers";

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

export const adminGetRecapsPaginated = async (params: { page: number; limit: number; search?: string }) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const page = params.page || 1;
      const limit = params.limit || 10;
      const search = params.search || "";

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } }
        ];
      }

      const [recaps, total] = await Promise.all([
        prisma.yearRecap.findMany({
          where,
          orderBy: { year: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            year: true,
            name: true,
            description: true,
            isPublished: true,
            coverImage: true,
            createdAt: true
          }
        }),
        prisma.yearRecap.count({ where })
      ]);

      const mappedRecaps = recaps.map((r) => ({
        ...r,
        createdAt: new Date(r.createdAt).toISOString()
      }));

      return {
        recaps: mappedRecaps,
        total
      };
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
          ...(data.description !== undefined && {
            description: data.description
          }),
          ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
          ...(data.coverImage2 !== undefined && {
            coverImage2: data.coverImage2
          }),
          ...(data.coverImage3 !== undefined && {
            coverImage3: data.coverImage3
          }),
          ...(data.endImage !== undefined && { endImage: data.endImage }),
          ...(data.musicUrl !== undefined && { musicUrl: data.musicUrl }),
          ...(data.isPublished !== undefined && {
            isPublished: data.isPublished
          }),
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
        prisma.post.findMany({
          where: {
            type: "EVENT",
            startAt: { gte: startOfYear, lte: endOfYear }
          },
          orderBy: { startAt: "asc" },
          select: {
            id: true,
            titleVi: true,
            slug: true,
            thumbnail: true,
            summaryVi: true,
            startAt: true,
            eventStatus: true,
            eventType: true,
            locationVi: true,
            locationEn: true,
            images: true
          }
        }),
        prisma.post.findMany({
          where: {
            type: "ACHIEVEMENT",
            achievementDate: { gte: startOfYear, lte: endOfYear }
          },
          orderBy: { achievementDate: "asc" },
          select: {
            id: true,
            titleVi: true,
            slug: true,
            thumbnail: true,
            summaryVi: true,
            achievementDate: true,
            achievementType: true,
            images: true,
            achievementMembers: {
              include: {
                member: {
                  select: { firstName: true, lastName: true, middleName: true, avatar: true }
                }
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
                member: {
                  select: { firstName: true, lastName: true, middleName: true, avatar: true }
                }
              }
            }
          }
        })
      ]);

      return {
        events: events.map((e) => ({
          id: e.id,
          title: e.titleVi,
          slug: e.slug,
          thumbnail: e.thumbnail,
          description: e.summaryVi,
          startAt: e.startAt?.toISOString(),
          status: e.eventStatus,
          type: e.eventType,
          location: e.locationVi || e.locationEn || null,
          images: e.images
        })),
        achievements: achievements.map((a) => ({
          id: a.id,
          title: a.titleVi,
          slug: a.slug,
          thumbnail: a.thumbnail,
          summary: a.summaryVi,
          date: a.achievementDate?.toISOString(),
          type: a.achievementType,
          images: a.images,
          members: a.achievementMembers
        })),
        projects: projects.map((p) => ({
          ...p,
          startDate: p.startDate?.toISOString() ?? null
        }))
      };
    }
  });

// ── Helper: resolve position label in both locales ──
const POSITION_LABELS: Record<string, { vi: string; en: string }> = {
  PRESIDENT: { vi: "Chủ nhiệm", en: "President" },
  VICE_PRESIDENT: { vi: "Phó Chủ nhiệm", en: "Vice President" },
  DEPARTMENT_LEADER: { vi: "Trưởng ban", en: "Department Lead" },
  DEPARTMENT_VICE_LEADER: { vi: "Phó ban", en: "Vice Department Lead" }
};

function resolvePositionLabel(position: string, locale: "vi" | "en"): string {
  return POSITION_LABELS[position]?.[locale] ?? position;
}

// ── Build & save recap data JSON ──
// Now stores bilingual data: Vietnamese as primary, English as fallback fields
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

      // Fetch selected items with full details (bilingual)
      const [events, achievements, projects] = await Promise.all([
        prisma.post.findMany({
          where: { id: { in: selectedEventIds }, type: "EVENT" },
          include: { gallery: { orderBy: { order: "asc" } } }
        }),
        prisma.post.findMany({
          where: { id: { in: selectedAchievementIds }, type: "ACHIEVEMENT" },
          include: {
            achievementMembers: {
              include: {
                member: {
                  select: { firstName: true, lastName: true, middleName: true, avatar: true }
                }
              }
            }
          }
        }),
        prisma.project.findMany({
          where: { id: { in: selectedProjectIds } },
          include: {
            members: {
              include: {
                member: {
                  select: { firstName: true, lastName: true, middleName: true, avatar: true }
                }
              }
            }
          }
        })
      ]);

      // ── Stats ──
      const eventsByType: Record<string, number> = {};
      for (const e of events) {
        const t = e.eventType ?? "OTHER";
        eventsByType[t] = (eventsByType[t] || 0) + 1;
      }

      // New members: members whose earliest ClubRole startAt falls within `year`
      const allMembersWithRoles = await prisma.member.findMany({
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
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
            middleName: m.middleName,
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
          member: {
            select: { id: true, firstName: true, lastName: true, middleName: true, avatar: true }
          },
          department: { select: { nameVi: true, nameEn: true } }
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
        const mappedRole = {
          id: role.member.id,
          firstName: role.member.firstName,
          middleName: role.member.middleName,
          lastName: role.member.lastName,
          avatar: role.member.avatar,
          position: resolvePositionLabel(role.position, "vi"),
          positionEn: resolvePositionLabel(role.position, "en"),
          department: role.department?.nameVi ?? null,
          departmentEn: role.department?.nameEn ?? null,
          _order: posOrder[role.position] || 99
        };

        const existing = execBoardMap.get(role.member.id) as typeof mappedRole | undefined;
        if (existing && mappedRole._order >= existing._order) {
          continue;
        }
        execBoardMap.set(role.member.id, mappedRole);
      }

      const executiveBoardList = Array.from(execBoardMap.values())
        .sort((a, b) => a._order - b._order)
        .map(({ _order, ...rest }) => rest);

      // ── Timeline (bilingual) ──
      const timeline: RecapTimelineItem[] = [];

      for (const e of events) {
        timeline.push({
          type: "event",
          id: e.id,
          title: e.titleVi,
          titleEn: e.titleEn || null,
          date: e.startAt?.toISOString() ?? "",
          thumbnail: e.thumbnail,
          description: e.contentVi || e.summaryVi || null,
          descriptionEn: e.contentEn || e.summaryEn || null,
          eventType: e.eventType ?? undefined,
          images: [...e.images, ...(e.gallery?.map((g) => g.url) || [])],
          location: e.locationVi || e.locationEn || undefined,
          locationEn: e.locationEn || null
        });
      }

      for (const a of achievements) {
        timeline.push({
          type: "achievement",
          id: a.id,
          title: a.titleVi,
          titleEn: a.titleEn || null,
          date: a.achievementDate?.toISOString() ?? "",
          thumbnail: a.thumbnail,
          description: a.contentVi || a.summaryVi || null,
          descriptionEn: a.contentEn || a.summaryEn || null,
          achievementType: a.achievementType ?? undefined,
          images: a.images?.filter(Boolean) ?? [],
          members: a.achievementMembers.map((am) => ({
            firstName: am.member.firstName,
            middleName: am.member.middleName,
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
          titleEn: p.titleEn || null,
          date: (p.startDate ?? p.createdAt).toISOString(),
          thumbnail: p.thumbnail,
          description: p.content || p.description,
          descriptionEn: p.contentEn || p.descriptionEn || null,
          projectMembers: p.members.map((pm) => ({
            firstName: pm.member.firstName,
            middleName: pm.member.middleName,
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
        executiveBoard: executiveBoardList as RecapData["executiveBoard"],
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

export const adminGetRecapsStats = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const [total, published, draft] = await Promise.all([
        prisma.yearRecap.count(),
        prisma.yearRecap.count({ where: { isPublished: true } }),
        prisma.yearRecap.count({ where: { isPublished: false } })
      ]);
      return { total, published, draft };
    }
  });
