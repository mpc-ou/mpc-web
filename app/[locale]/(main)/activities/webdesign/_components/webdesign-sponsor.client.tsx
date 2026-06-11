"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";

export function WebDesignSponsorClient() {
  const t = useTranslations("webdesign");

  return (
    <section className='relative z-10 mb-28'>
      <ScrollReveal>
        <div className='relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-950/70 p-8 shadow-2xl backdrop-blur-md md:p-12'>
          <div className='pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-orange-500/5 blur-[100px]' />
          <div className='pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-blue-500/5 blur-[100px]' />

          <div className='grid grid-cols-1 items-center gap-8 lg:grid-cols-12'>
            <div className='space-y-6 lg:col-span-7'>
              <span className='rounded-full bg-blue-500/10 px-3 py-1 font-medium font-mono text-blue-400 text-sm uppercase'>
                &gt; partnership
              </span>
              <h2 className='font-black text-2xl text-white uppercase tracking-tight sm:text-3xl'>
                {t("sponsorHeading")}
              </h2>
              <p className='max-w-xl text-slate-300 text-sm leading-relaxed sm:text-base'>
                {t.rich("sponsorDesc", {
                  b: (chunks) => <strong className='font-bold text-white'>{chunks}</strong>
                })}
              </p>
              <div className='pt-2'>
                <Button
                  asChild
                  className='group h-14 rounded-xl border border-white/10 bg-slate-900 px-8 font-bold text-base text-white shadow-xl transition-all duration-300 hover:border-orange-500/30 hover:bg-slate-800'
                  size='lg'
                >
                  <a className='flex items-center gap-1.5' href='/sponsors'>
                    {t("sponsorBtn")}
                    <ChevronRight className='ml-2 h-5 w-5 transition-transform group-hover:translate-x-1' />
                  </a>
                </Button>
              </div>
            </div>

            {/* Right Column: Footage Image Mockup of the crowded finals venue */}
            <div className='group/image relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 shadow-2xl lg:col-span-5'>
              <img
                alt='Web Design Finals'
                className='h-full w-full object-cover transition-transform duration-500 group-hover/image:scale-105'
                src='/images/web-design/2025_0.jpg'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent' />
              <div className='absolute bottom-4 left-4 rounded-lg border border-white/10 bg-slate-900/90 px-3 py-1.5 font-mono text-white/80 text-xs backdrop-blur-xs'>
                <span className='font-bold text-orange-500'>500+</span> Students Engaged
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
