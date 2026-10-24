"use client";

import { ArrowLeft, Calendar, Clock, LayoutGrid, RotateCcw, Search, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Link } from "@/configs/i18n/routing";
import { cn } from "@/lib/utils";
import { localizedText, type WebDesignExhibitionItem } from "@/types/webdesign";
import { ExhibitionDetailModal, ExhibitionShowcaseCard } from "../web-design/_components/exhibition-showcase-card";

const INITIAL_BATCH_SIZE = 8;
const LOAD_MORE_STEP = 6;

type ViewMode = "timeline" | "grid";

type YearGroup = {
  year: number;
  items: WebDesignExhibitionItem[];
  totalInYear: number;
};

function matchesQuery(team: WebDesignExhibitionItem, locale: string, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) {
    return true;
  }
  const title = localizedText(locale, team.projectName).toLowerCase();
  const desc = localizedText(locale, team.description).toLowerCase();
  const testimonial = localizedText(locale, team.testimonial).toLowerCase();
  const teamName = team.teamName.toLowerCase();
  const subjects = team.subjects.toLowerCase();
  const members = team.teamMembers.join(" ").toLowerCase();
  const tech = team.techStack.join(" ").toLowerCase();

  return (
    title.includes(q) ||
    desc.includes(q) ||
    testimonial.includes(q) ||
    teamName.includes(q) ||
    subjects.includes(q) ||
    members.includes(q) ||
    tech.includes(q)
  );
}

function groupTeamsByYear(
  visibleTeams: WebDesignExhibitionItem[],
  allFilteredTeams: WebDesignExhibitionItem[]
): YearGroup[] {
  const totalByYear = new Map<number, number>();
  for (const item of allFilteredTeams) {
    totalByYear.set(item.year, (totalByYear.get(item.year) ?? 0) + 1);
  }

  const map = new Map<number, WebDesignExhibitionItem[]>();
  for (const item of visibleTeams) {
    const bucket = map.get(item.year);
    if (bucket) {
      bucket.push(item);
    } else {
      map.set(item.year, [item]);
    }
  }

  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({
      year,
      items,
      totalInYear: totalByYear.get(year) ?? items.length
    }));
}

