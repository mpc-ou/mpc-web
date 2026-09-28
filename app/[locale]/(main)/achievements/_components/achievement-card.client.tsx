"use client";

import { Trophy } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/configs/i18n/routing";
import { formatLocalDate } from "@/utils/handle-datetime";
import { HonoreeAvatar, initialsOf } from "./honoree-avatar";
import type { AchievementPost } from "./types";

const TYPE_KEY: Record<string, "individual" | "team" | "club"> = {
  INDIVIDUAL: "individual",
  TEAM: "team",
  CLUB: "club"
};

export function AchievementCard({ post }: { post: AchievementPost }) {
  const t = useTranslations("achievements");
  const locale = useLocale();
  const typeKey = TYPE_KEY[post.type];
  const shown = post.members.slice(0, 3);

  return (
    <Link
      className='group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-border bg-card transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-primary hover:shadow-[0_24px_50px_-22px_rgba(249,115,22,0.55)]'
      href={`/achievements/${post.slug}`}
    >
      <div className='relative aspect-video overflow-hidden bg-muted'>
        {post.thumbnail ? (
          <Image
            alt={post.title}
            className='object-cover transition-transform duration-700 ease-out group-hover:scale-110'
            fill
            sizes='(min-width: 1280px) 300px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
            src={post.thumbnail}
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-amber-400/10 to-transparent'>
            <Trophy className='h-12 w-12 text-primary/40' />
          </div>
        )}
        <span className='pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-ach-sheen' />
        {post.isHighlight && (
          <span className='absolute top-3 left-3 rounded-md bg-primary px-2 py-1 font-bold font-mono text-[11px] text-primary-foreground shadow-md'>
            {t("board.featured")}
          </span>
        )}
      </div>

      <div className='flex flex-1 flex-col gap-2.5 p-[18px]'>
        <p className='font-medium font-mono text-muted-foreground text-xs'>
          {[post.date ? formatLocalDate(post.date, locale) : null, typeKey ? t(typeKey).toLowerCase() : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <h3 className='line-clamp-2 text-pretty font-extrabold text-[17px] leading-snug transition-colors group-hover:text-primary'>
          {post.title}
        </h3>
        {post.members.length > 0 && (
          <div className='mt-auto flex items-center justify-between border-border border-t pt-3'>
            <div className='flex -space-x-1.5'>
              {shown.map((m) => (
                <HonoreeAvatar
                  className='h-7 w-7 rounded-full border-2 border-card text-[10px] transition-transform duration-300 group-hover:translate-x-0.5'
                  initials={initialsOf(m.firstName, m.lastName)}
                  key={m.id}
                  name={`${m.lastName} ${m.firstName}`}
                  sizes='28px'
                  src={m.avatar}
                />
              ))}
            </div>
            <span className='font-medium font-mono text-muted-foreground text-xs'>
              {t("board.peopleCount", { count: post.members.length })}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
