"use client";

import Image from "next/image";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TypewriterHeroText } from "./typewriter-hero-text.client";

type PageHeroProps = {
  title: string;
  description: string;
  badge?: string;
  imageUrl?: string;
  size?: "large" | "compact";
  children?: React.ReactNode;
  codeSnippet?: string;
  codeTitle?: string;
};

const PageHero = ({ title, description, badge, imageUrl, size = "large", children }: PageHeroProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) {
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const px = x * -10;
    const py = y * -10;

    setParallax({ x: px, y: py });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setParallax({ x: 0, y: 0 });
  }, []);

  const isCompact = size === "compact";

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: decorative mouse tracking effect
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative mouse tracking effect
    <section
      className={cn(
        "relative flex w-full overflow-hidden transition-all duration-300",
        "bg-slate-50 text-slate-900 dark:bg-[#070b13] dark:text-white",
        isCompact ? "h-[200px] items-center md:h-[240px]" : "h-[450px] items-end pb-8 md:h-[500px] md:pb-12"
      )}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      <style>{`
        @keyframes float-up-slow {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float-down-slow {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(12px) rotate(-2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes laser-sweep {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes blink-caret {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .animate-float-up {
          animation: float-up-slow 8s ease-in-out infinite;
        }
        .animate-float-down {
          animation: float-down-slow 10s ease-in-out infinite;
        }
        .animate-laser {
          animation: laser-sweep 15s ease-in-out infinite;
        }
        .animate-blink {
          animation: blink-caret 1s step-end infinite;
        }
      `}</style>

      {!isCompact && imageUrl && (
        <div
          className='absolute inset-0 z-0 scale-105 transition-transform duration-300 ease-out'
          style={{
            transform: `translate(${parallax.x}px, ${parallax.y}px)`
          }}
        >
          <Image
            alt={`${title} background`}
            className='object-cover opacity-100 saturate-[1.05] filter transition-opacity duration-300 dark:opacity-90'
            fill
            priority
            sizes='100vw'
            src={imageUrl}
          />
        </div>
      )}

      {!isCompact && (
        <>
          <div className='absolute inset-x-0 bottom-0 z-0 h-[80%] bg-gradient-to-t from-slate-50 via-slate-50/25 to-transparent dark:from-[#070b13] dark:via-[#070b13]/30 dark:to-transparent' />

          <div className='absolute inset-y-0 left-0 z-0 w-[50%] bg-gradient-to-r from-slate-50/25 to-transparent dark:from-[#070b13]/30 dark:to-transparent' />
        </>
      )}

      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-2 text-slate-950 transition-opacity duration-300 dark:text-white",
          isCompact ? "opacity-[0.015] dark:opacity-[0.01]" : "opacity-[0.02] dark:opacity-[0.015]"
        )}
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: isCompact ? "20px 20px" : "28px 28px"
        }}
      />

      <div className='pointer-events-none absolute inset-0 z-2 overflow-hidden'>
        <div className='absolute top-12 left-1/4 z-0 h-24 w-24 animate-float-up rounded-full bg-orange-500/5 blur-xl dark:bg-orange-500/8' />

        <div className='absolute right-1/4 bottom-20 z-0 h-32 w-32 animate-float-down rounded-full bg-cyan-500/5 blur-xl dark:bg-cyan-500/6' />

        <div className='absolute top-1/3 right-12 z-0 h-10 w-10 animate-float-up rounded-full border border-slate-350/20 bg-slate-350/5 dark:border-white/5 dark:bg-white/2' />

        <div className='absolute bottom-1/3 left-8 z-0 h-6 w-6 animate-float-down rounded-full border border-orange-500/10 bg-orange-500/2 dark:border-orange-500/15' />
      </div>

      {!isCompact && (
        <>
          <div className='pointer-events-none absolute inset-0 z-2 overflow-hidden'>
            <div className='absolute top-0 bottom-0 w-[180px] animate-laser bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent blur-2xl dark:via-orange-400/8' />
          </div>
          <div className='pointer-events-none absolute inset-0 z-2 overflow-hidden'>
            <div
              className='absolute top-[25%] left-[35%] h-[4px] w-[4px] animate-ping rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
              style={{ animationDuration: "3s" }}
            />
            <div
              className='absolute top-[55%] left-[75%] h-[4px] w-[4px] animate-ping rounded-full bg-orange-400 shadow-[0_0_8px_#fb923c]'
              style={{ animationDuration: "4s", animationDelay: "1.5s" }}
            />
            <div
              className='absolute top-[40%] left-[80%] h-[3px] w-[3px] animate-pulse rounded-full bg-cyan-400/80 shadow-[0_0_6px_#22d3ee]'
              style={{ animationDuration: "2.5s" }}
            />
          </div>
        </>
      )}

      <div className='container relative z-10 mx-auto w-full px-4'>
        <div
          className={cn(
            "flex max-w-3xl flex-col items-start text-left transition-all duration-300",
            isCompact ? "gap-2" : "gap-4 pb-4"
          )}
        >
          {badge && !isCompact && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 font-mono font-semibold text-xs tracking-wider shadow-xs transition-all duration-300",
                "border border-orange-200/60 bg-orange-50/50 text-orange-600 backdrop-blur-xs",
                "dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-400"
              )}
            >
              {badge}
            </span>
          )}

          <TypewriterHeroText
            descClassName={cn(
              "font-normal text-slate-600 leading-relaxed transition-all duration-300 dark:text-slate-200",
              isCompact ? "max-w-2xl text-xs sm:text-sm" : "max-w-2xl text-sm sm:text-base"
            )}
            description={description}
            title={title}
            titleClassName={cn(
              "font-black text-slate-900 leading-tight tracking-tight transition-all duration-300 dark:text-white",
              "cursor-default select-none hover:text-orange-500 hover:drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)] dark:hover:text-orange-400",
              isCompact ? "text-2xl sm:text-3xl lg:text-4xl" : "text-3xl sm:text-4xl lg:text-5xl"
            )}
          />

          {children}
        </div>
      </div>
    </section>
  );
};

export { PageHero };
