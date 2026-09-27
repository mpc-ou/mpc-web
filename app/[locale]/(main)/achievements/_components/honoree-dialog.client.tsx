"use client";

import { ArrowUpRight, FolderGit2, Landmark, Star, Trophy } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { createContext, use, useEffect, useMemo, useState } from "react";
import { getMemberAchievements } from "@/app/_actions/main";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Link } from "@/configs/i18n/routing";
import { getFullName } from "@/lib/utils";
import { formatLocalDate } from "@/utils/handle-datetime";
import { formatYearSpan, type TermGroup } from "@/utils/leadership-terms";
import { HonoreeAvatar, initialsOf } from "./honoree-avatar";
import { SocialIcons } from "./social-icons";
import type { GoldBoardEntry, Honoree } from "./types";

type MemberAchievement = {
  id: string;
  titleVi: string;
  titleEn: string;
  slug: string;
  thumbnail: string | null;
  achievementDate: string | null;
  achievementType: string;
  isHighlight: boolean;
  role: string | null;
  prize: string | null;
};

type HonoreeContextValue = {
  people: Record<string, Honoree>;
  goldBoard: GoldBoardEntry[];
  terms: TermGroup[];
  open: (memberId: string) => void;
  isOpen: boolean;
};

const HonoreeContext = createContext<HonoreeContextValue | null>(null);

export const useHonorees = () => {
  const ctx = use(HonoreeContext);
  if (!ctx) {
    throw new Error("useHonorees must be used inside HonoreeProvider");
  }
  return ctx;
};

const TYPE_KEY: Record<string, "individual" | "team" | "club"> = {
  INDIVIDUAL: "individual",
  TEAM: "team",
  CLUB: "club"
};

type ProviderProps = {
  people: Record<string, Honoree>;
  goldBoard: GoldBoardEntry[];
  terms: TermGroup[];
  children: React.ReactNode;
};

