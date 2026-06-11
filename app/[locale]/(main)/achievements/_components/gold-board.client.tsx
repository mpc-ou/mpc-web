"use client";

import { Trophy } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFullName } from "@/lib/utils";
import { LeaderDetailDialog } from "./leader-detail-dialog";

type GoldBoardMember = {
  member: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    slug: string;
    _count?: { achievementEntries: number; projects: number };
  };
  roles: Array<{
    position: string;
    departmentName: string | null;
  }>;
};

export function GoldBoard({ members, locale }: { members: GoldBoardMember[]; locale: string }) {
  const [selected, setSelected] = useState<GoldBoardMember | null>(null);

  const sorted = [...members].sort(
    (a, b) => (b.member._count?.achievementEntries ?? 0) - (a.member._count?.achievementEntries ?? 0)
  );

  return (
    <>
      <div className='flex flex-wrap justify-center gap-4'>
        {sorted.map((item) => (
          <GoldCard item={item} key={item.member.id} locale={locale} onClick={() => setSelected(item)} />
        ))}
      </div>

      {selected && (
        <LeaderDetailDialog
          leader={{
            member: {
              id: selected.member.id,
              firstName: selected.member.firstName,
              lastName: selected.member.lastName,
              avatar: selected.member.avatar,
              slug: selected.member.slug,
              socials: null,
              coverImage: null,
              _count: {
                achievements: selected.member._count?.achievementEntries ?? 0,
                projects: selected.member._count?.projects ?? 0
              }
            },
            roles: selected.roles.map((r) => ({
              id: `${selected.member.id}-${r.position}`,
              position: r.position,
              startAt: "",
              endAt: null,
              departmentName: r.departmentName
            }))
          }}
          onClose={() => setSelected(null)}
          open={!!selected}
        />
      )}
    </>
  );
}

function GoldCard({ item, locale, onClick }: { item: GoldBoardMember; locale: string; onClick: () => void }) {
  const fullName = getFullName(item.member.firstName, item.member.lastName, locale);
  const initials = `${item.member.firstName[0]}${item.member.lastName[0]}`;
  const achievementCount = item.member._count?.achievementEntries ?? 0;

  return (
    <button
      className='group relative flex w-40 flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]'
      onClick={onClick}
      type='button'
    >
      <div className='relative'>
        <Avatar className='h-16 w-16 border-2 border-background shadow-md ring-2 ring-amber-500/30 transition-all group-hover:ring-amber-500/60'>
          <AvatarImage src={item.member.avatar ?? undefined} />
          <AvatarFallback className='bg-amber-500/10 font-bold text-amber-600'>{initials}</AvatarFallback>
        </Avatar>
        {achievementCount > 0 && (
          <div className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 font-bold text-[10px] text-black shadow-sm'>
            {achievementCount}
          </div>
        )}
      </div>
      <div className='min-w-0'>
        <p className='truncate font-semibold text-sm'>{fullName}</p>
        <div className='mt-1 flex items-center justify-center gap-1.5'>
          {achievementCount > 0 && (
            <span className='flex items-center gap-0.5 text-[11px] text-amber-500'>
              <Trophy className='h-3 w-3' />
              {achievementCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
