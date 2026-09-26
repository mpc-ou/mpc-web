"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { SectionHeading } from "@/components/custom/section-heading";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { cn } from "@/lib/utils";
import { localizedText, type WebDesignExhibitionItem } from "@/types/webdesign";
import { WD_CARD, WD_CARD_HOVER, WD_SECTION_IDS, WdSection } from "./wd-primitives";

const ITEMS_PER_PAGE = 6;
const FALLBACK_THUMBNAIL = "/images/wd_logo.jpg";
const PROTOCOL_RE = /^https?:\/\//;
const TRAILING_SLASH_RE = /\/$/;

export function WebDesignExhibitionClient({ teams }: { teams: WebDesignExhibitionItem[] }) {
  const t = useTranslations("webdesign");
  const [currentPage, setCurrentPage] = useState(1);

  if (teams.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(teams.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTeams = teams.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <WdSection id={WD_SECTION_IDS.projects}>
      <ScrollReveal>
        <SectionHeading
          description={t("exhibitionSubtitle")}
          index='07'
          tag='exhibition'
          title={t("exhibitionTitle")}
        />
      </ScrollReveal>

      <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {currentTeams.map((team, idx) => (
          <ScrollReveal className='h-full' delay={idx * 110} key={`${team.teamName}-${team.live}`}>
            <ProjectCard team={team} />
          </ScrollReveal>
        ))}
      </div>

      {totalPages > 1 && (
        <div className='mt-10 flex items-center justify-center gap-2'>
          <Button
            aria-label='Previous page'
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            size='icon'
            variant='outline'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              className='h-10 w-10 font-bold font-mono'
              key={page}
              onClick={() => setCurrentPage(page)}
              variant={currentPage === page ? "default" : "outline"}
            >
              {page}
            </Button>
          ))}
          <Button
            aria-label='Next page'
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            size='icon'
            variant='outline'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </WdSection>
  );
}

function ProjectCard({ team }: { team: WebDesignExhibitionItem }) {
  const t = useTranslations("webdesign");
  const locale = useLocale();
  const title = localizedText(locale, team.projectName);
  const host = team.live.replace(PROTOCOL_RE, "").replace(TRAILING_SLASH_RE, "");

  return (
    <article className={cn(WD_CARD, WD_CARD_HOVER, "group flex h-full flex-col overflow-hidden")}>
      <div className='relative aspect-16/10 overflow-hidden border-border/60 border-b bg-muted dark:border-white/6'>
        <Image
          alt={title}
          className='object-cover transition-transform duration-700 group-hover:scale-105'
          fill
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (!target.src.includes(FALLBACK_THUMBNAIL)) {
              target.src = FALLBACK_THUMBNAIL;
            }
          }}
          sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
          src={team.thumbnail || FALLBACK_THUMBNAIL}
        />
      </div>
      <div className='flex flex-1 flex-col gap-2.5 p-5.5 pb-6'>
        <div className='flex items-center justify-between gap-3 font-mono text-[11px] text-muted-foreground'>
          <span className='truncate'>{host || team.teamName}</span>
          <span className='shrink-0 text-orange-400'>{team.teamName}</span>
        </div>
        <h3 className='font-extrabold text-lg leading-snug'>{title}</h3>
        <p className='line-clamp-3 text-muted-foreground text-sm leading-relaxed'>
          {localizedText(locale, team.description)}
        </p>
        <div className='mt-auto flex gap-4 pt-3.5 font-bold text-sm'>
          {team.live && (
            <a
              className='text-orange-400 hover:text-orange-300'
              href={team.live}
              rel='noopener noreferrer'
              target='_blank'
            >
              {t("viewDemo")}
            </a>
          )}
          {team.github && (
            <a
              className='text-muted-foreground hover:text-foreground'
              href={team.github}
              rel='noopener noreferrer'
              target='_blank'
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
