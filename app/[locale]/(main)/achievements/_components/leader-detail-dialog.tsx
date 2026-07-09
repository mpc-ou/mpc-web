"use client";

import { FolderGit2, Trophy, X } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { getMemberAchievements } from "@/app/_actions/main";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Link } from "@/configs/i18n/routing";
import { getFullName } from "@/lib/utils";
import { formatLocalDate } from "@/utils/handle-datetime";

type Role = {
  id: string;
  position: string;
  startAt?: string;
  endAt?: string | null;
  departmentName: string | null;
};

type Leader = {
  member: {
    id: string;
    firstName: string;
    middleName?: string | null;
    lastName: string;
    avatar: string | null;
    slug: string;
    socials?: unknown;
    coverImage?: string | null;
    _count?: {
      achievements?: number;
      achievementEntries?: number;
      projects?: number;
    };
  };
  roles: Role[];
};

type Achievement = {
  id: string;
  titleVi: string;
  titleEn: string;
  slug: string;
  summaryVi: string | null;
  summaryEn: string | null;
  thumbnail: string | null;
  achievementDate: Date | null;
  achievementType: string;
  isHighlight: boolean;
};

type Props = {
  leader: Leader;
  open: boolean;
  onClose: () => void;
};

export function LeaderDetailDialog({ leader, open, onClose }: Props) {
  const locale = useLocale();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setLoading(true);
    getMemberAchievements(leader.member.id)
      .then((res) => {
        setAchievements((res?.data?.payload as Achievement[]) ?? []);
      })
      .catch(() => setAchievements([]))
      .finally(() => setLoading(false));
  }, [open, leader.member.id]);

  if (!open) {
    return null;
  }

  const title = (a: Achievement) => (locale === "en" && a.titleEn ? a.titleEn : a.titleVi);
  const summary = (a: Achievement) => (locale === "en" && a.summaryEn ? a.summaryEn : a.summaryVi);
  const fullName = getFullName(leader.member.firstName, leader.member.middleName, leader.member.lastName, locale);
  const topRole = leader.roles[0];
  const achievementCount = leader.member._count?.achievements ?? leader.member._count?.achievementEntries ?? 0;
  const projectCount = leader.member._count?.projects ?? 0;

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/70 backdrop-blur-xs' onClick={onClose} />

      {/* Dialog */}
      <div className='fade-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-5xl animate-in overflow-hidden rounded-2xl border border-border bg-card shadow-2xl duration-200'>
        {/* Close button */}
        <button
          className='absolute top-4 right-4 z-10 rounded-full bg-background/80 p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground'
          onClick={onClose}
        >
          <X className='h-5 w-5' />
        </button>

        {/* ── LEFT: 30% Mini Profile ── */}
        <div className='relative flex w-[35%] shrink-0 flex-col bg-muted/30'>
          {/* Cover image */}
          <div className='relative h-36 w-full overflow-hidden bg-muted'>
            {leader.member.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt='' className='absolute inset-0 h-full w-full object-cover' src={leader.member.coverImage} />
            ) : (
              <div className='absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/10' />
            )}
            <div className='absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent' />
          </div>

          {/* Avatar */}
          <div className='-mt-12 flex justify-center'>
            <div className='relative h-24 w-24 overflow-hidden rounded-full border-4 border-card bg-muted shadow-lg'>
              {leader.member.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={fullName} className='h-full w-full object-cover' src={leader.member.avatar} />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-primary/10 font-bold text-2xl text-primary'>
                  {leader.member.firstName[0]}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className='flex flex-1 flex-col items-center gap-3 px-5 pb-6 text-center'>
            <div>
              <h2 className='font-bold text-lg'>{fullName}</h2>
              {topRole && (
                <p className='mt-1 font-medium text-muted-foreground text-xs'>
                  {topRole.departmentName ? `${topRole.position} — ${topRole.departmentName}` : topRole.position}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className='flex gap-4'>
              <div className='flex flex-col items-center gap-1 rounded-xl bg-background px-4 py-2'>
                <Trophy className='h-4 w-4 text-yellow-500' />
                <span className='font-bold text-lg'>{achievementCount}</span>
                <span className='text-muted-foreground text-xs'>Thành tựu</span>
              </div>
              <div className='flex flex-col items-center gap-1 rounded-xl bg-background px-4 py-2'>
                <FolderGit2 className='h-4 w-4 text-blue-500' />
                <span className='font-bold text-lg'>{projectCount}</span>
                <span className='text-muted-foreground text-xs'>Dự án</span>
              </div>
            </div>

            {/* Roles timeline */}
            {leader.roles.length > 0 && (
              <div className='mt-2 w-full space-y-2 text-left'>
                <p className='font-semibold text-muted-foreground text-xs uppercase tracking-wider'>Lịch sử chức vụ</p>
                {leader.roles
                  .filter((r) => r.startAt)
                  .map((role) => {
                    const startYear = new Date(role.startAt!).getFullYear();
                    const endYear = role.endAt ? new Date(role.endAt).getFullYear() : "Nay";
                    return (
                      <div className='border-muted-foreground/20 border-l-2 py-0.5 pl-3' key={role.id}>
                        <p className='font-medium text-sm'>{role.departmentName || role.position}</p>
                        <p className='text-muted-foreground text-xs'>
                          {startYear} — {endYear}
                        </p>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* View full profile link */}
            <Link
              className='mt-auto inline-flex items-center gap-1 pt-4 font-medium text-primary text-sm hover:underline'
              href={`/members/${leader.member.slug}`}
            >
              Xem hồ sơ đầy đủ →
            </Link>
          </div>
        </div>

        {/* ── RIGHT: 70% Achievements List ── */}
        <div className='flex flex-1 flex-col overflow-hidden'>
          <div className='border-border border-b px-6 py-4'>
            <h3 className='font-semibold text-lg'>Thành tựu ({achievements.length})</h3>
          </div>

          <div className='flex-1 overflow-y-auto px-6 py-4'>
            {loading ? (
              <div className='flex items-center justify-center py-20'>
                <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
              </div>
            ) : achievements.length === 0 ? (
              <p className='py-20 text-center text-muted-foreground'>Chưa có thành tựu nào.</p>
            ) : (
              <div className='space-y-4'>
                {achievements.map((a, i) => (
                  <ScrollReveal className='w-full' delay={i * 50} key={a.id} variant='fade-up'>
                    <Link
                      className='group flex gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/30 hover:shadow-sm'
                      href={`/achievements/${a.slug}`}
                    >
                      {/* Thumbnail */}
                      <div className='relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-muted'>
                        {a.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img alt='' className='absolute inset-0 h-full w-full object-cover' src={a.thumbnail} />
                        ) : (
                          <div className='flex h-full w-full items-center justify-center'>
                            <Trophy className='h-8 w-8 text-muted-foreground/30' />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className='flex min-w-0 flex-1 flex-col justify-center'>
                        <div className='mb-1 flex items-center gap-2'>
                          <h4 className='truncate font-semibold transition-colors group-hover:text-primary'>
                            {title(a)}
                          </h4>
                          {a.isHighlight && (
                            <Badge className='shrink-0 bg-yellow-500 text-black hover:bg-yellow-400'>★</Badge>
                          )}
                        </div>
                        {summary(a) && (
                          <p className='line-clamp-2 text-muted-foreground text-sm leading-relaxed'>{summary(a)}</p>
                        )}
                        <div className='mt-1.5 flex items-center gap-3 text-muted-foreground text-xs'>
                          <Badge variant='secondary'>{a.achievementType}</Badge>
                          {a.achievementDate && <span>{formatLocalDate(a.achievementDate, locale, "MM/yyyy")}</span>}
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
