"use client";

import { useState, useEffect } from "react";
import { Activity, Trophy, FolderGit2, Users, Calendar } from "lucide-react";
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
      } else setCount(start);
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
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  delay: string;
}) {
  return (
    <div
      className="group relative flex flex-col items-center gap-4 rounded-3xl bg-white/5 p-8 backdrop-blur-md border border-white/10 hover:border-orange-500/50 hover:bg-orange-900/10 transition-all duration-500 animate-fade-in-up overflow-hidden shadow-lg hover:shadow-[0_10px_30px_rgba(249,115,22,0.15)] hover:-translate-y-2"
      style={{ animationDelay: delay }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div
        className={`p-4 rounded-full bg-white/5 border border-white/10 ${color} group-hover:scale-110 transition-transform duration-500 shadow-md`}
      >
        {icon}
      </div>
      <div className="font-black text-5xl lg:text-6xl text-white tabular-nums tracking-tighter drop-shadow-md">
        {value}
      </div>
      <span className="text-white/50 text-xs lg:text-sm font-bold tracking-widest uppercase text-center w-full group-hover:text-white/80 transition-colors">
        {label}
      </span>
    </div>
  );
}

export function SlideStats({
  stats,
  coverImage2,
  active,
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
    OTHER: "Khác",
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-slate-950">
      <div className="absolute inset-0 blueprint-grid opacity-20" />
      <GlowingOrbs />
      {coverImage2 && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20 transition-opacity"
            src={coverImage2}
          />
          <div className="absolute inset-0 bg-orange-600/10 mix-blend-overlay" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/50" />

      <div className="relative z-10 w-full max-w-6xl px-8 py-6 pt-20 pb-16">
        <div className="text-center mb-16 animate-fade-in-up">
          <p className="text-orange-400 font-bold tracking-[0.3em] uppercase mb-4 text-sm [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
            Thống kê
          </p>
          <h2 className="font-black text-4xl text-white sm:text-6xl tracking-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.8)] drop-shadow-lg uppercase">
            Tình Hình Hoạt Động
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 mb-12">
          <StatCard
            delay="0s"
            icon={<Calendar className="h-8 w-8" />}
            label="Sự kiện"
            value={events}
            color="text-orange-400"
          />
          <StatCard
            delay="0.1s"
            icon={<Trophy className="h-8 w-8" />}
            label="Thành tựu"
            value={achievements}
            color="text-amber-400"
          />
          <StatCard
            delay="0.2s"
            icon={<FolderGit2 className="h-8 w-8" />}
            label="Dự án"
            value={projects}
            color="text-emerald-400"
          />
          <StatCard
            delay="0.3s"
            icon={<Users className="h-8 w-8" />}
            label="TV trước đó"
            value={membersBefore}
            color="text-purple-400"
          />
          <StatCard
            delay="0.4s"
            icon={<span className="text-3xl">🎉</span>}
            label="TV mới"
            value={newMembers}
            color="text-pink-400"
          />
        </div>

        {eventTypeEntries.length > 0 && (
          <div
            className="flex flex-wrap items-center justify-center gap-3 animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            {eventTypeEntries.map(([type, count]) => (
              <div
                key={type}
                className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 border border-white/10 shadow-sm transition-colors hover:border-orange-500/30 hover:bg-white/10"
              >
                <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                {typeBadge[type] ?? type}:{" "}
                <span className="text-white">{count as number}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
