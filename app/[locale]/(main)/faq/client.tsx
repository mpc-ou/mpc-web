"use client";

import { Search } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { FaqAccordion } from "@/components/custom/faq-accordion.client";
import { MarkdownContent } from "@/components/markdown-content";
import { cn } from "@/lib/utils";

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  order: number;
  target: string;
};

type Props = {
  items: FaqEntry[];
  targets: { value: string; label: string; count: number }[];
  labels: { all: string; empty: string; search: string; count: string };
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export function FaqBrowser({ items, targets, labels }: Props) {
  const [target, setTarget] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const needle = normalize(deferredQuery.trim());
  const visible = items.filter(
    (item) =>
      (!target || item.target === target) && (!needle || normalize(`${item.question} ${item.answer}`).includes(needle))
  );
  const labelOf = (value: string) => targets.find((t) => t.value === value)?.label ?? value;

  const chip = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-medium text-sm transition-colors",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
    );

  return (
    <div className='grid gap-10 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]'>
      <aside className='flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start'>
        <label className='relative block'>
          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <input
            className='h-11 w-full rounded-xl border border-border bg-card pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary'
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.search}
            type='search'
            value={query}
          />
        </label>
        <div className='flex flex-wrap gap-2 lg:flex-col lg:items-stretch'>
          <button
            className={cn(chip(target === null), "lg:justify-between")}
            onClick={() => setTarget(null)}
            type='button'
          >
            {labels.all}
            <span className='font-mono text-xs opacity-70'>{items.length}</span>
          </button>
          {targets.map((t) => (
            <button
              className={cn(chip(target === t.value), "lg:justify-between")}
              key={t.value}
              onClick={() => setTarget(t.value)}
              type='button'
            >
              {t.label}
              <span className='font-mono text-xs opacity-70'>{t.count}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className='flex min-w-0 flex-col gap-4'>
        <p className='font-mono text-muted-foreground text-xs'>
          {labels.count.replace("{count}", String(visible.length))}
        </p>
        {visible.length === 0 ? (
          <p className='rounded-2xl border border-border border-dashed px-6 py-16 text-center text-muted-foreground'>
            {labels.empty}
          </p>
        ) : (
          <FaqAccordion
            defaultOpenIndex={-1}
            items={visible.map((item) => ({
              id: item.id,
              label: labelOf(item.target),
              question: item.question,
              answer: <MarkdownContent content={item.answer} />
            }))}
            key={`${target}-${needle}`}
          />
        )}
      </div>
    </div>
  );
}
