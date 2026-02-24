"use client";

import { ChevronLeft, ChevronRight, CircleDot } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineHeader,
  TimelineIcon,
  TimelineItem,
  TimelineTitle
} from "@/components/ui/timeline";

const POSITION_LABELS: Record<string, string> = {
  PRESIDENT: "Chủ nhiệm CLB",
  VICE_PRESIDENT: "Phó chủ nhiệm",
  DEPARTMENT_LEADER: "Trưởng ban",
  DEPARTMENT_VICE_LEADER: "Phó ban",
  ADVISOR: "Cố vấn"
};

type Role = {
  id: string;
  position: string;
  startAt: string;
  endAt: string | null;
  departmentName: string | null;
};

type Leader = {
  member: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    slug: string;
    socials: any;
  };
  roles: Role[];
};

export function LeadershipCarouselClient({ leaders }: { leaders: Leader[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = useCallback(() => {
    setCurrentIndex((c) => (c === 0 ? leaders.length - 1 : c - 1));
  }, [leaders.length]);

  const next = useCallback(() => {
    setCurrentIndex((c) => (c === leaders.length - 1 ? 0 : c + 1));
  }, [leaders.length]);

  if (leaders.length === 0) {
    return <div className='py-20 text-center text-muted-foreground'>Chưa có dữ liệu thành viên ban điều hành.</div>;
  }

  const activeLeader = leaders[currentIndex];

  const getVisibleIndexes = () => {
    if (leaders.length <= 1) {
      return [0];
    }
    if (leaders.length === 2) {
      return [0, 1];
    }

    const prevIndex = currentIndex === 0 ? leaders.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex === leaders.length - 1 ? 0 : currentIndex + 1;
    return [prevIndex, currentIndex, nextIndex];
  };

  const visibleIndexes = getVisibleIndexes();

  return (
    <div className='relative mx-auto grid max-w-5xl items-start gap-12 py-8 lg:grid-cols-12 lg:gap-8'>
      {/* Left side: Carousel */}
      <div className='flex flex-col items-center justify-center space-y-8 lg:col-span-5'>
        <div className='relative flex h-80 w-full items-center justify-center'>
          {visibleIndexes.map((mappedIndex, i) => {
            const isCenter = i === 1 || visibleIndexes.length === 1;
            const leader = leaders[mappedIndex];

            // Layout logic based on array pos
            let transform = "translateX(0) scale(1)";
            let opacity = 1;
            let zIndex = 20;

            if (visibleIndexes.length > 1) {
              if (i === 0) {
                // Left
                transform = "translateX(-65%) scale(0.65)";
                opacity = 0.5;
                zIndex = 10;
              } else if (i === 2) {
                // Right
                transform = "translateX(65%) scale(0.65)";
                opacity = 0.5;
                zIndex = 10;
              }
            }

            return (
              <div
                className='absolute cursor-pointer transition-all duration-500 ease-out'
                key={`${leader.member.id}-${i}`}
                onClick={() => {
                  if (i === 0) {
                    prev();
                  }
                  if (i === 2) {
                    next();
                  }
                }}
                style={{ transform, opacity, zIndex }}
              >
                <div
                  className={`relative overflow-hidden rounded-full border-4 shadow-xl transition-colors duration-300 ${isCenter ? "h-48 w-48 border-primary sm:h-56 sm:w-56" : "h-40 w-40 border-border/50 sm:h-48 sm:w-48"} bg-muted`}
                >
                  {leader.member.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={leader.member.firstName}
                      className='h-full w-full object-cover'
                      src={leader.member.avatar}
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center bg-primary/10 font-bold text-5xl text-primary'>
                      {leader.member.firstName[0]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {leaders.length > 1 && (
          <div className='flex items-center gap-4'>
            <Button className='rounded-full shadow-md' onClick={prev} size='icon' variant='outline'>
              <ChevronLeft className='h-5 w-5' />
            </Button>
            <div className='flex gap-2'>
              {leaders.map((_, i) => (
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"}`}
                  key={i}
                />
              ))}
            </div>
            <Button className='rounded-full shadow-md' onClick={next} size='icon' variant='outline'>
              <ChevronRight className='h-5 w-5' />
            </Button>
          </div>
        )}
      </div>

      {/* Right side: Info and Timeline */}
      <div className='flex min-h-[500px] flex-col rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-8 lg:col-span-7'>
        <div className='mb-8 border-border border-b pb-6'>
          <h2 className='mb-2 font-black text-3xl text-foreground sm:text-4xl'>
            {activeLeader.member.lastName} {activeLeader.member.firstName}
          </h2>
          <div className='mb-4 flex flex-wrap gap-2'>
            {activeLeader.roles.length > 0 && (
              <span className='font-semibold text-primary'>
                {POSITION_LABELS[activeLeader.roles[0].position] || activeLeader.roles[0].position}
              </span>
            )}
          </div>

          <Button asChild className='rounded-full' variant='secondary'>
            <a href={`/members/${activeLeader.member.slug}`}>Xem hồ sơ chi tiết</a>
          </Button>
        </div>

        <div className='flex-1'>
          <h3 className='mb-6 font-semibold text-lg text-muted-foreground'>Lịch sử hoạt động điều hành</h3>

          <Timeline>
            {activeLeader.roles.map((role, idx) => {
              const startYear = new Date(role.startAt).getFullYear();
              const endYear = role.endAt ? new Date(role.endAt).getFullYear() : "Hiện tại";

              return (
                <TimelineItem key={role.id}>
                  {idx !== activeLeader.roles.length - 1 && <TimelineConnector />}
                  <TimelineHeader>
                    <TimelineIcon className='bg-primary/20 p-2 text-primary'>
                      <CircleDot className='h-4 w-4' />
                    </TimelineIcon>
                    <TimelineTitle>{POSITION_LABELS[role.position] || role.position}</TimelineTitle>
                  </TimelineHeader>
                  <TimelineContent>
                    <TimelineDescription>
                      {role.departmentName ? `${role.departmentName} • ` : ""}
                      Nhiệm kỳ: {startYear} - {endYear}
                    </TimelineDescription>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        </div>
      </div>
    </div>
  );
}
