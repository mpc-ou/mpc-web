"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import type { WebDesignMilestone } from "@/types/webdesign";
import { HeroSlideshow } from "./hero-slideshow.client";
import { HeroStatus } from "./hero-status.client";
import { TechMarquee } from "./tech-marquee";
import { WD_SECTION_IDS } from "./wd-primitives";

/** Moves the decorative spotlight via CSS vars - no React re-render per mouse move. */
function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return ref;
}

export function WebDesignHeroClient({
  contestDate,
  milestones,
  registerUrl
}: {
  contestDate?: string;
  milestones: WebDesignMilestone[];
  registerUrl?: string;
}) {
  const t = useTranslations("webdesign");
  const hasStatus = milestones.length > 0 || (!!contestDate && !Number.isNaN(new Date(contestDate).getTime()));
  const isExternalRegister = !!registerUrl;
  const sectionRef = useSpotlight<HTMLElement>();

  return (
    <section className='relative min-h-screen px-4 pt-18 sm:px-6' ref={sectionRef}>
      <HeroBackdrop />

      <div className='relative mx-auto mb-8 flex max-w-7xl flex-wrap items-center gap-14'>
        {/* Copy */}
        <div className='flex min-w-0 flex-[1_1_420px] flex-col items-start gap-7'>
          {/* <ScrollReveal className='flex flex-wrap items-center gap-2.5'>
            <span className='inline-flex items-center gap-2 rounded-full border border-orange-500/35 bg-orange-500/10 px-3.5 py-1.5 font-mono font-semibold text-orange-400 text-xs tracking-[0.04em]'>
              <span className='h-1.5 w-1.5 rounded-full bg-[#ff5e00] motion-safe:animate-pulse' />
              {t("heroBadge")}
            </span>
            <span className='font-mono text-muted-foreground text-xs'>{t("heroEyebrow")}</span>
          </ScrollReveal> */}

          <ScrollReveal delay={90}>
            <h1 className='font-black text-[clamp(2.75rem,6.4vw,5.25rem)] leading-[0.98] tracking-[-0.035em]'>
              <span className='mb-3.5 block font-extrabold text-[0.46em] text-muted-foreground tracking-[-0.01em]'>
                {t("heroTitlePrefix")}
              </span>
              <span className='block text-foreground'>Web</span>
              <span className='block bg-[linear-gradient(90deg,#ff5e00,#fbbf24,#ff5e00)] bg-size-[200%_100%] bg-clip-text pb-2 text-transparent motion-safe:animate-wd-shine'>
                Design.
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={180}>
            <p className='max-w-[520px] text-pretty text-[17px] text-muted-foreground leading-[1.7]'>{t("subtitle")}</p>
          </ScrollReveal>

          <ScrollReveal className='flex flex-wrap gap-3' delay={270}>
            <a
              className='inline-flex h-13 items-center gap-2.5 rounded-xl bg-[#ff5e00] px-6.5 font-extrabold text-base text-white shadow-[0_12px_32px_-10px_rgba(255,94,0,0.6)] transition-colors hover:bg-[#ff7a2e]'
              href={registerUrl || `#${WD_SECTION_IDS.register}`}
              {...(isExternalRegister ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {t("registerBtn")} <ArrowRight className='h-4.5 w-4.5' strokeWidth={2.2} />
            </a>
            <a
              className='inline-flex h-13 items-center rounded-xl border border-border bg-foreground/[0.03] px-6 font-bold text-base text-foreground transition-colors hover:border-orange-500/50 dark:border-white/15'
              href={`#${WD_SECTION_IDS.regulations}`}
            >
              {t("rulesBtn")}
            </a>
          </ScrollReveal>

          {hasStatus && (
            <ScrollReveal delay={360}>
              <HeroStatus contestDate={contestDate} milestones={milestones} />
            </ScrollReveal>
          )}
        </div>

        {/* Browser window slideshow */}
        <ScrollReveal className='min-w-0 flex-[1.35_1_520px]' delay={250} duration={1000} variant='zoom-in'>
          <HeroSlideshow />
        </ScrollReveal>
      </div>

      {/* <HeroKeyFacts /> */}
      <TechMarquee />
    </section>
  );
}

function HeroBackdrop() {
  return (
    <div aria-hidden='true' className='pointer-events-none absolute inset-0 overflow-hidden'>
      {/* Cursor spotlight */}
      <div className='absolute inset-0 bg-[radial-gradient(560px_circle_at_var(--mx,70%)_var(--my,30%),rgba(255,94,0,0.10),transparent_60%)]' />
      {/* Faded grid */}
      <div className='absolute inset-0 bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] bg-size-[64px_64px] text-foreground/[0.04] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_30%,#000_30%,transparent_80%)]' />
      {/* Drifting glows */}
      <div className='absolute -top-30 -left-20 h-140 w-140 rounded-full bg-orange-500/22 blur-[140px] motion-safe:animate-wd-drift' />
      <div className='absolute top-10 -right-30 h-130 w-130 rounded-full bg-blue-500/16 blur-[150px] motion-safe:animate-wd-drift-reverse' />
    </div>
  );
}
