"use server";

import { cacheTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import {
  _CACHE_ANNOUNCEMENTS,
  _CACHE_EVENTS,
  _CACHE_FAQ,
  _CACHE_GALLERY,
  _CACHE_SETTINGS
} from "@/constants/cache";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

export const getUpcomingEventsCount = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_EVENTS);
      return { count: await prisma.event.count({ where: { status: { in: ["UPCOMING", "COMPLETED"] } } }) };
    }
  });

export const getActiveAnnouncement = async () =>
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

export const getFaqItems = async (locale: string) =>
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
            order: index
          };
        });
      }

      // Read from DB
      const items = await prisma.faqItem.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" }
      });

      return items.map((item) => ({
        id: item.id,
        question: locale === "en" ? item.questionEn || item.questionVi : item.questionVi,
        answer: locale === "en" ? item.answerEn || item.answerVi : item.answerVi,
        order: item.order
      }));
    }
  });

export const getGalleryImages = async () =>
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

export const getFooterData = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_SETTINGS);

      const [settings, externalLinks] = await Promise.all([
        prisma.siteSetting.findMany({
          where: {
            key: {
              in: ["footer_fanpage", "footer_youtube", "footer_github", "footer_mail"]
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
