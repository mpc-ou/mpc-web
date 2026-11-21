"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/configs/i18n/routing";
import { cn, getFullName } from "@/lib/utils";
import { formatYearSpan, LEADERSHIP_POSITIONS, type TermEntry } from "@/utils/leadership-terms";
import { HonoreeAvatar, initialsOf } from "./honoree-avatar";
import { useHonorees } from "./honoree-dialog.client";
import { SectionHeading } from "./section-heading";
import { SocialIcons } from "./social-icons";
import { type Honoree, LEADER_TOP_POSITIONS } from "./types";

const LEADERSHIP_SET = new Set<string>(LEADERSHIP_POSITIONS);

export function LeadershipTerms() {
  const t = useTranslations("achievements");
  const { terms, people, isOpen } = useHonorees();
  const [activeIdx, setActiveIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [edges, setEdges] = useState({ start: false, end: false });
  const sectionRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) {
      return;
    }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    const onEnter = () => setHovered(true);
    const onLeave = () => setHovered(false);
    const onFocusIn = (e: FocusEvent) => setFocused((e.target as HTMLElement).matches(":focus-visible"));
    const onFocusOut = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node | null)) {
        setFocused(false);
      }
    };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    return () => {
      io.disconnect();
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  useEffect(() => {
    const container = tabsRef.current;
    const tab = container?.children[activeIdx] as HTMLElement | undefined;
    if (container && tab) {
      container.scrollTo({
        left: tab.offsetLeft - container.clientWidth / 2 + tab.clientWidth / 2,
        behavior: "smooth"
      });
    }
  }, [activeIdx]);

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) {
      return;
    }
    const update = () =>
      setEdges({ start: el.scrollLeft > 4, end: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) {
        return;
      }
      const max = el.scrollWidth - el.clientWidth;
      const canScroll = e.deltaY < 0 ? el.scrollLeft > 0 : el.scrollLeft < max;
      if (canScroll) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  if (terms.length === 0) {
    return null;
  }

  const current = terms[Math.min(activeIdx, terms.length - 1)];
  const paused = hovered || focused || isOpen || !inView;
  const next = () => setActiveIdx((i) => (i + 1) % terms.length);
  const scrollTabs = (dir: 1 | -1) => {
    const el = tabsRef.current;
    el?.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  const onTabKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowRight: activeIdx + 1,
      ArrowLeft: activeIdx - 1,
      Home: 0,
      End: terms.length - 1
    };
    const target = moves[e.key];
    if (target === undefined) {
      return;
    }
    e.preventDefault();
    const idx = (target + terms.length) % terms.length;
    setActiveIdx(idx);
    (tabsRef.current?.children[idx] as HTMLElement | undefined)?.focus();
  };

  return (
    <section className='flex flex-col gap-7' ref={sectionRef}>
      <SectionHeading aside={t("board.leadNote")} eyebrow={t("board.leadEyebrow")} title={t("board.leadTitle")} />

      <div className='relative border-border border-b'>
        <div
          className='[&::-webkit-scrollbar]:hidden! grid auto-cols-[minmax(88px,1fr)] grid-flow-col overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none]!'
          onKeyDown={onTabKey}
          ref={tabsRef}
          role='tablist'
        >
          {terms.map((term, i) => {
            const on = i === activeIdx;
            return (
              <button
                aria-selected={on}
                className={cn(
                  "group/tab relative flex flex-col items-start gap-1 px-1.5 pt-3.5 pb-4 text-left outline-none transition-colors duration-300 focus-visible:bg-muted/50",
                  on ? "text-foreground" : "text-muted-foreground/70 hover:text-foreground"
                )}
                key={term.year}
                onClick={() => setActiveIdx(i)}
                role='tab'
                tabIndex={on ? 0 : -1}
                type='button'
              >
                <span
                  className={cn(
                    "font-black text-[22px] leading-none tracking-tight transition-transform duration-300",
                    on ? "scale-105" : "group-hover/tab:translate-x-0.5"
                  )}
                >
                  {term.year}
                </span>
                <span
                  className={cn("font-medium font-mono text-[11px]", on ? "text-primary" : "text-muted-foreground/60")}
                >
                  {i === 0 ? t("board.termCurrent") : t("board.termLabel", { year: term.year })}
                </span>
                <span className={cn("absolute inset-x-0 bottom-0 h-0.5", on ? "bg-border-strong" : "bg-transparent")}>
                  {on && terms.length > 1 && (
                    <span
                      className='block h-full origin-left animate-ach-progress bg-primary motion-reduce:animate-none'
                      key={`${term.year}-${activeIdx}`}
                      onAnimationEnd={next}
                      style={{ animationPlayState: paused ? "paused" : "running" }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <TabsEdgeButton
          direction='start'
          label={t("board.prevPage")}
          onClick={() => scrollTabs(-1)}
          visible={edges.start}
        />
        <TabsEdgeButton direction='end' label={t("board.nextPage")} onClick={() => scrollTabs(1)} visible={edges.end} />
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4' key={current.year} role='tabpanel'>
        {current.entries
          .filter((e) => people[e.memberId])
          .map((entry, i) => (
            <div
              className='fade-in zoom-in-95 slide-in-from-bottom-4 animate-in fill-mode-both duration-700 ease-out'
              key={entry.memberId}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <LeaderCard entry={entry} person={people[entry.memberId]} />
            </div>
          ))}
      </div>
    </section>
  );
}

function TabsEdgeButton({
  direction,
  visible,
  label,
  onClick
}: {
  direction: "start" | "end";
  visible: boolean;
  label: string;
  onClick: () => void;
}) {
  const isStart = direction === "start";
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-y-0 flex w-20 items-center transition-opacity duration-300",
        isStart ? "left-0 justify-start bg-gradient-to-r" : "right-0 justify-end bg-gradient-to-l",
        "from-background via-background/80 to-transparent",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <button
        aria-label={label}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border border-border-strong bg-background shadow-sm transition-all hover:scale-110 hover:border-primary hover:text-primary",
          visible ? "pointer-events-auto" : "pointer-events-none"
        )}
        onClick={onClick}
        tabIndex={-1}
        type='button'
      >
        {isStart ? <ChevronLeft className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
      </button>
    </div>
  );
}

function LeaderCard({ entry, person }: { entry: TermEntry; person: Honoree }) {
  const t = useTranslations("achievements");
  const locale = useLocale();
  const { open } = useHonorees();
  const name = getFullName(person.firstName, person.middleName, person.lastName, locale);
  const isTop = LEADER_TOP_POSITIONS.has(entry.position);
  const positionLabel = (p: string) => t(`leadership.positions.${p}` as Parameters<typeof t>[0]);
  const history = person.roles.filter((r) => LEADERSHIP_SET.has(r.position)).slice(0, 4);

  return (
    <div
      className={cn(
        "group relative aspect-square overflow-hidden rounded-[20px] border bg-muted transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(249,115,22,0.55)]",
        isTop ? "border-2 border-primary" : "border-border"
      )}
    >
      <HonoreeAvatar
        className='absolute inset-0 text-3xl'
        imageClassName='transition-transform duration-700 ease-out group-hover:scale-110 group-has-[:focus-visible]:scale-110'
        initials={initialsOf(person.firstName, person.lastName)}
        name={name}
        sizes='(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw'
        src={person.avatar}
      />
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-b from-55% from-transparent to-black/85 sm:from-40% sm:to-black/90' />

      <span
        className={cn(
          "pointer-events-none absolute top-2 left-2 z-10 rounded-md px-1.5 py-0.5 font-bold font-mono text-[9px] uppercase sm:top-3 sm:left-3 sm:px-2 sm:py-1 sm:text-[11px]",
          isTop ? "bg-primary text-primary-foreground" : "bg-black/70 text-white backdrop-blur-sm"
        )}
      >
        {positionLabel(entry.position)}
      </span>

      <div className='pointer-events-none absolute inset-x-2.5 bottom-2.5 text-white transition-all duration-500 group-hover:translate-y-3 group-hover:opacity-0 group-has-[:focus-visible]:translate-y-3 group-has-[:focus-visible]:opacity-0 sm:inset-x-4 sm:bottom-4'>
        <p className='line-clamp-2 font-extrabold text-sm leading-tight sm:text-lg'>{name}</p>
        {entry.departmentName && (
          <p className='truncate font-mono text-[10px] text-white/70 sm:text-[11px]'>{entry.departmentName}</p>
        )}
      </div>

      <button
        aria-label={t("board.openDetail", { name })}
        className='absolute inset-0 z-10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset'
        onClick={() => open(person.id)}
        type='button'
      />

      <div className='pointer-events-none absolute inset-0 z-20 flex translate-y-4 flex-col justify-end gap-3 bg-black/85 p-4 text-white opacity-0 backdrop-blur-[2px] transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-has-[:focus-visible]:translate-y-0 group-has-[:focus-visible]:opacity-100 sm:p-5'>
        <p className='font-extrabold text-base leading-tight sm:text-lg'>{name}</p>
        {history.length > 0 && (
          <ul className='flex flex-col gap-1 font-medium font-mono text-[11px] text-white/75'>
            {history.map((r) => (
              <li className='flex gap-2.5' key={r.id}>
                <span className='shrink-0 text-primary'>
                  {formatYearSpan(r.startAt, r.endAt, t("board.modal.present"))}
                </span>
                <span className='truncate'>{positionLabel(r.position)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className='flex flex-wrap items-center gap-1.5 group-hover:pointer-events-auto group-has-[:focus-visible]:pointer-events-auto'>
          <SocialIcons itemClassName='h-7 w-7' max={4} socials={person.socials} />
          {person.slug && (
            <Link
              className='ml-auto inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 font-bold font-mono text-[11px] text-primary-foreground transition-transform hover:scale-105'
              href={`/members/${person.slug}`}
            >
              {t("board.viewProfile")}
              <ArrowRight className='h-3 w-3' />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
