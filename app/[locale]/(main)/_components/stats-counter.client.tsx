"use client";

import { useEffect, useRef, useState } from "react";
import { orbitron } from "@/configs/fonts";
import { cn } from "@/lib/utils";

type StatItem = {
  label: string;
  value: string;
};

function parseStatValue(raw: string): { number: number; suffix: string } {
  const match = /^(\d+)(.*)$/.exec(raw.trim());
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
      {suffix}
    </>
  );
}

function StatsCounter({ stats, title }: { stats: StatItem[]; title: string }) {
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

  return (
    <section className='w-full bg-linear-to-r from-orange-500 via-orange-500 to-amber-600 py-16' ref={sectionRef}>
      <div className='container mx-auto px-4'>
        <div
          className={cn(
            "mb-6 text-center transition-all duration-700",
            inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
        >
          <span className='rounded-full bg-white/15 px-3 py-1 font-medium font-mono text-sm text-white/90'>
            &gt; club_stats
          </span>
        </div>
        <h2
          className={cn(
            "mb-10 text-center font-bold text-2xl text-primary-foreground transition-all duration-700",
            inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          )}
        >
          {title}
        </h2>

        <div className='grid grid-cols-2 gap-8 sm:grid-cols-4'>
          {stats.map((stat, index) => (
            <div
              className={cn(
                "flex flex-col items-center gap-3 transition-all duration-700",
                inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}
              key={stat.label}
              style={{ transitionDelay: inView ? `${index * 150}ms` : "0ms" }}
            >
              <div className='relative rounded-2xl border border-white/15 bg-black/20 px-6 py-4 shadow-inner backdrop-blur-sm'>
                <div className='absolute inset-0 rounded-2xl bg-linear-to-b from-white/5 to-transparent' />
                <span
                  className={cn(
                    "relative block text-center font-black text-4xl text-white tabular-nums tracking-widest sm:text-5xl",
                    orbitron.className
                  )}
                >
                  <AnimatedNumber animate={inView} value={stat.value} />
                </span>
              </div>
              <span className='font-medium text-primary-foreground/80 text-sm'>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { StatsCounter };
export type { StatItem };
