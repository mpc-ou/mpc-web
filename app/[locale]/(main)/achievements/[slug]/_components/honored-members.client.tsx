"use client";

import { Trophy, User, X, ZoomIn } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/configs/i18n/routing";
import { getFullName } from "@/lib/utils";
import { getDiceBearUrl } from "@/utils/dicebear-avatar";

type MemberDetail = {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  slug: string | null;
};

type AchievementMember = {
  id: string;
  postId: string;
  memberId: string;
  role: string | null;
  prize: string | null;
  imageUrl: string | null;
  member: MemberDetail;
};

type Props = {
  members: AchievementMember[];
  locale: string;
};

export function HonoredMembers({ members, locale }: Props) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (!members || members.length === 0) {
    return null;
  }

  return (
    <div className='mt-12 space-y-6 rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.03] to-transparent p-6 sm:p-8'>
      <div className='flex items-center gap-3 border-border border-b pb-4'>
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 shadow-inner'>
          <Trophy className='h-5 w-5 animate-pulse' />
        </div>
        <div>
          <h2 className='font-black text-foreground text-xl uppercase tracking-tight sm:text-2xl'>
            Thành viên được vinh danh
          </h2>
          <p className='text-muted-foreground text-xs'>
            Ghi nhận đóng góp xuất sắc của các thành viên trong thành tựu này
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3'>
        {members.map((m) => {
          const avatarSrc = m.member.avatar || getDiceBearUrl(m.member.id);
          const honorImg = m.imageUrl;

          return (
            <div
              className='group relative flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-amber-500/5 hover:shadow-md'
              key={m.id}
            >
              {/* Honor Image Holder */}
              <div className='relative aspect-4/3 w-full overflow-hidden bg-muted'>
                {honorImg ? (
                  <>
                    {/* biome-ignore lint/performance/noImgElement: honor photo */}
                    <img
                      alt={getFullName(m.member.firstName, m.member.lastName, locale)}
                      className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                      src={honorImg}
                    />
                    <div className='absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                      <button
                        className='flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-white/90 text-slate-900 opacity-0 shadow-lg transition-all duration-300 hover:bg-white group-hover:scale-100 group-hover:opacity-100'
                        onClick={() => setActiveImage(honorImg)}
                        title='Phóng to ảnh'
                        type='button'
                      >
                        <ZoomIn className='h-5 w-5' />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className='flex h-full w-full flex-col items-center justify-center bg-muted/40 p-4 text-center'>
                    <Trophy className='mb-2 h-10 w-10 text-amber-500/20' />
                    <span className='font-medium text-muted-foreground/60 text-xs'>Chưa có hình ảnh vinh danh</span>
                  </div>
                )}
                {/* Prize Badge Overlay */}
                {m.prize && (
                  <div className='absolute top-3 right-3 z-10'>
                    <Badge className='flex items-center gap-1 border-none bg-amber-500 px-2 py-0.5 font-bold text-[10px] text-white uppercase tracking-wide shadow-md'>
                      <Trophy className='h-2.5 w-2.5 shrink-0' />
                      {m.prize}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Card Footer: Member details */}
              <div className='flex flex-1 flex-col justify-between border-border/60 border-t bg-muted/10 p-4'>
                <div className='flex items-center gap-3'>
                  {/* Avatar link */}
                  <Link
                    className='relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-amber-500/20 transition-all group-hover:ring-amber-500/40'
                    href={`/members/${m.member.slug || m.member.id}` as "/"}
                  >
                    {/* biome-ignore lint/performance/noImgElement: avatar */}
                    <img
                      alt={getFullName(m.member.firstName, m.member.lastName, locale)}
                      className='h-full w-full object-cover'
                      src={avatarSrc}
                    />
                  </Link>
                  <div className='min-w-0 flex-1'>
                    <Link
                      className='block truncate font-bold text-foreground text-sm transition-colors hover:text-amber-500'
                      href={`/members/${m.member.slug || m.member.id}` as "/"}
                    >
                      {getFullName(m.member.firstName, m.member.lastName, locale)}
                    </Link>
                    {m.role && <p className='mt-0.5 truncate font-medium text-muted-foreground text-xs'>{m.role}</p>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox / Zoom Modal */}
      {activeImage && (
        <div
          className='fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/90 p-4 backdrop-blur-xs transition-all duration-300'
          onClick={() => setActiveImage(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setActiveImage(null);
            }
          }}
        >
          <button
            aria-label='Close'
            className='absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20'
            onClick={() => setActiveImage(null)}
            type='button'
          >
            <X className='h-6 w-6' />
          </button>
          <div className='relative max-h-full max-w-full overflow-hidden' onClick={(e) => e.stopPropagation()}>
            {/* biome-ignore lint/performance/noImgElement: lightbox */}
            <img
              alt='Zoomed Honor'
              className='max-h-[85vh] max-w-[95vw] animate-zoom-in select-none rounded-lg object-contain shadow-2xl'
              src={activeImage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
