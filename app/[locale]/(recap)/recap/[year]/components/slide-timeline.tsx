"use client";

import { Calendar, ExternalLink, FolderGit2, MapPin, Trophy, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { MarkdownContent } from "@/components/markdown-content";
import { useMediumZoom } from "@/hooks/use-medium-zoom";
import type { RecapTimelineItem } from "@/lib/recap-data";
import { resolveTimelineDescription, resolveTimelineLocation, resolveTimelineTitle } from "@/lib/recap-data";
import { getFullName } from "@/lib/utils";
import { colorFromString, dimColorFromString } from "@/utils/color";
import { formatLocalDate } from "@/utils/handle-datetime";
import { FloatingShapes, GlowingOrbs, GridBackground } from "./animations";

// ── Sub-components ──

function MemberChip({
  name,
  avatar,
  role,
  prize
}: {
  name: string;
  avatar: string | null;
  role?: string | null;
  prize?: string | null;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const borderColor = colorFromString(name);
  const bgColor = dimColorFromString(name);

  return (
    <div
      className='group/chip flex cursor-pointer items-center gap-2 rounded-full border border-white/[0.06] bg-[#13131f] py-1 pr-3 pl-1 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-500/30 hover:bg-white/[0.06] hover:shadow-[0_4px_12px_rgba(249,115,22,0.1)]'
      title={role ?? undefined}
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={name}
          className='h-6 w-6 rounded-full object-cover ring-1 ring-white/10 transition-all group-hover/chip:ring-orange-400/60'
          src={avatar}
          style={{ borderColor }}
        />
      ) : (
        <div
          className='flex h-6 w-6 items-center justify-center rounded-full font-bold text-[10px] transition-all group-hover/chip:ring-2 group-hover/chip:ring-orange-400/40'
          style={{
            backgroundColor: bgColor,
            color: borderColor,
            border: `1.5px solid ${borderColor}`
          }}
        >
          {initials}
        </div>
      )}
      <span className='font-medium text-[12px] text-white/80 transition-colors group-hover/chip:text-white'>
        {name}
      </span>
      {prize && (
        <span className='mr-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 font-bold font-mono text-[10px] text-amber-400/90'>
          {prize}
        </span>
      )}
    </div>
  );
}

