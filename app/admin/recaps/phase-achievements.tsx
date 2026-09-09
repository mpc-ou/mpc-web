"use client";

import { CalendarDays, CheckSquare, Square, Trophy } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatLocalDate } from "@/utils/handle-datetime";

type AchievementCandidate = {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  summary: string | null;
  date: string;
  type: string;
};

type Props = {
  achievements: AchievementCandidate[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

const typeBadge: Record<string, string> = {
  INDIVIDUAL: "Cá nhân",
  TEAM: "Nhóm",
  CLUB: "CLB"
};

export function PhaseAchievements({ achievements, selectedIds, onChange }: Props) {
  const locale = "vi";
  const allSelected = achievements.length > 0 && selectedIds.length === achievements.length;

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]);
  };

  const toggleAll = () => {
    onChange(allSelected ? [] : achievements.map((a) => a.id));
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='font-semibold text-xl'>Chọn thành tựu</h2>
          <p className='text-muted-foreground text-sm'>
            Đã chọn {selectedIds.length} / {achievements.length} thành tựu trong năm
          </p>
        </div>
        <Button onClick={toggleAll} size='sm' variant='outline'>
          {allSelected ? (
            <>
              <Square className='mr-2 h-4 w-4' /> Bỏ chọn tất cả
            </>
          ) : (
            <>
              <CheckSquare className='mr-2 h-4 w-4' /> Chọn tất cả
            </>
          )}
        </Button>
      </div>

      {achievements.length === 0 ? (
        <div className='rounded-lg border border-dashed py-12 text-center text-muted-foreground'>
          Không có thành tựu nào trong năm này.
        </div>
      ) : (
        <div className='grid gap-3'>
          {achievements.map((ach) => {
            const checked = selectedIds.includes(ach.id);
            return (
              <label
                className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors ${
                  checked ? "border-primary/50 bg-primary/5" : "border-border hover:border-muted-foreground/30"
                }`}
                htmlFor={`ach-${ach.id}`}
                key={ach.id}
              >
                <Checkbox
                  checked={checked}
                  className='mt-0.5'
                  id={`ach-${ach.id}`}
                  onCheckedChange={() => toggle(ach.id)}
                />
                {ach.thumbnail && (
                  <Image
                    alt={ach.title}
                    className='shrink-0 rounded-md object-cover'
                    height={64}
                    src={ach.thumbnail}
                    width={96}
                  />
                )}
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <Trophy className='h-4 w-4 shrink-0 text-amber-500' />
                    <span className='font-medium'>{ach.title}</span>
                    <Badge className='text-[10px]' variant='secondary'>
                      {typeBadge[ach.type] ?? ach.type}
                    </Badge>
                  </div>
                  <div className='mt-1 flex items-center gap-3 text-muted-foreground text-xs'>
                    <span className='flex items-center gap-1'>
                      <CalendarDays className='h-3 w-3' />
                      {formatLocalDate(ach.date, locale)}
                    </span>
                    {ach.summary && <span className='line-clamp-1'>{ach.summary}</span>}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
