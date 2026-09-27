"use client";

import { Trophy, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ImageLightbox } from "@/components/image-lightbox.client";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/configs/i18n/routing";
import { getFullName } from "@/lib/utils";
import { getDiceBearUrl } from "@/utils/dicebear-avatar";

type MemberDetail = {
  id: string;
  firstName: string;
  middleName?: string | null;
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
  const t = useTranslations("achievements");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const honorImages = (members ?? [])
    .filter((m) => m.imageUrl)
    .map((m) => ({
      url: m.imageUrl as string,
      title: getFullName(m.member.firstName, m.member.middleName, m.member.lastName, locale),
      caption: [m.role, m.prize].filter(Boolean).join(" · ") || null
    }));

  if (!members || members.length === 0) {
    return null;
  }

  return (
    <div className='space-y-4'>
      <h3 className='font-bold text-muted-foreground text-xs uppercase tracking-wider'>
        {t("honoredMembers")} ({members.length})
      </h3>

      <div className='flex flex-col gap-3'>
        {members.map((m) => {
          const avatarSrc = m.member.avatar || getDiceBearUrl(m.member.id);
          const honorImg = m.imageUrl;

          return (
            <div
              className='group overflow-hidden rounded-lg border bg-card shadow-xs transition-all hover:border-amber-500/40 hover:shadow-md'
              key={m.id}
            >
              {/* Honor Image - full width */}
              <div className='relative w-full overflow-hidden bg-muted'>
                {honorImg ? (
                  <>
                    <div className='relative aspect-4/3 w-full'>
                      <Image
                        alt={getFullName(m.member.firstName, m.member.middleName, m.member.lastName, locale)}
                        className='object-cover transition-transform duration-500 group-hover:scale-105'
                        fill
                        sizes='(min-width: 768px) 33vw, 100vw'
                        src={honorImg}
                      />
                    </div>
                    <button
                      className='absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100'
                      onClick={() => setActiveIndex(honorImages.findIndex((img) => img.url === honorImg))}
                      type='button'
                    >
                      <ZoomIn className='h-8 w-8 rounded-full bg-white/90 p-1.5 text-slate-900 shadow-lg' />
                    </button>
                  </>
                ) : (
                  <div className='flex aspect-4/3 w-full flex-col items-center justify-center bg-muted/40'>
                    <Trophy className='mb-1 h-8 w-8 text-amber-500/20' />
                  </div>
                )}
                {/* Prize Badge */}
                {m.prize && (
                  <div className='absolute top-2 right-2 z-10'>
                    <Badge className='flex items-center gap-1 border-none bg-amber-500 px-2 py-0.5 font-bold text-[10px] text-white shadow-md'>
                      <Trophy className='h-2.5 w-2.5 shrink-0' />
                      {m.prize}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Member info */}
              <div className='flex items-center gap-3 p-3'>
                <Link
                  className='relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-amber-500/20 transition-all group-hover:ring-amber-500/40'
                  href={`/members/${m.member.slug || m.member.id}` as "/"}
                >
                  <Image
                    alt={getFullName(m.member.firstName, m.member.middleName, m.member.lastName, locale)}
                    className='object-cover'
                    fill
                    sizes='36px'
                    src={avatarSrc}
                  />
                </Link>
                <div className='min-w-0 flex-1'>
                  <Link
                    className='block truncate font-semibold text-foreground text-sm transition-colors hover:text-amber-500'
                    href={`/members/${m.member.slug || m.member.id}` as "/"}
                  >
                    {getFullName(m.member.firstName, m.member.middleName, m.member.lastName, locale)}
                  </Link>
                  {m.role && <p className='truncate text-muted-foreground text-xs'>{m.role}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ImageLightbox
        images={honorImages}
        initialIndex={activeIndex ?? 0}
        onClose={() => setActiveIndex(null)}
        open={activeIndex !== null}
        title={t("honoredMembers")}
      />
    </div>
  );
}
