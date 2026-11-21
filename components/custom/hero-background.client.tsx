"use client";

import { useEffect, useRef } from "react";

const ROWS = [
  { animation: "hero-bg-marquee 140s linear infinite", indent: "" },
  { animation: "hero-bg-marquee-rev 120s linear infinite", indent: "pl-32" },
  { animation: "hero-bg-marquee 100s linear infinite", indent: "pl-64" }
] as const;

const REPEAT = [0, 1, 2];

const CSS = `
  @keyframes hero-bg-grid { to { transform: translate3d(32px, 32px, 0); } }
  @keyframes hero-bg-marquee { to { transform: translate3d(-50%, 0, 0); } }
  @keyframes hero-bg-marquee-rev { from { transform: translate3d(-50%, 0, 0); } to { transform: translate3d(0, 0, 0); } }
  .hero-bg[data-paused="true"] * { animation-play-state: paused !important; }
  .hero-bg[data-lite="true"] .hero-bg-row:nth-child(n+2) { display: none; }
  .hero-bg[data-lite="true"] .hero-bg-grid { animation: none !important; }
  @media (prefers-reduced-motion: reduce) { .hero-bg * { animation: none !important; } }
`;

function MarqueeGroup({ hidden }: { hidden?: boolean }) {
  return (
    <div aria-hidden={hidden} className='flex shrink-0 gap-24 pr-24 md:gap-36 md:pr-36'>
      {REPEAT.map((i) => (
        <span className='flex gap-24 md:gap-36' key={i}>
          <span>MOBILE PROGRAMMING CLUB</span>
          <span>•</span>
        </span>
      ))}
    </div>
  );
}

export function HeroBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const nav = navigator as Navigator & { deviceMemory?: number };
    el.dataset.lite = String((nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4);
    const observer = new IntersectionObserver(([entry]) => {
      el.dataset.paused = String(!entry?.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className='hero-bg pointer-events-none absolute inset-0 z-0 select-none overflow-hidden [contain:paint]'
      ref={ref}
    >
      <style>{CSS}</style>

      <div className='absolute inset-0 opacity-[0.2]'>
        <div
          className='hero-bg-grid absolute inset-[-32px] will-change-transform'
          style={{
            animation: "hero-bg-grid 1s linear infinite",
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        />
      </div>

      <div className='absolute inset-[-35%] flex -rotate-45 flex-col justify-center gap-24 overflow-hidden opacity-[0.012] md:gap-36 dark:opacity-[0.02]'>
        {ROWS.map((row) => (
          <div
            className={`hero-bg-row flex whitespace-nowrap font-black text-6xl text-foreground uppercase tracking-widest md:text-8xl dark:text-white ${row.indent}`}
            key={row.animation}
          >
            <div className='flex w-max will-change-transform' style={{ animation: row.animation }}>
              <MarqueeGroup />
              <MarqueeGroup hidden />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
