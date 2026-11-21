"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/configs/i18n/routing";
import { cn } from "@/lib/utils";

export type ActivityCard = {
  id: string;
  title: string;
  description: string;
  frequency?: string;
  thumbnail?: string | null;
  href?: string;
};

type Props = {
  activities: ActivityCard[];
  prevLabel: string;
  nextLabel: string;
};

function ActivityCardView({ activity }: { activity: ActivityCard }) {
  const card = (
    <div className='group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-300 hover:border-primary/50'>
      <div className='relative aspect-video w-full overflow-hidden bg-muted/30'>
        {activity.thumbnail ? (
          <Image
            alt={activity.title}
            className='object-cover transition-transform duration-500 group-hover:scale-105'
            fill
            sizes='(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 85vw'
            src={activity.thumbnail}
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center font-bold text-4xl text-muted-foreground/20'>
            {activity.title.charAt(0)}
          </div>
        )}
        {activity.frequency && (
          <span className='absolute top-3 left-3 rounded-full border border-white/20 bg-black/60 px-2.5 py-0.5 font-medium text-[11px] text-white'>
            {activity.frequency}
          </span>
        )}
      </div>
      <div className='flex flex-1 flex-col p-5'>
        <h3 className='mb-1.5 flex items-center gap-1 font-bold text-base text-foreground leading-tight transition-colors group-hover:text-primary'>
          {activity.title}
          {activity.href && <ArrowUpRight className='h-4 w-4 shrink-0 text-primary opacity-70' />}
        </h3>
        <p className='line-clamp-3 text-muted-foreground text-sm leading-relaxed'>{activity.description}</p>
      </div>
    </div>
  );

  if (activity.href?.startsWith("http")) {
    return (
      <a className='block h-full' href={activity.href} rel='noopener noreferrer' target='_blank'>
        {card}
      </a>
    );
  }
  if (activity.href) {
    return (
      <Link className='block h-full' href={activity.href}>
        {card}
      </Link>
    );
  }
  return card;
}

const AUTO_ADVANCE_MS = 5000;
const COPIES = 3;

const navButtonClass =
  "absolute top-[calc(50%-1.5rem)] z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground opacity-0 shadow-md backdrop-blur transition-all duration-300 hover:border-primary hover:text-primary focus-visible:opacity-100 group-hover/carousel:opacity-100 [@media(hover:none)]:hidden";

export function ActivitiesCarousel({ activities, prevLabel, nextLabel }: Props) {
  const trackRef = useRef<HTMLUListElement>(null);
  const pausedRef = useRef(false);
  const visibleRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [canLoop, setCanLoop] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const pause = () => {
      pausedRef.current = true;
    };
    const resume = () => {
      pausedRef.current = false;
    };
    const events: [string, () => void][] = [
      ["mouseenter", pause],
      ["mouseleave", resume],
      ["focusin", pause],
      ["focusout", resume],
      ["touchstart", pause],
      ["touchend", resume]
    ];
    for (const [name, handler] of events) {
      root.addEventListener(name, handler, { passive: true });
    }
    return () => {
      for (const [name, handler] of events) {
        root.removeEventListener(name, handler);
      }
    };
  }, []);

  const metrics = useCallback(() => {
    const el = trackRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!(el && first)) {
      return null;
    }
    const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0;
    const stepWidth = first.offsetWidth + gap;
    return { el, stepWidth, copyWidth: stepWidth * activities.length };
  }, [activities.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) {
      return;
    }
    const measure = () => {
      const m = metrics();
      if (!m) {
        return;
      }
      const loop = m.copyWidth > m.el.clientWidth + 1;
      setCanLoop(loop);
      if (loop && m.el.scrollLeft < m.copyWidth * 0.5) {
        m.el.scrollLeft = m.copyWidth;
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [metrics]);

  useEffect(() => {
    const el = trackRef.current;
    if (!(el && canLoop)) {
      return;
    }
    let timer = 0;
    const recenter = () => {
      const m = metrics();
      if (!m) {
        return;
      }
      if (m.el.scrollLeft < m.copyWidth * 0.5) {
        m.el.scrollLeft += m.copyWidth;
      } else if (m.el.scrollLeft > m.copyWidth * 1.5) {
        m.el.scrollLeft -= m.copyWidth;
      }
    };
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(recenter, 150);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      el.removeEventListener("scroll", onScroll);
    };
  }, [canLoop, metrics]);

  const step = useCallback(
    (direction: 1 | -1) => {
      const m = metrics();
      m?.el.scrollBy({ left: direction * m.stepWidth, behavior: "smooth" });
    },
    [metrics]
  );

  useEffect(() => {
    const el = trackRef.current;
    if (!(el && canLoop) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry?.isIntersecting ?? false;
    });
    observer.observe(el);
    const interval = window.setInterval(() => {
      if (visibleRef.current && !pausedRef.current && document.visibilityState === "visible") {
        step(1);
      }
    }, AUTO_ADVANCE_MS);
    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, [canLoop, step]);

  if (activities.length === 0) {
    return null;
  }

  const copies = canLoop ? COPIES : 1;

  return (
    <div className='group/carousel relative' ref={rootRef}>
      <ul
        className='[&::-webkit-scrollbar]:hidden! -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-2 [scrollbar-width:none]! sm:mx-0 sm:scroll-px-0 sm:px-0'
        ref={trackRef}
      >
        {Array.from({ length: copies }, (_, copy) =>
          activities.map((activity) => (
            <li
              aria-hidden={canLoop && copy !== 1 ? true : undefined}
              className='w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]'
              key={`${copy}-${activity.id}`}
            >
              <ActivityCardView activity={activity} />
            </li>
          ))
        )}
      </ul>

      {canLoop && (
        <>
          <button
            aria-label={prevLabel}
            className={cn(navButtonClass, "-left-2 sm:-left-5")}
            onClick={() => step(-1)}
            type='button'
          >
            <ChevronLeft className='h-5 w-5' />
          </button>
          <button
            aria-label={nextLabel}
            className={cn(navButtonClass, "-right-2 sm:-right-5")}
            onClick={() => step(1)}
            type='button'
          >
            <ChevronRight className='h-5 w-5' />
          </button>
        </>
      )}
    </div>
  );
}
