"use client";

import { ArrowRight, Search } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/configs/i18n/routing";
import { buildSocialHref, cn, getFullName } from "@/lib/utils";
import { getSocialMeta, parseSocials } from "@/utils/social";

export type DirectoryMember = {
  id: string;
  slug: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  avatar: string | null;
  studentId: string | null;
  socials: unknown;
  currentRole: {
    position: string;
    department: { id: string; nameVi: string; nameEn: string | null } | null;
  } | null;
};

export type DirectoryYear = { year: number; members: DirectoryMember[] };

const LEADER_POSITIONS = new Set(["PRESIDENT", "VICE_PRESIDENT", "DEPARTMENT_LEADER", "DEPARTMENT_VICE_LEADER"]);
const MAX_POPUP_SOCIALS = 6;
const TILE_STAGGER_MS = 30;
const TILE_MAX_DELAY_MS = 900;
const WHITESPACE_RE = /\s+/;
const DIACRITICS_RE = /\p{Diacritic}/gu;

const normalize = (value: string) =>
  value.normalize("NFD").replace(DIACRITICS_RE, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const initialsOf = (fullName: string) => {
  const words = fullName.trim().split(WHITESPACE_RE);
  return `${words[0]?.charAt(0) ?? ""}${words.length > 1 ? (words.at(-1)?.charAt(0) ?? "") : ""}`.toUpperCase();
};

const departmentLabel = (department: { nameVi: string; nameEn: string | null }, locale: string) =>
  locale === "en" && department.nameEn ? department.nameEn : department.nameVi;

const MemberAvatar = ({
  member,
  initials,
  sizes,
  className
}: {
  member: DirectoryMember;
  initials: string;
  sizes: string;
  className?: string;
}) => (
  <span
    className={cn(
      "relative flex items-center justify-center overflow-hidden rounded-full bg-muted font-semibold text-muted-foreground",
      className
    )}
  >
    {member.avatar ? <Image alt='' className='object-cover' fill sizes={sizes} src={member.avatar} /> : initials}
  </span>
);

function useInViewOnce<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView]);

  return { ref, inView };
}

