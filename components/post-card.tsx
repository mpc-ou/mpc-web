"use client";

import { ArrowRight, CalendarDays, Code2, Image as ImageIcon, Trophy, User, Users } from "lucide-react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/configs/i18n/routing";
import { formatLocalDate } from "@/utils/handle-datetime";

// ── Types ──

export type PostCardData = {
  id: string;
  slug: string;
  /** Card variant: blog | event | achievement | project */
  variant: "blog" | "event" | "achievement" | "project";
  /** View mode */
  viewMode?: "card" | "list";
  // -- Title --
  titleVi: string;
  titleEn?: string | null;
  // -- Summary / description --
  summaryVi?: string | null;
  summaryEn?: string | null;
  // -- Thumbnail --
  thumbnail?: string | null;
  // -- Date --
  date?: string | Date | null;
  dateLabel?: string | null;
  // -- Date range (project only) --
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  // -- Tags (blog only) --
  tags?: { nameVi: string; nameEn: string }[];
  // -- Author (blog only) --
  author?: {
    firstName: string;
    lastName: string;
    avatar?: string | null;
    slug?: string | null;
  };
  // -- Status badge (event only) --
  statusBadge?: {
    label: string;
    variant: "default" | "secondary" | "outline";
  };
  // -- Event type badge (event only) --
  eventTypeBadge?: string | null;
  // -- Achievement: isHighlight --
  isHighlight?: boolean;
  // -- Achievement: type icon --
  achievementType?: "INDIVIDUAL" | "TEAM" | "COLLECTIVE" | null;
  // -- Achievement: member avatars --
  members?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  }[];
  // -- Project: technologies --
  technologies?: string[];
  // -- Project/Profile: member role --
  memberRole?: string | null;
  // -- Project: contributors/members --
  contributors?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
    slug?: string | null;
  }[];
  // -- Link href override --
  href?: string;
  // -- Read more label override --
  readMoreLabel?: string;
};

// ── Helpers ──

const ACHIEVEMENT_TYPE_LABEL: Record<string, string> = {
  INDIVIDUAL: "Cá nhân",
  TEAM: "Đội",
  COLLECTIVE: "Tập thể"
};

/** Get localized title */
function getTitle(d: PostCardData, locale: string): string {
  return locale === "en" && d.titleEn ? d.titleEn : d.titleVi;
}

/** Get localized summary */
function getSummary(d: PostCardData, locale: string): string | undefined {
  const s = locale === "en" && d.summaryEn ? d.summaryEn : d.summaryVi;
  return s ?? undefined;
}

/** Format date string */
function fmtDate(d: PostCardData, locale: string, fmt?: string): string {
  const raw = d.date;
  if (!raw) {
    return "";
  }
  try {
    return formatLocalDate(raw, locale, fmt);
  } catch {
    return "";
  }
}

// ── Sub-components ──

function CardThumbnail({ data }: { data: PostCardData }) {
  const title = getTitle(data, "vi");
  return (
    <div className='relative aspect-video w-full overflow-hidden bg-muted/30'>
      {data.thumbnail ? (
        <Image
          alt={title}
          className='object-cover transition-transform duration-500 group-hover:scale-105'
          fill
          sizes='(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw'
          src={data.thumbnail}
        />
      ) : (
        <div className='flex h-full w-full items-center justify-center text-muted-foreground/30'>
          <ThumbnailPlaceholder data={data} />
        </div>
      )}
      <ThumbnailOverlays data={data} />
    </div>
  );
}

function ThumbnailPlaceholder({ data }: { data: PostCardData }) {
  switch (data.variant) {
    case "achievement":
      return <Trophy className='h-12 w-12 opacity-50' />;
    case "project":
      return <Code2 className='h-12 w-12 opacity-50' />;
    default:
      return <ImageIcon className='h-12 w-12 opacity-50' />;
  }
}

function ThumbnailOverlays({ data }: { data: PostCardData }) {
  return (
    <div className='absolute top-3 left-3 flex flex-wrap gap-2 pr-3'>
      {/* Blog tags */}
      {data.variant === "blog" &&
        data.tags?.slice(0, 2).map((t) => (
          <Badge
            className='bg-background/80 text-foreground shadow-xs backdrop-blur-md hover:bg-background/90'
            key={t.nameVi}
            variant='secondary'
          >
            <TagLabel tag={t} />
          </Badge>
        ))}
      {/* Event status */}
      {data.variant === "event" && data.statusBadge && (
        <Badge className='bg-background/80 shadow-xs backdrop-blur-md' variant={data.statusBadge.variant}>
          {data.statusBadge.label}
        </Badge>
      )}
      {/* Event type */}
      {data.variant === "event" && data.eventTypeBadge && (
        <Badge
          className='bg-background/80 text-foreground shadow-xs backdrop-blur-md hover:bg-background/90'
          variant='secondary'
        >
          {data.eventTypeBadge}
        </Badge>
      )}
      {/* Achievement highlight */}
      {data.variant === "achievement" && data.isHighlight && (
        <Badge className='bg-yellow-500 text-black hover:bg-yellow-400'>⭐ Nổi bật</Badge>
      )}
    </div>
  );
}

