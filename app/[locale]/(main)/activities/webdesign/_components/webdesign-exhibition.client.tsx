"use client";

import { ChevronLeft, ChevronRight, Github, Globe } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import wdData from "@/configs/data/wd.json";

const ITEMS_PER_PAGE = 6;

export function WebDesignExhibitionClient() {
  const t = useTranslations("webdesign");
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = wdData.teams.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTeams = wdData.teams.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <section className='relative z-10 mb-28'>
      <ScrollReveal className='mb-16 text-center'>
        <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm uppercase'>
          &gt; exhibition
        </span>
        <h2 className='mt-4 font-black text-3xl text-white uppercase tracking-tight sm:text-4xl'>
          {t("exhibitionTitle", { fallback: "Các dự án tiêu biểu" })}
        </h2>
      </ScrollReveal>

      <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {currentTeams.map((team, idx) => (
          <ScrollReveal delay={idx * 150} key={`${team.teamName}-${idx}`} variant='fade-up'>
            <div className='group flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 transition-all duration-300 hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/5'>
              {/* Browser Window Header Mockup */}
              <div className='flex shrink-0 select-none items-center justify-between border-white/5 border-b bg-slate-950 px-4 py-2.5 font-mono text-[10px]'>
                <div className='flex items-center gap-1.5'>
                  <div className='h-2.5 w-2.5 rounded-full bg-[#ff5f56]' />
                  <div className='h-2.5 w-2.5 rounded-full bg-[#ffbd2e]' />
                  <div className='h-2.5 w-2.5 rounded-full bg-[#27c93f]' />
                </div>
                {/* URL bar */}
                <div className='mx-4 max-w-[180px] grow truncate rounded border border-white/5 bg-slate-900 px-3 py-0.5 text-center text-slate-500'>
                  https://{team.teamName.toLowerCase().replace(/\s+/g, "")}.mpc.edu
                </div>
                <div className='w-8' />
              </div>

              {/* Browser Viewport Area (Image + Controls hover) */}
              <div className='relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-950'>
                <Image
                  alt={team.projectName}
                  className='object-cover transition-transform duration-700 group-hover:scale-105'
                  fill
                  sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                  src={team.thumbnail}
                />

                {/* Action overlays visible on hover */}
                <div className='absolute inset-0 flex items-center justify-center gap-4 bg-slate-950/80 opacity-0 backdrop-blur-xs transition-opacity duration-300 group-hover:opacity-100'>
                  <Button
                    asChild
                    className='h-10 w-10 rounded-xl bg-orange-500 p-0 font-bold text-white shadow-xl transition-transform hover:scale-110 hover:bg-orange-600'
                    size='icon'
                  >
                    <a href={team.live} rel='noopener noreferrer' target='_blank'>
                      <Globe className='h-5 w-5' />
                      <span className='sr-only'>Live Demo</span>
                    </a>
                  </Button>
                  <Button
                    asChild
                    className='h-10 w-10 rounded-xl border border-white/10 bg-slate-800 p-0 font-bold text-white shadow-xl transition-transform hover:scale-110 hover:bg-slate-700'
                    size='icon'
                  >
                    <a href={team.github} rel='noopener noreferrer' target='_blank'>
                      <Github className='h-5 w-5' />
                      <span className='sr-only'>GitHub</span>
                    </a>
                  </Button>
                </div>
              </div>

              {/* Card Content Footer */}
              <div className='flex flex-1 flex-col justify-between bg-slate-950/30 p-6'>
                <div className='flex flex-1 flex-col bg-transparent'>
                  <div className='mb-2 flex shrink-0 items-center justify-between'>
                    <span className='rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-0.5 font-bold font-mono text-[10px] text-orange-400 uppercase tracking-wider'>
                      {team.teamName}
                    </span>
                    <span className='ml-2 truncate font-mono text-[10px] text-slate-500'>{team.subjects}</span>
                  </div>

                  <h3 className='mt-2 line-clamp-2 font-black text-base text-white uppercase tracking-tight transition-colors group-hover:text-orange-400'>
                    {team.projectName}
                  </h3>

                  <p className='mt-3 line-clamp-3 flex-1 bg-transparent text-slate-400 text-xs leading-relaxed'>
                    {team.description}
                  </p>
                </div>

                {/* Tech Tags */}
                <div className='mt-6 flex shrink-0 flex-wrap gap-1.5 border-white/5 border-t pt-4'>
                  {team.techStack.map((tech) => (
                    <span
                      className='rounded border border-white/5 bg-slate-900 px-2 py-0.5 font-mono font-semibold text-[9px] text-slate-400'
                      key={tech}
                    >
                      .{tech.toLowerCase().replace(/\s+/g, "-")}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {totalPages > 1 && (
        <div className='mt-12 flex items-center justify-center gap-2'>
          <Button
            className='border-white/10 text-slate-300 hover:bg-slate-900 hover:text-white'
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            size='icon'
            variant='outline'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>

          <div className='flex gap-2 font-mono'>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <Button
                className='h-10 w-10 border-white/10 font-bold'
                key={`page-${idx + 1}`}
                onClick={() => setCurrentPage(idx + 1)}
                variant={currentPage === idx + 1 ? "default" : "outline"}
              >
                {idx + 1}
              </Button>
            ))}
          </div>

          <Button
            className='border-white/10 text-slate-300 hover:bg-slate-900 hover:text-white'
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            size='icon'
            variant='outline'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </section>
  );
}
