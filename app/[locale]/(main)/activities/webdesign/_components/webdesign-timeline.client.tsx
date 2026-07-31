"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";

export function WebDesignTimelineClient() {
  const t = useTranslations("webdesign");

  return (
    <section className='relative z-10 mb-28'>
      <ScrollReveal className='mb-16 text-center'>
        <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm uppercase'>
          &gt; timeline
        </span>
        <h2 className='mt-4 font-black text-3xl text-foreground uppercase tracking-tight sm:text-4xl'>
          {t("timelineTitle")}
        </h2>
      </ScrollReveal>

      <div className='relative mx-auto max-w-3xl pl-8 sm:pl-16'>
        <div className='absolute top-4 bottom-4 left-[18px] w-0.5 rounded-full bg-gradient-to-b from-orange-500 via-blue-500 to-emerald-500 sm:left-[35px]' />

        {[1, 2, 3, 4].map((phase, idx) => {
          const dotColors = [
            "bg-orange-500 ring-orange-500/20",
            "bg-blue-500 ring-blue-500/20",
            "bg-pink-500 ring-pink-500/20",
            "bg-emerald-500 ring-emerald-500/20"
          ];
          const textGradients = [
            "from-orange-400 to-amber-300",
            "from-blue-400 to-cyan-300",
            "from-pink-400 to-rose-300",
            "from-emerald-400 to-teal-300"
          ];

          const commitHash = `df80b0${idx + 1}`;

          return (
            <ScrollReveal
              className='group relative mb-10 last:mb-0'
              delay={idx * 150}
              key={commitHash}
              variant='fade-up'
            >
              <div
                className={`absolute top-6 left-[-26px] z-10 h-4 w-4 rounded-full border border-background transition-all duration-300 sm:left-[-53px] ${dotColors[idx]} group-hover:scale-125 group-hover:ring-4`}
              />

              <div className='absolute top-12 left-[-26px] hidden origin-left rotate-90 pl-2 font-mono text-[9px] text-slate-500 opacity-50 transition-opacity group-hover:opacity-100 sm:left-[-53px] sm:block'>
                git: branch_{idx + 1}
              </div>

              <div className='rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-slate-200/50 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-orange-500/40 sm:p-8 dark:border-white/10 dark:bg-slate-900/30 dark:shadow-none'>
                <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
                  <div className='flex items-center gap-2'>
                    <span className='rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono font-semibold text-slate-600 text-xs dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-400'>
                      commit {commitHash}
                    </span>
                    <span className='font-mono text-[10px] text-slate-500'>author: mpc-dev</span>
                  </div>

                  <Badge
                    className='border-border bg-muted/40 font-semibold text-slate-700 text-xs tracking-wider dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
                    variant='outline'
                  >
                    {t(`phase${phase}Title` as Parameters<typeof t>[0])}
                  </Badge>
                </div>

                <h3
                  className={`bg-gradient-to-r bg-clip-text font-black text-transparent text-xl uppercase tracking-tight ${textGradients[idx]}`}
                >
                  {t(`phase${phase}` as Parameters<typeof t>[0])}
                </h3>
                <p className='mt-2 border-border border-l pl-4 text-slate-600 text-sm leading-relaxed transition-colors dark:border-white/10 dark:text-slate-400'>
                  {t(`phase${phase}Desc` as Parameters<typeof t>[0])}
                </p>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
