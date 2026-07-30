"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Floating "scroll to top" control. Appears after the user scrolls past a
 * threshold and animates a circular progress ring tracking scroll position.
 */
export function BackToTop({ threshold = 400 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) {
        return;
      }
      raf = requestAnimationFrame(() => {
        raf = 0;
        const scrollTop = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        setVisible(scrollTop > threshold);
        setProgress(height > 0 ? Math.min(scrollTop / height, 1) : 0);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, [threshold]);

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <button
      aria-hidden={!visible}
      aria-label='Scroll to top'
      className={cn(
        "group fixed right-5 bottom-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:text-primary",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      tabIndex={visible ? 0 : -1}
      type='button'
    >
      {/* progress ring */}
      <svg
        aria-hidden='true'
        className='absolute inset-0 h-full w-full -rotate-90'
        role='presentation'
        viewBox='0 0 48 48'
      >
        <circle className='stroke-border/40' cx='24' cy='24' fill='none' r={radius} strokeWidth='2.5' />
        <circle
          className='stroke-primary transition-[stroke-dashoffset] duration-150'
          cx='24'
          cy='24'
          fill='none'
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap='round'
          strokeWidth='2.5'
        />
      </svg>
      <ArrowUp className='h-5 w-5 transition-transform group-hover:-translate-y-0.5' />
    </button>
  );
}
