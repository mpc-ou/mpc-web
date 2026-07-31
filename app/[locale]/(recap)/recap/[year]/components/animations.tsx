import { motion, useMotionValue, useTransform } from "framer-motion";
import { Calendar, FolderGit2, Hexagon, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// ── Cyberpunk Glowing Orbs (orange + cyan) ──

export function GlowingOrbs() {
  return (
    <div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
      <div className='absolute top-[-10%] left-[-5%] h-[500px] w-[500px] animate-orb-drift rounded-full bg-orange-500/15 blur-[120px]' />
      <div
        className='absolute right-[-5%] bottom-[-10%] h-[400px] w-[400px] animate-orb-drift rounded-full bg-cyan-500/10 blur-[100px]'
        style={{ animationDelay: "4s" }}
      />
      <div
        className='absolute top-[50%] left-[40%] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 animate-orb-drift rounded-full bg-purple-500/8 blur-[80px]'
        style={{ animationDelay: "2s" }}
      />
    </div>
  );
}

// ── Scanning line effect ──

export function ScanningLine() {
  return (
    <div className='pointer-events-none absolute inset-0 z-[1] overflow-hidden'>
      <div className='absolute top-0 left-0 h-[2px] w-full animate-scan bg-linear-to-r from-transparent via-orange-500/30 to-transparent' />
    </div>
  );
}

// ── Grid background pattern ──

export function GridBackground() {
  return (
    <div className='pointer-events-none absolute inset-0 z-0'>
      <div
        className='absolute inset-0 opacity-[0.03]'
        style={{
          backgroundImage:
            "linear-gradient(rgba(249,115,22,1) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}
      />
      <div className='absolute inset-0 bg-radial-[ellipse_80%_60%_at_50%_50%] from-transparent via-transparent to-[#0a0a0f]' />
    </div>
  );
}

// ── Reduced elegant confetti (max 25 pieces) ──

const CONFETTI_COLORS = ["bg-orange-500", "bg-cyan-500", "bg-amber-500", "bg-emerald-500", "bg-purple-500"];

export function ConfettiEffect() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pieces = useMemo(
    () =>
      Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        width: 4 + Math.random() * 8,
        height: i % 2 === 0 ? 4 + Math.random() * 8 : 8 + Math.random() * 14,
        animDelay: Math.random() * 5,
        animDuration: 4 + Math.random() * 4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        isCircle: i % 3 === 0
      })),
    []
  );

  if (!mounted) {
    return null;
  }

  return (
    <div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
      {pieces.map((p) => (
        <div
          className={`absolute -top-10 ${p.isCircle ? "rounded-full" : "rounded-sm"} ${p.color} animate-confetti shadow-black/20 shadow-sm`}
          key={p.id}
          style={{
            left: `${p.left}%`,
            width: `${p.width}px`,
            height: `${p.height}px`,
            animationDelay: `${p.animDelay}s`,
            animationDuration: `${p.animDuration}s`
          }}
        />
      ))}
    </div>
  );
}

// ── Floating geometric shapes ──

export function FloatingShapes() {
  return (
    <div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
      <div className='absolute top-[20%] left-[12%] animate-float opacity-20' style={{ animationDelay: "0s" }}>
        <Trophy className='h-16 w-16 text-amber-500/50' />
      </div>
      <div className='absolute right-[18%] bottom-[30%] animate-float opacity-20' style={{ animationDelay: "2s" }}>
        <Calendar className='h-20 w-20 text-cyan-500/40' />
      </div>
      <div className='absolute top-[15%] right-[8%] animate-float-slow opacity-15' style={{ animationDelay: "1s" }}>
        <div className='h-16 w-16 rounded-full border-4 border-orange-500/30 border-dashed' />
      </div>
      <div className='absolute bottom-[18%] left-[22%] animate-float-slow opacity-15' style={{ animationDelay: "3s" }}>
        <FolderGit2 className='h-24 w-24 text-cyan-500/30' />
      </div>
      <div className='absolute top-[55%] left-[55%] animate-float opacity-10' style={{ animationDelay: "5s" }}>
        <Hexagon className='h-14 w-14 text-orange-500/30' />
      </div>
    </div>
  );
}

