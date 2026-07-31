"use client";

import { ChevronRight, FileText } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";

export function WebDesignSponsorClient({ proposalUrl, sponsorUrl }: { proposalUrl?: string; sponsorUrl?: string }) {
  const t = useTranslations("webdesign");

  return (
    <section className='relative z-10 mb-28'>
      <ScrollReveal>
        <div className='relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-slate-200/50 shadow-xl backdrop-blur-xl md:p-12 dark:border-white/10 dark:bg-slate-900/30 dark:shadow-none'>
          <div className='pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-orange-500/5 blur-[100px]' />
          <div className='pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-blue-500/5 blur-[100px]' />

          <div className='grid grid-cols-1 items-center gap-8 lg:grid-cols-12'>
            <div className='space-y-6 lg:col-span-7'>
              <span className='rounded-full bg-blue-500/10 px-3 py-1 font-medium font-mono text-blue-500 text-sm uppercase dark:text-blue-400'>
                &gt; partnership
              </span>
              <h2 className='mt-2 font-black text-2xl text-foreground uppercase tracking-tight sm:text-3xl'>
                {t("sponsorHeading")}
              </h2>
              <p className='max-w-xl text-slate-600 text-sm leading-relaxed sm:text-base dark:text-slate-300'>
                {t.rich("sponsorDesc", {
                  b: (chunks) => <strong className='font-bold text-foreground'>{chunks}</strong>
                })}
              </p>
              <div className='flex flex-wrap gap-3 pt-2'>
                {sponsorUrl && (
                  <Button
                    asChild
                    className='group h-14 rounded-xl border border-white/10 bg-slate-900 px-8 font-bold text-base text-white shadow-xl transition-all duration-300 hover:border-orange-500/30 hover:bg-slate-800'
                    size='lg'
                  >
                    <a
                      className='flex items-center gap-1.5'
                      href={sponsorUrl}
                      rel='noopener noreferrer'
                      target='_blank'
                    >
                      {t("sponsorCtaBtn")}
                      <ChevronRight className='ml-2 h-5 w-5 transition-transform group-hover:translate-x-1' />
                    </a>
                  </Button>
                )}

                {proposalUrl && (
                  <Button
                    asChild
                    className='group h-14 rounded-xl border border-orange-500/30 bg-orange-500/10 px-8 font-bold text-base text-orange-500 shadow-xl transition-all duration-300 hover:border-orange-500/50 hover:bg-orange-500/20 dark:text-orange-400'
                    size='lg'
                    variant='outline'
                  >
                    <a href={proposalUrl} rel='noopener noreferrer' target='_blank'>
                      <FileText className='mr-2 h-5 w-5' />
                      {t("proposalBtn")}
                      <ChevronRight className='ml-2 h-5 w-5 transition-transform group-hover:translate-x-1' />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className='group/image relative aspect-4/3 overflow-hidden rounded-xl border border-slate-200 shadow-2xl lg:col-span-5 dark:border-white/10'>
              <Image
                alt='Web Design Finals'
                className='object-cover transition-transform duration-500 group-hover/image:scale-105'
                fill
                sizes='(min-width: 1024px) 42vw, 100vw'
                src='/images/web-design/2025_0.jpg'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent' />
              <div className='absolute bottom-4 left-4 rounded-lg border border-slate-200 bg-white/90 px-3 py-1.5 font-mono text-slate-800 text-xs backdrop-blur-xs dark:border-white/10 dark:bg-slate-900/90 dark:text-white/80'>
                <span className='font-bold text-orange-500'>500+</span> Students Engaged
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
