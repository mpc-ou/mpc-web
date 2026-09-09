"use client";

import { CalendarDays, CheckSquare, FolderGit2, Square } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatLocalDate } from "@/utils/handle-datetime";

type ProjectCandidate = {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  description: string | null;
  startDate: string | null;
  technologies: string[];
};

type Props = {
  projects: ProjectCandidate[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export function PhaseProjects({ projects, selectedIds, onChange }: Props) {
  const locale = "vi";
  const allSelected = projects.length > 0 && selectedIds.length === projects.length;

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]);
  };

  const toggleAll = () => {
    onChange(allSelected ? [] : projects.map((p) => p.id));
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='font-semibold text-xl'>Chọn dự án</h2>
          <p className='text-muted-foreground text-sm'>
            Đã chọn {selectedIds.length} / {projects.length} dự án trong năm
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

      {projects.length === 0 ? (
        <div className='rounded-lg border border-dashed py-12 text-center text-muted-foreground'>
          Không có dự án nào trong năm này.
        </div>
      ) : (
        <div className='grid gap-3'>
          {projects.map((proj) => {
            const checked = selectedIds.includes(proj.id);
            return (
              <label
                className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors ${
                  checked ? "border-primary/50 bg-primary/5" : "border-border hover:border-muted-foreground/30"
                }`}
                htmlFor={`proj-${proj.id}`}
                key={proj.id}
              >
                <Checkbox
                  checked={checked}
                  className='mt-0.5'
                  id={`proj-${proj.id}`}
                  onCheckedChange={() => toggle(proj.id)}
                />
                {proj.thumbnail && (
                  <Image
                    alt={proj.title}
                    className='shrink-0 rounded-md object-cover'
                    height={64}
                    src={proj.thumbnail}
                    width={96}
                  />
                )}
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <FolderGit2 className='h-4 w-4 shrink-0 text-blue-500' />
                    <span className='font-medium'>{proj.title}</span>
                  </div>
                  <div className='mt-1 flex flex-wrap items-center gap-2 text-muted-foreground text-xs'>
                    {proj.startDate && (
                      <span className='flex items-center gap-1'>
                        <CalendarDays className='h-3 w-3' />
                        {formatLocalDate(proj.startDate, locale)}
                      </span>
                    )}
                    {(proj.technologies as string[])?.slice(0, 4).map((t) => (
                      <Badge className='px-1.5 py-0 text-[10px]' key={t} variant='outline'>
                        {t}
                      </Badge>
                    ))}
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
