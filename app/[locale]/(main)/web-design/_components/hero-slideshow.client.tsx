"use client";

import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Lock, Pause, Play, RotateCw, Users } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { WindowDots } from "./wd-primitives";

type Slide = { src: string; year: number; isFinal?: boolean };

const SLIDES: Slide[] = [
  { src: "/images/web-design/2025_0.jpg", year: 2025, isFinal: true },
  { src: "/images/web-design/2025_7.jpg", year: 2025 },
  { src: "/images/web-design/2025_3.jpg", year: 2025 },
  { src: "/images/web-design/2025_1.jpg", year: 2025 },
  { src: "/images/web-design/2025_2.jpg", year: 2025 },
  { src: "/images/web-design/2025_4.jpg", year: 2025 },
  { src: "/images/web-design/2025_5.jpg", year: 2025 },
  { src: "/images/web-design/2023_1.jpg", year: 2023 }
];

const TOTAL = SLIDES.length;

// Must match the duration of `--animate-wd-progress` in globals.css.
const INTERVAL_MS = 4500;

const pad = (n: number) => n.toString().padStart(2, "0");

export function HeroSlideshow() {
  const t = useTranslations("webdesign");
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) {
      return;
    }
    const timeout = setTimeout(() => setCurrent((current + 1) % TOTAL), INTERVAL_MS);
    return () => clearTimeout(timeout);
  }, [current, playing]);

  const go = (index: number) => setCurrent((index + TOTAL) % TOTAL);
  const slide = SLIDES[current] ?? SLIDES[0];
  const slideTitle = (s: Slide) => (s.isFinal ? t("slideFinal") : t("slideSeason", { year: s.year }));
  const slideNo = pad(current + 1);

  return (
    <div className='relative min-w-0'>
      <div className='pointer-events-none absolute -inset-x-2.5 -top-8 bottom-15 bg-[radial-gradient(closest-side,rgba(255,94,0,0.2),transparent)] blur-2xl' />

      <div className='relative overflow-hidden rounded-[14px] border border-white/12 bg-[#0b0c0e] text-slate-200 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,94,0,0.06)]'>
        {/* Tab strip */}
        <div className='flex h-10 items-end gap-3.5 bg-[#101114] px-3.5'>
          <WindowDots className='self-center' />
          <div className='flex min-w-0 items-end gap-0.5'>
            <div className='flex h-8 items-center gap-2 whitespace-nowrap rounded-t-[9px] bg-[#1a1c20] px-3.5 font-bold text-[12.5px] text-slate-200'>
              <Image alt='' className='rounded-full' height={14} src='/images/logo.png' width={14} />
              {t("heroTabGallery")}
              <span className='ml-1.5 text-[#5b6470]'>×</span>
            </div>
            <div className='hidden h-8 items-center overflow-hidden whitespace-nowrap px-3.5 text-[#7d8793] text-[12.5px] sm:flex'>
              {t("heroTabRules")}
            </div>
            <div className='flex h-8 items-center px-2 text-[#7d8793]'>+</div>
          </div>
        </div>

        {/* Address bar */}
        <div className='flex h-11 items-center gap-2.5 border-white/6 border-b bg-[#1a1c20] px-3'>
          <div className='flex gap-1 text-[#7d8793]'>
            <ChromeButton label={t("slidePrev")} onClick={() => go(current - 1)}>
              <ArrowLeft className='h-4 w-4' />
            </ChromeButton>
            <ChromeButton label={t("slideNext")} onClick={() => go(current + 1)}>
              <ArrowRight className='h-4 w-4' />
            </ChromeButton>
            <span aria-hidden='true' className='hidden h-7 w-7 items-center justify-center sm:flex'>
              <RotateCw className='h-3.5 w-3.5' />
            </span>
          </div>
          <div className='flex h-7.5 min-w-0 flex-1 items-center gap-2 overflow-hidden whitespace-nowrap rounded-lg border border-white/6 bg-[#0f1013] px-3 font-mono text-[#9aa3ae] text-xs'>
            <Lock className='h-3 w-3 shrink-0 text-emerald-400' strokeWidth={2.2} />
            <span className='truncate'>
              <span className='text-slate-200'>mpclub.dev</span>/webdesign/gallery/
              <span className='text-orange-400'>{slideNo}</span>
            </span>
          </div>
          <div className='ml-auto flex items-center gap-2.5'>
            <span className='hidden font-mono text-[#7d8793] text-xs sm:inline'>
              {slideNo} / {pad(TOTAL)}
            </span>
            <button
              aria-label={playing ? t("slidePause") : t("slidePlay")}
              className='flex h-7 w-7 cursor-pointer items-center justify-center rounded-[7px] border border-white/10 bg-white/4 text-slate-200 transition-colors hover:border-orange-500/50'
              onClick={() => setPlaying((p) => !p)}
              type='button'
            >
              {playing ? <Pause className='h-3 w-3 fill-current' /> : <Play className='h-3 w-3 fill-current' />}
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className='relative aspect-16/10 overflow-hidden bg-black'>
          {SLIDES.map((s, idx) => {
            const isActive = idx === current;
            return (
              <Image
                alt={slideTitle(s)}
                aria-hidden={!isActive}
                className='object-cover'
                fill
                key={s.src}
                priority={idx === 0}
                sizes='(min-width: 1024px) 55vw, 100vw'
                src={s.src}
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                  // Active: fade in + slow Ken Burns zoom. Inactive: fade out, then snap scale back once hidden.
                  transition: isActive
                    ? "opacity .9s ease, transform 6s linear"
                    : "opacity .9s ease, transform 0s linear .9s"
                }}
              />
            );
          })}
          <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(8,9,11,0.85)] to-45% to-transparent' />

          <div aria-live='polite' className='absolute right-28 bottom-5 left-5'>
            <div className='font-mono text-[11px] text-orange-400 tracking-[0.12em]'>
              {slide.isFinal ? "FINAL" : "WEBDESIGN"} · {slide.year}
            </div>
            <div className='mt-1 font-black text-white text-xl'>{slideTitle(slide)}</div>
          </div>

          <div className='absolute right-4 bottom-4 flex gap-2'>
            <OverlayButton label={t("slidePrev")} onClick={() => go(current - 1)}>
              <ChevronLeft className='h-4 w-4' strokeWidth={2.2} />
            </OverlayButton>
            <OverlayButton label={t("slideNext")} onClick={() => go(current + 1)}>
              <ChevronRight className='h-4 w-4' strokeWidth={2.2} />
            </OverlayButton>
          </div>

          <div className='absolute inset-x-0 bottom-0 h-[3px] overflow-hidden bg-white/10'>
            <div
              className={cn(
                "h-full origin-left bg-gradient-to-r from-[#ff5e00] to-amber-400",
                playing ? "animate-wd-progress" : "scale-x-0"
              )}
              key={`${current}-${playing}`}
            />
          </div>
        </div>

        {/* Thumbnails */}
        <div className='flex gap-1.5 overflow-x-auto bg-[#15171a] p-2'>
          {SLIDES.map((s, idx) => {
            const isActive = idx === current;
            return (
              <button
                aria-current={isActive}
                aria-label={t("slideGoTo", { index: idx + 1 })}
                className={cn(
                  "relative h-11 w-18 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 bg-black transition-[opacity,border-color] duration-300",
                  isActive ? "border-[#ff5e00] opacity-100" : "border-transparent opacity-45 hover:opacity-80"
                )}
                key={s.src}
                onClick={() => go(idx)}
                type='button'
              >
                <Image alt='' className='object-cover' fill sizes='72px' src={s.src} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating stat badge */}
      <div className='absolute -right-3.5 -bottom-6 hidden items-center gap-3 rounded-[14px] border border-white/10 bg-[rgba(26,29,33,0.92)] px-4 py-3 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.7)] backdrop-blur-md motion-safe:animate-wd-bob sm:flex'>
        <div className='flex h-10 w-10 items-center justify-center rounded-[10px] border border-orange-500/30 bg-orange-500/12 text-orange-400'>
          <Users className='h-5 w-5' />
        </div>
        <div>
          <div className='font-black text-lg text-white leading-tight'>
            <span className='text-orange-400'>{t("heroStatValue")}</span> {t("heroStatLabel")}
          </div>
          <div className='text-[#9aa3ae] text-xs'>{t("heroStatSub")}</div>
        </div>
      </div>
    </div>
  );
}

function ChromeButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      aria-label={label}
      className='flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-white/6 hover:text-white'
      onClick={onClick}
      type='button'
    >
      {children}
    </button>
  );
}

function OverlayButton({
  label,
  onClick,
  children
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      className='flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-[rgba(10,11,13,0.55)] text-white backdrop-blur-md transition-colors hover:border-[#ff5e00] hover:bg-[#ff5e00]'
      onClick={onClick}
      type='button'
    >
      {children}
    </button>
  );
}
