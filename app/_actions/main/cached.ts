import { cacheTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import {
  _CACHE_ACHIEVEMENTS,
  _CACHE_ANNOUNCEMENTS,
  _CACHE_EVENTS,
  _CACHE_FAQ,
  _CACHE_GALLERY,
  _CACHE_MEMBERS,
  _CACHE_POSTS,
  _CACHE_PROJECTS,
  _CACHE_SETTINGS
} from "@/constants/cache";

export const getUpcomingEventsCountCached = async () => {
  "use cache";
  cacheTag(_CACHE_EVENTS);
  return {
    count: await prisma.post.count({
      where: { type: "EVENT", eventStatus: { in: ["UPCOMING", "COMPLETED"] } }
    })
  };
};

export const getActiveAnnouncementCached = async () => {
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
};

export const getFaqItemsCached = async (locale: string, target?: string) => {
  "use cache";
  cacheTag(_CACHE_FAQ);

  const items = await prisma.faqItem.findMany({
    where: {
      isActive: true,
      ...(target ? { target } : {})
    },
    orderBy: { order: "asc" }
  });

  return items.map((item) => ({
    id: item.id,
    question: locale === "en" ? item.questionEn || item.questionVi : item.questionVi,
    answer: locale === "en" ? item.answerEn || item.answerVi : item.answerVi,
    order: item.order,
    target: item.target
  }));
};

export const getGalleryImagesCached = async (type: string) => {
  "use cache";
  cacheTag(_CACHE_GALLERY);

  const images = await prisma.galleryImage.findMany({
    where: {
      isActive: true,
      type
    },
    orderBy: { order: "asc" }
  });

  return images;
};

export const getFooterDataCached = async () => {
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
};

export const getTerminalStatsCached = async () => {
  "use cache";
  cacheTag(_CACHE_MEMBERS);
  cacheTag(_CACHE_POSTS);
  cacheTag(_CACHE_EVENTS);
  cacheTag(_CACHE_ACHIEVEMENTS);
  cacheTag(_CACHE_PROJECTS);

  const [memberCount, postCount, projectCount, eventCount, achievementCount] = await Promise.all([
    prisma.member.count({
      where: { isActive: true, webRole: { not: "GUEST" } }
    }),
    prisma.post.count({
      where: { type: "BLOG", status: { in: ["PUBLISHED", "UNLISTED"] } }
    }),
    prisma.project.count({ where: { isActive: true } }),
    prisma.post.count({
      where: { type: "EVENT", status: { in: ["PUBLISHED", "UNLISTED"] } }
    }),
    prisma.post.count({
      where: {
        type: "ACHIEVEMENT",
        status: { in: ["PUBLISHED", "UNLISTED"] }
      }
    })
  ]);

  return {
    members: memberCount,
    posts: postCount,
    projects: projectCount,
    events: eventCount,
    achievements: achievementCount,
    github: "https://github.com/Mobile-Programming-Club-MPC",
    fanpage: "https://www.facebook.com/CLBLapTrinhTrenThietBiDiDong"
  };
};
