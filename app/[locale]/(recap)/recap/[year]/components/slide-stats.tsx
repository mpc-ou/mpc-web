"use client";

import { Activity, Calendar, FolderGit2, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { RecapData } from "@/lib/recap-data";
import { GlowingOrbs } from "./animations";

function useCountUp(target: number, duration = 1500, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [target, duration, active]);
  return count;
}

function StatCard({
  icon,
  label,
  value,
  color,
  delay
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  delay: string;
}) {
  return (
    <div
      className='group relative flex animate-fade-in-up flex-col items-center gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-orange-500/50 hover:bg-orange-900/10 hover:shadow-[0_10px_30px_rgba(249,115,22,0.15)]'
      style={{ animationDelay: delay }}
    >
      <div className='absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />
      <div
        className={`rounded-full border border-white/10 bg-white/5 p-4 ${color} shadow-md transition-transform duration-500 group-hover:scale-110`}
      >
        {icon}
      </div>
      <div className='font-black text-5xl text-white tabular-nums tracking-tighter drop-shadow-md lg:text-6xl'>
        {value}
      </div>
      <span className='w-full text-center font-bold text-white/50 text-xs uppercase tracking-widest transition-colors group-hover:text-white/80 lg:text-sm'>
        {label}
      </span>
    </div>
  );
}

export function SlideStats({
  stats,
  coverImage2,
  active
}: {
  stats: RecapData["stats"];
  coverImage2: string | null;
  active: boolean;
}) {
  const events = useCountUp(stats.totalEvents, 1200, active);
  const achievements = useCountUp(stats.totalAchievements, 1200, active);
  const projects = useCountUp(stats.totalProjects, 1200, active);
  const membersBefore = useCountUp(stats.totalMembersBefore, 1200, active);
  const newMembers = useCountUp(stats.newMembersInYear, 1200, active);

  const eventTypeEntries = Object.entries(stats.eventsByType);
  const typeBadge: Record<string, string> = {
    ACADEMIC: "Học thuật",
    MEMBER_ACTIVITY: "Thành viên",
    VOLUNTEER: "Tình nguyện",
    SEMINAR: "Hội thảo",
    OTHER: "Khác"
  };

  return (
    <div className='relative flex h-full w-full items-center justify-center overflow-hidden bg-slate-950'>
      <div className='blueprint-grid absolute inset-0 opacity-20' />
      <GlowingOrbs />
      {coverImage2 && (
        <div className='absolute inset-0'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=''
            className='absolute inset-0 h-full w-full object-cover opacity-20 transition-opacity'
            src={coverImage2}
          />
          <div className='absolute inset-0 bg-orange-600/10 mix-blend-overlay' />
        </div>
      )}
      <div className='absolute inset-0 bg-black/20' />
      <div className='absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/50' />

      <div className='relative z-10 w-full max-w-6xl px-8 py-6 pt-20 pb-16'>
        <div className='mb-16 animate-fade-in-up text-center'>
          <p className='mb-4 font-bold text-orange-400 text-sm uppercase tracking-[0.3em] [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]'>
            Thống kê
          </p>
          <h2 className='font-black text-4xl text-white uppercase tracking-tight drop-shadow-lg [text-shadow:0_2px_12px_rgba(0,0,0,0.8)] sm:text-6xl'>
            Tình Hình Hoạt Động
          </h2>
        </div>

        <div className='mb-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5'>
          <StatCard
            color='text-orange-400'
            delay='0s'
            icon={<Calendar className='h-8 w-8' />}
            label='Sự kiện'
            value={events}
          />
          <StatCard
            color='text-amber-400'
            delay='0.1s'
            icon={<Trophy className='h-8 w-8' />}
            label='Thành tựu'
            value={achievements}
          />
          <StatCard
            color='text-emerald-400'
            delay='0.2s'
            icon={<FolderGit2 className='h-8 w-8' />}
            label='Dự án'
            value={projects}
          />
          <StatCard
            color='text-purple-400'
            delay='0.3s'
            icon={<Users className='h-8 w-8' />}
            label='TV trước đó'
            value={membersBefore}
          />
          <StatCard
            color='text-pink-400'
            delay='0.4s'
            icon={<span className='text-3xl'>🎉</span>}
            label='TV mới'
            value={newMembers}
          />
        </div>

        {eventTypeEntries.length > 0 && (
          <div
            className='flex animate-fade-in-up flex-wrap items-center justify-center gap-3'
            style={{ animationDelay: "0.6s" }}
          >
            {eventTypeEntries.map(([type, count]) => (
              <div
                className='flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-sm text-white/80 shadow-sm transition-colors hover:border-orange-500/30 hover:bg-white/10'
                key={type}
              >
                <div className='h-2 w-2 animate-pulse rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' />
                {typeBadge[type] ?? type}: <span className='text-white'>{count as number}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
