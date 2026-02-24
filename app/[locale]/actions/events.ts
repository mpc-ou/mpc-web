"use server";

import { prisma } from "@/configs/prisma/db";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

export const getEventsPageData = async (validPage: number, take: number) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const skip = (validPage - 1) * take;

      const [total, events] = await Promise.all([
        prisma.event.count({
          where: {
            status: { in: ["UPCOMING", "ONGOING", "COMPLETED"] }
          }
        }),
        prisma.event.findMany({
          where: {
            status: { in: ["UPCOMING", "ONGOING", "COMPLETED"] }
          },
          skip,
          take,
          orderBy: { startAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            thumbnail: true,
            startAt: true,
            endAt: true,
            location: true,
            status: true,
            tags: {
              include: { tag: true }
            }
          }
        })
      ]);

      const totalPages = Math.ceil(total / take);

      const serializedEvents = events.map((e) => ({
        ...e,
        startAt: e.startAt.toISOString(),
        endAt: e.endAt ? e.endAt.toISOString() : null
      }));

      return { events: serializedEvents, totalPages };
    }
  });

export const getEventBySlug = async (slug: string) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const event = await prisma.event.findUnique({
        where: { slug },
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
              slug: true
            }
          },
          sponsorships: {
            include: { sponsor: true }
          },
          organizers: {
            include: {
              member: {
                select: {
                  firstName: true,
                  lastName: true,
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
          gallery: {
            orderBy: { order: "asc" }
          },
          tags: {
            include: { tag: true }
          }
        }
      });
      if (!event) {
        return { event: null };
      }

      const serializedEvent = {
        ...event,
        startAt: event.startAt.toISOString(),
        endAt: event.endAt ? event.endAt.toISOString() : null
      };

      return { event: serializedEvent };
    }
  });

export const getRecentEvents = async (take = 3) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const events = await prisma.event.findMany({
        where: {
          status: { in: ["UPCOMING", "ONGOING", "COMPLETED"] }
        },
        take,
        orderBy: { startAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          thumbnail: true,
          startAt: true,
          status: true
        }
      });
      const serializedEvents = events.map((e) => ({
        ...e,
        startAt: e.startAt.toISOString()
      }));
      return { events: serializedEvents };
    }
  });
