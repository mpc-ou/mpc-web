"use client";

import { Calendar, ChevronLeft, ChevronRight, Clock, LayoutGrid, Loader2, Sparkles } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { getEventsPageData } from "@/app/_actions/main";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { cn } from "@/lib/utils";
import { EventCard } from "./_components/event-card.client";

export type EventListItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  startAt: string | undefined;
  status: string | null;
  type: string | null;
  eventType: string | null;
};

type ViewMode = "timeline" | "grid";

type YearEventGroup = {
  year: number;
  items: EventListItem[];
};

function getEventYear(event: EventListItem): number {
  if (event.startAt) {
    const parsed = new Date(event.startAt).getFullYear();
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return new Date().getFullYear();
}

function groupEventsByYear(events: EventListItem[]): YearEventGroup[] {
  const map = new Map<number, EventListItem[]>();
  for (const ev of events) {
    const year = getEventYear(ev);
    const bucket = map.get(year);
    if (bucket) {
      bucket.push(ev);
    } else {
      map.set(year, [ev]);
    }
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({ year, items }));
}

export function DynamicEventsClient({
  events,
  currentPage,
  totalPages,
  totalEvents = events.length,
  take = 12,
  locale = "vi"
}: {
  events: EventListItem[];
  currentPage: number;
  totalPages: number;
  totalEvents?: number;
  take?: number;
  locale?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("events");

  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");

  // Timeline accumulated state for lazy loading
  const [timelineEvents, setTimelineEvents] = useState<EventListItem[]>(events);
  const [loadedPage, setLoadedPage] = useState<number>(currentPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Sync timeline list if server props change (e.g. user changed page in grid mode or locale)
  useEffect(() => {
    setTimelineEvents(events);
    setLoadedPage(currentPage);
  }, [events, currentPage]);

  const hasMoreTimeline = loadedPage < totalPages;

  const loadMoreTimeline = useCallback(async () => {
    if (isLoadingMore || !hasMoreTimeline) {
      return;
    }
    setIsLoadingMore(true);
    try {
      const nextPage = loadedPage + 1;
      const { data } = await getEventsPageData(nextPage, take, locale);
      const payload = data?.payload as { events: EventListItem[] } | undefined;
      const nextItems = payload?.events ?? [];
      if (nextItems.length > 0) {
        setTimelineEvents((prev) => {
          const seen = new Set(prev.map((item) => item.id));
          const deduped = nextItems.filter((item) => !seen.has(item.id));
          return [...prev, ...deduped];
        });
      }
      setLoadedPage(nextPage);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMoreTimeline, isLoadingMore, loadedPage, locale, take]);

  // IntersectionObserver for automatic lazy loading in Timeline mode
  useEffect(() => {
    if (viewMode !== "timeline") {
      return;
    }
    const node = sentinelRef.current;
    if (!(node && hasMoreTimeline) || isLoadingMore) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreTimeline();
        }
      },
      { rootMargin: "280px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [viewMode, hasMoreTimeline, isLoadingMore, loadMoreTimeline]);

  const years = useMemo(() => {
    const unique = new Set<number>();
    for (const ev of timelineEvents) {
      unique.add(getEventYear(ev));
    }
    return Array.from(unique).sort((a, b) => b - a);
  }, [timelineEvents]);

  const filteredTimelineEvents = useMemo(
    () => (selectedYear === "all" ? timelineEvents : timelineEvents.filter((ev) => getEventYear(ev) === selectedYear)),
    [timelineEvents, selectedYear]
  );

  const yearGroups = useMemo(() => groupEventsByYear(filteredTimelineEvents), [filteredTimelineEvents]);

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  if (events.length === 0) {
    return <div className='py-20 text-center text-muted-foreground'>{t("emptyData")}</div>;
  }

  return (
    <div className={cn("transition-opacity duration-300", isPending ? "opacity-50" : "opacity-100")}>
      {/* Toolbar: Year Filter (in Timeline mode) & View Switcher */}
      <div className='mb-10 flex flex-wrap items-center justify-between gap-4 border-border/60 border-b pb-4 dark:border-white/10'>
        {viewMode === "timeline" ? (
          <div className='flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0'>
            <YearPill active={selectedYear === "all"} label={t("allYears")} onClick={() => setSelectedYear("all")} />
            {years.map((year) => (
              <YearPill
                active={selectedYear === year}
                key={year}
                label={String(year)}
                onClick={() => setSelectedYear(year)}
              />
            ))}
          </div>
        ) : (
          <p className='font-mono text-muted-foreground text-xs'>
            {t("showingCount", { visible: events.length, total: totalEvents })}
          </p>
        )}

        <div className='ml-auto inline-flex rounded-xl border border-border/70 bg-card/60 p-0.5 dark:border-white/10'>
          <button
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono font-semibold text-xs transition-colors",
              viewMode === "timeline"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setViewMode("timeline")}
            type='button'
          >
            <Clock className='h-3.5 w-3.5' />
            {t("viewTimeline")}
          </button>
          <button
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono font-semibold text-xs transition-colors",
              viewMode === "grid"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setViewMode("grid")}
            type='button'
          >
            <LayoutGrid className='h-3.5 w-3.5' />
            {t("viewGrid")}
          </button>
        </div>
      </div>

      {/* View Content */}
      {viewMode === "timeline" ? (
        <>
          <EventsTimelineView
            groups={yearGroups}
            yearBadgeLabel={(year) => t("yearBadge", { year })}
            yearCountLabel={(count) => t("yearEventsCount", { count })}
          />

          {/* Lazy-loading Sentinel + Fallback Button */}
          <div className='mt-14 flex flex-col items-center gap-4' ref={sentinelRef}>
            <p className='font-mono text-muted-foreground text-xs'>
              {t("showingCount", {
                visible: timelineEvents.length,
                total: Math.max(totalEvents, timelineEvents.length)
              })}
            </p>
            {hasMoreTimeline && (
              <button
                className='inline-flex h-11 items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-6 font-bold font-mono text-primary text-xs transition-colors hover:bg-primary/20 disabled:opacity-50'
                disabled={isLoadingMore}
                onClick={loadMoreTimeline}
                type='button'
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                    {t("loadingMore")}
                  </>
                ) : (
                  <>
                    <Sparkles className='h-3.5 w-3.5' />
                    {t("loadMore")}
                  </>
                )}
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {events.map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </div>

          {totalPages > 1 && (
            <GridPagination
              currentPage={currentPage}
              isPending={isPending}
              onPageChange={handlePageChange}
              totalPages={totalPages}
            />
          )}
        </>
      )}
    </div>
  );
}

function EventsTimelineView({
  groups,
  yearBadgeLabel,
  yearCountLabel
}: {
  groups: YearEventGroup[];
  yearBadgeLabel: (year: number) => string;
  yearCountLabel: (count: number) => string;
}) {
  return (
    <div className='relative space-y-14 before:absolute before:top-4 before:bottom-4 before:left-4 before:w-px before:bg-linear-to-b before:from-primary/70 before:via-primary/25 before:to-transparent sm:before:left-6'>
      {groups.map((group) => (
        <section className='relative pl-11 sm:pl-16' key={group.year}>
          {/* Glowing Timeline Node */}
          <div
            aria-hidden='true'
            className='absolute top-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-primary bg-background shadow-[0_0_18px_rgba(249,115,22,0.65)] sm:left-3.5'
          >
            <span className='h-2.5 w-2.5 rounded-full bg-primary' />
          </div>

          {/* Year Header */}
          <div className='mb-6 flex flex-wrap items-baseline justify-between gap-4 border-border/60 border-b pb-3.5 dark:border-white/10'>
            <div className='flex flex-wrap items-center gap-3'>
              <h2 className='font-black font-mono text-3xl text-foreground tracking-tight sm:text-4xl'>{group.year}</h2>
              <span className='inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-bold font-mono text-primary text-xs'>
                <Calendar className='h-3.5 w-3.5' />
                {yearBadgeLabel(group.year)}
              </span>
            </div>
            <span className='font-mono text-muted-foreground text-xs'>{yearCountLabel(group.items.length)}</span>
          </div>

          {/* Cards Grid inside Year */}
          <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
            {group.items.map((event, idx) => (
              <ScrollReveal className='h-full' delay={(idx % 6) * 60} key={event.id}>
                <EventCard event={event} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function YearPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={cn(
        "shrink-0 rounded-xl px-3.5 py-1.5 font-bold font-mono text-xs transition-all",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "border border-border/60 bg-card/50 text-muted-foreground hover:border-primary/40 hover:text-foreground dark:border-white/10"
      )}
      onClick={onClick}
      type='button'
    >
      {label}
    </button>
  );
}

function GridPagination({
  currentPage,
  totalPages,
  isPending,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  isPending: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className='mt-12 flex items-center justify-center gap-2'>
      <Button
        className='h-8 w-8 p-0'
        disabled={currentPage <= 1 || isPending}
        onClick={() => onPageChange(currentPage - 1)}
        size='sm'
        variant='outline'
      >
        <ChevronLeft className='h-4 w-4' />
      </Button>
      <div className='flex items-center gap-1'>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
            return (
              <Button
                className='h-8 w-8 p-0'
                disabled={isPending || currentPage === p}
                key={p}
                onClick={() => onPageChange(p)}
                size='sm'
                variant={currentPage === p ? "default" : "outline"}
              >
                {p}
              </Button>
            );
          }
          if (p === currentPage - 2 || p === currentPage + 2) {
            return (
              <span className='flex h-8 w-8 items-center justify-center text-muted-foreground text-sm' key={p}>
                ...
              </span>
            );
          }
          return null;
        })}
      </div>
      <Button
        className='h-8 w-8 p-0'
        disabled={currentPage >= totalPages || isPending}
        onClick={() => onPageChange(currentPage + 1)}
        size='sm'
        variant='outline'
      >
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  );
}
