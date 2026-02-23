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
      cacheTag(_CACHE_FAQ, _CACHE_SETTINGS);

      // Check if template mode is enabled
      const templateSetting = await prisma.siteSetting.findUnique({
        where: { key: "faq_use_template" }
      });

      if (templateSetting?.value === "true") {
        // Read from static JSON file
        const faqJson = (await import("@/configs/data/fqa.json")).default as Array<{
          vi: { q: string; a: string };
          en: { q: string; a: string };
        }>;
        return faqJson.map((item, index) => {
          const localeData = locale === "en" ? item.en : item.vi;
          return {
            id: `template-${String(index)}`,
            question: localeData.q,
            answer: localeData.a,
            order: index,
          };
        });
      }

      // Read from DB (bilingual model)
      const items = await prisma.faqItem.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" }
      });

      return items.map((item) => ({
        id: item.id,
        question: locale === "en" ? (item.questionEn || item.questionVi) : item.questionVi,
        answer: locale === "en" ? (item.answerEn || item.answerVi) : item.answerVi,
        order: item.order,
      }));
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

const getFooterData = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_SETTINGS);

      const [settings, externalLinks] = await Promise.all([
        prisma.siteSetting.findMany({
          where: {
            key: {
              in: [
                "footer_fanpage",
                "footer_youtube",
                "footer_github",
                "footer_mail",
              ]
            }
          }
        }),
        prisma.externalLink.findMany({
          where: { isActive: true },
          orderBy: { order: "asc" }
        })
      ]);

      const settingsMap: Record<string, string> = {};
      for (const s of settings) {
        settingsMap[s.key] = s.value;
      }

      return { settings: settingsMap, externalLinks };
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
  getFooterData,
  getGalleryImages,
  getLeadership,
  getMemberCount,
  getUpcomingEventsCount,
  getHeaderProfile
};
