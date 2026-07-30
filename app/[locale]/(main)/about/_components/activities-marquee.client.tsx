"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { Link } from "@/configs/i18n/routing";

export type ActivityCard = {
  id: string;
  title: string;
  description: string;
  frequency?: string;
  thumbnail?: string | null;
  href?: string;
};

/**
 * Horizontally auto-scrolling ("marquee") strip of real activity cards.
 * Duplicates the list so the CSS translate loops seamlessly, and pauses on
 * hover. Falls back gracefully for reduced-motion users via the CSS.
 */
export function ActivitiesMarquee({ activities }: { activities: ActivityCard[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (activities.length === 0) {
    return null;
  }

  // Duplicate for a seamless loop.
  const items = [...activities, ...activities];

  return (
    <div className='group relative overflow-hidden'>
      {/* edge fades */}
      <div className='pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-background to-transparent' />
      <div className='pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent' />

      <div
        className='flex w-max animate-[activities-marquee_40s_linear_infinite] gap-6 group-hover:[animation-play-state:paused] motion-reduce:[animation:none]'
        ref={trackRef}
      >
        {items.map((a, idx) => {
          const card = (
            <div className='flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md'>
              <div className='relative aspect-video w-full overflow-hidden bg-muted/30'>
                {a.thumbnail ? (
                  <Image
                    alt={a.title}
                    className='object-cover transition-transform duration-500 hover:scale-105'
                    fill
                    sizes='300px'
                    src={a.thumbnail}
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center font-bold text-4xl text-muted-foreground/20'>
                    {a.title.charAt(0)}
                  </div>
                )}
                {a.frequency && (
                  <span className='absolute top-3 left-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-0.5 font-medium text-[11px] text-white backdrop-blur-sm'>
                    {a.frequency}
                  </span>
                )}
              </div>
              <div className='flex flex-1 flex-col p-5'>
                <h3 className='mb-1.5 flex items-center gap-1 font-bold text-base text-foreground leading-tight'>
                  {a.title}
                  {a.href && <ArrowUpRight className='h-4 w-4 shrink-0 text-primary opacity-70' />}
                </h3>
                <p className='line-clamp-3 text-muted-foreground text-sm leading-relaxed'>{a.description}</p>
              </div>
            </div>
          );

          let wrapped = card;
          if (a.href?.startsWith("http")) {
            wrapped = (
              <a className='block h-full' href={a.href} rel='noopener noreferrer' target='_blank'>
                {card}
              </a>
            );
          } else if (a.href) {
            wrapped = (
              <Link className='block h-full' href={a.href}>
                {card}
              </Link>
            );
          }

          return (
            <div className='w-75 shrink-0' key={`${a.id}-${idx}`}>
              {wrapped}
            </div>
          );
        })}
      </div>
    </div>
  );
}
