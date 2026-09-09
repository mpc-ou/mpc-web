"use client";

import { Globe, PenTool, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";

export function WebDesignRulesClient() {
  const t = useTranslations("webdesign");

  return (
    <section className='relative z-10 mb-28'>
      <ScrollReveal className='mb-16 text-center'>
        <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm uppercase'>
          &gt; rules
        </span>
        <h2 className='mt-4 font-black text-3xl text-foreground uppercase tracking-tight sm:text-4xl'>
          {t("rulesTitle")}
        </h2>
      </ScrollReveal>

      <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
        {[
          { icon: Users, title: "rules1", desc: "rules1Desc", frame: "Team_Card" },
          { icon: PenTool, title: "rules2", desc: "rules2Desc", frame: "Register_Card" },
          { icon: Globe, title: "rules3", desc: "rules3Desc", frame: "Audience_Card" }
        ].map((item, idx) => (
          <ScrollReveal delay={idx * 150} key={item.frame} variant='fade-up'>
            <div className='group relative flex h-full cursor-pointer select-none flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-slate-200/50 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-orange-500/50 hover:bg-white dark:border-white/10 dark:bg-slate-900/30 dark:shadow-none dark:hover:bg-slate-900/50'>
              <div className='absolute top-0 left-0 h-[1px] w-full bg-orange-500/0 transition-colors group-hover:bg-orange-500/40' />
              <div className='absolute bottom-0 left-0 h-[1px] w-full bg-orange-500/0 transition-colors group-hover:bg-orange-500/40' />
              <div className='absolute top-0 left-0 h-full w-[1px] bg-orange-500/0 transition-colors group-hover:bg-orange-500/40' />
              <div className='absolute top-0 right-0 h-full w-[1px] bg-orange-500/0 transition-colors group-hover:bg-orange-500/40' />

              <div className='absolute top-[-3px] left-[-3px] h-1.5 w-1.5 border border-orange-500 bg-white opacity-0 transition-opacity group-hover:opacity-100' />
              <div className='absolute top-[-3px] right-[-3px] h-1.5 w-1.5 border border-orange-500 bg-white opacity-0 transition-opacity group-hover:opacity-100' />
              <div className='absolute bottom-[-3px] left-[-3px] h-1.5 w-1.5 border border-orange-500 bg-white opacity-0 transition-opacity group-hover:opacity-100' />
              <div className='absolute right-[-3px] bottom-[-3px] h-1.5 w-1.5 border border-orange-500 bg-white opacity-0 transition-opacity group-hover:opacity-100' />

              <div className='absolute top-2 left-2 font-mono text-[9px] text-slate-500/80 transition-colors group-hover:text-orange-400'>
                {item.frame} [x, y, w, h]
              </div>

              <div className='pt-4'>
                <div className='mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(249,115,22,0.4)]'>
                  <item.icon className='h-6 w-6' />
                </div>
                <h3 className='mb-3 font-black text-foreground text-lg uppercase tracking-tight'>
                  {t(item.title as Parameters<typeof t>[0])}
                </h3>
                <p className='text-slate-600 text-sm leading-relaxed transition-colors group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-300'>
                  {t(item.desc as Parameters<typeof t>[0])}
                </p>
              </div>

              <div className='mt-8 flex shrink-0 justify-between font-mono text-[10px] text-slate-600 transition-colors group-hover:text-orange-500/40'>
                <span>ALIGN: CENTER</span>
                <span>OPACITY: 100%</span>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
