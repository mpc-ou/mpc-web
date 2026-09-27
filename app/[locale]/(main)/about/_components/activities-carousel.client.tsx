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

const navButtonClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-35";

export function ActivitiesCarousel({ activities, prevLabel, nextLabel }: Props) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) {
      return;
    }
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) {
      return;
    }
    updateEdges();
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateEdges);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [updateEdges]);

  const step = (direction: 1 | -1) => {
    const el = trackRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!(el && first)) {
      return;
    }
    const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: direction * (first.offsetWidth + gap), behavior: "smooth" });
  };

  if (activities.length === 0) {
    return null;
  }

  return (
    <div className='flex flex-col gap-6'>
      <ul
        className='-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:scroll-px-0 sm:px-0 [&::-webkit-scrollbar]:hidden'
        ref={trackRef}
      >
        {activities.map((activity) => (
          <li
            className='w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]'
            key={activity.id}
          >
            <ActivityCardView activity={activity} />
          </li>
        ))}
      </ul>

      <div className={cn("flex justify-end gap-3", !(canPrev || canNext) && "hidden")}>
        <button
          aria-label={prevLabel}
          className={navButtonClass}
          disabled={!canPrev}
          onClick={() => step(-1)}
          type='button'
        >
          <ChevronLeft className='h-5 w-5' />
        </button>
        <button
          aria-label={nextLabel}
          className={navButtonClass}
          disabled={!canNext}
          onClick={() => step(1)}
          type='button'
        >
          <ChevronRight className='h-5 w-5' />
        </button>
      </div>
    </div>
  );
}
