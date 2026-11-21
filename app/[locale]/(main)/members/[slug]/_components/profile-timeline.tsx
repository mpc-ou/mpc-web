import { Star } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/configs/i18n/routing";
import { cn } from "@/lib/utils";
import { formatLocalDate } from "@/utils/handle-datetime";
import { groupByYear, TAG_LABEL, type TimelineItem, type TimelineKind } from "./profile-data";

const ITEMS_PER_YEAR = 4;

type Filter = "all" | TimelineKind;

const FILTERS: { value: Filter; labelKey: "all" | "projects" | "achievements" | "posts" | "roles" }[] = [
  { value: "all", labelKey: "all" },
  { value: "project", labelKey: "projects" },
  { value: "award", labelKey: "achievements" },
  { value: "post", labelKey: "posts" },
  { value: "role", labelKey: "roles" }
];

const monthYear = (time: number, locale: string) => formatLocalDate(new Date(time).toISOString(), locale, "MM/yyyy");

const Tag = ({ kind, solid }: { kind: TimelineKind; solid?: boolean }) => (
  <span
    className={cn(
      "shrink-0 rounded px-1.5 py-0.5 font-bold font-mono text-[10px] tracking-wide",
      kind === "award" && "bg-primary text-white",
      kind === "project" && "bg-foreground text-background",
      !(kind === "award" || kind === "project") && (solid ? "bg-muted text-foreground" : "text-muted-foreground")
    )}
  >
    {TAG_LABEL[kind]}
  </span>
);

const Thumb = ({ src, className, sizes }: { src: string | null; className?: string; sizes: string }) => (
  <div className={cn("relative overflow-hidden bg-muted", className)}>
    {src ? (
      <Image
        alt=''
        className='object-cover transition-transform duration-500 group-hover:scale-105'
        fill
        sizes={sizes}
        src={src}
      />
    ) : (
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.18),transparent_60%)]' />
    )}
  </div>
);

const ItemShell = ({
  item,
  className,
  children
}: {
  item: TimelineItem;
  className: string;
  children: React.ReactNode;
}) =>
  item.href ? (
    <Link className={cn("group", className)} href={item.href as "/"}>
      {children}
    </Link>
  ) : (
    <div className={className}>{children}</div>
  );

export function FeaturedGrid({ items }: { items: TimelineItem[] }) {
  const tm = useTranslations("header.member");
  const locale = useLocale();
  if (items.length === 0) {
    return null;
  }
  return (
    <section className='mt-8'>
      <h2 className='mb-3 font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]'>{tm("featured")}</h2>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {items.map((item) => (
          <ItemShell
            className='relative block aspect-[2/1] overflow-hidden rounded-xl border border-border transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_0_32px_-12px_rgba(249,115,22,0.7)]'
            item={item}
            key={item.id}
          >
            <Thumb
              className='absolute inset-0'
              sizes='(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw'
              src={item.thumbnail}
            />
            <div className='absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/10' />
            <div className='absolute top-2.5 left-2.5'>
              <Tag kind={item.kind} solid />
            </div>
            <div className='absolute inset-x-0 bottom-0 p-3 text-white'>
              <p className='font-mono text-[11px] text-white/70'>
                {monthYear(item.date, locale)} · {TAG_LABEL[item.kind].toLowerCase()}
              </p>
              <p className='mt-0.5 line-clamp-2 font-bold leading-snug transition-colors group-hover:text-primary'>
                {item.title}
              </p>
            </div>
          </ItemShell>
        ))}
      </div>
    </section>
  );
}

const RichItem = ({ item, locale }: { item: TimelineItem; locale: string }) => (
  <ItemShell
    className='flex items-center gap-4 rounded-xl border border-border bg-card/60 p-2.5 pr-4 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5'
    item={item}
  >
    <Thumb className='aspect-[4/3] w-24 shrink-0 rounded-lg sm:w-28' sizes='112px' src={item.thumbnail} />
    <div className='min-w-0 flex-1'>
      <div className='flex items-center gap-2'>
        <Tag kind={item.kind} />
        <span className='font-mono text-muted-foreground text-xs'>{monthYear(item.date, locale)}</span>
      </div>
      <p className='mt-1 line-clamp-2 font-bold leading-snug transition-colors group-hover:text-primary'>
        {item.title}
      </p>
      {item.meta && <p className='mt-0.5 truncate font-mono text-muted-foreground text-xs'>{item.meta}</p>}
    </div>
    {item.aside ? (
      <span className='max-w-28 shrink-0 text-right font-black text-lg text-primary leading-tight sm:text-2xl'>
        {item.aside}
      </span>
    ) : (
      item.highlight && <Star aria-hidden className='h-6 w-6 shrink-0 fill-orange-500 text-primary' />
    )}
  </ItemShell>
);

