import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Section anchors, shared by the section nav, hero CTAs and each section. */
export const WD_SECTION_IDS = {
  intro: "gioi-thieu",
  rules: "the-thuc",
  timeline: "lo-trinh",
  criteria: "tieu-chi",
  regulations: "quy-dinh",
  prizes: "giai-thuong",
  projects: "du-an",
  gallery: "hinh-anh",
  register: "register",
  faq: "faq"
} as const;

export const WD_CARD = "rounded-2xl border border-border/60 bg-card/45 dark:border-white/10";

export const WD_CARD_HOVER =
  "transition-[translate,border-color,box-shadow] duration-350 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1.5 hover:border-orange-500/45 hover:shadow-[0_24px_48px_-24px_rgba(255,94,0,0.45)]";

export const WD_MONO_LABEL = "font-mono text-xs tracking-[0.12em]";

export function WdSection({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("scroll-mt-24 pt-24 lg:pt-30", className)} id={id}>
      {children}
    </section>
  );
}

/** macOS-style traffic lights for browser/editor window chrome. */
export function WindowDots({ className }: { className?: string }) {
  return (
    <div aria-hidden='true' className={cn("flex gap-1.5", className)}>
      <span className='h-2.5 w-2.5 rounded-full bg-[#ff5f56]' />
      <span className='h-2.5 w-2.5 rounded-full bg-[#ffbd2e]' />
      <span className='h-2.5 w-2.5 rounded-full bg-[#27c93f]' />
    </div>
  );
}

export function IconTile({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-400",
        className
      )}
    >
      {children}
    </div>
  );
}
