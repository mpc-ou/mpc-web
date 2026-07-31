"use client";

import { Laptop } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { EditorWindow } from "@/components/custom/editor-window.client";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";

export function WebDesignIntroClient() {
  const t = useTranslations("webdesign");

  return (
    <section className='relative z-10'>
      <ScrollReveal className='mb-16 text-center'>
        <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm uppercase'>
          &gt; {t("tag")}
        </span>
        <h2 className='mt-4 font-black text-3xl text-foreground uppercase tracking-tight sm:text-4xl'>
          {t("heading")}
        </h2>
        <div className='mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-500' />
      </ScrollReveal>

      <ScrollReveal delay={150} variant='zoom-in'>
        <div className='grid grid-cols-1 items-stretch gap-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-slate-200/50 shadow-xl backdrop-blur-xl lg:grid-cols-12 dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none'>
          <EditorWindow
            className='aspect-square rounded-none border-0 bg-slate-50 shadow-none lg:col-span-5 dark:bg-slate-950/60'
            showLineNumbers={true}
            showStatusBar={true}
            tabs={[
              {
                name: "purpose.json",
                lineCount: 11,
                content: (
                  <div className='flex h-full select-text flex-col justify-center overflow-x-auto bg-slate-50/80 p-6 font-mono text-slate-800 text-xs leading-6 dark:bg-slate-950/20 dark:text-slate-300'>
                    <pre className='whitespace-pre'>
                      <code>
                        <span className='text-pink-600 dark:text-pink-500'>{"{"}</span>
                        {"\n"}
                        {"  "}
                        <span className='text-sky-600 dark:text-sky-400'>"competition"</span>:{" "}
                        <span className='text-amber-600 dark:text-amber-300'>"Web Design"</span>,{"\n"}
                        {"  "}
                        <span className='text-sky-600 dark:text-sky-400'>"organizer"</span>:{" "}
                        <span className='text-amber-600 dark:text-amber-300'>"Mobile Dev Club"</span>,{"\n"}
                        {"  "}
                        <span className='text-sky-600 dark:text-sky-400'>"frequency"</span>:{" "}
                        <span className='text-emerald-600 dark:text-emerald-400'>"Annual"</span>,{"\n"}
                        {"  "}
                        <span className='text-sky-600 dark:text-sky-400'>"purpose"</span>:{" "}
                        <span className='text-orange-600 dark:text-orange-400'>"{t("purpose")}"</span>,{"\n"}
                        {"  "}
                        <span className='text-sky-600 dark:text-sky-400'>"skills"</span>:{" "}
                        <span className='text-pink-600 dark:text-pink-500'>[</span>
                        {"\n"}
                        {"    "}
                        <span className='text-amber-600 dark:text-amber-300'>"UI/UX Design"</span>,{"\n"}
                        {"    "}
                        <span className='text-amber-600 dark:text-amber-300'>"Frontend Dev"</span>,{"\n"}
                        {"    "}
                        <span className='text-amber-600 dark:text-amber-300'>"Teamwork"</span>
                        {"\n"}
                        {"  "}
                        <span className='text-pink-600 dark:text-pink-500'>]</span>
                        {"\n"}
                        <span className='text-pink-600 dark:text-pink-500'>{"}"}</span>
                      </code>
                    </pre>
                  </div>
                )
              },
              {
                name: "2025.jpg",
                content: (
                  <div className='relative h-full min-h-[260px] w-full select-none overflow-hidden bg-slate-100 dark:bg-slate-950/60'>
                    <Image
                      alt='2025 Logo'
                      className='object-cover'
                      fill
                      sizes='(min-width: 1024px) 42vw, 100vw'
                      src='/images/wd_logo.jpg'
                    />
                  </div>
                )
              }
            ]}
          />

          <div className='relative flex flex-col justify-center bg-slate-50/50 p-8 backdrop-blur-md md:p-12 lg:col-span-7 dark:bg-slate-900/20'>
            <div className='absolute top-3 right-4 select-none font-mono text-[9px] text-slate-500'>
              Frame: Info_Panel [W: 768px, H: 450px]
            </div>

            <div className='mb-6 flex shrink-0 items-center gap-3'>
              <div className='rounded-xl border border-orange-500/20 bg-orange-500/10 p-2'>
                <Laptop className='h-6 w-6 text-orange-500' />
              </div>
              <h3 className='bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text font-black text-2xl text-transparent uppercase tracking-tight dark:from-orange-400 dark:to-amber-300'>
                {t("purpose")}
              </h3>
            </div>
            <p className='mb-8 border-orange-500/50 border-l-2 pl-4 font-medium text-base text-slate-700 leading-relaxed dark:text-slate-300'>
              {t("purposeDesc")}
            </p>
            <div className='mt-2 flex flex-wrap gap-3'>
              <span className='rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 font-mono font-semibold text-orange-400 text-xs'>
                #ui_ux
              </span>
              <span className='rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 font-mono font-semibold text-blue-400 text-xs'>
                #frontend
              </span>
              <span className='rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono font-semibold text-emerald-400 text-xs'>
                #collaboration
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