const CompactItem = ({ item, locale }: { item: TimelineItem; locale: string }) => (
  <ItemShell
    className='flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm transition-colors hover:bg-muted/60'
    item={item}
  >
    <span className='w-14 shrink-0 font-mono text-muted-foreground text-xs'>{monthYear(item.date, locale)}</span>
    <span className='hidden w-12 shrink-0 sm:block'>
      <Tag kind={item.kind} />
    </span>
    <span
      className={cn(
        "min-w-0 flex-1 truncate transition-colors group-hover:text-primary",
        item.highlight && "font-semibold text-primary"
      )}
    >
      {item.title}
    </span>
    {item.aside && <span className='shrink-0 font-mono text-muted-foreground text-xs'>{item.aside}</span>}
  </ItemShell>
);

export function ProfileTimeline({ items }: { items: TimelineItem[] }) {
  const tm = useTranslations("header.member");
  const locale = useLocale();
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const counts: Record<Filter, number> = {
    all: items.length,
    project: items.filter((i) => i.kind === "project").length,
    award: items.filter((i) => i.kind === "award").length,
    post: items.filter((i) => i.kind === "post").length,
    role: items.filter((i) => i.kind === "role").length
  };
  const years = groupByYear(filter === "all" ? items : items.filter((i) => i.kind === filter));

  const toggleYear = (year: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });

  return (
    <section className='mt-8'>
      <div className='flex flex-wrap gap-2 border-border border-b pb-5'>
        {FILTERS.map(({ value, labelKey }) => (
          <button
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-semibold text-xs transition-colors",
              filter === value
                ? "border-foreground bg-foreground text-background"
                : "border-border text-foreground hover:border-primary/60"
            )}
            key={value}
            onClick={() => setFilter(value)}
            type='button'
          >
            {tm(`filters.${labelKey}`)}
            <span className={cn("font-mono", filter === value ? "opacity-60" : "text-muted-foreground")}>
              {counts[value]}
            </span>
          </button>
        ))}
      </div>

      {years.length === 0 ? (
        <p className='py-12 text-center text-muted-foreground text-sm'>{tm("emptyTimeline")}</p>
      ) : (
        <div className='mt-8 flex flex-col gap-10'>
          {years.map(({ year, items: yearItems }, idx) => {
            const isOpen = expanded.has(year);
            const visible = isOpen ? yearItems : yearItems.slice(0, ITEMS_PER_YEAR);
            const hidden = yearItems.length - ITEMS_PER_YEAR;
            return (
              <div className='flex flex-col gap-3 md:flex-row md:gap-6' key={year}>
                <div className='flex items-baseline gap-3 md:w-24 md:shrink-0 md:flex-col md:gap-0'>
                  <p
                    className={cn(
                      "font-black text-3xl tracking-tight md:text-4xl",
                      idx === 0 ? "text-primary" : "text-muted-foreground/50"
                    )}
                  >
                    {year}
                  </p>
                  <p className='font-mono text-muted-foreground text-xs'>
                    {tm("itemsCount", { count: yearItems.length })}
                  </p>
                </div>
                <div className='flex min-w-0 flex-1 flex-col gap-2 border-border md:border-l md:pl-6'>
                  {visible.map((item) =>
                    item.kind === "award" || item.kind === "project" ? (
                      <RichItem item={item} key={item.id} locale={locale} />
                    ) : (
                      <CompactItem item={item} key={item.id} locale={locale} />
                    )
                  )}
                  {hidden > 0 && (
                    <button
                      className='self-start rounded-lg border border-primary/50 border-dashed px-3 py-1.5 font-mono font-semibold text-primary text-xs transition-colors hover:bg-primary/10'
                      onClick={() => toggleYear(year)}
                      type='button'
                    >
                      {isOpen ? tm("showLess") : tm("showMore", { count: hidden })}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
