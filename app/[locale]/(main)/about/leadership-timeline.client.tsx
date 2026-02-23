"use client";

import { History, X } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type HistoricalRole = {
  id: string;
  position: string;
  startAt: string;
  endAt: string | null;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    slug: string | null;
  };
  departmentName: string | null;
};

const POSITION_LABELS: Record<string, string> = {
  PRESIDENT: "Chủ nhiệm",
  VICE_PRESIDENT: "Phó chủ nhiệm",
  DEPARTMENT_LEADER: "Trưởng ban",
  DEPARTMENT_VICE_LEADER: "Phó ban",
  ADVISOR: "Cố vấn"
};

const POSITION_PRIORITY: Record<string, number> = {
  ADVISOR: 1,
  PRESIDENT: 2,
  VICE_PRESIDENT: 3,
  DEPARTMENT_LEADER: 4,
  DEPARTMENT_VICE_LEADER: 5
};

export function LeadershipTimelineClient({ roles }: { roles: HistoricalRole[] }) {
  const [open, setOpen] = useState(false);

  // Group roles by Year/Term (using start year for simplicity)
  const groupedByYear = roles.reduce(
    (acc, role) => {
      const year = new Date(role.startAt).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(role);
      return acc;
    },
    {} as Record<number, HistoricalRole[]>
  );

  // Sort years descending (newest first)
  const sortedYears = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <>
      <Button className='rounded-full shadow-lg' onClick={() => setOpen(true)} size='lg'>
        <History className='mr-2 h-5 w-5' /> Mở gia phả Ban Điều Hành
      </Button>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-4xl'>
          <DialogHeader>
            <DialogTitle className='text-center font-bold text-2xl'>Lịch sử Ban Điều Hành</DialogTitle>
          </DialogHeader>

          <div className='space-y-12 py-6'>
            {sortedYears.map((year) => {
              // Sort roles within the year by hierarchy
              const yearRoles = groupedByYear[year].sort((a, b) => {
                const priorityA = POSITION_PRIORITY[a.position] || 99;
                const priorityB = POSITION_PRIORITY[b.position] || 99;
                return priorityA - priorityB;
              });

              return (
                <div className='relative' key={year}>
                  <div className='mb-6 flex items-center justify-center gap-4'>
                    <div className='h-px w-16 bg-border' />
                    <h3 className='rounded-full bg-primary/10 px-4 py-1.5 font-bold text-lg text-primary'>
                      Nhiệm kỳ {year}
                    </h3>
                    <div className='h-px w-16 bg-border' />
                  </div>

                  <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
                    {yearRoles.map((role) => {
                      const initials = `${role.member.firstName[0]}${role.member.lastName[0]}`;
                      const fullName = `${role.member.firstName} ${role.member.lastName}`;
                      const posLabel = POSITION_LABELS[role.position] || role.position;

                      return (
                        <div
                          className='flex flex-col items-center justify-center rounded-xl border border-border bg-card p-4 text-center shadow-sm'
                          key={role.id}
                        >
                          <Avatar className='mb-3 h-16 w-16 border-2 border-background shadow-xs'>
                            <AvatarImage src={role.member.avatar ?? undefined} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <span className='font-semibold text-foreground text-sm leading-tight'>{fullName}</span>
                          <span className='mt-1 font-medium text-primary text-xs'>{posLabel}</span>
                          {role.departmentName && (
                            <span className='mt-0.5 text-[10px] text-muted-foreground'>{role.departmentName}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {sortedYears.length === 0 && (
              <div className='py-20 text-center text-muted-foreground'>Chưa có dữ liệu lịch sử.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
