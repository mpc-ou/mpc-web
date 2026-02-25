"use client";

import { CalendarDays, CheckSquare, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type EventCandidate = {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  description: string | null;
  startAt: string;
  status: string;
  type: string | null;
  location: string | null;
};

type Props = {
  events: EventCandidate[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

const typeBadge: Record<string, string> = {
  ACADEMIC: "Học thuật",
  MEMBER_ACTIVITY: "Thành viên",
  VOLUNTEER: "Tình nguyện",
  SEMINAR: "Hội thảo",
  OTHER: "Khác"
};

export function PhaseEvents({ events, selectedIds, onChange }: Props) {
  const allSelected = events.length > 0 && selectedIds.length === events.length;

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]);
  };

  const toggleAll = () => {
    onChange(allSelected ? [] : events.map((e) => e.id));
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='font-semibold text-xl'>Chọn sự kiện</h2>
          <p className='text-muted-foreground text-sm'>
            Đã chọn {selectedIds.length} / {events.length} sự kiện trong năm
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

      {events.length === 0 ? (
        <div className='rounded-lg border border-dashed py-12 text-center text-muted-foreground'>
          Không có sự kiện nào trong năm này.
        </div>
      ) : (
        <div className='grid gap-3'>
          {events.map((event) => {
            const checked = selectedIds.includes(event.id);
            return (
              <label
                className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors ${
                  checked ? "border-primary/50 bg-primary/5" : "border-border hover:border-muted-foreground/30"
                }`}
                key={event.id}
              >
                <Checkbox checked={checked} className='mt-0.5' onCheckedChange={() => toggle(event.id)} />
                {event.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={event.title} className='h-16 w-24 shrink-0 rounded-md object-cover' src={event.thumbnail} />
                )}
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>{event.title}</span>
                    {event.type && (
                      <Badge className='text-[10px]' variant='secondary'>
                        {typeBadge[event.type] ?? event.type}
                      </Badge>
                    )}
                  </div>
                  <div className='mt-1 flex items-center gap-3 text-muted-foreground text-xs'>
                    <span className='flex items-center gap-1'>
                      <CalendarDays className='h-3 w-3' />
                      {new Date(event.startAt).toLocaleDateString("vi-VN")}
                    </span>
                    {event.location && <span>📍 {event.location}</span>}
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
