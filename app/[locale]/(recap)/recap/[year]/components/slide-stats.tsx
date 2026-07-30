"use client";

import { motion } from "framer-motion";
import { Activity, Calendar, FolderGit2, GitBranch, Trophy, UserPlus, Users } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { RecapData } from "@/lib/recap-data";
import {
  BarChart,
  CountUpNumber,
  DonutChart,
  GlowingOrbs,
  GridBackground,
  StaggerReveal,
  staggerItem
} from "./animations";

const TYPE_COLORS: Record<string, string> = {
  ACADEMIC: "#f97316",
  MEMBER_ACTIVITY: "#22c55e",
  VOLUNTEER: "#06b6d4",
  SEMINAR: "#a78bfa",
  OTHER: "#64748b"
};

const TYPE_LABEL_MAP: Record<string, string> = {
  ACADEMIC: "Học thuật",
  MEMBER_ACTIVITY: "Thành viên",
  VOLUNTEER: "Tình nguyện",
  SEMINAR: "Hội thảo",
  OTHER: "Khác"
};

export function SlideStats({
  stats,
  coverImage2,
  active
}: {
  stats: RecapData["stats"];
  coverImage2: string | null;
  active: boolean;
}) {
  const t = useTranslations("events");

  const eventTypeEntries = Object.entries(stats.eventsByType);

  const donutSegments = eventTypeEntries.map(([type, count]) => ({
    label: TYPE_LABEL_MAP[type] ?? type,
    value: count,
    color: TYPE_COLORS[type] ?? "#64748b"
  }));

  const barData = eventTypeEntries.map(([type, count]) => ({
    label: t(`recap.eventType.${type}` as Parameters<typeof t>[0]) ?? type,
    value: count,
    color: TYPE_COLORS[type] ?? "#64748b"
  }));

  return (
    <div className='relative flex h-full w-full items-center justify-center overflow-hidden bg-[#0a0a0f]'>
      <GridBackground />
      <GlowingOrbs />
      {coverImage2 && (
        <div className='absolute inset-0'>
          <Image alt='' className='object-cover opacity-10' fill src={coverImage2} />
          <div className='absolute inset-0 bg-orange-600/5 mix-blend-overlay' />
        </div>
      )}
      <div className='absolute inset-0 bg-black/30' />
      <div className='absolute inset-0 bg-linear-to-br from-transparent via-transparent to-black/50' />

      <div className='relative z-10 flex h-full w-full flex-col justify-center gap-6 px-10 py-16'>
        {/* Section header */}
        <motion.div
          animate={active ? { opacity: 1, y: 0 } : {}}
          className='text-center'
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <p className='mb-2 font-mono text-orange-400/70 text-sm uppercase tracking-[0.3em]'>
            {t("recap.statsTitle")}
          </p>
          <h2 className='font-black text-5xl text-white tracking-tight sm:text-6xl'>{t("recap.statsTitle")}</h2>
        </motion.div>

        {/* 5 stat cards row — full width */}
        <StaggerReveal className='grid w-full grid-cols-5 gap-4' delay={0.2} stagger={0.08}>
          {[
            {
              icon: <Calendar className='h-6 w-6' />,
              value: stats.totalEvents,
              label: t("recap.totalEvents"),
              accent: false
            },
            {
              icon: <Trophy className='h-6 w-6' />,
              value: stats.totalAchievements,
              label: t("recap.totalAchievements"),
              accent: false
            },
            {
              icon: <GitBranch className='h-6 w-6' />,
              value: stats.totalProjects,
              label: t("recap.totalProjects"),
              accent: false
            },
            {
              icon: <Users className='h-6 w-6' />,
              value: stats.totalMembersBefore,
              label: t("recap.membersBefore"),
              accent: false
            },
            {
              icon: <UserPlus className='h-6 w-6' />,
              value: stats.newMembersInYear,
              label: t("recap.newMembers"),
              accent: true
            }
          ].map((card) => (
            <motion.div
              className={`group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                card.accent
                  ? "border-cyan-500/20 bg-[#13131f] hover:border-cyan-500/50 hover:shadow-[0_0_24px_rgba(6,182,212,0.12)]"
                  : "border-white/6 bg-[#13131f] hover:border-orange-500/50 hover:shadow-[0_0_24px_rgba(249,115,22,0.12)]"
              }`}
              key={card.label}
              variants={staggerItem}
            >
              <div className='absolute inset-0 bg-linear-to-br from-white/3 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
              <div
                className={`rounded-xl p-3.5 shadow-md transition-transform duration-300 group-hover:scale-110 ${
                  card.accent ? "bg-cyan-500/10 text-cyan-400" : "bg-orange-500/10 text-orange-400"
                }`}
              >
                {card.icon}
              </div>
              {active ? (
                <CountUpNumber
                  className='font-bold font-mono text-4xl text-white tabular-nums tracking-tight sm:text-5xl'
                  target={card.value}
                />
              ) : (
                <span className='font-bold font-mono text-4xl text-white tabular-nums tracking-tight sm:text-5xl'>
                  0
                </span>
              )}
              <span className='text-center font-semibold text-white/40 text-xs uppercase tracking-[0.15em] transition-colors group-hover:text-white/70'>
                {card.label}
              </span>
            </motion.div>
          ))}
        </StaggerReveal>

        {/* Bottom charts row — full width */}
        {eventTypeEntries.length > 0 && (
          <motion.div
            animate={active ? { opacity: 1, y: 0 } : {}}
            className='grid w-full grid-cols-[1fr_1px_1fr] items-center gap-10'
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Donut */}
            <div className='flex flex-col items-center gap-3'>
              <span className='font-mono text-white/40 text-xs uppercase tracking-[0.12em]'>Phân bố</span>
              <DonutChart segments={donutSegments} size={200} />
              <div className='flex flex-wrap justify-center gap-3'>
                {donutSegments.map((seg) => (
                  <div
                    className='flex items-center gap-1.5 rounded-full border border-white/6 bg-white/3 px-3 py-1.5'
                    key={seg.label}
                  >
                    <div className='h-2.5 w-2.5 rounded-full' style={{ backgroundColor: seg.color }} />
                    <span className='font-mono text-white/50 text-xs'>{seg.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className='h-32 w-px bg-linear-to-b from-transparent via-white/10 to-transparent' />

            {/* Bar chart */}
            <div className='flex flex-col gap-3'>
              <span className='font-mono text-white/40 text-xs uppercase tracking-[0.12em]'>Chi tiết</span>
              <BarChart bars={barData} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
