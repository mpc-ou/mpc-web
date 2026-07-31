"use client";

import { Award, Sparkles, Ticket, Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { localizedText, type WebDesignBenefit, type WebDesignPrize } from "@/types/webdesign";

const TIER_STYLES: Record<
  WebDesignPrize["tier"],
  { border: string; iconBox: string; title: string; badge: string; wrapper: string; iconSize: string }
> = {
  gold: {
    border: "border-yellow-500/30 hover:border-yellow-400/50",
    iconBox: "border-yellow-400/30 bg-yellow-500/15 text-yellow-500 dark:text-yellow-400",
    title: "text-yellow-500 dark:text-yellow-400",
    badge: "text-yellow-600 dark:text-yellow-500/80",
    wrapper: "shadow-2xl shadow-yellow-500/10 md:-translate-y-4 md:p-10",
    iconSize: "h-14 w-14"
  },
  silver: {
    border: "border-border hover:border-slate-400/30 dark:border-white/10",
    iconBox: "border-slate-400/20 bg-slate-500/10 text-slate-500 dark:text-slate-300",
    title: "text-slate-700 dark:text-slate-300",
    badge: "text-slate-500",
    wrapper: "shadow-xl",
    iconSize: "h-10 w-10"
  },
  bronze: {
    border: "border-border hover:border-amber-700/30 dark:border-white/10",
    iconBox: "border-amber-600/20 bg-amber-700/10 text-amber-600",
    title: "text-amber-600",
    badge: "text-slate-500",
    wrapper: "shadow-xl",
    iconSize: "h-10 w-10"
  }
};

const BENEFIT_ICONS = [Award, Ticket];

export function WebDesignPrizesClient({
  prizes,
  benefits
}: {
  prizes: WebDesignPrize[];
  benefits: WebDesignBenefit[];
}) {
  const t = useTranslations("webdesign");
  const locale = useLocale();

  if (prizes.length === 0 && benefits.length === 0) {
    return null;
  }

  return (
    <section className='relative z-10 mb-28'>
      <ScrollReveal className='mb-16 text-center'>
        <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm uppercase'>
          &gt; prizes
        </span>
        <h2 className='mt-4 font-black text-3xl text-foreground uppercase tracking-tight sm:text-4xl'>
          {t("prizesTitle")}
        </h2>
      </ScrollReveal>

      {prizes.length > 0 && (
        <div className='relative mx-auto flex max-w-7xl flex-col items-stretch justify-center gap-8 md:flex-row'>
          {prizes.map((prize, idx) => {
            const style = TIER_STYLES[prize.tier];
            return (
              <ScrollReveal className='flex-1' delay={idx * 100} key={prize.id} variant='fade-up'>
                <div
                  className={`group relative flex h-full flex-col items-center justify-between rounded-2xl border bg-card/70 p-8 text-center backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 dark:bg-slate-900/30 ${style.border} ${style.wrapper}`}
                >
                  <div className='flex flex-col items-center'>
                    <div
                      className={`mb-6 rounded-full border p-4 transition-all group-hover:scale-110 ${style.iconBox}`}
                    >
                      <Trophy className={style.iconSize} />
                    </div>
                    <h3 className={`font-black text-xl uppercase tracking-wider ${style.title}`}>
                      {localizedText(locale, prize.title)}
                    </h3>
                    <p className='mt-4 text-slate-600 text-sm leading-relaxed dark:text-slate-400'>
                      {localizedText(locale, prize.description)}
                    </p>
                  </div>
                  <div
                    className={`mt-8 flex items-center gap-1.5 font-bold font-mono text-[10px] uppercase tracking-widest ${style.badge}`}
                  >
                    {prize.tier === "gold" && <Sparkles className='h-3 w-3 animate-pulse' />}
                    {prize.tier} award
                    {prize.tier === "gold" && <Sparkles className='h-3 w-3 animate-pulse' />}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}

      {benefits.length > 0 && (
        <div className='relative z-10 mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2'>
          {benefits.map((benefit, idx) => {
            const Icon = BENEFIT_ICONS[idx % BENEFIT_ICONS.length] ?? Award;
            return (
              <ScrollReveal delay={idx * 100} key={benefit.id} variant='fade-up'>
                <div className='group relative flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-slate-200/50 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-orange-500/30 dark:border-white/10 dark:bg-slate-900/30 dark:shadow-none'>
                  <div className='shrink-0 rounded-xl border border-orange-500/20 bg-orange-500/10 p-3 text-orange-500 transition-all group-hover:bg-orange-500 group-hover:text-white dark:text-orange-400'>
                    <Icon className='h-6 w-6' />
                  </div>
                  <div>
                    <h4 className='mb-2 font-bold text-foreground text-lg uppercase tracking-tight'>
                      {localizedText(locale, benefit.title)}
                    </h4>
                    <p className='text-slate-600 text-sm leading-relaxed dark:text-slate-400'>
                      {localizedText(locale, benefit.description)}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </section>
  );
}
