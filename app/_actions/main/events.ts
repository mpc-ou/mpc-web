"use server";

import { prisma } from "@/configs/prisma/db";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

export const getEventsPageData = async (validPage: number, take: number, locale = "vi") =>
  handleErrorServerNoAuth({
    cb: async () => {
      const skip = (validPage - 1) * take;

      const where = {
        type: "EVENT" as const,
        status: "PUBLISHED" as const,
        eventStatus: {
          in: ["UPCOMING" as const, "ONGOING" as const, "COMPLETED" as const]
        }
      };

      const [total, events] = await Promise.all([
        prisma.post.count({ where }),
        prisma.post.findMany({
          where,
          skip,
          take,
          orderBy: { startAt: "desc" },
          select: {
            id: true,
            titleVi: true,
            titleEn: true,
            slug: true,
            summaryVi: true,
            summaryEn: true,
            thumbnail: true,
            startAt: true,
            endAt: true,
            locationVi: true,
            locationEn: true,
            eventStatus: true,
            eventType: true,
            tags: { include: { tag: true } }
          }
        })
      ]);

      const totalPages = Math.ceil(total / take);
      const isEn = locale === "en";

      return {
        events: events.map((e) => ({
          ...e,
          title: isEn && e.titleEn ? e.titleEn : e.titleVi,
          description: isEn && e.summaryEn ? e.summaryEn : (e.summaryVi ?? ""),
          location: isEn && e.locationEn ? e.locationEn : (e.locationVi ?? ""),
          status: e.eventStatus,
          type: e.eventType,
          startAt: e.startAt?.toISOString(),
          endAt: e.endAt ? e.endAt.toISOString() : null
        })),
        totalPages
      };
    }
  });

export const getEventBySlug = async (slug: string, locale = "vi") =>
  handleErrorServerNoAuth({
    cb: async () => {
      const post = await prisma.post.findUnique({
        where: {
          slug,
          type: "EVENT",
          status: { in: ["PUBLISHED", "UNLISTED"] }
        },
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
              middleName: true,
              avatar: true,
              slug: true
            }
          },
          sponsorships: { include: { sponsor: true } },
          organizers: {
            include: {
              member: {
                select: {
                  firstName: true,
                  lastName: true,
                  middleName: true,
                  avatar: true,
                  slug: true,
                  clubRoles: {
                    where: { endAt: null },
                    include: { department: true }
                  }
                }
              }
            }
          },
          gallery: { orderBy: { order: "asc" } },
          tags: { include: { tag: true } }
        }
      });

      if (!post) {
        return { event: null };
      }

      const isEn = locale === "en";
      const title = isEn && post.titleEn ? post.titleEn : post.titleVi;
      const description = isEn && post.summaryEn ? post.summaryEn : (post.summaryVi ?? "");
      const content = isEn && post.contentEn ? post.contentEn : post.contentVi;

      return {
        event: {
          ...post,
          title,
          titleVi: post.titleVi,
          titleEn: post.titleEn,
          description,
          summaryVi: post.summaryVi,
          summaryEn: post.summaryEn,
          content,
          contentVi: post.contentVi,
          contentEn: post.contentEn,
          sourceLanguage: post.sourceLanguage,
          locationVi: post.locationVi,
          locationEn: post.locationEn,
          latitude: post.latitude,
          longitude: post.longitude,
          type: post.eventType,
          status: post.eventStatus,
          creator: post.author,
          startAt: post.startAt?.toISOString(),
          endAt: post.endAt ? post.endAt.toISOString() : null
        }
      };
    }
  });

export const getRecentEvents = async (take = 3, locale = "vi") =>
  handleErrorServerNoAuth({
    cb: async () => {
      const events = await prisma.post.findMany({
        where: {
          type: "EVENT",
          status: "PUBLISHED",
          eventStatus: { in: ["UPCOMING", "ONGOING", "COMPLETED"] }
        },
        take,
        orderBy: { startAt: "desc" },
        select: {
          id: true,
          titleVi: true,
          titleEn: true,
          slug: true,
          summaryVi: true,
          summaryEn: true,
          thumbnail: true,
          startAt: true,
          eventStatus: true,
          eventType: true
        }
      });

      const isEn = locale === "en";

      return {
        events: events.map((e) => ({
          ...e,
          title: isEn && e.titleEn ? e.titleEn : e.titleVi,
          description: isEn && e.summaryEn ? e.summaryEn : (e.summaryVi ?? ""),
          status: e.eventStatus,
          type: e.eventType,
          startAt: e.startAt?.toISOString()
        }))
      };
    }
  });
