"use client";

import { Award, Sparkles, Ticket, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";

export function WebDesignPrizesClient() {
  const t = useTranslations("webdesign");

  return (
    <section className='relative z-10 mb-28'>
      <ScrollReveal className='mb-16 text-center'>
        <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm uppercase'>
          &gt; prizes
        </span>
        <h2 className='mt-4 font-black text-3xl text-white uppercase tracking-tight sm:text-4xl'>{t("prizesTitle")}</h2>
      </ScrollReveal>

      <div className='relative mx-auto flex max-w-7xl flex-col items-stretch justify-center gap-8 md:flex-row'>
        {/* 2nd Place (Silver) */}
        <ScrollReveal className='flex-1' delay={100} variant='fade-up'>
          <div className='group relative flex h-full flex-col items-center justify-between rounded-2xl border border-white/5 bg-slate-900/40 p-8 text-center shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-slate-400/30'>
            <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-400 to-slate-200' />

            <div className='flex flex-col items-center'>
              <div className='mb-6 rounded-full border border-slate-400/20 bg-slate-500/10 p-4 text-slate-300 transition-all group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(148,163,184,0.3)]'>
                <Trophy className='h-10 w-10' />
              </div>
              <h3 className='font-black text-slate-300 text-xl uppercase tracking-wider'>{t("prize2")}</h3>
              <p className='mt-4 text-slate-400 text-sm leading-relaxed'>
                {t.rich("prize2Desc", {
                  b: (chunks) => <strong className='font-bold text-white'>{chunks}</strong>
                })}
              </p>
            </div>

            <div className='mt-8 font-mono text-[9px] text-slate-500 uppercase tracking-widest'>Silver Award</div>
          </div>
        </ScrollReveal>

        {/* 1st Place (Gold) - Sits in the center and is taller/elevated */}
        <ScrollReveal className='flex-1 md:-translate-y-4' delay={0} variant='fade-up'>
          <div className='group relative flex h-full flex-col items-center justify-between rounded-2xl border border-yellow-500/20 bg-slate-900/50 p-8 text-center shadow-2xl shadow-yellow-500/5 transition-all duration-300 hover:-translate-y-6 hover:border-yellow-400/40 md:p-10'>
            <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300' />
            {/* Gold glow effect on hover */}
            <div className='pointer-events-none absolute inset-0 rounded-2xl bg-yellow-500/0 opacity-[0.02] transition-opacity group-hover:bg-yellow-500/2 group-hover:opacity-100' />

            <div className='flex flex-col items-center'>
              <div className='mb-6 rounded-full border border-yellow-400/30 bg-yellow-500/15 p-5 text-yellow-400 transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]'>
                <Trophy className='h-14 w-14' />
              </div>
              <h3 className='font-black text-2xl text-yellow-400 uppercase tracking-widest'>{t("prize1")}</h3>
              <p className='mt-4 text-base text-slate-300 leading-relaxed'>
                {t.rich("prize1Desc", {
                  b: (chunks) => <strong className='font-bold text-white'>{chunks}</strong>
                })}
              </p>
            </div>

            <div className='mt-8 flex items-center gap-1.5 font-bold font-mono text-[10px] text-yellow-500/80 uppercase tracking-widest'>
              <Sparkles className='h-3 w-3 animate-pulse' />
              Champion Award
              <Sparkles className='h-3 w-3 animate-pulse' />
            </div>
          </div>
        </ScrollReveal>

        {/* 3rd Place (Bronze) */}
        <ScrollReveal className='flex-1' delay={200} variant='fade-up'>
          <div className='group relative flex h-full flex-col items-center justify-between rounded-2xl border border-white/5 bg-slate-900/40 p-8 text-center shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-amber-700/30'>
            <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-600 to-orange-700' />

            <div className='flex flex-col items-center'>
              <div className='mb-6 rounded-full border border-amber-600/20 bg-amber-700/10 p-4 text-amber-600 transition-all group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(217,119,6,0.3)]'>
                <Trophy className='h-10 w-10' />
              </div>
              <h3 className='font-black text-amber-600 text-xl uppercase tracking-wider'>{t("prize3")}</h3>
              <p className='mt-4 text-slate-400 text-sm leading-relaxed'>
                {t.rich("prize3Desc", {
                  b: (chunks) => <strong className='font-bold text-white'>{chunks}</strong>
                })}
              </p>
            </div>

            <div className='mt-8 font-mono text-[9px] text-slate-500 uppercase tracking-widest'>Bronze Award</div>
          </div>
        </ScrollReveal>
      </div>

      {/* Certificate & Spectator Perks */}
      <div className='relative z-10 mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Certificate Card */}
        <ScrollReveal delay={100} variant='fade-up'>
          <div className='group relative flex items-start gap-4 rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-lg transition-all duration-300 hover:border-orange-500/30 hover:bg-slate-900/60'>
            <div className='shrink-0 rounded-xl border border-orange-500/20 bg-orange-500/10 p-3 text-orange-400 transition-all group-hover:bg-orange-500 group-hover:text-white'>
              <Award className='h-6 w-6' />
            </div>
            <div>
              <h4 className='mb-2 font-bold text-lg text-white uppercase tracking-tight'>{t("certificate")}</h4>
              <p className='text-slate-400 text-sm leading-relaxed'>
                {t.rich("certificateDesc", {
                  b: (chunks) => <strong className='font-semibold text-white'>{chunks}</strong>
                })}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Spectator Card */}
        <ScrollReveal delay={200} variant='fade-up'>
          <div className='group relative flex items-start gap-4 rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-lg transition-all duration-300 hover:border-blue-500/30 hover:bg-slate-900/60'>
            <div className='shrink-0 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-400 transition-all group-hover:bg-blue-500 group-hover:text-white'>
              <Ticket className='h-6 w-6' />
            </div>
            <div>
              <h4 className='mb-2 font-bold text-lg text-white uppercase tracking-tight'>{t("spectatorPerk")}</h4>
              <p className='text-slate-400 text-sm leading-relaxed'>
                {t.rich("spectatorPerkDesc", {
                  b: (chunks) => <strong className='font-semibold text-white'>{chunks}</strong>
                })}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
