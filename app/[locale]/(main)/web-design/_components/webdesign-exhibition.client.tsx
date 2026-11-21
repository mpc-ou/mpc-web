"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/custom/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Link } from "@/configs/i18n/routing";
import type { WebDesignExhibitionItem } from "@/types/webdesign";
import { ExhibitionDetailModal, ExhibitionShowcaseCard } from "./exhibition-showcase-card";
import { WD_SECTION_IDS, WdSection } from "./wd-primitives";

const MAX_FEATURED_ITEMS = 4;

export function WebDesignExhibitionClient({ teams }: { teams: WebDesignExhibitionItem[] }) {
  const t = useTranslations("webdesign");
  const [selectedTeam, setSelectedTeam] = useState<WebDesignExhibitionItem | null>(null);

  const sortedTeams = useMemo(() => [...teams].sort((a, b) => b.year - a.year), [teams]);

  if (sortedTeams.length === 0) {
    return null;
  }

  const featuredTeams = sortedTeams.slice(0, MAX_FEATURED_ITEMS);
  const spotlightTeam = featuredTeams[0];
  const restTeams = featuredTeams.slice(1);

  return (
    <WdSection id={WD_SECTION_IDS.projects}>
      <ScrollReveal>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <SectionHeading
            description={t("exhibitionSubtitle")}
            index='07'
            tag='exhibition'
            title={t("exhibitionTitle")}
          />
          <Link
            className='mb-10 inline-flex items-center gap-2 rounded-xl border border-orange-500/35 bg-orange-500/10 px-4 py-2.5 font-bold font-mono text-orange-400 text-xs transition-all hover:-translate-y-0.5 hover:border-orange-500/60 hover:bg-orange-500/15'
            href='/web-design/exhibitions'
          >
            <Sparkles className='h-3.5 w-3.5' />
            {t("viewAllExhibitions")} ({sortedTeams.length})
            <ArrowRight className='h-3.5 w-3.5' />
          </Link>
        </div>
      </ScrollReveal>

      {/* Spotlight Hero Project Card */}
      {spotlightTeam && (
        <ScrollReveal className='mb-6'>
          <ExhibitionShowcaseCard featured onSelect={setSelectedTeam} team={spotlightTeam} />
        </ScrollReveal>
      )}

      {/* Remaining up to 5 cards in a responsive 2/3-col grid */}
      {restTeams.length > 0 && (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {restTeams.map((team, idx) => (
            <ScrollReveal className='h-full' delay={idx * 90} key={`${team.teamName}-${team.live}-${team.year}`}>
              <ExhibitionShowcaseCard onSelect={setSelectedTeam} team={team} />
            </ScrollReveal>
          ))}
        </div>
      )}

      {/* Prominent Archive CTA Banner */}
      <ScrollReveal className='mt-10' delay={200}>
        <div className='relative flex flex-col items-start justify-between gap-5 overflow-hidden rounded-2xl border border-orange-500/30 bg-[linear-gradient(115deg,rgba(255,94,0,0.14),transparent_65%)] bg-card/50 p-6 sm:flex-row sm:items-center sm:p-7'>
          <div className='pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl' />
          <div className='space-y-1'>
            <p className='font-bold font-mono text-orange-400 text-xs uppercase tracking-wider'>
              {"// WEB DESIGN EXHIBITION ARCHIVE"}
            </p>
            <p className='font-bold text-base text-foreground sm:text-lg'>
              {t("viewAllExhibitionsDesc", { count: sortedTeams.length })}
            </p>
          </div>
          <Link
            className='inline-flex h-12 shrink-0 items-center gap-2.5 rounded-xl bg-[#ff5e00] px-6 font-extrabold text-sm text-white shadow-[0_12px_28px_-10px_rgba(255,94,0,0.65)] transition-colors hover:bg-[#ff7a2e]'
            href='/web-design/exhibitions'
          >
            {t("viewAllExhibitions")}
            <ArrowRight className='h-4 w-4' />
          </Link>
        </div>
      </ScrollReveal>

      <ExhibitionDetailModal onClose={() => setSelectedTeam(null)} team={selectedTeam} />
    </WdSection>
  );
}