export function WebDesignExhibitionArchiveClient({ teams }: { teams: WebDesignExhibitionItem[] }) {
  const t = useTranslations("webdesign.exhibitionArchive");
  const locale = useLocale();

  const [query, setQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
  const [selectedTeam, setSelectedTeam] = useState<WebDesignExhibitionItem | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const sortedTeams = useMemo(() => [...teams].sort((a, b) => b.year - a.year), [teams]);

  const years = useMemo(() => {
    const unique = new Set<number>();
    for (const item of sortedTeams) {
      unique.add(item.year);
    }
    return Array.from(unique).sort((a, b) => b - a);
  }, [sortedTeams]);

  const totalTechnologies = useMemo(() => {
    const set = new Set<string>();
    for (const item of sortedTeams) {
      for (const tech of item.techStack) {
        set.add(tech.toLowerCase());
      }
    }
    return set.size;
  }, [sortedTeams]);

  const filteredTeams = useMemo(
    () =>
      sortedTeams.filter((team) => {
        const yearOk = selectedYear === "all" || team.year === selectedYear;
        return yearOk && matchesQuery(team, locale, query);
      }),
    [sortedTeams, selectedYear, locale, query]
  );

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  const updateYear = (nextYear: number | "all") => {
    setSelectedYear(nextYear);
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  const updateViewMode = (nextMode: ViewMode) => {
    setViewMode(nextMode);
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  const hasMore = visibleCount < filteredTeams.length;
  const remainingCount = Math.max(0, filteredTeams.length - visibleCount);

  // IntersectionObserver for automatic lazy loading on scroll
  useEffect(() => {
    const node = sentinelRef.current;
    if (!(node && hasMore)) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(filteredTeams.length, prev + LOAD_MORE_STEP));
        }
      },
      { rootMargin: "280px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, filteredTeams.length]);

  const visibleTeams = useMemo(() => filteredTeams.slice(0, visibleCount), [filteredTeams, visibleCount]);
  const yearGroups = useMemo(() => groupTeamsByYear(visibleTeams, filteredTeams), [visibleTeams, filteredTeams]);

  const handleReset = () => {
    setQuery("");
    setSelectedYear("all");
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  return (
    <div className='relative min-h-screen overflow-x-clip bg-background pb-28 text-foreground'>
      <ArchiveBackdrop />

      {/* Hero Header */}
      <header className='relative mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:pt-28'>
        <ScrollReveal>
          <Link
            className='mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-1.5 font-mono font-semibold text-muted-foreground text-xs backdrop-blur-md transition-colors hover:border-orange-500/40 hover:text-orange-400 dark:border-white/10'
            href='/web-design'
          >
            <ArrowLeft className='h-3.5 w-3.5' />
            {t("backToContest")}
          </Link>
        </ScrollReveal>

        <div className='grid items-end gap-8 lg:grid-cols-12'>
          <ScrollReveal className='space-y-4 lg:col-span-8' delay={60}>
            <p className='font-bold font-mono text-orange-400 text-xs tracking-[0.14em]'>{t("eyebrow")}</p>
            <h1 className='font-black text-[clamp(2.4rem,5.2vw,4.5rem)] leading-[1.02] tracking-[-0.035em]'>
              <span className='bg-[linear-gradient(90deg,#ff5e00,#fbbf24,#ff5e00)] bg-size-[200%_100%] bg-clip-text text-transparent motion-safe:animate-wd-shine'>
                {t("title")}
              </span>
            </h1>
            <p className='max-w-2xl text-pretty text-base text-muted-foreground leading-relaxed sm:text-lg'>
              {t("subtitle")}
            </p>
          </ScrollReveal>

          <ScrollReveal className='lg:col-span-4' delay={140}>
            <div className='grid grid-cols-3 gap-3 rounded-2xl border border-border/60 bg-card/55 p-4 backdrop-blur-md dark:border-white/10'>
              <StatTile label={t("statProjects")} value={sortedTeams.length} />
              <StatTile label={t("statSeasons")} value={years.length} />
              <StatTile label={t("statTechnologies")} value={totalTechnologies} />
            </div>
          </ScrollReveal>
        </div>
      </header>

      {/* Sticky Filter & View Controls */}
      <section className='sticky top-16 z-30 border-border/50 border-y bg-background/80 backdrop-blur-xl dark:border-white/10'>
        <div className='mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between'>
          {/* Year Pills */}
          <div className='flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0'>
            <YearFilterPill active={selectedYear === "all"} label={t("allYears")} onClick={() => updateYear("all")} />
            {years.map((year) => (
              <YearFilterPill
                active={selectedYear === year}
                key={year}
                label={String(year)}
                onClick={() => updateYear(year)}
              />
            ))}
          </div>

          {/* Search & View Switcher */}
          <div className='flex flex-wrap items-center gap-2.5'>
            <div className='relative min-w-60 flex-1 sm:w-72 lg:flex-initial'>
              <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                className='h-9 rounded-xl border-border/70 bg-card/60 pl-9 text-xs dark:border-white/10'
                onChange={(e) => updateQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                value={query}
              />
            </div>

            <div className='inline-flex rounded-xl border border-border/70 bg-card/60 p-0.5 dark:border-white/10'>
              <button
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono font-semibold text-xs transition-colors",
                  viewMode === "timeline"
                    ? "bg-[#ff5e00] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => updateViewMode("timeline")}
                type='button'
              >
                <Clock className='h-3.5 w-3.5' />
                {t("viewTimeline")}
              </button>
              <button
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono font-semibold text-xs transition-colors",
                  viewMode === "grid"
                    ? "bg-[#ff5e00] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => updateViewMode("grid")}
                type='button'
              >
                <LayoutGrid className='h-3.5 w-3.5' />
                {t("viewGrid")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className='mx-auto max-w-7xl px-4 pt-12 sm:px-6'>
        {filteredTeams.length === 0 && (
          <EmptyArchiveState onReset={handleReset} resetLabel={t("resetFilter")} title={t("emptySearch")} />
        )}
        {filteredTeams.length > 0 && viewMode === "timeline" && (
          <TimelineExhibitionList
            groups={yearGroups}
            onSelect={setSelectedTeam}
            seasonBadgeLabel={(year) => t("seasonBadge", { year })}
            seasonCountLabel={(count) => t("seasonProjectsCount", { count })}
          />
        )}
        {filteredTeams.length > 0 && viewMode === "grid" && (
          <GridExhibitionList items={visibleTeams} onSelect={setSelectedTeam} />
        )}

        {/* Lazy-loading Sentinel + Load More Fallback */}
        {filteredTeams.length > 0 && (
          <div className='mt-14 flex flex-col items-center gap-4' ref={sentinelRef}>
            <p className='font-mono text-muted-foreground text-xs'>
              {t("showingCount", { visible: visibleTeams.length, total: filteredTeams.length })}
            </p>
            {hasMore && (
              <button
                className='inline-flex h-11 items-center gap-2 rounded-xl border border-orange-500/40 bg-orange-500/10 px-6 font-bold font-mono text-orange-400 text-xs transition-colors hover:bg-orange-500/20'
                onClick={() => setVisibleCount((prev) => Math.min(filteredTeams.length, prev + LOAD_MORE_STEP))}
                type='button'
              >
                <Sparkles className='h-3.5 w-3.5' />
                {t("loadMore", { remaining: remainingCount })}
              </button>
            )}
          </div>
        )}
      </main>

      <ExhibitionDetailModal onClose={() => setSelectedTeam(null)} team={selectedTeam} />
    </div>
  );
}

function TimelineExhibitionList({
  groups,
  onSelect,
  seasonBadgeLabel,
  seasonCountLabel
}: {
  groups: YearGroup[];
  onSelect: (team: WebDesignExhibitionItem) => void;
  seasonBadgeLabel: (year: number) => string;
  seasonCountLabel: (count: number) => string;
}) {
  return (
    <div className='relative space-y-16 before:absolute before:top-4 before:bottom-4 before:left-4 before:w-px before:bg-linear-to-b before:from-orange-500/70 before:via-orange-500/25 before:to-transparent sm:before:left-6'>
      {groups.map((group) => (
        <section className='relative pl-11 sm:pl-16' id={`season-${group.year}`} key={group.year}>
          {/* Glowing Timeline Node */}
          <div
            aria-hidden='true'
            className='absolute top-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-orange-400 bg-background shadow-[0_0_20px_rgba(255,94,0,0.7)] sm:left-3.5'
          >
            <span className='h-2.5 w-2.5 rounded-full bg-[#ff5e00]' />
          </div>

          {/* Year Header */}
          <div className='mb-7 flex flex-wrap items-baseline justify-between gap-4 border-border/60 border-b pb-4 dark:border-white/10'>
            <div className='flex flex-wrap items-center gap-3.5'>
              <h2 className='font-black font-mono text-3xl text-foreground tracking-tight sm:text-4xl'>{group.year}</h2>
              <span className='inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 font-bold font-mono text-orange-400 text-xs'>
                <Calendar className='h-3.5 w-3.5' />
                {seasonBadgeLabel(group.year)}
              </span>
            </div>
            <span className='font-mono text-muted-foreground text-xs'>{seasonCountLabel(group.totalInYear)}</span>
          </div>

          {/* Cards Grid inside Year */}
          <div className='grid gap-6 md:grid-cols-2'>
            {group.items.map((team, idx) => (
              <ScrollReveal
                className='h-full'
                delay={(idx % 4) * 80}
                key={`${team.teamName}-${team.live}-${team.year}`}
              >
                <ExhibitionShowcaseCard featured={group.items.length === 1} onSelect={onSelect} team={team} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function GridExhibitionList({
  items,
  onSelect
}: {
  items: WebDesignExhibitionItem[];
  onSelect: (team: WebDesignExhibitionItem) => void;
}) {
  return (
    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {items.map((team, idx) => (
        <ScrollReveal className='h-full' delay={(idx % 6) * 70} key={`${team.teamName}-${team.live}-${team.year}`}>
          <ExhibitionShowcaseCard onSelect={onSelect} team={team} />
        </ScrollReveal>
      ))}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className='flex flex-col items-center justify-center rounded-xl border border-border/50 bg-background/50 px-3 py-3 text-center dark:border-white/8'>
      <span className='font-black font-mono text-2xl text-orange-400 sm:text-3xl'>{value}</span>
      <span className='mt-0.5 font-mono text-[11px] text-muted-foreground'>{label}</span>
    </div>
  );
}

function YearFilterPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={cn(
        "shrink-0 rounded-xl px-3.5 py-1.5 font-bold font-mono text-xs transition-all",
        active
          ? "bg-[#ff5e00] text-white shadow-[0_6px_18px_-6px_rgba(255,94,0,0.65)]"
          : "border border-border/60 bg-card/50 text-muted-foreground hover:border-orange-500/40 hover:text-foreground dark:border-white/10"
      )}
      onClick={onClick}
      type='button'
    >
      {label}
    </button>
  );
}

function EmptyArchiveState({ title, resetLabel, onReset }: { title: string; resetLabel: string; onReset: () => void }) {
  return (
    <div className='flex flex-col items-center justify-center rounded-3xl border border-border/60 border-dashed bg-card/30 px-6 py-20 text-center dark:border-white/10'>
      <p className='mb-4 text-base text-muted-foreground'>{title}</p>
      <button
        className='inline-flex items-center gap-2 rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-2 font-bold font-mono text-orange-400 text-xs transition-colors hover:bg-orange-500/20'
        onClick={onReset}
        type='button'
      >
        <RotateCcw className='h-3.5 w-3.5' />
        {resetLabel}
      </button>
    </div>
  );
}

function ArchiveBackdrop() {
  return (
    <div aria-hidden='true' className='pointer-events-none absolute inset-0 overflow-hidden'>
      <div className='absolute inset-0 bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] bg-size-[64px_64px] text-foreground/[0.03] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_15%,#000_30%,transparent_80%)]' />
      <div className='absolute -top-36 left-1/4 h-120 w-120 rounded-full bg-orange-500/18 blur-[140px]' />
      <div className='absolute top-40 right-10 h-96 w-96 rounded-full bg-amber-500/10 blur-[140px]' />
    </div>
  );
}