function MemberTile({
  member,
  locale,
  revealed,
  index
}: {
  member: DirectoryMember;
  locale: string;
  revealed: boolean;
  index: number;
}) {
  const t = useTranslations("membersPage");
  const tPos = useTranslations("userMenu.positions");
  const fullName = getFullName(member.firstName, member.middleName, member.lastName, locale);
  const initials = initialsOf(fullName);
  const role = member.currentRole;
  const isLeader = !!role && LEADER_POSITIONS.has(role.position);
  const href = `/members/${member.slug ?? member.id}` as "/";
  const socials = parseSocials(member.socials).slice(0, MAX_POPUP_SOCIALS);

  return (
    <div className='group/tile relative aspect-square transition-opacity duration-200 hover:z-40' data-tile>
      <span
        className={cn("absolute inset-0", revealed ? "motion-safe:animate-member-pop" : "motion-safe:opacity-0")}
        style={revealed ? { animationDelay: `${Math.min(index * TILE_STAGGER_MS, TILE_MAX_DELAY_MS)}ms` } : undefined}
      >
        <Link
          aria-label={fullName}
          className={cn(
            "absolute inset-0 rounded-full ring-offset-2 ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group-hover/tile:scale-105 group-hover/tile:ring-2 group-hover/tile:ring-primary",
            isLeader && "ring-2 ring-primary/60"
          )}
          href={href}
        >
          <MemberAvatar
            className='h-full w-full text-sm sm:text-base'
            initials={initials}
            member={member}
            sizes='96px'
          />
          {isLeader && (
            <span className='absolute top-[6%] right-[6%] h-2.5 w-2.5 rounded-full border-2 border-background bg-primary' />
          )}
        </Link>
      </span>

      <div className='pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 hidden w-80 -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-200 after:absolute after:inset-x-0 after:top-full after:h-5 group-hover/tile:pointer-events-auto group-hover/tile:translate-y-0 group-hover/tile:opacity-100 md:block'>
        <div className='overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl'>
          <div className='flex items-center gap-3 p-4 pb-3'>
            <MemberAvatar className='h-12 w-12 shrink-0 text-sm' initials={initials} member={member} sizes='48px' />
            <div className='min-w-0'>
              <p className='line-clamp-2 font-semibold leading-tight'>{fullName}</p>
              {(member.studentId || member.slug) && (
                <p className='mt-0.5 truncate text-muted-foreground text-xs'>
                  {member.studentId ? `#${member.studentId}` : `@${member.slug}`}
                </p>
              )}
            </div>
          </div>
          {role && (
            <div className='flex flex-wrap gap-1.5 px-4 pb-3'>
              <Badge>{tPos(role.position as Parameters<typeof tPos>[0]) || role.position}</Badge>
              {role.department && <Badge variant='secondary'>{departmentLabel(role.department, locale)}</Badge>}
            </div>
          )}
          <div className='flex flex-wrap items-center gap-1.5 border-t bg-muted/40 px-3 py-2.5'>
            {socials.map((social) => {
              const meta = getSocialMeta(social.platform);
              return (
                <a
                  aria-label={meta.platform}
                  className='flex h-8 w-8 items-center justify-center rounded-full bg-background transition-colors hover:bg-primary/15'
                  href={buildSocialHref(social.url, meta.prefix)}
                  key={social.id || `${social.platform}-${social.url}`}
                  rel='noopener noreferrer'
                  target='_blank'
                  title={meta.platform}
                >
                  <Image alt='' className='h-4 w-4 object-contain' height={16} src={meta.icon} width={16} />
                </a>
              );
            })}
            <Button asChild className='ml-auto h-8' size='sm'>
              <Link href={href}>
                {t("profile")}
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MembersDirectory({ years }: { years: DirectoryYear[] }) {
  const t = useTranslations("membersPage");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState<string>("all");

  const departments = useMemo(() => {
    const map = new Map<string, { id: string; nameVi: string; nameEn: string | null }>();
    for (const { members } of years) {
      for (const m of members) {
        const dept = m.currentRole?.department;
        if (dept && !map.has(dept.id)) {
          map.set(dept.id, dept);
        }
      }
    }
    return [...map.values()].sort((a, b) => departmentLabel(a, locale).localeCompare(departmentLabel(b, locale)));
  }, [years, locale]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return years
      .map(({ year, members }) => ({
        year,
        members: members.filter((m) => {
          if (department !== "all" && m.currentRole?.department?.id !== department) {
            return false;
          }
          if (!q) {
            return true;
          }
          const haystack = normalize(
            `${getFullName(m.firstName, m.middleName, m.lastName, locale)} ${m.slug ?? ""} ${m.studentId ?? ""}`
          );
          return haystack.includes(q);
        })
      }))
      .filter((y) => y.members.length > 0);
  }, [years, query, department, locale]);

  const filterButton = (value: string, label: string) => (
    <Button
      className='shrink-0 rounded-full'
      key={value}
      onClick={() => setDepartment(value)}
      size='sm'
      variant={department === value ? "default" : "outline"}
    >
      {label}
    </Button>
  );

  return (
    <>
      <div className='sticky top-16 z-30 border-b bg-background/85 backdrop-blur-md'>
        <div className='container mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center'>
          <div className='relative w-full lg:w-64'>
            <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              aria-label={t("searchPlaceholder")}
              className='pl-9'
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              type='search'
              value={query}
            />
          </div>
          <div className='-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0 lg:pb-0'>
            {filterButton("all", t("filterAll"))}
            {departments.map((d) => filterButton(d.id, departmentLabel(d, locale)))}
          </div>
          <nav className='hidden gap-3 text-muted-foreground text-sm lg:ml-auto lg:flex'>
            {filtered.map(({ year }) => (
              <a
                aria-label={t("jumpToYear", { year })}
                className='transition-colors hover:text-primary'
                href={`#year-${year}`}
                key={year}
              >
                &apos;{String(year).slice(-2)}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className='container mx-auto max-w-7xl px-4 pt-12'>
        {filtered.length === 0 ? (
          <p className='py-20 text-center text-muted-foreground'>{t("noResults")}</p>
        ) : (
          <div className='flex flex-col gap-14 [&:has([data-tile]:hover)_[data-tile]:not(:hover)]:opacity-40'>
            {filtered.map(({ year, members }, idx) => (
              <YearSection highlight={idx === 0} key={year} locale={locale} members={members} year={year} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function YearSection({
  year,
  members,
  locale,
  highlight
}: {
  year: number;
  members: DirectoryMember[];
  locale: string;
  highlight: boolean;
}) {
  const t = useTranslations("membersPage");
  const { ref, inView } = useInViewOnce<HTMLElement>();

  return (
    <section className='flex scroll-mt-40 flex-col gap-5 md:flex-row md:gap-8' id={`year-${year}`} ref={ref}>
      <div
        className={cn(
          "flex items-baseline gap-3 md:w-28 md:shrink-0 md:flex-col md:gap-1",
          inView ? "motion-safe:animate-fade-in-up" : "motion-safe:opacity-0"
        )}
      >
        <h2 className={cn("font-bold text-3xl md:text-4xl", highlight ? "text-primary" : "text-foreground")}>{year}</h2>
        <p className='text-muted-foreground text-sm'>{t("peopleCount", { count: members.length })}</p>
      </div>
      <div className='grid min-w-0 flex-1 grid-cols-4 gap-3 border-l-0 sm:grid-cols-6 md:border-l md:pl-8 lg:grid-cols-8 xl:grid-cols-10'>
        {members.map((member, index) => (
          <MemberTile index={index} key={member.id} locale={locale} member={member} revealed={inView} />
        ))}
      </div>
    </section>
  );
}
