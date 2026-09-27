import type { WebDesignConfig } from "@/types/webdesign";
import { getHeroState, type HeroState, parseVnDate, toMilestoneViews } from "@/utils/webdesign-milestones";

const VN_TIME_ZONE = "Asia/Ho_Chi_Minh";

export type WebDesignSeoInfo = {
  /** Season year, from the contest date (or first milestone); null when no dates are configured. */
  year: number | null;
  /** Contest (final) day formatted for the locale, or null when not configured. */
  contestDateLabel: string | null;
  /** ISO start/end of the whole season, for Event structured data. */
  startIso: string | null;
  endIso: string | null;
  /** Where the season currently is (upcoming / ongoing phase / ended); null without dates or without `now`. */
  hero: HeroState | null;
};

export function formatVnDate(ms: number, locale: string): string {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    timeZone: VN_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(ms);
}

/**
 * Derives everything the SEO layer (metadata, OG image, JSON-LD) needs from the admin config.
 * `now` is optional because Server Components with cacheComponents may not read the clock;
 * only the OG route (a dynamic request) passes it to get the live phase.
 */
export function getWebDesignSeoInfo(config: WebDesignConfig, locale: string, now?: number): WebDesignSeoInfo {
  const views = toMilestoneViews(config.milestones, locale, { contestDate: config.contestDate, title: "Web Design" });
  const contestMs = parseVnDate(config.contestDate);
  const hasContest = !Number.isNaN(contestMs);

  const first = views[0];
  const last = views.at(-1);
  const yearSource = hasContest ? contestMs : first?.startMs;
  const year = yearSource === undefined ? null : new Date(yearSource).getFullYear();

  const startMs = first?.startMs ?? (hasContest ? contestMs : undefined);
  const endMs = Math.max(last?.endMs ?? Number.NEGATIVE_INFINITY, hasContest ? contestMs : Number.NEGATIVE_INFINITY);

  return {
    year,
    contestDateLabel: hasContest ? formatVnDate(contestMs, locale) : null,
    startIso: startMs === undefined ? null : new Date(startMs).toISOString(),
    endIso: Number.isFinite(endMs) ? new Date(endMs).toISOString() : null,
    hero: now === undefined ? null : getHeroState(views, now)
  };
}
