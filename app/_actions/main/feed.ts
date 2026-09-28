"use server";

import { cacheTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_EVENTS, _CACHE_POSTS } from "@/constants/cache";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

export type FeedKind = "event" | "achievement" | "blog";

export type FeedItem = {
  id: string;
  kind: FeedKind;
  slug: string;
  title: string;
  summary: string | null;
  thumbnail: string | null;
  date: string | null;
  isPinned: boolean;
  eventStatus: string | null;
  eventType: string | null;
};

const FEED_SELECT = {
  id: true,
  titleVi: true,
  titleEn: true,
  slug: true,
  summaryVi: true,
  summaryEn: true,
  thumbnail: true,
  isPinned: true,
  publishedAt: true,
  createdAt: true,
  startAt: true,
  achievementDate: true,
  eventStatus: true,
  eventType: true
} as const;

export const getLatestFeed = async (locale = "vi", perKind = 5) =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache: remote";
      cacheTag(_CACHE_POSTS);
      cacheTag(_CACHE_EVENTS);

      const [events, achievements, blogs] = await Promise.all([
        prisma.post.findMany({
          where: { type: "EVENT", status: "PUBLISHED", eventStatus: { in: ["UPCOMING", "ONGOING", "COMPLETED"] } },
          orderBy: [{ isPinned: "desc" }, { startAt: "desc" }],
          take: perKind,
          select: FEED_SELECT
        }),
        prisma.post.findMany({
          where: { type: "ACHIEVEMENT", status: "PUBLISHED" },
          orderBy: [{ isHighlight: "desc" }, { achievementDate: "desc" }],
          take: perKind,
          select: FEED_SELECT
        }),
        prisma.post.findMany({
          where: { type: "BLOG", status: "PUBLISHED" },
          orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
          take: perKind,
          select: FEED_SELECT
        })
      ]);

      const isEn = locale === "en";
      type Row = (typeof events)[number];
      const toItem = (row: Row, kind: FeedKind, date: Date | null): FeedItem => ({
        id: row.id,
        kind,
        slug: row.slug,
        title: isEn && row.titleEn ? row.titleEn : row.titleVi,
        summary: isEn && row.summaryEn ? row.summaryEn : row.summaryVi,
        thumbnail: row.thumbnail,
        date: (date ?? row.publishedAt ?? row.createdAt).toISOString(),
        isPinned: row.isPinned,
        eventStatus: row.eventStatus,
        eventType: row.eventType
      });

      return {
        items: [
          ...events.map((e) => toItem(e, "event", e.startAt)),
          ...achievements.map((a) => toItem(a, "achievement", a.achievementDate)),
          ...blogs.map((b) => toItem(b, "blog", b.publishedAt))
        ]
      };
    }
  });