export function HonoreeProvider({ people, goldBoard, terms, children }: ProviderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [achievementsById, setAchievementsById] = useState<Record<string, MemberAchievement[]>>({});

  useEffect(() => {
    if (!selectedId || achievementsById[selectedId]) {
      return;
    }
    let cancelled = false;
    getMemberAchievements(selectedId)
      .then((res) => (res.data?.payload as MemberAchievement[] | undefined) ?? [])
      .catch(() => [])
      .then((items) => {
        if (!cancelled) {
          setAchievementsById((prev) => ({ ...prev, [selectedId]: items }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, achievementsById]);

  const value = useMemo(
    () => ({ people, goldBoard, terms, open: setSelectedId, isOpen: selectedId !== null }),
    [people, goldBoard, terms, selectedId]
  );

  const person = selectedId ? people[selectedId] : undefined;

  return (
    <HonoreeContext value={value}>
      {children}
      <Dialog onOpenChange={(o) => !o && setSelectedId(null)} open={!!person}>
        {person && (
          <HonoreeDialogBody
            achievements={achievementsById[person.id] ?? null}
            goldEntry={goldBoard.find((g) => g.memberId === person.id)}
            person={person}
            termYears={terms.filter((t) => t.entries.some((e) => e.memberId === person.id)).map((t) => t.year)}
          />
        )}
      </Dialog>
    </HonoreeContext>
  );
}

type BodyProps = {
  person: Honoree;
  achievements: MemberAchievement[] | null;
  goldEntry?: GoldBoardEntry;
  termYears: number[];
};

function HonoreeDialogBody({ person, achievements, goldEntry, termYears }: BodyProps) {
  const t = useTranslations("achievements");
  const locale = useLocale();
  const name = getFullName(person.firstName, person.middleName, person.lastName, locale);
  const topRole = person.roles[0];
  const positionLabel = (p: string) => t(`leadership.positions.${p}` as Parameters<typeof t>[0]);
  const subtitle = topRole
    ? [positionLabel(topRole.position), topRole.departmentName].filter(Boolean).join(" · ")
    : t("board.modal.member");

  const stats = [
    { icon: Trophy, value: achievements?.length ?? person.achievementCount, label: t("board.modal.achievements") },
    { icon: FolderGit2, value: person.projectCount, label: t("board.modal.projects") },
    { icon: Landmark, value: termYears.length, label: t("board.modal.terms") }
  ];

  return (
    <DialogContent className='max-h-[92vh] max-w-[calc(100vw-2rem)] gap-0 overflow-y-auto border-amber-400/30 bg-background p-0 shadow-[0_0_80px_-20px_rgba(251,191,36,0.45)] sm:rounded-3xl md:max-w-4xl md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:overflow-hidden'>
      <aside className='relative flex flex-col md:max-h-[92vh] md:overflow-y-auto md:border-border md:border-r'>
        <div className='relative h-36 shrink-0 overflow-hidden'>
          {person.coverImage ? (
            <Image
              alt=''
              className='object-cover'
              fill
              sizes='(min-width: 768px) 420px, 100vw'
              src={person.coverImage}
            />
          ) : (
            <div className='absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_0%,rgba(251,191,36,0.55),transparent_55%),radial-gradient(90%_120%_at_100%_20%,rgba(249,115,22,0.45),transparent_60%)] bg-muted' />
          )}
          <div className='absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent' />
          <div className='pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-ach-sheen bg-gradient-to-r from-transparent via-white/35 to-transparent [animation-delay:250ms] [animation-fill-mode:both]' />
        </div>

        <div className='relative -mt-16 flex flex-col items-center gap-4 px-6 pb-6 text-center'>
          <div className='relative h-28 w-28 animate-ach-float'>
            <div className='absolute -inset-4 rounded-full bg-amber-400/30 blur-2xl' />
            <div className='absolute -inset-1 animate-ach-spin rounded-full bg-[conic-gradient(from_0deg,#fde68a,#f59e0b,#f97316,#fbbf24,#fff7d6,#fde68a)]' />
            <HonoreeAvatar
              className='relative h-full w-full rounded-full border-4 border-background'
              initials={initialsOf(person.firstName, person.lastName)}
              name={name}
              sizes='112px'
              src={person.avatar}
            />
          </div>

          {goldEntry && (
            <span className='inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 px-3 py-1 font-bold font-mono text-[11px] text-amber-950 shadow-[0_0_18px_rgba(251,191,36,0.5)]'>
              <Trophy className='h-3.5 w-3.5' />
              {t("board.modal.rank", { rank: String(goldEntry.rank).padStart(2, "0") })}
            </span>
          )}

          <div className='flex flex-col gap-1'>
            <DialogTitle className='text-balance font-black text-2xl tracking-tight'>{name}</DialogTitle>
            <DialogDescription className='font-mono text-xs'>{subtitle}</DialogDescription>
          </div>

          <div className='grid w-full grid-cols-3 gap-2'>
            {stats.map(({ icon: Icon, value, label }) => (
              <div
                className='flex flex-col items-center gap-1 rounded-2xl border border-border bg-card px-2 py-3 transition-colors hover:border-amber-400/50'
                key={label}
              >
                <Icon className='h-4 w-4 text-amber-500' />
                <span className='font-black text-xl leading-none'>{value}</span>
                <span className='text-[11px] text-muted-foreground'>{label}</span>
              </div>
            ))}
          </div>

          <SocialIcons className='justify-center' socials={person.socials} />

          {person.roles.length > 0 && (
            <div className='w-full text-left'>
              <p className='mb-2 font-mono font-semibold text-[11px] text-muted-foreground uppercase tracking-widest'>
                {t("board.modal.roleHistory")}
              </p>
              <ol className='relative space-y-2.5 border-amber-400/30 border-l pl-4'>
                {person.roles.map((r) => (
                  <li className='relative' key={r.id}>
                    <span className='absolute top-1.5 -left-[21px] h-2.5 w-2.5 rounded-full border-2 border-background bg-amber-400' />
                    <p className='font-semibold text-sm'>
                      {positionLabel(r.position)}
                      {r.departmentName && <span className='text-muted-foreground'> · {r.departmentName}</span>}
                    </p>
                    <p className='font-mono text-[11px] text-muted-foreground'>
                      {formatYearSpan(r.startAt, r.endAt, t("board.modal.present"))}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {person.slug && (
            <Link
              className='group/cta mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground text-sm shadow-glow-primary transition-transform hover:scale-[1.03]'
              href={`/members/${person.slug}`}
            >
              {t("board.modal.viewProfile")}
              <ArrowUpRight className='h-4 w-4 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5' />
            </Link>
          )}
        </div>
      </aside>

      <section className='flex min-h-0 flex-col md:max-h-[92vh]'>
        <header className='flex items-center justify-between gap-3 border-border border-t px-6 py-4 pr-12 md:border-t-0 md:border-b'>
          <h3 className='font-bold text-lg'>{t("board.modal.journey")}</h3>
          {achievements && (
            <span className='rounded-full bg-amber-400/15 px-2.5 py-0.5 font-bold font-mono text-amber-600 text-xs dark:text-amber-300'>
              {achievements.length}
            </span>
          )}
        </header>
        <div className='flex-1 px-6 py-5 md:overflow-y-auto'>
          <AchievementTimeline items={achievements} locale={locale} />
        </div>
      </section>
    </DialogContent>
  );
}

function AchievementTimeline({ items, locale }: { items: MemberAchievement[] | null; locale: string }) {
  const t = useTranslations("achievements");

  if (!items) {
    return (
      <div className='space-y-3'>
        {[0, 1, 2].map((i) => (
          <div className='flex animate-pulse gap-3 rounded-2xl border border-border p-3' key={i}>
            <div className='h-16 w-24 rounded-xl bg-muted' />
            <div className='flex flex-1 flex-col justify-center gap-2'>
              <div className='h-3.5 w-4/5 rounded bg-muted' />
              <div className='h-3 w-1/3 rounded bg-muted' />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className='flex flex-col items-center gap-3 py-16 text-center text-muted-foreground'>
        <Trophy className='h-10 w-10 opacity-30' />
        <p className='text-sm'>{t("board.modal.empty")}</p>
      </div>
    );
  }

  return (
    <ol className='relative space-y-3'>
      {items.map((a, i) => {
        const title = locale === "en" && a.titleEn ? a.titleEn : a.titleVi;
        const typeKey = TYPE_KEY[a.achievementType];
        return (
          <li
            className='fade-in slide-in-from-bottom-3 animate-in fill-mode-both duration-500'
            key={a.id}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <Link
              className='group relative flex gap-3 overflow-hidden rounded-2xl border border-border bg-card p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/60 hover:shadow-[0_10px_30px_-12px_rgba(251,191,36,0.5)]'
              href={`/achievements/${a.slug}`}
            >
              <span className='pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] bg-gradient-to-r from-transparent via-amber-200/25 to-transparent group-hover:animate-ach-sheen' />
              <div className='relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-muted'>
                {a.thumbnail ? (
                  <Image
                    alt=''
                    className='object-cover transition-transform duration-500 group-hover:scale-110'
                    fill
                    sizes='96px'
                    src={a.thumbnail}
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-400/20 to-transparent'>
                    <Trophy className='h-6 w-6 text-amber-500/60' />
                  </div>
                )}
              </div>
              <div className='flex min-w-0 flex-1 flex-col justify-center gap-1.5'>
                <p className='line-clamp-2 font-semibold text-sm leading-snug transition-colors group-hover:text-primary'>
                  {a.isHighlight && <Star className='mr-1 mb-0.5 inline h-3.5 w-3.5 fill-amber-400 text-amber-400' />}
                  {title}
                </p>
                <div className='flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-muted-foreground'>
                  {a.achievementDate && <span>{formatLocalDate(a.achievementDate, locale, "MM/yyyy")}</span>}
                  {typeKey && <span>· {t(typeKey)}</span>}
                </div>
                {(a.prize || a.role) && (
                  <div className='flex min-w-0 flex-col items-start gap-1 text-[11px] leading-snug'>
                    {a.prize && (
                      <span className='max-w-full break-words rounded-md bg-gradient-to-r from-amber-300 to-orange-300 px-2 py-0.5 font-bold text-amber-950'>
                        {a.prize}
                      </span>
                    )}
                    {a.role && (
                      <span className='max-w-full break-words rounded-md border border-border px-2 py-0.5 text-muted-foreground'>
                        {a.role}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
