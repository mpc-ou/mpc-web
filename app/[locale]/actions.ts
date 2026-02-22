"use server";

import { cacheTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import {
  _CACHE_ANNOUNCEMENTS,
  _CACHE_EVENTS,
  _CACHE_FAQ,
  _CACHE_GALLERY,
  _CACHE_MEMBERS,
  _CACHE_SETTINGS
} from "@/constants/cache";
import { handleErrorServerNoAuth, handleErrorServerWithAuth } from "@/utils/handle-error-server";

const getLeadership = async () =>
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

const getMemberCount = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_MEMBERS);
      return { count: await prisma.member.count({ where: { isActive: true } }) };
    }
  });

const getUpcomingEventsCount = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_EVENTS);
      return { count: await prisma.event.count({ where: { status: { in: ["UPCOMING", "COMPLETED"] } } }) };
    }
  });

const getActiveAnnouncement = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_ANNOUNCEMENTS);

      const now = new Date();
      const announcement = await prisma.announcement.findFirst({
        where: {
          isActive: true,
          startAt: { lte: now },
          OR: [{ endAt: null }, { endAt: { gte: now } }]
        },
        orderBy: { createdAt: "desc" }
      });

      return { announcement };
    }
  });

const getFaqItems = async (locale: string) =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_FAQ);

      const items = await prisma.faqItem.findMany({
        where: { isActive: true, locale },
        orderBy: { order: "asc" }
      });

      return items;
    }
  });

const getGalleryImages = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_GALLERY);

      const images = await prisma.galleryImage.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" }
      });

      return images;
    }
  });

const getHeaderProfile = async () =>
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

export {
  getActiveAnnouncement,
  getFaqItems,
  getGalleryImages,
  getLeadership,
  getMemberCount,
  getUpcomingEventsCount,
  getHeaderProfile
};
