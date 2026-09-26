import { localizedText, type WebDesignMilestone } from "@/types/webdesign";

const DAY_MS = 86_400_000;
const HAS_TZ_RE = /(Z|[+-]\d{2}:?\d{2})$/i;
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Admin enters times without a timezone (datetime-local); they always mean Vietnam time (UTC+7),
 * so every viewer — whatever their own timezone — sees the same countdown and progress.
 */
export function parseVnDate(value: string): number {
  if (!value) {
    return Number.NaN;
  }
  if (HAS_TZ_RE.test(value)) {
    return new Date(value).getTime();
  }
  const withTime = DATE_ONLY_RE.test(value) ? `${value}T00:00` : value;
  return new Date(`${withTime}+07:00`).getTime();
}
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/;

export type MilestoneView = {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  startMs: number;
  endMs: number;
};

export type MilestoneStatus = "done" | "current" | "upcoming";

export type HeroState =
  | { kind: "upcoming"; title: string; target: number }
  | { kind: "ongoing"; title: string; target: number }
  | { kind: "ended" };

/**
 * Resolves milestones for the viewer's locale. Without milestones, the single `contestDate`
 * becomes a one-day milestone so the hero still counts down and then shows "ongoing".
 * Times are interpreted as UTC+7 (see `parseVnDate`).
 */
export function toMilestoneViews(
  milestones: WebDesignMilestone[],
  locale: string,
  fallback: { contestDate?: string; title: string }
): MilestoneView[] {
  let source = milestones;
  if (source.length === 0 && fallback.contestDate) {
    source = [
      {
        id: "contest-day",
        start: fallback.contestDate,
        end: "",
        title: { vi: fallback.title, en: fallback.title },
        description: { vi: "", en: "" }
      }
    ];
  }

  return source
    .map((m) => {
      const startMs = parseVnDate(m.start);
      const parsedEnd = parseVnDate(m.end);
      // A missing or non-positive range means "that whole day".
      const endMs = Number.isNaN(parsedEnd) || parsedEnd <= startMs ? startMs + DAY_MS : parsedEnd;
      return {
        id: m.id,
        title: localizedText(locale, m.title),
        description: localizedText(locale, m.description),
        start: m.start,
        end: m.end,
        startMs,
        endMs
      };
    })
    .filter((m) => !Number.isNaN(m.startMs))
    .sort((a, b) => a.startMs - b.startMs);
}

export function getMilestoneStatus(m: MilestoneView, now: number): MilestoneStatus {
  if (now >= m.endMs) {
    return "done";
  }
  return now >= m.startMs ? "current" : "upcoming";
}

export function getHeroState(views: MilestoneView[], now: number): HeroState | null {
  if (views.length === 0) {
    return null;
  }
  const current = views.find((m) => getMilestoneStatus(m, now) === "current");
  if (current) {
    return { kind: "ongoing", title: current.title, target: current.endMs };
  }
  const next = views.find((m) => m.startMs > now);
  return next ? { kind: "upcoming", title: next.title, target: next.startMs } : { kind: "ended" };
}

/**
 * Position (0–1) of `now` along a track where milestone `i` owns the slice [i/n, (i+1)/n):
 * it advances through a slice while that milestone runs and waits at the boundary between milestones.
 */
export function getTimelineProgress(views: MilestoneView[], now: number): number {
  const n = views.length;
  if (n === 0) {
    return 0;
  }
  let progress = 0;
  views.forEach((m, i) => {
    if (now >= m.endMs) {
      progress = (i + 1) / n;
    } else if (now >= m.startMs) {
      progress = (i + (now - m.startMs) / (m.endMs - m.startMs)) / n;
    }
  });
  return Math.min(1, Math.max(0, progress));
}

/**
 * Formats "01/10 – 31/10/2026" or "05/12/2026 · 08:00–17:00" straight from the stored strings,
 * so server and client render identical text regardless of timezone.
 */
export function formatMilestoneRange(start: string, end: string): string {
  const s = DATE_RE.exec(start);
  if (!s) {
    return "";
  }
  const e = DATE_RE.exec(end);
  const [, sy, sm, sd, sh, smin] = s;
  const startDay = `${sd}/${sm}`;
  if (!e) {
    return `${startDay}/${sy}`;
  }
  const [, ey, em, ed, eh, emin] = e;
  if (sy === ey && sm === em && sd === ed) {
    return sh && eh ? `${startDay}/${sy} · ${sh}:${smin}–${eh}:${emin}` : `${startDay}/${sy}`;
  }
  return sy === ey ? `${startDay} – ${ed}/${em}/${ey}` : `${startDay}/${sy} – ${ed}/${em}/${ey}`;
}
