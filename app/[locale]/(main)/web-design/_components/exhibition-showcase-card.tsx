"use client";

import { Code2, ExternalLink, Eye, Github, Layers, Quote, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { localizedText, type WebDesignExhibitionItem } from "@/types/webdesign";
import { WD_CARD, WD_CARD_HOVER, WindowDots } from "./wd-primitives";

export const FALLBACK_THUMBNAIL = "/images/wd_logo.jpg";
const PROTOCOL_RE = /^https?:\/\//;
const TRAILING_SLASH_RE = /\/$/;

export function formatExhibitionHost(url: string, fallback: string): string {
  const cleaned = url.replace(PROTOCOL_RE, "").replace(TRAILING_SLASH_RE, "");
  return cleaned || fallback;
}

export function ExhibitionShowcaseCard({
  team,
  featured = false,
  onSelect
}: {
  team: WebDesignExhibitionItem;
  featured?: boolean;
  onSelect?: (team: WebDesignExhibitionItem) => void;
}) {
  const t = useTranslations("webdesign");
  const locale = useLocale();
  const title = localizedText(locale, team.projectName);
  const description = localizedText(locale, team.description);
  const testimonial = localizedText(locale, team.testimonial);
  const host = formatExhibitionHost(team.live, team.teamName);

  return (
    <article
      className={cn(
        WD_CARD,
        WD_CARD_HOVER,
        "group relative flex h-full flex-col overflow-hidden bg-card/65 backdrop-blur-sm",
        featured && "lg:grid lg:grid-cols-12 lg:items-stretch"
      )}
    >
      <ExhibitionCardPreview
        featured={featured}
        host={host}
        onSelect={onSelect}
        team={team}
        title={title}
        viewDemoLabel={t("viewDemo")}
        viewDetailsLabel={t("viewDetails")}
      />

      <div className={cn("flex flex-1 flex-col gap-3.5 p-5 sm:p-6", featured && "lg:col-span-5 lg:justify-between")}>
        <div className='space-y-2.5'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div className='inline-flex items-center gap-1.5 rounded-md border border-orange-500/25 bg-orange-500/10 px-2.5 py-0.5 font-bold font-mono text-orange-400 text-xs'>
              <Users className='h-3.5 w-3.5' />
              <span>{team.teamName}</span>
            </div>
            <span className='font-mono text-[11px] text-muted-foreground'>{t("yearLabel", { year: team.year })}</span>
          </div>

          <h3
            className={cn(
              "font-extrabold text-foreground leading-snug tracking-tight transition-colors group-hover:text-orange-400",
              featured ? "text-xl sm:text-2xl" : "line-clamp-2 text-lg"
            )}
          >
            {onSelect ? (
              <button className='text-left' onClick={() => onSelect(team)} type='button'>
                {title}
              </button>
            ) : (
              title
            )}
          </h3>

          {description && (
            <p
              className={cn(
                "text-muted-foreground text-sm leading-relaxed",
                featured ? "line-clamp-4" : "line-clamp-2"
              )}
            >
              {description}
            </p>
          )}

          {testimonial && (
            <blockquote className='relative rounded-xl border border-orange-500/20 bg-orange-500/[0.04] p-3 text-muted-foreground text-xs italic leading-relaxed'>
              <Quote className='mb-1 h-3.5 w-3.5 text-orange-400/80' />
              <p className={cn(featured ? "line-clamp-3" : "line-clamp-2")}>{testimonial}</p>
            </blockquote>
          )}

          {team.teamMembers.length > 0 && (
            <div className='flex flex-wrap items-center gap-1.5 pt-0.5 text-muted-foreground text-xs'>
              <span className='font-mono text-[11px] text-muted-foreground/80'>{t("membersLabel")}:</span>
              <span className='line-clamp-1 font-medium text-foreground/85'>{team.teamMembers.join(", ")}</span>
            </div>
          )}
        </div>

        <ExhibitionCardFooter
          featured={featured}
          onSelect={onSelect}
          team={team}
          viewDemoLabel={t("viewDemo")}
          viewDetailsLabel={t("viewDetails")}
          viewSourceLabel={t("viewSource")}
        />
      </div>
    </article>
  );
}

function ExhibitionCardPreview({
  team,
  title,
  host,
  featured,
  onSelect,
  viewDemoLabel,
  viewDetailsLabel
}: {
  team: WebDesignExhibitionItem;
  title: string;
  host: string;
  featured: boolean;
  onSelect?: (team: WebDesignExhibitionItem) => void;
  viewDemoLabel: string;
  viewDetailsLabel: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col border-border/60 border-b bg-black/20 dark:border-white/10",
        featured && "lg:col-span-7 lg:border-r lg:border-b-0"
      )}
    >
      <BrowserChromeBar host={host} liveUrl={team.live} year={team.year} />

      <div className={cn("relative aspect-16/10 w-full flex-1 overflow-hidden bg-muted", featured && "lg:min-h-72")}>
        <Image
          alt={title}
          className='object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105'
          fill
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (!target.src.includes(FALLBACK_THUMBNAIL)) {
              target.src = FALLBACK_THUMBNAIL;
            }
          }}
          sizes={
            featured ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          }
          src={team.thumbnail || FALLBACK_THUMBNAIL}
        />

        <div className='pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90' />

        {team.subjects && (
          <div className='absolute bottom-3 left-3 z-10 max-w-[75%]'>
            <span className='inline-flex items-center gap-1.5 truncate rounded-full border border-white/15 bg-black/65 px-3 py-1 font-mono text-[11px] text-amber-300 backdrop-blur-md'>
              <Sparkles className='h-3 w-3 shrink-0 text-orange-400' />
              <span className='truncate'>{team.subjects}</span>
            </span>
          </div>
        )}

        <div className='absolute inset-0 z-10 flex items-center justify-center gap-2.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
          {team.live && (
            <a
              className='inline-flex items-center gap-1.5 rounded-xl bg-[#ff5e00] px-4 py-2 font-bold text-white text-xs shadow-lg transition-transform hover:scale-105 hover:bg-[#ff7a2e]'
              href={team.live}
              rel='noopener noreferrer'
              target='_blank'
            >
              {viewDemoLabel}
            </a>
          )}
          {onSelect && (
            <button
              className='inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-black/75 px-3.5 py-2 font-semibold text-white text-xs backdrop-blur-md transition-transform hover:scale-105 hover:border-orange-400/60'
              onClick={() => onSelect(team)}
              type='button'
            >
              <Eye className='h-3.5 w-3.5 text-orange-400' />
              {viewDetailsLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ExhibitionCardFooter({
  team,
  featured,
  onSelect,
  viewDemoLabel,
  viewSourceLabel,
  viewDetailsLabel
}: {
  team: WebDesignExhibitionItem;
  featured: boolean;
  onSelect?: (team: WebDesignExhibitionItem) => void;
  viewDemoLabel: string;
  viewSourceLabel: string;
  viewDetailsLabel: string;
}) {
  const maxTech = featured ? 6 : 4;
  return (
    <div className='mt-auto space-y-3.5 pt-2'>
      {team.techStack.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {team.techStack.slice(0, maxTech).map((tech) => (
            <span
              className='rounded-md border border-border/70 bg-muted/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground dark:border-white/10 dark:bg-white/[0.04]'
              key={tech}
            >
              {tech}
            </span>
          ))}
          {team.techStack.length > maxTech && (
            <span className='rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground'>
              +{team.techStack.length - maxTech}
            </span>
          )}
        </div>
      )}

      <div className='flex items-center justify-between gap-2 border-border/50 border-t pt-3 dark:border-white/8'>
        <div className='flex items-center gap-3'>
          {team.live && (
            <a
              className='inline-flex items-center gap-1.5 font-bold text-orange-400 text-xs transition-colors hover:text-orange-300'
              href={team.live}
              rel='noopener noreferrer'
              target='_blank'
            >
              <ExternalLink className='h-3.5 w-3.5' />
              {viewDemoLabel}
            </a>
          )}
          {team.github && (
            <a
              className='inline-flex items-center gap-1.5 font-semibold text-muted-foreground text-xs transition-colors hover:text-foreground'
              href={team.github}
              rel='noopener noreferrer'
              target='_blank'
            >
              <Github className='h-3.5 w-3.5' />
              {viewSourceLabel}
            </a>
          )}
        </div>

        {onSelect && (
          <button
            className='inline-flex items-center gap-1 rounded-lg border border-border/70 bg-foreground/[0.03] px-2.5 py-1 font-mono font-semibold text-[11px] text-muted-foreground transition-colors hover:border-orange-500/40 hover:text-foreground dark:border-white/10'
            onClick={() => onSelect(team)}
            type='button'
          >
            {viewDetailsLabel} →
          </button>
        )}
      </div>
    </div>
  );
}

function BrowserChromeBar({ host, liveUrl, year }: { host: string; liveUrl: string; year: number }) {
  return (
    <div className='flex items-center gap-2.5 border-border/50 border-b bg-muted/60 px-3.5 py-2 dark:border-white/8 dark:bg-[#0d121f]/90'>
      <WindowDots />
      <div className='flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-border/60 bg-background/70 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground dark:border-white/8 dark:bg-black/40'>
        <span className='text-emerald-400'>https://</span>
        {liveUrl ? (
          <a className='truncate hover:text-orange-400' href={liveUrl} rel='noopener noreferrer' target='_blank'>
            {host}
          </a>
        ) : (
          <span className='truncate'>{host}</span>
        )}
      </div>
      <span className='shrink-0 rounded-md bg-orange-500/15 px-2 py-0.5 font-bold font-mono text-[10px] text-orange-400'>
        {year}
      </span>
    </div>
  );
}

export function ExhibitionDetailModal({
  team,
  onClose
}: {
  team: WebDesignExhibitionItem | null;
  onClose: () => void;
}) {
  const t = useTranslations("webdesign");
  const locale = useLocale();

  if (!team) {
    return null;
  }

  const title = localizedText(locale, team.projectName);
  const description = localizedText(locale, team.description);
  const testimonial = localizedText(locale, team.testimonial);
  const host = formatExhibitionHost(team.live, team.teamName);

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={!!team}>
      <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto border-border/70 bg-background/95 p-0 backdrop-blur-xl sm:rounded-2xl dark:border-white/15'>
        <div className='overflow-hidden border-border/60 border-b dark:border-white/10'>
          <BrowserChromeBar host={host} liveUrl={team.live} year={team.year} />
          <div className='relative aspect-16/9 w-full bg-muted'>
            <Image
              alt={title}
              className='object-cover object-top'
              fill
              sizes='(min-width: 768px) 768px, 100vw'
              src={team.thumbnail || FALLBACK_THUMBNAIL}
            />
          </div>
        </div>

        <div className='space-y-5 p-6'>
          <DialogHeader className='space-y-2 text-left'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 font-bold font-mono text-orange-400 text-xs'>
                <Users className='h-3.5 w-3.5' />
                {team.teamName}
              </span>
              <span className='rounded-full border border-border bg-muted/50 px-3 py-1 font-mono text-muted-foreground text-xs'>
                {t("yearLabel", { year: team.year })}
              </span>
              {team.subjects && (
                <span className='rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 font-mono text-amber-400 text-xs'>
                  {team.subjects}
                </span>
              )}
            </div>
            <DialogTitle className='font-black text-2xl leading-tight sm:text-3xl'>{title}</DialogTitle>
            {description && (
              <DialogDescription className='pt-1 text-base text-foreground/85 leading-relaxed'>
                {description}
              </DialogDescription>
            )}
          </DialogHeader>

          {testimonial && (
            <div className='rounded-2xl border border-orange-500/25 bg-orange-500/[0.06] p-4 sm:p-5'>
              <div className='mb-2 flex items-center gap-2 font-bold font-mono text-orange-400 text-xs uppercase tracking-wider'>
                <Quote className='h-4 w-4' />
                {t("testimonialLabel")}
              </div>
              <p className='text-foreground/90 text-sm italic leading-relaxed sm:text-base'>“{testimonial}”</p>
            </div>
          )}

          <div className='grid gap-4 sm:grid-cols-2'>
            {team.teamMembers.length > 0 && (
              <div className='rounded-xl border border-border/60 bg-muted/25 p-4 dark:border-white/10'>
                <div className='mb-2 flex items-center gap-1.5 font-mono font-semibold text-muted-foreground text-xs uppercase'>
                  <Users className='h-3.5 w-3.5 text-orange-400' />
                  {t("membersLabel")}
                </div>
                <div className='flex flex-wrap gap-1.5'>
                  {team.teamMembers.map((member) => (
                    <span
                      className='rounded-md border border-border bg-background px-2.5 py-1 font-medium text-xs'
                      key={member}
                    >
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {team.techStack.length > 0 && (
              <div className='rounded-xl border border-border/60 bg-muted/25 p-4 dark:border-white/10'>
                <div className='mb-2 flex items-center gap-1.5 font-mono font-semibold text-muted-foreground text-xs uppercase'>
                  <Layers className='h-3.5 w-3.5 text-orange-400' />
                  {t("techStackLabel")}
                </div>
                <div className='flex flex-wrap gap-1.5'>
                  {team.techStack.map((tech) => (
                    <span
                      className='inline-flex items-center gap-1 rounded-md border border-orange-500/25 bg-orange-500/10 px-2.5 py-1 font-mono text-orange-300 text-xs'
                      key={tech}
                    >
                      <Code2 className='h-3 w-3' />
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className='flex flex-wrap items-center justify-end gap-3 border-border/60 border-t pt-4 dark:border-white/10'>
            {team.github && (
              <a
                className='inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-foreground/[0.03] px-5 font-bold text-foreground text-sm transition-colors hover:border-orange-500/50 dark:border-white/15'
                href={team.github}
                rel='noopener noreferrer'
                target='_blank'
              >
                <Github className='h-4 w-4' />
                {t("openSourceCode")}
              </a>
            )}
            {team.live && (
              <a
                className='inline-flex h-11 items-center gap-2 rounded-xl bg-[#ff5e00] px-5 font-extrabold text-sm text-white shadow-[0_10px_24px_-8px_rgba(255,94,0,0.6)] transition-colors hover:bg-[#ff7a2e]'
                href={team.live}
                rel='noopener noreferrer'
                target='_blank'
              >
                <ExternalLink className='h-4 w-4' />
                {t("openLiveSite")}
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
