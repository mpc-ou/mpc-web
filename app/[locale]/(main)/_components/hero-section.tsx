"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { HeroBackground } from "@/components/custom/hero-background.client";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";
import type { StatsData } from "@/constants/terminal";
import { useTransparentHeader } from "@/hooks/use-transparent-header";
import { HeroPc } from "./hero-pc.client";

type Props = {
  stats: StatsData | null;
  slides: string[];
};

const TYPE_DELAY_MS = 350;
const TYPE_STEP_MS = 38;

const TypedTitle = ({ text }: { text: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let timer: ReturnType<typeof setTimeout>;
    const step = (n: number) => {
      setCount(n);
      if (n < text.length) {
        timer = setTimeout(() => step(n + 1), TYPE_STEP_MS);
      }
    };
    timer = setTimeout(() => step(1), TYPE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [text]);

  const cursor = (
    <span className='ml-[0.06em] inline-block h-[0.82em] w-[0.08em] translate-y-[0.06em] animate-blink-cursor bg-primary' />
  );

  return (
    <h1 className='relative pb-4 font-black text-[2.6rem] leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-7xl xl:text-[5.5rem]'>
      <span className='sr-only'>{text}</span>
      <span aria-hidden className='invisible'>
        {text}
        {cursor}
      </span>
      <span
        aria-hidden
        className='absolute inset-0 bg-linear-to-br from-primary to-primary/70 bg-clip-text text-transparent'
      >
        {text.slice(0, count)}
        {cursor}
      </span>
    </h1>
  );
};

const HeroSection = ({ stats, slides }: Props) => {
  useTransparentHeader({
    hideActions: false,
    textColor: "var(--color-foreground)",
    logoColor: "var(--color-foreground)"
  });

  const t = useTranslations("home.hero");

  return (
    <section className='relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden bg-background px-4 pt-24 pb-20 text-foreground lg:pt-16'>
      <HeroBackground />
      <div
        aria-hidden
        className='pointer-events-none absolute top-1/2 right-[-10%] h-160 w-160 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px] dark:bg-primary/15'
      />

      <div className='relative z-10 grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-6'>
        <div className='order-last flex flex-col items-center gap-5 text-center lg:order-first lg:items-start lg:gap-6 lg:text-left'>
          <Image
            alt='MPC Logo'
            className='h-11 w-11 animate-fade-in-up lg:h-14 lg:w-14'
            height={56}
            src='/images/logo.png'
            width={56}
          />

          <TypedTitle text={t("title")} />

          <p className='max-w-md animate-fade-in-up text-lg text-muted-foreground opacity-0 [animation-delay:240ms] sm:text-xl'>
            {t("subtitle")}
          </p>

          <div className='flex animate-fade-in-up flex-wrap items-center justify-center gap-3 pt-1 opacity-0 [animation-delay:360ms] lg:justify-start'>
            <Button
              asChild
              className='group rounded-xl bg-primary px-6 py-5 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-primary/40'
              size='lg'
            >
              <Link href='/about'>
                <span className='mr-1 font-mono'>&gt;_</span>
                {t("cta")}
                <ArrowRight className='ml-1 h-4 w-4 transition-transform group-hover:translate-x-1' />
              </Link>
            </Button>
            <Button
              asChild
              className='rounded-xl border-border bg-background/40 px-6 py-5 font-semibold backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:text-primary dark:hover:text-primary'
              size='lg'
              variant='outline'
            >
              <Link href='/members'>{t("ctaJoin")}</Link>
            </Button>
          </div>
        </div>

        <div className='order-first flex animate-fade-in-up justify-center opacity-0 [animation-delay:200ms] lg:order-last'>
          <HeroPc slides={slides} stats={stats} />
        </div>
      </div>

      <div className='absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-muted-foreground/60 sm:flex'>
        <span className='font-mono text-[11px] tracking-[0.3em]'>SCROLL</span>
        <ChevronDown className='h-4 w-4 animate-bounce' />
      </div>
    </section>
  );
};

export { HeroSection };
