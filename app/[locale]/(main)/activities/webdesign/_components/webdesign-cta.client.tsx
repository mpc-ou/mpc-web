"use client";

import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { EditorWindow } from "@/components/custom/editor-window.client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { ABOUT_CLUB } from "@/configs/data/about";

export function WebDesignCtaClient({ registerUrl }: { registerUrl?: string }) {
  const t = useTranslations("webdesign");

  return (
    <section className='relative z-10 mb-28'>
      <ScrollReveal>
        <EditorWindow
          className='rounded-2xl border border-slate-200/80 bg-white/90 shadow-slate-200/50 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 dark:shadow-none'
          showLineNumbers={false}
          showStatusBar={false}
          title='join-webdesign.sh'
        >
          <div className='space-y-6 p-8 font-mono text-foreground text-sm md:p-12'>
            <div className='bg-transparent'>
              <Badge
                className='mb-4 border-orange-500/20 bg-orange-500/10 text-orange-500 uppercase tracking-widest dark:text-orange-400'
                variant='outline'
              >
                {t("joinTitle")}
              </Badge>
              <h2 className='mb-4 font-black text-2xl text-foreground uppercase tracking-tight sm:text-3xl'>
                {t("joinHeading")}
              </h2>
              <p className='max-w-2xl text-slate-600 text-sm leading-relaxed sm:text-base dark:text-slate-400'>
                {t("joinDesc")}
              </p>
            </div>

            <div className='space-y-2 rounded-lg border border-border bg-slate-100/80 px-5 py-4 font-mono text-slate-700 text-xs leading-relaxed sm:text-sm dark:border-white/10 dark:bg-black/50 dark:text-slate-400'>
              <div>
                <span className='text-orange-500'>$</span> npm init{" "}
                <span className='text-amber-600 dark:text-amber-300'>mpc-webdesign</span> --year=2025
              </div>
              <div className='text-emerald-600 dark:text-emerald-400'>
                &gt; Fetching latest rules... success [200 OK]
              </div>
              <div className='text-emerald-600 dark:text-emerald-400'>
                &gt; Preparing registration form... success [200 OK]
              </div>
              <div>
                <span className='text-orange-500'>$</span> mpc register --team=your-team-name
              </div>
              <div className='text-slate-500 italic dark:text-slate-400'>
                &gt; Standing by. Tap the button below to complete the workflow.
              </div>
            </div>

            <div className='flex items-center gap-3 border-border border-t pt-4 dark:border-white/10'>
              <Button
                asChild
                className='group h-14 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-8 font-bold text-base text-white shadow-xl transition-all duration-300 hover:from-orange-600 hover:to-amber-600 hover:shadow-orange-500/20 active:scale-[0.98]'
                size='lg'
              >
                <a
                  className='flex items-center justify-center gap-1.5'
                  href={ABOUT_CLUB.contact.facebook}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  {t("followUpBtn")}
                  <ExternalLink className='ml-2 h-5 w-5 transition-transform group-hover:translate-x-1' />
                </a>
              </Button>

              {registerUrl && (
                <Button
                  asChild
                  className='group h-14 rounded-xl border border-orange-500/30 bg-white/90 px-8 font-bold text-base text-orange-600 shadow-xl transition-all duration-300 hover:bg-orange-50 active:scale-[0.98] dark:bg-slate-950/60 dark:text-orange-400 dark:hover:bg-slate-900'
                  size='lg'
                  variant='outline'
                >
                  <a
                    className='flex items-center justify-center gap-1.5'
                    href={registerUrl}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {t("registerBtn")}
                    <ExternalLink className='ml-2 h-5 w-5 transition-transform group-hover:translate-x-1' />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </EditorWindow>
      </ScrollReveal>
    </section>
  );
}
