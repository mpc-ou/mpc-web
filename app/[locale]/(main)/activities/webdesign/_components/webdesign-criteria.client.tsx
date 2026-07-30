"use client";

import { CalendarDays, CheckSquare, Layout, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";

const CRITERIA = [
  { icon: Layout, title: "criteria1", desc: "criteria1Desc" },
  { icon: CalendarDays, title: "criteria2", desc: "criteria2Desc" },
  { icon: Lightbulb, title: "criteria3", desc: "criteria3Desc" },
  { icon: CheckSquare, title: "criteria4", desc: "criteria4Desc" }
] as const;

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
        {CRITERIA.map((item, idx) => (
          <ScrollReveal delay={idx * 100} key={item.title} variant='fade-up'>
            <div className='group flex h-full flex-col items-center gap-4 rounded-2xl border border-white/5 bg-slate-900/40 p-6 text-center shadow-lg transition-all duration-300 hover:border-emerald-500/40 hover:bg-slate-900/60'>
              <div className='flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 transition-transform duration-300 group-hover:scale-110'>
                <item.icon className='h-7 w-7 text-emerald-400' strokeWidth={1.75} />
              </div>

              <div>
                <h3 className='mb-2 font-black text-base text-white uppercase tracking-tight'>
                  {t(item.title as Parameters<typeof t>[0])}
                </h3>
                <p className='text-slate-400 text-xs leading-relaxed'>{t(item.desc as Parameters<typeof t>[0])}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
