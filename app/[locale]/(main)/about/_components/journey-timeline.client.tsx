"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Flag, Hand } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { type PointerEvent, useEffect, useRef, useState } from "react";
import { SectionEyebrow, SectionTitle } from "@/components/custom/section-heading";
import { Link } from "@/configs/i18n/routing";
import { MPC_FOUNDED_YEAR } from "@/constants/hero";
import { cn } from "@/lib/utils";

export type TimelineItem = {
  id: string;
  kind: "event" | "achievement" | "project";
  href: string;
  title: string;
  thumbnail: string | null;
  date: string;
};

const DRAG_THRESHOLD = 5;
const SWAP_DELAY_MS = 450;

type Transition = { key: number; direction: "older" | "newer" };

const KIND_CLASS: Record<TimelineItem["kind"], string> = {
  event: "text-primary",
  achievement: "text-amber-500",
  project: "text-sky-500"
};

const pad = (n: number) => String(n).padStart(2, "0");
const dateLabel = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

function TimelineCard({ item, above }: { item: TimelineItem; above: boolean }) {
  const t = useTranslations("aboutPage.journey");
  const date = new Date(item.date);

  return (
    <li className='group/node relative h-full w-56 shrink-0 sm:w-64'>
      <span className='absolute top-1/2 left-4 z-10 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-primary bg-background transition-all duration-300 group-hover/node:scale-150 group-hover/node:bg-primary group-hover/node:shadow-[0_0_14px_3px_hsl(var(--primary)/0.7)]' />
      <span
        className={cn(
          "absolute left-[calc(1rem+6px)] w-px bg-border transition-colors duration-300 group-hover/node:bg-primary",
          above ? "bottom-1/2 h-10 sm:h-12" : "top-1/2 h-10 sm:h-12"
        )}
      />
      <span
        className={cn(
          "absolute left-4 origin-left font-bold font-mono text-foreground text-sm transition-all duration-300 group-hover/node:scale-110 group-hover/node:text-primary",
          above ? "top-[calc(50%+14px)]" : "bottom-[calc(50%+14px)]"
        )}
      >
        {dateLabel(date)}
      </span>

      <Link
        className={cn(
          "group absolute left-2 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 group-hover/node:scale-[1.06] group-hover/node:border-primary group-hover/node:shadow-[0_18px_40px_-12px_hsl(var(--primary)/0.55)] sm:w-56",
          above
            ? "bottom-[calc(50%+2.5rem)] origin-bottom-left group-hover/node:-translate-y-1 sm:bottom-[calc(50%+3rem)]"
            : "top-[calc(50%+2.5rem)] origin-top-left group-hover/node:translate-y-1 sm:top-[calc(50%+3rem)]"
        )}
        draggable={false}
        href={item.href}
      >
        <div className='relative aspect-video w-full overflow-hidden bg-muted'>
          {item.thumbnail && (
            <Image
              alt={item.title}
              className='pointer-events-none object-cover transition-transform duration-500 group-hover/node:scale-110'
              draggable={false}
              fill
              sizes='224px'
              src={item.thumbnail}
            />
          )}
        </div>
        <div className='flex flex-col gap-1 p-3'>
          <span className={cn("font-bold font-mono text-[10px] uppercase tracking-wide", KIND_CLASS[item.kind])}>
            {t(`kinds.${item.kind}`)}
          </span>
          <span className='line-clamp-2 font-bold text-foreground text-sm leading-snug transition-colors group-hover/node:text-primary'>
            {item.title}
          </span>
        </div>
      </Link>
    </li>
  );
}

