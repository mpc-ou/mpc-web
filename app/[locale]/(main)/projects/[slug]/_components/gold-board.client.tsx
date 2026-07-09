"use client";

import { Award, ExternalLink, Trophy } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "@/configs/i18n/routing";
import { getFullName } from "@/lib/utils";
import { formatLocalDate } from "@/utils/handle-datetime";

// ── Types ──

type AchievementEntry = {
  id: string;
  titleVi: string;
  titleEn?: string;
  achievementDate?: string | null;
  achievementType?: string | null;
  slug: string;
  thumbnail?: string | null;
};

type GoldMember = {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  avatar: string | null;
  slug: string;
  _count: { achievementEntries: number; projects: number };
  clubRoles: {
    position: string;
    department: { nameVi: string } | null;
  }[];
  achievementEntries: {
    post: AchievementEntry;
  }[];
};

// ── Labels ──

const POSITION_LABELS: Record<string, string> = {
  PRESIDENT: "Chủ nhiệm",
  VICE_PRESIDENT: "Phó chủ nhiệm",
  DEPARTMENT_LEADER: "Trưởng ban",
  DEPARTMENT_VICE_LEADER: "Phó ban",
  DEPARTMENT_MEMBER: "Thành viên ban",
  COLLABORATOR: "Cộng tác viên",
  ADVISOR: "Cố vấn"
};

// ── Gold board section ──

export function GoldBoardSection({
  members,
  locale,
  labels
}: {
  members: GoldMember[];
  locale: string;
  labels: {
    badge: string;
    title: string;
    subtitle: string;
    modalTitle: string;
    noAchievements: string;
    viewProfile: string;
  };
}) {
  const sorted = [...members]
    .filter((m) => m._count.achievementEntries > 0)
    .sort((a, b) => b._count.achievementEntries - a._count.achievementEntries);

  if (sorted.length === 0) {
    return null;
  }

  return (
    <section className='w-full bg-muted/30 py-20'>
      <div className='container mx-auto px-4'>
        {/* ── Header ── */}
        <div className='mb-12 text-center'>
          <span className='inline-flex rounded-full bg-amber-500/10 px-3 py-1 font-medium font-mono text-amber-500 text-sm'>
            &gt; {labels.badge}
          </span>
          <h2 className='mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl'>{labels.title}</h2>
          <p className='mx-auto mt-3 max-w-2xl text-muted-foreground'>{labels.subtitle}</p>
        </div>

        {/* ── Grid ── */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {sorted.map((m, idx) => (
            <GoldCard idx={idx} key={m.id} labels={labels} locale={locale} member={m} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Gold Card ──

function GoldCard({
  idx,
  locale,
  member,
  labels
}: {
  idx: number;
  locale: string;
  member: GoldMember;
  labels: {
    modalTitle: string;
    noAchievements: string;
    viewProfile: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const fullName = getFullName(member.firstName, member.middleName, member.lastName, locale);
  const initials = `${member.firstName[0]}${member.lastName[0]}`;
  const achievementCount = member._count.achievementEntries;
  const projectCount = member._count.projects;
  const activeRole = member.clubRoles[0];
  const roleLabel = activeRole ? (POSITION_LABELS[activeRole.position] ?? activeRole.position) : null;

  const medalColors = [
    "bg-amber-500 text-white shadow-amber-500/30",
    "bg-slate-400 text-white shadow-slate-400/20",
    "bg-amber-700 text-white shadow-amber-700/20"
  ];

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className='group relative cursor-pointer rounded-2xl border border-border bg-card p-5 text-center transition-all hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-lg'
        onClick={() => setOpen(true)}
      >
        {/* Rank badge */}
        {idx < 3 && (
          <div
            className={`absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full font-bold text-xs shadow-lg ${medalColors[idx]}`}
          >
            {idx + 1}
          </div>
        )}

        <Avatar className='mx-auto h-20 w-20 ring-2 ring-border transition-all group-hover:ring-amber-500/50'>
          <AvatarImage src={member.avatar ?? undefined} />
          <AvatarFallback className='bg-muted font-bold text-lg'>{initials}</AvatarFallback>
        </Avatar>

        <h3 className='mt-3 font-bold text-foreground text-sm transition-colors group-hover:text-amber-600'>
          {fullName}
        </h3>
        {roleLabel && <p className='mt-0.5 text-muted-foreground text-xs'>{roleLabel}</p>}

        <div className='mt-3 flex items-center justify-center gap-3 border-border border-t pt-3'>
          <div className='flex items-center gap-1'>
            <Trophy className='h-3.5 w-3.5 text-amber-500' />
            <span className='font-bold text-sm'>{achievementCount}</span>
          </div>
          <div className='flex items-center gap-1'>
            <Award className='h-3.5 w-3.5 text-primary/60' />
            <span className='font-bold text-sm'>{projectCount}</span>
          </div>
        </div>
      </div>

      {/* ── Achievement Modal ── */}
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className='max-h-[80vh] max-w-lg overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              {labels.modalTitle} {fullName}
            </DialogTitle>
          </DialogHeader>

          {member.achievementEntries.length === 0 ? (
            <p className='py-8 text-center text-muted-foreground text-sm'>{labels.noAchievements}</p>
          ) : (
            <div className='space-y-3'>
              {/* biome-ignore lint/suspicious/noExplicitAny: API shape */}
              {member.achievementEntries.map((entry: any) => {
                const title = locale === "en" && entry.post.titleEn ? entry.post.titleEn : entry.post.titleVi;
                return (
                  <Link
                    className='-mx-2 flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50'
                    href={`/achievements/${entry.post.slug}`}
                    key={entry.post.id}
                  >
                    {entry.post.thumbnail ? (
                      // biome-ignore lint/performance/noImgElement: external
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt='' className='h-14 w-14 shrink-0 rounded-lg object-cover' src={entry.post.thumbnail} />
                    ) : (
                      <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted'>
                        <Trophy className='h-5 w-5 text-muted-foreground/50' />
                      </div>
                    )}
                    <div className='min-w-0 flex-1'>
                      <p className='font-medium text-sm'>{title}</p>
                      {entry.post.achievementDate && (
                        <p className='mt-0.5 text-muted-foreground text-xs'>
                          {formatLocalDate(entry.post.achievementDate, locale)}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className='mt-4 border-border border-t pt-4'>
            <Button asChild className='w-full' variant='outline'>
              <Link href={`/members/${member.slug || member.id}`}>
                <ExternalLink className='mr-2 h-4 w-4' />
                {labels.viewProfile}
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