function ImageLightbox({ images, index, onClose }: { images: string[]; index: number; onClose: () => void }) {
  const [current, setCurrent] = useState(index);

  const goNext = useCallback(() => setCurrent((p) => (p + 1) % images.length), [images.length]);
  const goPrev = useCallback(() => setCurrent((p) => (p - 1 + images.length) % images.length), [images.length]);

  return (
    <div
      className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm'
      onClick={onClose}
    >
      <button
        className='absolute top-6 right-6 z-10 rounded-full bg-white/10 p-2 text-white/70 transition-colors hover:bg-white/20 hover:text-white'
        onClick={onClose}
      >
        <X className='h-5 w-5' />
      </button>

      {images.length > 1 && (
        <>
          <button
            className='absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white/70 transition-colors hover:bg-white/20 hover:text-white'
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
          >
            <ExternalLink className='h-5 w-5 rotate-180' />
          </button>
          <button
            className='absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white/70 transition-colors hover:bg-white/20 hover:text-white'
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
          >
            <ExternalLink className='h-5 w-5' />
          </button>
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=''
        className='max-h-[90vh] max-w-[90vw] rounded-xl object-contain'
        onClick={(e) => e.stopPropagation()}
        src={images[current]}
      />

      {images.length > 1 && (
        <div className='absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 font-mono text-sm text-white/60 backdrop-blur-md'>
          {current + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

// ── Main component ──

export function SlideTimeline({ item }: { item: RecapTimelineItem }) {
  const t = useTranslations("events");
  const locale = useLocale() as "vi" | "en";
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const title = resolveTimelineTitle(item, locale);
  const description = resolveTimelineDescription(item, locale);
  const location = resolveTimelineLocation(item, locale);

  const typeColor = {
    event: "text-orange-400 border-orange-400/25 bg-orange-500/[0.08]",
    achievement: "text-amber-400 border-amber-400/25 bg-amber-500/[0.08]",
    project: "text-emerald-400 border-emerald-400/25 bg-emerald-500/[0.08]"
  };
  const typeGlow = {
    event: "shadow-[0_0_20px_rgba(249,115,22,0.1)]",
    achievement: "shadow-[0_0_20px_rgba(234,179,8,0.1)]",
    project: "shadow-[0_0_20px_rgba(34,197,94,0.1)]"
  };
  const typeLabel = {
    event: t("recap.timeline.event"),
    achievement: t("recap.timeline.achievement"),
    project: t("recap.timeline.project")
  };
  const typeIcon = {
    event: <Calendar className='h-3.5 w-3.5' />,
    achievement: <Trophy className='h-3.5 w-3.5' />,
    project: <FolderGit2 className='h-3.5 w-3.5' />
  };

  const date = formatLocalDate(item.date, locale, "d MMMM, yyyy");

  const images = item.images?.filter(Boolean) ?? [];
  const members = item.members ?? item.projectMembers ?? [];
  const displayMembers = members.slice(0, 6);
  const extraCount = members.length - displayMembers.length;

  const containerRef = useMediumZoom<HTMLDivElement>();

  return (
    <div className='relative flex h-full w-full overflow-hidden bg-[#0a0a0f] pt-16' ref={containerRef}>
      <GridBackground />
      <GlowingOrbs />
      <FloatingShapes />
      {item.thumbnail && (
        <div className='absolute inset-0'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt='' className='h-full w-full scale-105 object-cover opacity-12' src={item.thumbnail} />
          <div className='absolute inset-0 bg-orange-600/3 mix-blend-overlay' />
        </div>
      )}
      <div className='absolute inset-0 bg-black/40' />
      <div className='absolute inset-0 bg-linear-to-br from-transparent via-transparent to-black/70' />

      {/* Main card layout — full width */}
      <div className='relative z-10 mx-auto flex h-full w-full flex-col justify-center gap-8 px-10 pb-10 lg:flex-row'>
        {/* ── LEFT COLUMN: Content Card ── */}
        <div className='flex w-full flex-col lg:w-[55%]'>
          <div
            className={`flex flex-1 flex-col rounded-2xl border border-white/6 bg-[#13131f]/80 p-8 backdrop-blur-md transition-all duration-300 hover:border-white/10 ${typeGlow[item.type]}`}
          >
            {/* Header: type badge + date */}
            <div className='mb-5 flex flex-wrap items-center gap-3'>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 font-bold text-xs uppercase tracking-[0.08em] transition-all duration-300 hover:scale-105 ${typeColor[item.type]}`}
              >
                {typeIcon[item.type]}
                {typeLabel[item.type]}
              </span>
              <span className='font-mono text-[#94a3b8] text-sm'>{date}</span>
            </div>

            {/* Title */}
            <h2 className='mb-5 font-black text-[clamp(28px,4vw,44px)] text-white leading-[1.1] tracking-tight'>
              {title}
            </h2>

            {/* Location */}
            {location && (
              <div className='mb-5 flex items-center gap-1.5'>
                <MapPin className='h-4 w-4 shrink-0 text-orange-400/60' />
                <span className='font-mono text-[#94a3b8] text-sm'>{location}</span>
              </div>
            )}

            {/* Description */}
            {description && (
              <div className='custom-scrollbar mb-5 max-h-[36vh] overflow-y-auto rounded-r-lg border-orange-500/20 border-l-2 bg-black/20 py-2 pr-4 pl-5'>
                <MarkdownContent
                  className='prose-invert! prose-sm max-w-none! prose-a:text-orange-400 prose-headings:text-white prose-p:text-[#94a3b8] prose-strong:text-orange-300 text-base leading-relaxed [&_img]:max-w-full [&_img]:rounded-xl'
                  content={description}
                />
              </div>
            )}

            {/* Members */}
            {members.length > 0 && (
              <div className='mt-auto border-white/6 border-t pt-4'>
                <p className='mb-3 font-bold text-[#475569] text-xs uppercase tracking-[0.12em]'>
                  {item.type === "achievement"
                    ? t("recap.timeline.achievementMembers")
                    : t("recap.timeline.projectMembers")}
                  <span className='ml-2 text-white/30'>{members.length}</span>
                </p>
                <div className='flex flex-wrap gap-2'>
                  {displayMembers.map((m, i) => (
                    <MemberChip
                      avatar={m.avatar}
                      key={i}
                      name={getFullName(m.firstName, m.middleName, m.lastName, "vi")}
                      prize={m.prize ?? undefined}
                      role={m.role ?? undefined}
                    />
                  ))}
                  {extraCount > 0 && (
                    <span className='flex cursor-pointer items-center rounded-full border border-white/8 border-dashed bg-transparent px-3 py-1 text-white/30 text-xs transition-colors hover:border-orange-500/30 hover:text-orange-400/60'>
                      +{extraCount}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Technologies */}
            {item.technologies && item.technologies.length > 0 && (
              <div className='mt-4 flex flex-wrap gap-2'>
                {item.technologies.map((tech) => (
                  <span
                    className='cursor-default rounded-md border border-cyan-500/12 bg-cyan-500/6 px-3 py-1 font-mono font-semibold text-cyan-400/90 text-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:shadow-[0_4px_12px_rgba(6,182,212,0.1)]'
                    key={tech}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Image + Gallery Cards ── */}
        <div className='flex w-full flex-col justify-center gap-4 lg:w-[45%]'>
          {/* Main thumbnail */}
          <div className='group relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl border border-white/6 bg-[#13131f] shadow-2xl transition-all duration-300 hover:border-orange-500/20 hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)]'>
            {item.thumbnail ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={item.title}
                  className='absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]'
                  src={item.thumbnail}
                />
                <div className='absolute inset-0 bg-linear-to-t from-[#0a0a0f]/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />
                <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                  <div className='rounded-full bg-black/60 p-3 backdrop-blur-sm'>
                    <ExternalLink className='h-5 w-5 text-white/80' />
                  </div>
                </div>
              </>
            ) : (
              <div className='flex h-full flex-col items-center justify-center gap-3'>
                <FolderGit2 className='h-12 w-12 text-white/6' />
                <span className='font-mono text-white/20 text-xs'>No image</span>
              </div>
            )}
          </div>

          {/* Gallery grid */}
          {images.length > 0 && (
            <div className='grid grid-cols-3 gap-2'>
              {images.slice(0, 6).map((img, i) => (
                <button
                  className='group/img relative aspect-4/3 w-full cursor-pointer overflow-hidden rounded-xl border border-white/6 bg-[#13131f] transition-all duration-200 hover:z-10 hover:scale-104 hover:border-orange-500/40 hover:shadow-[0_8px_20px_rgba(249,115,22,0.2)]'
                  key={i}
                  onClick={() => setLightboxIdx(i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`${item.title} ${i + 1}`}
                    className='h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-110'
                    src={img}
                  />
                  <div className='absolute inset-0 bg-black/0 transition-colors duration-200 group-hover/img:bg-black/20' />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <ImageLightbox images={images} index={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </div>
  );
}
