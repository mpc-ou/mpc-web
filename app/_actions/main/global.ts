"use server";

import { handleErrorServerNoAuth } from "@/utils/handle-error-server";
import {
  getActiveAnnouncementCached,
  getFaqItemsCached,
  getFooterDataCached,
  getGalleryImagesCached,
  getTerminalStatsCached,
  getUpcomingEventsCountCached
} from "./cached";

export const getUpcomingEventsCount = async () =>
  handleErrorServerNoAuth({
    cb: getUpcomingEventsCountCached
  });

export const getActiveAnnouncement = async () =>
  handleErrorServerNoAuth({
    cb: getActiveAnnouncementCached
  });

export const getFaqItems = async (locale: string, target?: string) =>
  handleErrorServerNoAuth({
    cb: () => getFaqItemsCached(locale, target)
  });

export const getGalleryImages = async (type = "common") =>
  handleErrorServerNoAuth({
    cb: () => getGalleryImagesCached(type)
  });

export const getFooterData = async () =>
  handleErrorServerNoAuth({
    cb: getFooterDataCached
  });

export const getTerminalStats = async () =>
  handleErrorServerNoAuth({
    cb: getTerminalStatsCached
  });

export const getSiteSettings = async (keys: string[]) =>
  handleErrorServerNoAuth({
    cb: () => import("./cached").then((m) => m.getSiteSettingsCached(keys))
  });

export const getSitemapData = async () =>
  handleErrorServerNoAuth({
    cb: () => import("./cached").then((m) => m.getSitemapDataCached())
  });