// ── Count-up number (framer-motion) ──

export function CountUpNumber({
  target,
  duration = 1.2,
  suffix = "",
  className = ""
}: {
  target: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) {
  const count = useMotionValue(0);
  const _rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    count.set(0);
    const controls = { stop: false };
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress) * (1 - progress);
      count.set(eased * target);
      setDisplay(`${Math.round(eased * target)}${suffix}`);
      if (progress < 1 && !controls.stop) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
    return () => {
      controls.stop = true;
    };
  }, [target, duration, count, suffix]);

  return <span className={className}>{display}</span>;
}

// ── Staggered reveal wrapper ──

export function StaggerReveal({
  children,
  delay = 0,
  stagger = 0.05,
  className = ""
}: {
  children: React.ReactNode;
  delay?: number;
  stagger?: number;
  className?: string;
}) {
  return (
    <motion.div
      animate='visible'
      className={className}
      initial='hidden'
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }
  }
};

// ── Glowing text ──

export function GlowText({
  children,
  color = "text-orange-500",
  className = ""
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={`${color} ${className}`}
      style={{
        textShadow: "0 0 40px rgba(249,115,22,0.4), 0 0 80px rgba(249,115,22,0.2)"
      }}
    >
      {children}
    </span>
  );
}

// ── SVG Donut Chart ──

export function DonutChart({
  segments,
  size = 180,
  strokeWidth = 24
}: {
  segments: Array<{ label: string; value: number; color: string }>;
  size?: number;
  strokeWidth?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  let offset = 0;
  return (
    <div className='relative inline-flex items-center justify-center'>
      <svg aria-hidden='true' height={size} role='presentation' width={size}>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          fill='none'
          r={radius}
          stroke='rgba(255,255,255,0.04)'
          strokeWidth={strokeWidth}
        />
        {segments.map((seg) => {
          const segLen = (seg.value / total) * circumference;
          const _dash = animated ? segLen : 0;
          const dashOffset = -offset;
          offset += segLen;
          return (
            <circle
              cx={size / 2}
              cy={size / 2}
              fill='none'
              key={seg.label}
              r={radius}
              stroke={seg.color}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap='round'
              strokeWidth={strokeWidth}
              style={{
                transition: "stroke-dashoffset 1.5s ease, stroke-dasharray 1.5s ease",
                strokeDasharray: animated ? `${segLen} ${circumference - segLen}` : `0 ${circumference}`,
                strokeDashoffset: animated ? -segLen - (offset - segLen) : 0,
                transformOrigin: "center",
                transform: "rotate(-90deg)"
              }}
            />
          );
        })}
      </svg>
      <div className='absolute flex flex-col items-center'>
        <span className='font-bold font-mono text-3xl text-white'>{total}</span>
        <span className='text-[10px] text-white/40'>Tổng</span>
      </div>
    </div>
  );
}

// ── Horizontal Bar Chart ──

export function BarChart({
  bars
}: {
  bars: Array<{
    label: string;
    value: number;
    color: string;
    maxValue?: number;
  }>;
}) {
  const maxValue = Math.max(...bars.map((b) => b.maxValue ?? b.value), 1);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='flex flex-col gap-2.5'>
      {bars.map((bar, i) => (
        <div key={bar.label}>
          <div className='mb-1 flex items-center justify-between'>
            <span className='font-mono text-[11px] text-white/60 uppercase tracking-[0.08em]'>{bar.label}</span>
            <span className='font-bold font-mono text-[13px] text-white'>{bar.value}</span>
          </div>
          <div className='h-3 overflow-hidden rounded-full bg-white/[0.04]'>
            <div
              className='h-full rounded-full transition-all duration-1000 ease-out'
              style={{
                width: animated ? `${(bar.value / maxValue) * 100}%` : "0%",
                backgroundColor: bar.color,
                transitionDelay: `${i * 0.1}s`,
                boxShadow: `0 0 8px ${bar.color}40`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
