"use client";

import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/custom/section-heading";
import { cn } from "@/lib/utils";

type StatItem = {
  key: string;
  label: string;
  value: string;
};

const STAT_VALUE_RE = /^(\d+)(.*)$/;

function parseStatValue(raw: string): { number: number; suffix: string } {
  const match = STAT_VALUE_RE.exec(raw.trim());
  if (!match) {
    return { number: 0, suffix: raw };
  }
  return { number: Number(match.at(1)), suffix: match.at(2) ?? "" };
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function AnimatedNumber({ value, animate, duration = 2000 }: { value: string; animate: boolean; duration?: number }) {
  const { number: target, suffix } = parseStatValue(value);
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!animate) {
      setDisplay(0);
      return;
    }

    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      setDisplay(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [animate, target, duration]);

  if (target === 0 && suffix === value) {
    return <>{value}</>;
  }

  return (
    <>
      {display}
      {suffix && (
        <sup className='ml-[0.04em] align-super font-black text-[0.45em] text-foreground [text-shadow:none]'>
          {suffix}
        </sup>
      )}
    </>
  );
}

function StatsCounter({ stats, title, subtitle }: { stats: StatItem[]; title: string; subtitle: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const revealClass = cn(
    "transition-all duration-700",
    inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
  );
  const delay = (ms: number) => ({ transitionDelay: inView ? `${ms}ms` : "0ms" });

  return (
    <section className='w-full py-20 sm:py-24' ref={sectionRef}>
      <div className='container mx-auto px-4'>
        <div className='relative overflow-hidden rounded-3xl px-6 py-10 sm:px-12 sm:py-14 lg:px-24'>
          <div className='relative grid items-center gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16'>
            <div className={revealClass}>
              <SectionHeading description={subtitle} layout='stack' tag='club_stats' title={title} />
            </div>

            <div className='grid grid-cols-2 overflow-hidden rounded-2xl'>
              {stats.map((stat, index) => (
                <div
                  className={cn(
                    revealClass,
                    "flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8",
                    index % 2 === 0 && "border-r",
                    index < 2 && "border-b"
                  )}
                  key={stat.key}
                  style={delay(200 + index * 120)}
                >
                  <div className='flex flex-col gap-1'>
                    <span className='font-mono text-[11px] text-muted-foreground/70'>{stat.key}:</span>
                    <span className='font-semibold text-foreground text-sm sm:text-base'>{stat.label}</span>
                  </div>
                  <span className='font-black text-4xl text-primary tabular-nums leading-none tracking-tight [text-shadow:0_0_24px_hsl(var(--primary)/0.55)] sm:text-6xl'>
                    <AnimatedNumber animate={inView} value={stat.value} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { StatsCounter };
export type { StatItem };
