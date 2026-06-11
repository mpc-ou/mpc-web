"use client";

import { HelpCircle, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { cn } from "@/lib/utils";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
  title?: string;
  subtitle?: string;
  badge?: string;
  className?: string;
};

export function FaqAccordion({ items, title, subtitle, badge = "faq", className }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={cn("w-full", className)}>
      {(title || badge) && (
        <ScrollReveal className='mb-12 text-center'>
          {badge && (
            <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm uppercase'>
              &gt; {badge}
            </span>
          )}
          {title && (
            <h2 className='mt-4 font-black text-3xl text-white uppercase tracking-tight sm:text-4xl'>{title}</h2>
          )}
          {subtitle && <p className='mx-auto mt-3 max-w-xl text-slate-400 text-sm'>{subtitle}</p>}
        </ScrollReveal>
      )}

      <div className='mx-auto max-w-4xl space-y-4'>
        {items.map((item, idx) => {
          const isOpen = openId === item.id;

          return (
            <ScrollReveal delay={idx * 50} key={item.id} variant='fade-up'>
              <div
                className={cn(
                  "overflow-hidden rounded-xl border transition-all duration-300",
                  isOpen
                    ? "border-orange-500/30 bg-slate-900/80 shadow-lg shadow-orange-500/5"
                    : "border-white/5 bg-slate-900/40 hover:border-white/10 hover:bg-slate-900/60"
                )}
              >
                <button
                  className='flex w-full select-none items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-white focus:outline-none'
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  type='button'
                >
                  <div className='flex items-center gap-3'>
                    <HelpCircle
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors duration-300",
                        isOpen ? "text-orange-500" : "text-slate-500"
                      )}
                    />
                    <span className='text-sm sm:text-base'>{item.question}</span>
                  </div>
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/5 bg-slate-950/50 text-slate-400 transition-transform duration-300",
                      isOpen && "rotate-180 border-orange-500/20 text-orange-400"
                    )}
                  >
                    {isOpen ? <Minus className='h-3.5 w-3.5' /> : <Plus className='h-3.5 w-3.5' />}
                  </div>
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className='border-white/5 border-t bg-slate-950/20 px-6 pt-1 pb-6 pl-[44px] font-sans text-slate-300 text-sm leading-relaxed sm:text-base'>
                    {item.answer}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
