"use client";

import { ArrowRight, ArrowUpRight, CalendarDays, ChevronDown, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { FeedItem, FeedKind } from "@/app/_actions/main/feed";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Link } from "@/configs/i18n/routing";
import { cn } from "@/lib/utils";
import { formatLocalDate } from "@/utils/handle-datetime";

type Filter = "all" | FeedKind;
type Size = "hero" | "wide" | "small" | "full";

const MAX_ITEMS = 5;
const MOBILE_LIMIT = 4;
const KINDS: FeedKind[] = ["event", "achievement", "blog"];

const SIZE_CLASS: Record<Size, string> = {
  hero: "sm:col-span-2 sm:row-span-2",
  wide: "sm:col-span-2",
  small: "",
  full: "sm:col-span-2 lg:col-span-4"
};

const LAYOUTS: Record<number, Size[]> = {
  1: ["full"],
  2: ["hero", "hero"],
  3: ["hero", "wide", "wide"],
  4: ["hero", "wide", "small", "small"],
  5: ["hero", "small", "small", "small", "small"]
};

const KIND_HREF: Record<FeedKind, string> = {
  event: "/events",
  achievement: "/achievements",
  blog: "/blogs"
};

const STATUS_KEY: Record<string, "status.upcoming" | "status.ongoing" | "status.completed"> = {
  UPCOMING: "status.upcoming",
  ONGOING: "status.ongoing",
  COMPLETED: "status.completed"
};

const byNewest = (a: FeedItem, b: FeedItem) => (b.date ?? "").localeCompare(a.date ?? "");

const interleaveByKind = (items: FeedItem[], limit: number): FeedItem[] => {
  const queues = KINDS.map((kind) => items.filter((item) => item.kind === kind).sort(byNewest))
    .filter((queue) => queue.length > 0)
    .sort((a, b) => byNewest(a[0], b[0]));
  const result: FeedItem[] = [];
  while (result.length < limit && queues.some((queue) => queue.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next && result.length < limit) {
        result.push(next);
      }
    }
  }
  return result;
};

function FeedCard({ item, size }: { item: FeedItem; size: Size }) {
  const t = useTranslations("home.feed");
  const te = useTranslations("events");
  const locale = useLocale();
  const isHero = size === "hero";
  const statusKey = item.kind === "event" ? STATUS_KEY[item.eventStatus ?? ""] : undefined;
  const isLive = item.eventStatus === "UPCOMING" || item.eventStatus === "ONGOING";

  return (
    <Link
      className='group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-muted p-4 text-white sm:p-5'
      href={`${KIND_HREF[item.kind]}/${item.slug}`}
    >
      {item.thumbnail ? (
        <Image
          alt={item.title}
          className='object-cover transition-transform duration-700 ease-out group-hover:scale-105'
          fill
          sizes={isHero ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 100vw"}
          src={item.thumbnail}
        />
      ) : (
        <div className='absolute inset-0 flex items-center justify-center text-muted-foreground/30'>
          <ImageIcon className='h-10 w-10' />
        </div>
      )}
      <div className='absolute inset-0 bg-linear-to-t from-black/90 via-black/35 to-black/10' />

      <div className='relative flex items-start justify-between gap-2'>
        <div className='flex flex-wrap gap-1.5'>
          <span className='rounded-md bg-white/90 px-2 py-0.5 font-bold font-mono text-[10px] text-zinc-900 uppercase tracking-wide'>
            {t(`kinds.${item.kind}`)}
          </span>
          {statusKey && (
            <span
              className={cn(
                "rounded-md px-2 py-0.5 font-bold font-mono text-[10px] uppercase tracking-wide",
                isLive ? "bg-primary text-primary-foreground" : "bg-black/55 text-white/90"
              )}
            >
              {te(statusKey)}
            </span>
          )}
        </div>
        {item.date && (
          <span className='flex shrink-0 items-center gap-1 rounded-md bg-black/55 px-2 py-0.5 font-mono text-[11px] text-white/90'>
            <CalendarDays className='h-3 w-3' />
            {formatLocalDate(item.date, locale)}
          </span>
        )}
      </div>

      <div className='relative flex items-end justify-between gap-4'>
        <div className='flex min-w-0 flex-col gap-2'>
          <h3
            className={cn(
              "line-clamp-2 text-balance font-black leading-tight tracking-tight",
              isHero ? "text-2xl lg:text-[1.75rem]" : "text-[15px] sm:text-base"
            )}
          >
            {item.title}
          </h3>
          {isHero && item.summary && (
            <p className='line-clamp-2 max-w-lg text-sm text-white/75 leading-relaxed'>{item.summary}</p>
          )}
        </div>
        <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/90 text-zinc-900 transition-colors group-hover:bg-primary group-hover:text-primary-foreground'>
          <ArrowUpRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
        </span>
      </div>
    </Link>
  );
}

export function LatestFeed({ items }: { items: FeedItem[] }) {
  const t = useTranslations("home.feed");
  const [filter, setFilter] = useState<Filter>("all");

  const availableKinds = KINDS.filter((kind) => items.some((item) => item.kind === kind));
  const visible =
    filter === "all"
      ? interleaveByKind(items, MAX_ITEMS)
      : items
          .filter((item) => item.kind === filter)
          .sort(byNewest)
          .slice(0, MAX_ITEMS);
  const layout = LAYOUTS[visible.length] ?? LAYOUTS[MAX_ITEMS];
  const filters: Filter[] = ["all", ...availableKinds];

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        {availableKinds.length > 1 ? (
          <div className='flex flex-wrap gap-2' role='tablist'>
            {filters.map((f) => (
              <button
                aria-selected={filter === f}
                className={cn(
                  "rounded-full border px-4 py-1.5 font-medium text-sm transition-colors",
                  filter === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
                )}
                key={f}
                onClick={() => setFilter(f)}
                role='tab'
                type='button'
              >
                {t(`filters.${f}`)}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        {filter === "all" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='rounded-full' variant='outline'>
                {t("viewMore")} <ChevronDown className='ml-1.5 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {KINDS.map((kind) => (
                <DropdownMenuItem asChild key={kind}>
                  <Link className='cursor-pointer' href={KIND_HREF[kind]}>
                    {t(`viewAll.${kind}`)}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild className='rounded-full' variant='outline'>
            <Link href={KIND_HREF[filter]}>
              {t(`viewAll.${filter}`)} <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
        )}
      </div>

      <div className='grid auto-rows-[200px] grid-cols-1 gap-4 sm:auto-rows-[180px] sm:grid-cols-2 lg:auto-rows-[190px] lg:grid-cols-4'>
        {visible.map((item, idx) => {
          const size = layout[idx] ?? "small";
          return (
            <div
              className={cn(
                SIZE_CLASS[size],
                "fade-in slide-in-from-bottom-4 animate-in fill-mode-both duration-500",
                idx >= MOBILE_LIMIT && "hidden sm:block"
              )}
              key={`${filter}-${item.id}`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <FeedCard item={item} size={size} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
