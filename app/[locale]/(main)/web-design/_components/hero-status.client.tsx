"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { WebDesignMilestone } from "@/types/webdesign";
import { getHeroState, type HeroState, toMilestoneViews } from "@/utils/webdesign-milestones";

type CountdownParts = { days: number; hours: number; minutes: number; seconds: number };

function toParts(target: number, now: number): CountdownParts {
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60
  };
}

const pad = (n: number) => n.toString().padStart(2, "0");

/**
 * Hero status block: counts down to the next milestone, shows "happening now" (with time left)
 * while one is running, and a closing note once every milestone has passed.
 */
export function HeroStatus({ milestones, contestDate }: { milestones: WebDesignMilestone[]; contestDate?: string }) {
  const t = useTranslations("webdesign");
  const locale = useLocale();
  // Null until mounted: "now" differs between server and client, so we only render it client-side.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const views = toMilestoneViews(milestones, locale, { contestDate, title: t("contestDay") });
  if (views.length === 0) {
    return null;
  }

  const state = now === null ? null : getHeroState(views, now);

  if (state?.kind === "ended") {
    return (
      <div className='rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-muted-foreground text-sm dark:border-white/10'>
        {t("seasonEnded")}
      </div>
    );
  }

  const isOngoing = state?.kind === "ongoing";

  return (
    <div className='flex flex-col gap-2.5 pt-1'>
      <StatusLabel state={state} />
      <CountdownBoxes isOngoing={isOngoing} parts={state && now !== null ? toParts(state.target, now) : null} />
    </div>
  );
}

function StatusLabel({ state }: { state: Exclude<HeroState, { kind: "ended" }> | null }) {
  const t = useTranslations("webdesign");

  if (state?.kind === "ongoing") {
    return (
      <div className='flex flex-wrap items-center gap-2'>
        <span className='inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-0.5 font-bold text-[11px] text-emerald-500 uppercase tracking-[0.1em] dark:text-emerald-400'>
          <span className='h-1.5 w-1.5 rounded-full bg-emerald-500 motion-safe:animate-pulse' />
          {t("ongoingBadge")}
        </span>
        <span className='font-mono text-[11px] text-muted-foreground uppercase tracking-[0.14em]'>
          {t("ongoingEndsIn", { title: state.title })}
        </span>
      </div>
    );
  }

  return (
    <span className='font-mono text-[11px] text-muted-foreground uppercase tracking-[0.14em]'>
      {state ? t("countdownTo", { title: state.title }) : t("countdownTitle")}
    </span>
  );
}

function CountdownBoxes({ parts, isOngoing }: { parts: CountdownParts | null; isOngoing: boolean }) {
  const t = useTranslations("webdesign");
  const units = [
    { key: "d", label: t("countdownDays"), value: parts?.days },
    { key: "h", label: t("countdownHours"), value: parts?.hours },
    { key: "m", label: t("countdownMinutes"), value: parts?.minutes },
    { key: "s", label: t("countdownSeconds"), value: parts?.seconds }
  ];
  const accent = isOngoing
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
    : "border-orange-500/30 bg-orange-500/10 text-orange-400";

  return (
    <div className='flex gap-2'>
      {units.map((unit, idx) => {
        const isAccent = idx === units.length - 1;
        return (
          <div
            className={cn(
              "w-18 rounded-xl border pt-3 pb-2.5 text-center sm:w-19.5",
              isAccent ? accent : "border-border/60 bg-card/70 text-foreground dark:border-white/10"
            )}
            key={unit.key}
          >
            <div className='font-mono font-semibold text-[1.75rem] tabular-nums leading-none sm:text-[1.875rem]'>
              {unit.value === undefined ? "--" : pad(unit.value)}
            </div>
            <div
              className={cn(
                "mt-1.5 font-bold text-[11px] uppercase tracking-[0.08em]",
                !isAccent && "text-muted-foreground"
              )}
            >
              {unit.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
