"use client";

import { ArrowRight, ChevronDown, Terminal } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeroBackground } from "@/components/custom/hero-background.client";
import { InteractiveTerminal } from "@/components/custom/interactive-terminal.client";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";
import { CLUB_TAGS, PARALLAX_FACTOR } from "@/constants/hero";
import { useTransparentHeader } from "@/hooks/use-transparent-header";

type StatsData = {
  members: number;
  posts: number;
  projects: number;
  events: number;
  achievements: number;
  github: string;
  fanpage: string;
};

type Props = {
  stats: StatsData | null;
};

const HeroSection = ({ stats }: Props) => {
  useTransparentHeader({
    hideActions: false,
    textColor: "var(--color-foreground)",
    logoColor: "var(--color-foreground)"
  });

  const t = useTranslations("home.hero");
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const rafRef = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!sectionRef.current) {
      return;
    }
    const rect = sectionRef.current.getBoundingClientRect();
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
    const section = sectionRef.current;
    if (!section) {
      return;
    }
    section.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMouseMove]);

  const contentTransform = `translate(${offset.x * PARALLAX_FACTOR}px, ${offset.y * PARALLAX_FACTOR}px)`;

  return (
    <section
      className='relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 text-foreground dark:bg-[#0B1121] dark:text-white'
      ref={sectionRef}
    >
      <HeroBackground />

      <div
        className='relative z-10 flex w-full max-w-6xl flex-col items-center gap-8 transition-transform duration-300 ease-out lg:flex-row lg:items-center lg:justify-between lg:gap-12'
        style={{ transform: contentTransform }}
      >
        <div className='flex flex-col items-center gap-6 text-center lg:items-start lg:text-left'>
          <Image
            alt='MPC Logo'
            className='h-14 w-14 transition-shadow duration-300'
            height={56}
            src='/images/logo.png'
            width={56}
          />

          <h1 className='max-w-xl animate-fade-in-up font-black text-4xl text-orange-500 leading-[1.1] tracking-tight transition-[text-shadow] duration-300 hover:text-orange-400 sm:text-5xl lg:text-6xl dark:text-orange-400 dark:hover:text-orange-300 hover:[text-shadow:0_0_30px_rgba(249,115,22,0.3)] dark:hover:[text-shadow:0_0_30px_rgba(249,115,22,0.4)]'>
            {t("title")}
          </h1>

          <p className='max-w-md animate-fade-in-up text-lg text-muted-foreground opacity-0 [animation-delay:200ms] sm:text-xl dark:text-slate-300'>
            {t("subtitle")}
          </p>

          <div className='flex animate-fade-in-up flex-wrap items-center gap-3 pt-2 opacity-0 [animation-delay:400ms]'>
            <Button
              asChild
              className='rounded-xl bg-linear-to-r from-orange-500 to-orange-600 px-6 py-5 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/40'
              size='lg'
            >
              <Link href='/about'>
                <Terminal className='mr-2 h-4 w-4' />
                {t("cta")}
                <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
              </Link>
            </Button>
            <Button
              asChild
              className='rounded-xl border-border bg-transparent px-6 py-5 font-semibold text-muted-foreground transition-all hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-orange-400'
              size='lg'
              variant='outline'
            >
              <Link href='/members'>{t("ctaJoin")}</Link>
            </Button>
          </div>
        </div>

        {/* ── Interactive Terminal ── */}
        <InteractiveTerminal stats={stats} tags={CLUB_TAGS} />
      </div>

      <div className='absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce'>
        <div className='flex flex-col items-center gap-2'>
          <span className='font-mono text-muted-foreground/50 text-xs tracking-widest dark:text-slate-500'>SCROLL</span>
          <ChevronDown className='h-4 w-4 text-muted-foreground/50 dark:text-slate-500' />
        </div>
      </div>
    </section>
  );
};

export { HeroSection };
