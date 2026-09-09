"use client";

import { ArrowRight, Camera, Code, Settings, Users } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";
import { cn } from "@/lib/utils";

const TIME_INTERVAL = 8000;

type Department = {
  id: string;
  name: string;
  icon: string;
  bgImage: string;
  description: string;
  missions: string;
  link?: string;
  linkLabel?: string;
};

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "Code":
      return <Code className='h-6 w-6' />;
    case "Camera":
      return <Camera className='h-6 w-6' />;
    case "Settings":
      return <Settings className='h-6 w-6' />;
    case "Users":
      return <Users className='h-6 w-6' />;
    default:
      return <Code className='h-6 w-6' />;
  }
};

export function DepartmentsCarouselClient({ departments }: { departments: Department[] }) {
  const t = useTranslations("aboutPage.departments");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % departments.length);
    }, TIME_INTERVAL);
    return () => clearInterval(interval);
  }, [departments.length]);

  // Trigger content-level reset animation on active index change
  // biome-ignore lint/correctness/useExhaustiveDependencies: run transition on slide change
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 50);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  if (!departments || departments.length === 0) {
    return null;
  }

  const currentDept = departments[activeIndex];

  return (
    <section className='relative flex min-h-[90vh] w-full items-center overflow-hidden border-border border-y bg-black'>
      {/* Background Images with Ken Burns Zoom & Opacity Transitions */}
      {departments.map((dept, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              isActive ? "z-0 opacity-100" : "z-0 opacity-0"
            )}
            key={dept.id}
          >
            <Image
              alt={dept.name}
              className={cn(
                "object-cover transition-transform duration-[8000ms] ease-out will-change-transform",
                isActive ? "scale-105" : "scale-100"
              )}
              fill
              priority={index === 0}
              src={dept.bgImage}
            />
            <div className='absolute inset-0 bg-black/40' />
            <div className='absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/20 to-transparent' />
            <div className='absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/20 to-transparent' />
          </div>
        );
      })}

      <div className='container relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-4 py-12 md:flex-row lg:items-center lg:gap-16 lg:py-24'>
        {/* Navigation Dots / Buttons */}
        <div className='z-20 order-2 mt-8 flex shrink-0 flex-row items-center gap-4 md:order-1 md:mt-0 md:flex-col'>
          {departments.map((dept, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                aria-label={`Select ${dept.name}`}
                className={cn(
                  "relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border transition-all duration-500 sm:h-14 sm:w-14",
                  isActive
                    ? "scale-110 border-primary bg-primary text-primary-foreground shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                    : "border-white/10 bg-black/40 text-white/60 hover:scale-105 hover:border-white/30 hover:bg-white/15 hover:text-white active:scale-95"
                )}
                key={dept.id}
                onClick={() => setActiveIndex(idx)}
                type='button'
              >
                <div className='transition-transform duration-300 group-hover:scale-110'>{getIcon(dept.icon)}</div>
              </button>
            );
          })}
        </div>

        {/* Content Panel with Staggered Keyframe Animations */}
        <div className='order-1 flex w-full flex-1 flex-col gap-6 md:order-2'>
          <div
            className={cn(
              "flex w-full max-w-3xl flex-col gap-5 transition-opacity duration-300",
              isTransitioning ? "opacity-0" : "opacity-100"
            )}
            key={`content-container-${currentDept.id}`}
          >
            {/* Category Tag */}
            <div className='fade-in slide-in-from-bottom-3 animate-in fill-mode-both duration-500'>
              <span className='inline-flex items-center rounded-full bg-primary/10 px-3 py-1 font-mono font-semibold text-primary text-xs uppercase tracking-widest'>
                &gt; {t("badge")}
              </span>
            </div>

            {/* Department Title */}
            <div className='fade-in slide-in-from-bottom-4 animate-in fill-mode-both delay-100 duration-500'>
              <h2
                className='text-balance font-black text-4xl text-white uppercase tracking-tight sm:text-5xl lg:text-6xl'
                style={{ textShadow: "0px 2px 10px rgba(0,0,0,0.9)" }}
              >
                {currentDept.name}
              </h2>
            </div>

            {/* Description */}
            <div className='fade-in slide-in-from-bottom-5 animate-in fill-mode-both delay-200 duration-500'>
              <p
                className='border-primary border-l-4 pl-4 font-medium text-base text-zinc-200 leading-relaxed sm:text-lg'
                style={{ textShadow: "0px 1px 4px rgba(0,0,0,0.85)" }}
              >
                {currentDept.description}
              </p>
            </div>

            {/* Missions — rendered as Markdown */}
            {currentDept.missions && (
              <div className='fade-in slide-in-from-bottom-6 animate-in fill-mode-both delay-300 duration-500'>
                <h4
                  className='mb-3 font-bold text-base text-primary uppercase tracking-widest sm:text-lg'
                  style={{ textShadow: "0px 1px 4px rgba(0,0,0,0.9)" }}
                >
                  {t("missionsLabel")}
                </h4>
                <div
                  className='prose prose-invert prose-sm max-w-none text-zinc-100'
                  style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.9)" }}
                >
                  <MarkdownContent content={currentDept.missions} />
                </div>
              </div>
            )}

            {/* Link Action */}
            {currentDept.link && (
              <div className='fade-in slide-in-from-bottom-7 mt-3 animate-in fill-mode-both delay-400 duration-500'>
                <Button
                  asChild
                  className='group h-12 cursor-pointer rounded-full px-8 font-bold text-base shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-primary/25'
                  size='lg'
                  variant='default'
                >
                  {/* biome-ignore lint/suspicious/noExplicitAny: next-intl typed routing wrapper */}
                  <Link href={currentDept.link as any}>
                    {currentDept.linkLabel}
                    <ArrowRight className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5' />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide Progress Bar */}
      <div className='absolute bottom-0 left-0 z-20 h-[3px] w-full bg-white/10'>
        <div
          className='h-full origin-left bg-gradient-to-r from-orange-600 to-orange-400'
          key={`progress-${activeIndex}`}
          style={{
            animation: `progress-bar ${TIME_INTERVAL}ms linear forwards`
          }}
        />
      </div>

      <style>{`
        @keyframes progress-bar {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </section>
  );
}
