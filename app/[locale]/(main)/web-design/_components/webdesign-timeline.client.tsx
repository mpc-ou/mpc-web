"use client";

import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type CSSProperties, useEffect, useState } from "react";
import { SectionHeading } from "@/components/custom/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { cn } from "@/lib/utils";
import type { WebDesignMilestone } from "@/types/webdesign";
import {
  formatMilestoneRange,
  getMilestoneStatus,
  getTimelineProgress,
  type MilestoneStatus,
  toMilestoneViews
} from "@/utils/webdesign-milestones";
import { WD_SECTION_IDS, WdSection } from "./wd-primitives";

const PALETTE = [
  { dot: "bg-orange-500", ring: "ring-orange-500/30", label: "text-orange-400" },
  { dot: "bg-blue-500", ring: "ring-blue-500/30", label: "text-blue-400" },
  { dot: "bg-pink-500", ring: "ring-pink-500/30", label: "text-pink-400" },
  { dot: "bg-emerald-500", ring: "ring-emerald-500/30", label: "text-emerald-400" }
];

type PhaseItem = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  status: MilestoneStatus | null;
};

export function WebDesignTimelineClient({ milestones }: { milestones: WebDesignMilestone[] }) {
  const t = useTranslations("webdesign");
  const locale = useLocale();
  // Null until mounted so SSR markup matches; progress then animates in from 0.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const views = toMilestoneViews(milestones, locale, { title: "" });
  const hasDates = views.length > 0;

  // Without admin-defined milestones, fall back to the four generic phases from i18n (no progress).
  const items: PhaseItem[] = hasDates
    ? views.map((m) => ({
        id: m.id,
        eyebrow: formatMilestoneRange(m.start, m.end),
        title: m.title,
        description: m.description,
        status: now === null ? null : getMilestoneStatus(m, now)
      }))
    : ([1, 2, 3, 4] as const).map((phase) => ({
        id: `phase-${phase}`,
        eyebrow: t(`phase${phase}Title`),
        title: t(`phase${phase}`),
        description: t(`phase${phase}Desc`),
        status: null
      }));

  const progress = hasDates && now !== null ? getTimelineProgress(views, now) : 0;

  return (
    <WdSection id={WD_SECTION_IDS.timeline}>
      <ScrollReveal>
        <SectionHeading
          className='mb-10'
          description={t("timelineSubtitle")}
          index='03'
          tag='timeline'
          title={t("timelineTitle")}
        />
      </ScrollReveal>

      <div className='relative'>
        <ProgressTrack progress={progress} showProgress={hasDates} />

        {/* One column per phase on desktop, so the row never wraps. */}
        <ol
          className='relative grid gap-4 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))] lg:gap-3'
          style={{ "--cols": items.length } as CSSProperties}
        >
          {items.map((item, idx) => (
            <ScrollReveal as='li' className='flex flex-col gap-4 lg:gap-5' delay={idx * 90} key={item.id}>
              <PhaseDot paletteIndex={idx} status={item.status} />
              <PhaseCard item={item} paletteIndex={idx} />
            </ScrollReveal>
          ))}
        </ol>
      </div>
    </WdSection>
  );
}

/** Desktop track: dim base line + progress fill up to "now" (UTC+7) with a light sweep and a glowing head. */
function ProgressTrack({ progress, showProgress }: { progress: number; showProgress: boolean }) {
  const percent = `${(progress * 100).toFixed(2)}%`;

  return (
    <div aria-hidden='true' className='absolute inset-x-0 top-2.25 hidden h-0.5 lg:block'>
      <div
        className={cn(
          "absolute inset-0 rounded-full",
          showProgress
            ? "bg-border dark:bg-white/10"
            : "bg-[linear-gradient(90deg,#f97316,#3b82f6,#ec4899,#10b981)] opacity-50"
        )}
      />
      {showProgress && (
        <div
          className='absolute inset-y-0 left-0 overflow-hidden rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 shadow-[0_0_12px_rgba(249,115,22,0.6)] transition-[width] duration-1500 ease-out'
          style={{ width: percent }}
        >
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent motion-safe:animate-shimmer' />
        </div>
      )}
      {showProgress && progress > 0 && progress < 1 && (
        <div
          className='absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-1500 ease-out'
          style={{ left: percent }}
        >
          <span className='absolute -inset-1.5 rounded-full bg-amber-400/40 motion-safe:animate-ping' />
          <span className='relative block h-3 w-3 rounded-full border-2 border-background bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.9)]' />
        </div>
      )}
    </div>
  );
}

function PhaseDot({ paletteIndex, status }: { paletteIndex: number; status: MilestoneStatus | null }) {
  const palette = PALETTE[paletteIndex % PALETTE.length] ?? PALETTE[0];
  return (
    <span className='relative flex h-5 w-5'>
      {status === "current" && (
        <span className={cn("absolute inset-0 rounded-full opacity-60 motion-safe:animate-ping", palette.dot)} />
      )}
      <span
        className={cn(
          "relative h-5 w-5 rounded-full ring-2 ring-offset-4 ring-offset-background transition-opacity",
          palette.dot,
          palette.ring,
          status === "upcoming" && "opacity-40"
        )}
      />
    </span>
  );
}

function PhaseCard({ item, paletteIndex }: { item: PhaseItem; paletteIndex: number }) {
  const t = useTranslations("webdesign");
  const palette = PALETTE[paletteIndex % PALETTE.length] ?? PALETTE[0];
  const isCurrent = item.status === "current";

  return (
    // Desktop: fixed-height slot with the card absolutely positioned inside, so expanding on hover
    // overlays the content below instead of pushing the whole section down.
    <div className='group relative lg:h-27'>
      <div
        className={cn(
          "rounded-2xl border p-4 transition-[border-color,box-shadow,opacity] duration-300 lg:absolute lg:inset-x-0 lg:top-0 lg:min-h-full",
          "group-hover:z-20 group-hover:shadow-[0_24px_48px_-20px_rgba(0,0,0,0.6)]",
          isCurrent
            ? "border-emerald-500/40 bg-[color-mix(in_oklab,var(--color-background),#10b981_7%)]"
            : "border-border/60 bg-card group-hover:border-orange-500/40 dark:border-white/10",
          item.status === "done" && "opacity-75 group-hover:opacity-100"
        )}
      >
        {isCurrent && (
          <span className='absolute -top-2.5 right-3 rounded-full border border-emerald-500/40 bg-background px-2 py-0.5 font-bold text-[10px] text-emerald-500 uppercase tracking-wider dark:text-emerald-400'>
            {t("milestoneCurrent")}
          </span>
        )}
        <div className={cn("truncate font-mono text-[11px] uppercase", palette.label)}>{item.eyebrow}</div>
        <div className='mt-1.5 flex items-start justify-between gap-2'>
          <h3 className='line-clamp-2 font-extrabold text-base leading-snug'>{item.title}</h3>
          {item.description && (
            <ChevronDown className='mt-0.5 hidden h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:rotate-180 lg:block' />
          )}
        </div>
        {item.description && (
          // Always visible on mobile; collapsed on desktop until hover.
          <div className='grid transition-[grid-template-rows,opacity] duration-300 ease-out lg:grid-rows-[0fr] lg:opacity-0 lg:group-hover:grid-rows-[1fr] lg:group-hover:opacity-100'>
            <p className='overflow-hidden text-[13.5px] text-muted-foreground leading-relaxed'>
              <span className='block pt-2'>{item.description}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
