"use server";

import { prisma } from "@/configs/prisma/db";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

export const getEventsPageData = async (validPage: number, take: number) =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
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

      return { events, totalPages };
    }
  });

export const getEventBySlug = async (slug: string) =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
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
      return { event };
    }
  });

export const getRecentEvents = async (take = 3) =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
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
      return { events };
    }
  });
