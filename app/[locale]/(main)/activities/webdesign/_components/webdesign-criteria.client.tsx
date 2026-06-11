"use client";

import { CalendarDays, CheckCircle, CheckSquare, Layout, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";

export function WebDesignCriteriaClient() {
  const t = useTranslations("webdesign");

  return (
    <section className='relative z-10 mb-28'>
      <ScrollReveal className='mb-16 text-center'>
        <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm uppercase'>
          &gt; criteria
        </span>
        <h2 className='mt-4 font-black text-3xl text-white uppercase tracking-tight sm:text-4xl'>
          {t("criteriaTitle")}
        </h2>
      </ScrollReveal>

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        {[
          { icon: Layout, title: "criteria1", desc: "criteria1Desc", score: 99, color: "stroke-emerald-400" },
          { icon: CalendarDays, title: "criteria2", desc: "criteria2Desc", score: 98, color: "stroke-emerald-400" },
          { icon: Lightbulb, title: "criteria3", desc: "criteria3Desc", score: 100, color: "stroke-emerald-400" },
          { icon: CheckSquare, title: "criteria4", desc: "criteria4Desc", score: 100, color: "stroke-emerald-400" }
        ].map((item, idx) => {
          const radius = 34;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (item.score / 100) * circumference;

          return (
            <ScrollReveal delay={idx * 100} key={idx} variant='fade-up'>
              <div className='group flex h-full flex-col items-center justify-between rounded-2xl border border-white/5 bg-slate-900/40 p-6 text-center shadow-lg transition-all duration-300 hover:border-emerald-500/40 hover:bg-slate-900/60'>
                <div className='flex w-full flex-col items-center'>
                  {/* Lighthouse Score Circular Progress SVG */}
                  <div className='relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/5 bg-slate-950/40'>
                    <svg className='absolute h-22 w-22 -rotate-90'>
                      <circle
                        className='stroke-slate-800'
                        cx='44'
                        cy='44'
                        fill='transparent'
                        r={radius}
                        strokeWidth='4'
                      />
                      <circle
                        className={item.color}
                        cx='44'
                        cy='44'
                        fill='transparent'
                        r={radius}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap='round'
                        strokeWidth='4'
                      />
                    </svg>
                    <div className='z-10 flex flex-col items-center justify-center'>
                      <span className='font-bold font-mono text-emerald-400 text-xl'>{item.score}</span>
                      <span className='font-mono text-[8px] text-slate-500 uppercase tracking-widest transition-colors group-hover:text-emerald-400/80'>
                        Score
                      </span>
                    </div>
                  </div>

                  <div className='mb-2 flex items-center justify-center gap-1.5'>
                    <item.icon className='h-4 w-4 text-emerald-400' />
                    <h3 className='font-black text-base text-white uppercase tracking-tight'>{t(item.title as any)}</h3>
                  </div>

                  <p className='px-2 text-slate-400 text-xs leading-relaxed'>{t(item.desc as any)}</p>
                </div>

                {/* Audit Success Indicator badge */}
                <div className='mt-6 flex w-full items-center justify-center gap-1 rounded-lg border border-emerald-500/10 bg-emerald-500/5 py-1 font-mono text-[9px] text-emerald-400 uppercase tracking-widest'>
                  <CheckCircle className='h-3 w-3' />
                  Audit Passed
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