function TagLabel({ tag }: { tag: { nameVi: string; nameEn: string } }) {
  const locale = useLocale();
  return <>{locale === "en" ? tag.nameEn : tag.nameVi}</>;
}

// ── Card content ──

function CardContent({ data }: { data: PostCardData }) {
  const locale = useLocale();
  const title = getTitle(data, locale);
  const summary = getSummary(data, locale);
  const dateStr = fmtDate(data, locale, data.dateLabel ?? undefined);

  return (
    <div className='flex grow flex-col p-5'>
      {renderMeta(data, locale, dateStr)}
      <h3 className='mb-2 line-clamp-2 font-bold text-lg leading-snug transition-colors group-hover:text-primary'>
        {title}
      </h3>
      {summary && <p className='mb-4 line-clamp-2 flex-1 text-muted-foreground text-sm leading-relaxed'>{summary}</p>}
      {renderFooter(data, locale)}
    </div>
  );
}

function renderMeta(data: PostCardData, locale: string, dateStr: string): React.ReactNode {
  // Blog: author + date
  if (data.variant === "blog") {
    return (
      <div className='mb-3 flex items-center justify-between text-muted-foreground text-xs'>
        <div className='flex items-center gap-2'>
          {data.author?.avatar ? (
            <Image
              alt={`${data.author.lastName} ${data.author.firstName}`}
              className='rounded-full object-cover ring-1 ring-border'
              height={24}
              src={data.author.avatar}
              width={24}
            />
          ) : (
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-muted'>
              <User className='h-3.5 w-3.5 text-muted-foreground' />
            </div>
          )}
          <span className='relative z-10 font-medium text-foreground/80 hover:text-primary hover:underline'>
            {data.author ? (
              <Link href={`/members/${data.author.slug || data.author.firstName}`}>
                {data.author.lastName} {data.author.firstName}
              </Link>
            ) : null}
          </span>
        </div>
        <div className='flex items-center gap-1 font-medium'>
          <CalendarDays className='h-3.5 w-3.5' />
          <span>{dateStr}</span>
        </div>
      </div>
    );
  }

  // Achievement: date + type icon
  if (data.variant === "achievement") {
    return (
      <div className='mb-3 flex items-center gap-2 text-muted-foreground text-xs'>
        <span className='flex items-center gap-1'>
          <CalendarDays className='h-3.5 w-3.5' />
          {dateStr}
        </span>
        {data.achievementType && (
          <span className='flex items-center gap-1 border-border border-l pl-2'>
            {data.achievementType === "INDIVIDUAL" ? (
              <User className='h-3.5 w-3.5' />
            ) : (
              <Users className='h-3.5 w-3.5' />
            )}
            {ACHIEVEMENT_TYPE_LABEL[data.achievementType] ?? "Tập thể"}
          </span>
        )}
      </div>
    );
  }

  // Event: date only
  if (data.variant === "event" && dateStr) {
    return (
      <div className='mb-3 flex items-center gap-2 font-medium text-muted-foreground text-xs'>
        <CalendarDays className='h-3.5 w-3.5' />
        <span>{dateStr}</span>
      </div>
    );
  }

  // Project: date range + contributors
  if (data.variant === "project") {
    const start = data.startDate ? formatLocalDate(data.startDate, locale, "MM/yyyy") : null;
    const end = data.endDate ? formatLocalDate(data.endDate, locale, "MM/yyyy") : null;
    const hasDate = start || end;

    return (
      <div className='mb-3 flex items-center justify-between gap-2'>
        {hasDate ? (
          <div className='flex items-center gap-1.5 font-medium text-muted-foreground text-xs'>
            <CalendarDays className='h-3.5 w-3.5' />
            <span>
              {start || "..."} — {end || "..."}
            </span>
          </div>
        ) : (
          <div />
        )}
        {data.contributors && data.contributors.length > 0 && (
          <div className='flex -space-x-2'>
            {data.contributors.slice(0, 4).map((c, idx) => (
              <div
                className='relative flex h-6 w-6 shrink-0 overflow-hidden rounded-full border-2 border-background bg-muted'
                key={c.id}
                style={{ zIndex: 10 - idx }}
                title={`${c.lastName} ${c.firstName}`}
              >
                {c.avatar ? (
                  <Image
                    alt={`${c.lastName} ${c.firstName}`}
                    className='object-cover'
                    fill
                    sizes='24px'
                    src={c.avatar}
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center font-bold text-[9px] text-muted-foreground uppercase'>
                    {c.firstName[0]}
                  </div>
                )}
              </div>
            ))}
            {data.contributors.length > 4 && (
              <div className='relative z-0 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted'>
                <span className='font-medium text-[9px] text-muted-foreground'>+{data.contributors.length - 4}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}

function renderFooter(data: PostCardData, locale: string): React.ReactNode {
  // Achievement: member avatars
  if (data.variant === "achievement" && data.members?.length) {
    return (
      <div className='mt-4 flex items-center border-border border-t pt-4'>
        <div className='flex -space-x-3'>
          {data.members.slice(0, 5).map((m, idx) => (
            <div
              className='relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 border-background bg-muted shadow-sm'
              key={m.id}
              style={{ zIndex: 10 - idx }}
              title={`${m.lastName} ${m.firstName}`}
            >
              {m.avatar ? (
                <Image alt={`${m.lastName} ${m.firstName}`} className='object-cover' fill sizes='32px' src={m.avatar} />
              ) : (
                <div className='flex h-full w-full items-center justify-center font-bold text-[10px] text-muted-foreground uppercase'>
                  {m.firstName[0]}
                </div>
              )}
            </div>
          ))}
          {data.members.length > 5 && (
            <div className='relative z-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted shadow-sm'>
              <span className='font-medium text-[10px] text-muted-foreground'>+{data.members.length - 5}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Project: role + technologies
  if (data.variant === "project") {
    return (
      <div className='mt-auto space-y-3'>
        {data.memberRole && (
          <div className='flex items-center gap-2'>
            <span className='rounded-md bg-primary/10 px-2.5 py-1 font-semibold text-primary text-xs'>
              {data.memberRole}
            </span>
          </div>
        )}
        {data.technologies && data.technologies.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {data.technologies.slice(0, 3).map((t) => (
              <Badge className='px-1.5 font-normal text-[10px]' key={t} variant='secondary'>
                {t}
              </Badge>
            ))}
            {data.technologies.length > 3 && (
              <Badge className='px-1.5 font-normal text-[10px]' variant='outline'>
                +{data.technologies.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  }

  // Blog / Event: read more link
  if (data.variant === "blog" || data.variant === "event") {
    return (
      <div className='mt-auto flex items-center border-border/10 border-t pt-4 font-semibold text-primary text-sm'>
        <span className='inline-flex items-center group-hover:underline'>
          {data.readMoreLabel || "Xem thêm"}
          <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
        </span>
      </div>
    );
  }

  // Profile posts: date at bottom
  if (data.date && (data.variant as string) === "blog" && !data.author) {
    const dateStr = fmtDate(data, locale);
    return dateStr ? <p className='mt-auto pt-4 font-mono text-muted-foreground text-xs'>{dateStr}</p> : null;
  }

  return null;
}

// ── Main component ──

export function PostCard({ data }: { data: PostCardData }) {
  const isList = data.viewMode === "list";
  const href = data.href || `/${data.variant}s/${data.slug}`;
  const baseClass =
    "group relative flex overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg";

  // The card links out to `href` via a "stretched link" that covers the whole
  // card (z-0), so it can never itself contain other <a> tags — any nested
  // links (author, read-more, ...) sit above it at z-10 and stay clickable.
  const stretchedLink = <Link aria-label={getTitle(data, "vi")} className='absolute inset-0 z-0' href={href} />;

  if (isList) {
    return (
      <div className={`${baseClass} flex-row`}>
        {stretchedLink}
        {/* Thumbnail — fixed width */}
        <div className='relative w-48 shrink-0 overflow-hidden bg-muted/30 sm:w-64'>
          {data.thumbnail ? (
            <Image
              alt={getTitle(data, "vi")}
              className='object-cover transition-transform duration-500 group-hover:scale-105'
              fill
              sizes='(min-width: 640px) 256px, 192px'
              src={data.thumbnail}
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center text-muted-foreground/30'>
              <ThumbnailPlaceholder data={data} />
            </div>
          )}
        </div>
        <CardContent data={data} />
      </div>
    );
  }

  // Card mode
  return (
    <div className={`${baseClass} flex-col`}>
      {stretchedLink}
      <CardThumbnail data={data} />
      <CardContent data={data} />
    </div>
  );
}
