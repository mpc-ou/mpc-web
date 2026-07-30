"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RecapData } from "@/lib/recap-data";
import { getFullName } from "@/lib/utils";
import { colorFromString, dimColorFromString } from "@/utils/color";
import { CountUpNumber, GlowingOrbs, GridBackground } from "./animations";

function getNameInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type Bubble = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  name: string;
  fullName: string;
  avatar: string | null;
  initials: string;
  borderColor: string;
  bgColor: string;
};

function GravityBubbleField({ members }: { members: RecapData["newMembers"] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const bubblesRef = useRef<Bubble[]>([]);
  const rafRef = useRef<number>(0);

  // Init bubbles
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const rect = container.getBoundingClientRect();
    const BUBBLE_R = 40;
    const init: Bubble[] = members.map((m) => {
      const fullName = getFullName(m.firstName, m.middleName, m.lastName, "vi");
      return {
        id: m.id,
        x: BUBBLE_R + Math.random() * (rect.width - BUBBLE_R * 2),
        y: BUBBLE_R + Math.random() * (rect.height * 0.5),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        r: BUBBLE_R,
        name: fullName.split(" ").pop() ?? fullName,
        fullName,
        avatar: m.avatar,
        initials: getNameInitials(fullName),
        borderColor: colorFromString(fullName),
        bgColor: dimColorFromString(fullName)
      };
    });
    bubblesRef.current = init;
    setBubbles(init);
  }, [members]);

  // Physics loop
  useEffect(() => {
    const GRAVITY = 0.08;
    const FLOOR_BOUNCE = 0.6;
    const WALL_BOUNCE = 0.7;
    const FRICTION = 0.995;
    const MAX_SPEED = 6;

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const loop = () => {
      const rect = container.getBoundingClientRect();
      const bubbles = bubblesRef.current;
      const margin = 8;

      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];

        // Gravity
        b.vy += GRAVITY;

        // Friction
        b.vx *= FRICTION;
        b.vy *= FRICTION;

        // Clamp speed
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (speed > MAX_SPEED) {
          b.vx = (b.vx / speed) * MAX_SPEED;
          b.vy = (b.vy / speed) * MAX_SPEED;
        }

        b.x += b.vx;
        b.y += b.vy;

        // Wall collisions
        if (b.x - b.r < margin) {
          b.x = margin + b.r;
          b.vx *= -WALL_BOUNCE;
        }
        if (b.x + b.r > rect.width - margin) {
          b.x = rect.width - margin - b.r;
          b.vx *= -WALL_BOUNCE;
        }
        if (b.y - b.r < margin) {
          b.y = margin + b.r;
          b.vy *= -WALL_BOUNCE;
        }
        // Floor: gentle settle
        if (b.y + b.r > rect.height - margin) {
          b.y = rect.height - margin - b.r;
          b.vy *= -FLOOR_BOUNCE;
          if (Math.abs(b.vy) < 0.3) {
            b.vy = 0;
          }
        }

        // Bubble-bubble collision
        for (let j = i + 1; j < bubbles.length; j++) {
          const a = bubbles[i];
          const c = bubbles[j];
          const dx = c.x - a.x;
          const dy = c.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.r + c.r + 4;

          if (dist < minDist && dist > 0) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;

            a.x -= nx * overlap;
            a.y -= ny * overlap;
            c.x += nx * overlap;
            c.y += ny * overlap;

            // Elastic collision response
            const dvx = a.vx - c.vx;
            const dvy = a.vy - c.vy;
            const dot = dvx * nx + dvy * ny;
            if (dot > 0) {
              a.vx -= dot * nx * 0.5;
              a.vy -= dot * ny * 0.5;
              c.vx += dot * nx * 0.5;
              c.vy += dot * ny * 0.5;
            }
          }
        }
      }

      setBubbles([...bubbles]);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className='relative mx-auto h-full w-full overflow-hidden' ref={containerRef}>
      {bubbles.map((b) => (
        <div
          className='group absolute flex flex-col items-center transition-opacity duration-300 hover:z-10'
          key={b.id}
          style={{
            left: b.x - b.r,
            top: b.y - b.r,
            width: b.r * 2,
            height: b.r * 2,
            transform: "none"
          }}
        >
          {/* Glow ring */}
          <div
            className='pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100'
            style={{
              background: `radial-gradient(circle, ${b.borderColor}22 0%, transparent 70%)`,
              transform: "scale(1.3)"
            }}
          />
          {/* Avatar */}
          <div className='relative flex h-full w-full items-center justify-center'>
            {b.avatar ? (
              <Image
                alt={b.fullName}
                className='rounded-full object-cover shadow-lg ring-2 ring-white/10 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] group-hover:ring-orange-400'
                height={60}
                src={b.avatar}
                style={{ border: `2px solid ${b.borderColor}` }}
                width={60}
              />
            ) : (
              <div
                className='flex h-[60px] w-[60px] items-center justify-center rounded-full font-bold text-base shadow-lg transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] group-hover:ring-2 group-hover:ring-orange-400'
                style={{
                  backgroundColor: b.bgColor,
                  color: b.borderColor,
                  border: `2.5px solid ${b.borderColor}`
                }}
              >
                {b.initials}
              </div>
            )}
          </div>
          {/* Name label — always below, no rotation */}
          <span className='mt-1.5 w-[80px] truncate text-center font-medium text-white/60 text-xs transition-colors group-hover:text-white/90'>
            {b.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SlideNewMembers({
  coverImage3,
  members
}: {
  coverImage3: string | null;
  members: RecapData["newMembers"];
}) {
  const t = useTranslations("events");

  return (
    <div className='relative flex h-full w-full flex-col overflow-hidden bg-[#0a0a0f] pt-16'>
      <GridBackground />
      <GlowingOrbs />
      {coverImage3 && (
        <div className='absolute inset-0'>
          <Image alt='' className='object-cover opacity-10' fill src={coverImage3} />
          <div className='absolute inset-0 bg-orange-500/5 mix-blend-overlay' />
        </div>
      )}
      <div className='absolute inset-0 bg-black/20' />
      <div className='absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent' />

      <div className='relative z-10 mx-auto flex h-full w-full flex-col px-8 pb-8'>
        {/* Header */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className='shrink-0 pt-8 pb-4 text-center'
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <div className='mb-3 inline-flex items-center justify-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/8 px-5 py-2 text-orange-300'>
            <Users className='h-5 w-5' />
            <span className='font-semibold text-sm uppercase tracking-[0.12em]'>{t("recap.newMembersTag")}</span>
          </div>
          <h2 className='font-black text-[clamp(36px,6vw,64px)] text-white tracking-tight'>
            {t("recap.newMembersTitle")}
          </h2>
          <p className='mx-auto mt-3 max-w-2xl text-[#94a3b8] text-base'>{t("recap.newMembersDesc")}</p>
          <div className='mt-4 text-white/60'>
            <span className='font-mono text-base'>Đã chào đón </span>
            <CountUpNumber className='font-bold font-mono text-3xl text-orange-400' suffix='' target={members.length} />
            <span className='font-mono text-base'> thành viên mới</span>
          </div>
        </motion.div>

        {/* Gravity bubble field — fills remaining space */}
        <div className='flex-1 overflow-hidden'>
          <GravityBubbleField members={members} />
        </div>
      </div>
    </div>
  );
}
