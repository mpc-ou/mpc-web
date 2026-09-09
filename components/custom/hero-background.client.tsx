"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TypingFloatingSnippet } from "@/components/custom/typing-floating-snippet.client";
import { HERO_BG_SNIPPETS } from "@/constants/hero";

const snippetPositions = HERO_BG_SNIPPETS.map((_, i) => ({
  left: `${(i * 17 + 5) % 90}%`,
  top: `${(i * 23 + 8) % 85}%`
}));

const GRID_SPEED_SECONDS = 1;

export function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const rafRef = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const gx = (e.clientX - rect.left) / rect.width - 0.5;
    const gy = (e.clientY - rect.top) / rect.height - 0.5;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      setOffset({ x: gx, y: gy });
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMouseMove]);

  const codeTransform = `translate(${offset.x * -4}px, ${offset.y * -4}px)`;

  return (
    <div className='pointer-events-none absolute inset-0 z-0 select-none overflow-hidden' ref={containerRef}>
      <style>{`
        @keyframes grid-move {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 32px 32px;
          }
        }
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes marquee-reverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        .animate-grid-move {
          animation: grid-move ${GRID_SPEED_SECONDS}s linear infinite;
        }
        .animate-marquee-slow {
          animation: marquee 120s linear infinite;
        }
        .animate-marquee-mid {
          animation: marquee-reverse 100s linear infinite;
        }
        .animate-marquee-fast {
          animation: marquee 80s linear infinite;
        }
      `}</style>

      {/* Grid pattern */}
      <div
        className='pointer-events-none absolute inset-0 animate-grid-move opacity-[0.08] dark:opacity-[0.1]'
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      {/* Big rotated background text */}
      <div className='pointer-events-none absolute inset-[-50%] z-0 flex rotate-[-45deg] scale-110 select-none flex-col justify-center gap-24 overflow-hidden opacity-[0.006] md:gap-36 dark:opacity-[0.01]'>
        <div className='flex whitespace-nowrap font-black text-7xl text-foreground uppercase tracking-widest md:text-9xl dark:text-white'>
          <div className='flex shrink-0 animate-marquee-slow gap-24 md:gap-36'>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
          </div>
          <div aria-hidden='true' className='flex shrink-0 animate-marquee-slow gap-24 md:gap-36'>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
          </div>
        </div>

        <div className='flex whitespace-nowrap pl-32 font-black text-7xl text-foreground uppercase tracking-widest md:text-9xl dark:text-white'>
          <div className='flex shrink-0 animate-marquee-mid gap-24 md:gap-36'>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
          </div>
          <div aria-hidden='true' className='flex shrink-0 animate-marquee-mid gap-24 md:gap-36'>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
          </div>
        </div>

        <div className='flex whitespace-nowrap pl-64 font-black text-7xl text-foreground uppercase tracking-widest md:text-9xl dark:text-white'>
          <div className='flex shrink-0 animate-marquee-fast gap-24 md:gap-36'>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
          </div>
          <div aria-hidden='true' className='flex shrink-0 animate-marquee-fast gap-24 md:gap-36'>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
            <span>MOBILE PROGRAMMING CLUB</span>
            <span>•</span>
          </div>
        </div>
      </div>

      {/* Colorful glow balls */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-orange-500/5 blur-[120px] dark:bg-orange-500/10' />
        <div className='absolute top-1/3 right-1/4 h-80 w-80 rounded-full bg-cyan-500/3 blur-[100px] dark:bg-cyan-500/8' />
        <div className='absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-orange-600/3 blur-[100px] dark:bg-orange-600/8' />
      </div>

      {/* Floating typing code snippets */}
      <div
        className='pointer-events-none absolute inset-0 select-none overflow-hidden'
        style={{ transform: codeTransform }}
      >
        {HERO_BG_SNIPPETS.map((snippet, i) => {
          const pos = snippetPositions[i];
          if (!pos) {
            return null;
          }
          return <TypingFloatingSnippet initialLeft={pos.left} initialTop={pos.top} key={snippet} snippet={snippet} />;
        })}
      </div>
    </div>
  );
}
