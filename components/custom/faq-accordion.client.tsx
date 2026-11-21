"use client";

import { type ReactNode, useId, useState } from "react";
import { cn } from "@/lib/utils";

export type FaqItem = {
  id: string;
  question: ReactNode;
  answer: ReactNode;
  /** Optional leading label, e.g. "Điều 01" in the `numbered` variant. */
  label?: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
  /**
   * `card`: each item is a rounded card (FAQ).
   * `numbered`: flat rows separated by dividers, with a mono label column (rules/regulations).
   */
  variant?: "card" | "numbered";
  /** Index of the item open on first render; `-1` starts fully collapsed. */
  defaultOpenIndex?: number;
  className?: string;
};

export function FaqAccordion({ items, variant = "card", defaultOpenIndex = 0, className }: FaqAccordionProps) {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(items[defaultOpenIndex]?.id ?? null);
  const isCard = variant === "card";

  return (
    <div className={cn(isCard ? "flex flex-col gap-2.5" : "border-border/60 border-t dark:border-white/10", className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        const triggerId = `${baseId}-${item.id}-trigger`;
        const panelId = `${baseId}-${item.id}-panel`;

        return (
          <div
            className={cn(
              "transition-colors duration-300",
              isCard
                ? cn(
                    "rounded-2xl border bg-card/40 dark:bg-card/40",
                    isOpen
                      ? "border-orange-500/35 dark:border-orange-500/30"
                      : "border-border/60 hover:border-orange-500/25 dark:border-white/10"
                  )
                : "border-border/60 border-b dark:border-white/10"
            )}
            key={item.id}
          >
            <button
              aria-controls={panelId}
              aria-expanded={isOpen}
              className={cn(
                "group flex w-full cursor-pointer items-center text-left text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50",
                isCard ? "justify-between gap-4 rounded-2xl px-5 py-4.5" : "gap-5 px-1 py-5.5"
              )}
              id={triggerId}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              type='button'
            >
              {!isCard && item.label && (
                <span className='w-16 shrink-0 font-mono text-orange-400 text-xs'>{item.label}</span>
              )}
              <span
                className={cn(
                  "flex-1 transition-colors group-hover:text-orange-500",
                  isCard ? "font-bold text-base" : "font-extrabold text-lg"
                )}
              >
                {item.question}
              </span>
              <PlusMinus isCard={isCard} isOpen={isOpen} />
            </button>

            <section
              aria-labelledby={triggerId}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
              id={panelId}
              inert={!isOpen}
            >
              <div className='overflow-hidden'>
                <div
                  className={cn(
                    "text-[15px] text-muted-foreground leading-relaxed",
                    isCard ? "px-5 pb-5" : "pr-1 pb-6 pl-1 sm:pl-22"
                  )}
                >
                  {item.answer}
                </div>
              </div>
            </section>
          </div>
        );
      })}
    </div>
  );
}

function PlusMinus({ isOpen, isCard }: { isOpen: boolean; isCard: boolean }) {
  return (
    <span
      aria-hidden='true'
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        isCard
          ? "h-5 w-5 text-orange-500"
          : "h-7 w-7 rounded-lg border border-border text-muted-foreground dark:border-white/15",
        !isCard && isOpen && "border-orange-500/40 text-orange-500"
      )}
    >
      <span className='absolute h-0.5 w-3 rounded-full bg-current' />
      <span
        className={cn(
          "absolute h-3 w-0.5 rounded-full bg-current transition-transform duration-300",
          isOpen && "rotate-90 scale-y-0"
        )}
      />
    </span>
  );
}

/** Bullet list styled for accordion answers (orange square markers). */
export function FaqBulletList({ items }: { items: string[] }) {
  return (
    <ul className='flex flex-col gap-2.5'>
      {items.map((text) => (
        <li className='relative pl-4.5' key={text}>
          <span className='absolute top-2.5 left-0 h-1.5 w-1.5 rounded-[2px] bg-orange-500' />
          {text}
        </li>
      ))}
    </ul>
  );
}
