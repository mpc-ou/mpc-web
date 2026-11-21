"use client";

import { ChevronDown, Crown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, getFullName } from "@/lib/utils";
import { HonoreeAvatar, initialsOf } from "./honoree-avatar";
import { useHonorees } from "./honoree-dialog.client";
import { SectionHeading } from "./section-heading";
import { type GoldBoardEntry, HONOR_BOARD_LIMIT, type Honoree } from "./types";

const MEDALS: Record<number, { card: string; ring: string; text: string; glow: string }> = {
  1: {
    card: "border-amber-400/60 bg-gradient-to-br from-amber-300/15 via-card to-card",
    ring: "ring-2 ring-amber-400",
    text: "text-amber-500 dark:text-amber-300",
    glow: "hover:shadow-[0_22px_50px_-18px_rgba(251,191,36,0.75)]"
  },
  2: {
    card: "border-slate-300/60 bg-gradient-to-br from-slate-300/15 via-card to-card",
    ring: "ring-2 ring-slate-300",
    text: "text-slate-500 dark:text-slate-200",
    glow: "hover:shadow-[0_22px_50px_-18px_rgba(203,213,225,0.7)]"
  },
  3: {
    card: "border-orange-400/50 bg-gradient-to-br from-orange-400/15 via-card to-card",
    ring: "ring-2 ring-orange-400/80",
    text: "text-orange-600 dark:text-orange-300",
    glow: "hover:shadow-[0_22px_50px_-18px_rgba(251,146,60,0.7)]"
  }
};

const DEFAULT_MEDAL = {
  card: "border-border bg-card",
  ring: "",
  text: "text-muted-foreground",
  glow: "hover:shadow-[0_22px_50px_-20px_rgba(251,191,36,0.55)]"
};

type Mode = "all" | "year";

export function HonorBoard() {
  const t = useTranslations("achievements");
  const { goldBoard, goldBoardByYear, people } = useHonorees();
  const years = Object.keys(goldBoardByYear).sort((a, b) => Number(b) - Number(a));
  const [mode, setMode] = useState<Mode>("all");
  const [year, setYear] = useState(years[0] ?? "");
  const [expanded, setExpanded] = useState(false);

  const source = mode === "all" ? goldBoard : (goldBoardByYear[year] ?? []);
  const rows = source.filter((g) => people[g.memberId]);
  const visible = expanded ? rows : rows.slice(0, HONOR_BOARD_LIMIT);
  const hidden = rows.length - visible.length;

  const switchMode = (next: Mode) => {
    setMode(next);
    setExpanded(false);
  };

  const segment = (active: boolean) =>
    cn(
      "rounded-full px-3.5 py-1.5 font-medium text-xs transition-colors",
      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
    );

  const filters = (
    <div className='flex flex-wrap items-center gap-2'>
      <div className='inline-flex rounded-full border border-border bg-card p-1'>
        <button
          aria-pressed={mode === "all"}
          className={segment(mode === "all")}
          onClick={() => switchMode("all")}
          type='button'
        >
          {t("board.filterAll")}
        </button>
        <button
          aria-pressed={mode === "year"}
          className={segment(mode === "year")}
          disabled={years.length === 0}
          onClick={() => switchMode("year")}
          type='button'
        >
          {t("board.filterByYear")}
        </button>
      </div>
      {mode === "year" && (
        <Select
          onValueChange={(value) => {
            setYear(value);
            setExpanded(false);
          }}
          value={year}
        >
          <SelectTrigger aria-label={t("board.selectYear")} className='h-9 w-28 rounded-full text-xs'>
            <SelectValue placeholder={t("board.selectYear")} />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );

  return (
    <section className='flex flex-col gap-7'>
      <SectionHeading aside={filters} eyebrow={t("board.hallEyebrow")} title={t("hallOfFameTitle")} />
      {rows.length === 0 ? (
        <p className='py-12 text-center text-muted-foreground'>
          {mode === "year" ? t("board.yearEmpty") : t("board.hallEmpty")}
        </p>
      ) : (
        <>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' key={`${mode}-${year}`}>
            {visible.map((entry, i) => (
              <ScrollReveal delay={Math.min(i, 11) * 50} key={entry.memberId} variant='fade-up'>
                <HonorCard entry={entry} person={people[entry.memberId]} />
              </ScrollReveal>
            ))}
          </div>
          {(hidden > 0 || expanded) && rows.length > HONOR_BOARD_LIMIT && (
            <button
              className='mx-auto inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 font-medium text-sm transition-colors hover:border-primary hover:text-primary'
              onClick={() => setExpanded((v) => !v)}
              type='button'
            >
              {expanded ? t("board.showLess") : t("board.showMore", { count: hidden })}
              <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
            </button>
          )}
        </>
      )}
    </section>
  );
}

function HonorCard({ entry, person }: { entry: GoldBoardEntry; person: Honoree }) {
  const t = useTranslations("achievements");
  const locale = useLocale();
  const { open } = useHonorees();
  const medal = MEDALS[entry.rank] ?? DEFAULT_MEDAL;
  const name = getFullName(person.firstName, person.middleName, person.lastName, locale);
  const role = person.roles[0];
  const subtitle = role
    ? [role.departmentName, t(`leadership.positions.${role.position}` as Parameters<typeof t>[0])]
        .filter(Boolean)
        .join(" · ")
    : t("board.modal.member");

  const trackPointer = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <button
      aria-label={t("board.openDetail", { name })}
      className={cn(
        "group relative flex w-full items-center gap-3.5 overflow-hidden rounded-2xl border p-3.5 pr-5 text-left outline-none transition-all duration-500 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:border-amber-400/80 focus-visible:ring-2 focus-visible:ring-amber-400",
        medal.card,
        medal.glow
      )}
      onClick={() => open(person.id)}
      onPointerMove={trackPointer}
      type='button'
    >
      <span className='pointer-events-none absolute inset-0 bg-[radial-gradient(220px_circle_at_var(--mx,50%)_var(--my,50%),rgba(251,191,36,0.22),transparent_65%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      <span className='pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:animate-ach-sheen dark:via-white/15' />

      <div className='relative shrink-0'>
        {entry.rank === 1 && (
          <Crown className='absolute -top-3.5 left-1/2 z-10 h-5 w-5 -translate-x-1/2 animate-ach-float fill-amber-300 text-amber-500 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]' />
        )}
        <HonoreeAvatar
          className={cn("h-16 w-16 rounded-xl transition-shadow duration-500", medal.ring)}
          imageClassName='transition-transform duration-700 group-hover:scale-110'
          initials={initialsOf(person.firstName, person.lastName)}
          name={name}
          sizes='64px'
          src={person.avatar}
        />
      </div>

      <div className='relative flex min-w-0 flex-1 flex-col gap-0.5'>
        <span className={cn("font-bold font-mono text-[11px]", medal.text)}>
          #{String(entry.rank).padStart(2, "0")}
        </span>
        <span className='truncate font-bold text-[15px] transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-200'>
          {name}
        </span>
        <span className='truncate font-medium font-mono text-[11px] text-muted-foreground'>{subtitle}</span>
      </div>

      <div className='relative flex flex-col items-end gap-0.5'>
        <span
          className={cn(
            "font-black text-4xl leading-none tracking-tight transition-transform duration-500 group-hover:scale-110",
            entry.rank <= 3 ? medal.text : "text-foreground"
          )}
        >
          {entry.count}
        </span>
        <span className='font-medium font-mono text-[10px] text-muted-foreground'>{t("board.awardsUnit")}</span>
      </div>
    </button>
  );
}