export function JourneyTimeline({ items }: { items: TimelineItem[] }) {
  const t = useTranslations("aboutPage.journey");
  const years = [...new Set(items.map((item) => new Date(item.date).getFullYear()))].sort((a, b) => b - a);
  const [year, setYear] = useState(years[0] ?? MPC_FOUNDED_YEAR);
  const [now, setNow] = useState<Date | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0 });
  const swapTimer = useRef(0);
  const [hidden, setHidden] = useState(false);
  const [transition, setTransition] = useState<Transition | null>(null);

  useEffect(() => {
    setNow(new Date());
    return () => window.clearTimeout(swapTimer.current);
  }, []);

  const swapYear = (next: number) => {
    setYear(next);
    scrollerRef.current?.scrollTo({ left: 0 });
  };

  const changeYear = (next: number | undefined) => {
    if (next === undefined || hidden) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      swapYear(next);
      return;
    }
    setTransition((prev) => ({ key: (prev?.key ?? 0) + 1, direction: next < year ? "older" : "newer" }));
    setHidden(true);
    swapTimer.current = window.setTimeout(() => {
      swapYear(next);
      requestAnimationFrame(() => requestAnimationFrame(() => setHidden(false)));
    }, SWAP_DELAY_MS);
  };

  const fadeClass = cn(
    "transition-[opacity,filter,transform] duration-[450ms] ease-out",
    hidden && "scale-[0.985] opacity-0 blur-md"
  );

  const yearIndex = years.indexOf(year);
  const olderYear = years[yearIndex + 1];
  const newerYear = yearIndex > 0 ? years[yearIndex - 1] : undefined;
  const yearItems = items.filter((item) => new Date(item.date).getFullYear() === year);
  const showNow = now !== null && now.getFullYear() === year;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el || e.pointerType !== "mouse" || e.button !== 0) {
      return;
    }
    drag.current = { active: true, moved: false, startX: e.clientX, startLeft: el.scrollLeft };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!(el && drag.current.active)) {
      return;
    }
    const dx = e.clientX - drag.current.startX;
    if (!drag.current.moved && Math.abs(dx) > DRAG_THRESHOLD) {
      drag.current.moved = true;
      el.setPointerCapture(e.pointerId);
    }
    if (drag.current.moved) {
      el.scrollLeft = drag.current.startLeft - dx;
    }
  };

  const endDrag = () => {
    drag.current.active = false;
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    el?.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className='relative flex h-full flex-col'>
      {transition && (
        <div aria-hidden className='pointer-events-none absolute inset-0 z-30 overflow-hidden' key={transition.key}>
          <div className='absolute top-[20%] left-[10%] h-[55%] w-[40%] animate-journey-mist rounded-full bg-primary/30 blur-3xl' />
          <div
            className='absolute top-[40%] left-[45%] h-[55%] w-[45%] animate-journey-mist rounded-full bg-amber-400/25 blur-3xl'
            style={{ animationDelay: "120ms" }}
          />
          <div
            className='absolute top-[10%] right-[5%] h-[45%] w-[35%] animate-journey-mist rounded-full bg-foreground/15 blur-3xl'
            style={{ animationDelay: "220ms" }}
          />
          <div
            className={cn(
              "absolute inset-y-[-10%] left-0 w-2/5 animate-journey-sweep",
              transition.direction === "newer" && "[animation-direction:reverse]"
            )}
          >
            <div className='absolute inset-0 bg-linear-to-r from-transparent via-primary/55 to-transparent blur-2xl' />
            <div className='absolute inset-y-0 left-1/2 w-16 -translate-x-1/2 bg-linear-to-r from-transparent via-white/70 to-transparent blur-lg' />
          </div>
        </div>
      )}
      <div className='container mx-auto flex items-end justify-between gap-6 px-4'>
        <div className='flex flex-col gap-3'>
          <SectionEyebrow tag='journey' />
          <SectionTitle>{t("title")}</SectionTitle>
          <p className='hidden max-w-xl text-[15px] text-muted-foreground leading-relaxed sm:block'>
            {t("description")}
          </p>
        </div>
        <div className='flex shrink-0 items-center gap-1 sm:gap-2'>
          <button
            aria-label={t("newerYear")}
            className='rounded-full p-2 text-muted-foreground transition-colors hover:text-primary disabled:pointer-events-none disabled:opacity-30'
            disabled={newerYear === undefined}
            onClick={() => changeYear(newerYear)}
            type='button'
          >
            <ChevronLeft className='h-5 w-5' />
          </button>
          <span
            className={cn(
              "font-black font-mono text-5xl text-primary tabular-nums leading-none sm:text-7xl",
              fadeClass
            )}
          >
            {year}
          </span>
          <button
            aria-label={t("olderYear")}
            className='rounded-full p-2 text-muted-foreground transition-colors hover:text-primary disabled:pointer-events-none disabled:opacity-30'
            disabled={olderYear === undefined}
            onClick={() => changeYear(olderYear)}
            type='button'
          >
            <ChevronRight className='h-5 w-5' />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "[&::-webkit-scrollbar]:hidden! relative mt-4 min-h-0 flex-1 cursor-grab overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none]! active:cursor-grabbing",
          fadeClass
        )}
        onClickCapture={onClickCapture}
        onPointerCancel={endDrag}
        onPointerDown={onPointerDown}
        onPointerLeave={endDrag}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        ref={scrollerRef}
      >
        <ol className='relative flex h-full w-max select-none px-4 sm:px-[max(1rem,calc((100vw-80rem)/2))]' key={year}>
          <span className='absolute top-1/2 right-0 left-0 h-px bg-border' />

          {showNow && now && (
            <li className='relative h-full w-36 shrink-0'>
              <span className='absolute top-1/2 left-4 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center'>
                <span className='absolute h-full w-full animate-ping rounded-full bg-primary/60' />
                <span className='relative h-3 w-3 rounded-full bg-primary' />
              </span>
              <span className='absolute bottom-[calc(50%+14px)] left-4 flex flex-col'>
                <span className='font-bold font-mono text-primary text-xs uppercase'>{t("now")}</span>
                <span className='font-bold font-mono text-foreground text-sm'>{dateLabel(now)}</span>
              </span>
            </li>
          )}

          {yearItems.length === 0 && (
            <li className='relative flex h-full w-64 shrink-0 items-center'>
              <span className='mt-16 text-muted-foreground text-sm'>{t("empty")}</span>
            </li>
          )}

          {yearItems.map((item, idx) => (
            <TimelineCard above={idx % 2 === 0} item={item} key={item.id} />
          ))}

          {olderYear === undefined ? (
            <li className='relative h-full w-64 shrink-0'>
              <span className='absolute top-1/2 left-4 z-10 h-4 w-4 -translate-y-1/2 rounded-full bg-primary ring-4 ring-background' />
              <div className='absolute top-[calc(50%+18px)] left-4 flex w-56 flex-col gap-1'>
                <span className='flex items-center gap-2 font-bold text-foreground'>
                  <Flag className='h-4 w-4 text-primary' />
                  {MPC_FOUNDED_YEAR} · {t("founded")}
                </span>
                <span className='text-muted-foreground text-sm leading-relaxed'>{t("foundedDesc")}</span>
              </div>
            </li>
          ) : (
            <li className='relative flex h-full w-72 shrink-0 items-center pl-6'>
              <button
                className='group relative z-10 flex flex-col items-start gap-2 rounded-2xl border border-primary/50 border-dashed bg-background p-5 text-left transition-colors hover:border-primary hover:bg-primary/5'
                onClick={() => changeYear(olderYear)}
                type='button'
              >
                <span className='font-mono text-muted-foreground text-xs'>{t("continue")}</span>
                <span className='flex items-center gap-2 font-black text-2xl text-foreground transition-colors group-hover:text-primary'>
                  {t("viewYear", { year: olderYear })}
                  <ArrowRight className='h-5 w-5 transition-transform group-hover:translate-x-1' />
                </span>
              </button>
            </li>
          )}
        </ol>
      </div>

      <div className='container mx-auto flex items-center justify-between gap-4 px-4'>
        <span className='flex items-center gap-2 font-mono text-muted-foreground text-xs'>
          <Hand className='h-3.5 w-3.5' />
          {t("hint")}
        </span>
        <div className='flex gap-2'>
          <button
            aria-label={t("scrollBack")}
            className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary'
            onClick={() => scrollByPage(-1)}
            type='button'
          >
            <ChevronLeft className='h-5 w-5' />
          </button>
          <button
            aria-label={t("scrollForward")}
            className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary'
            onClick={() => scrollByPage(1)}
            type='button'
          >
            <ChevronRight className='h-5 w-5' />
          </button>
        </div>
      </div>
    </div>
  );
}
