"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTransparentHeader } from "@/hooks/use-transparent-header";

// ─── Countdown Timer ──────────────────────────────────────────────────────────

type CountdownParts = { days: number; hours: number; minutes: number; seconds: number };

function getCountdownParts(target: number): CountdownParts {
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

const pad = (n: number) => n.toString().padStart(2, "0");

function MinimalCountdownTimer({ contestDate }: { contestDate: string }) {
  const t = useTranslations("webdesign");
  const target = new Date(contestDate).getTime();
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    if (Number.isNaN(target)) {
      return;
    }
    setParts(getCountdownParts(target));
    const interval = setInterval(() => setParts(getCountdownParts(target)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (!parts) {
    return null;
  }

  const units = [
    { label: t("countdownDays"), value: parts.days },
    { label: t("countdownHours"), value: parts.hours },
    { label: t("countdownMinutes"), value: parts.minutes },
    { label: t("countdownSeconds"), value: parts.seconds }
  ];

  return (
    <div className='flex flex-col items-start gap-2 pt-4'>
      <div className='flex items-center gap-6 font-mono text-[11px] text-muted-foreground uppercase tracking-widest'>
        {units.map((u) => (
          <span className='w-14 text-center font-semibold' key={u.label}>
            {u.label}
          </span>
        ))}
      </div>
      <div className='flex items-center gap-2 font-black font-serif text-4xl text-foreground sm:text-5xl lg:text-6xl'>
        {units.map((unit, idx) => (
          <div className='flex items-center gap-2' key={unit.label}>
            <span className='w-14 text-center tracking-tight'>{pad(unit.value)}</span>
            {idx < units.length - 1 && <span className='font-sans text-primary opacity-60'>:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Floating decorations ─────────────────────────────────────────────────────

const FLOATING_KEYWORDS = [
  {
    text: "HTML5",
    color: "text-orange-500",
    bg: "bg-orange-500/10 border-orange-500/30",
    delay: "0s",
    x: "left-[6%]",
    y: "top-[18%]"
  },
  {
    text: "CSS3",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/30",
    delay: "1.5s",
    x: "left-[12%]",
    y: "top-[62%]"
  },
  {
    text: "JavaScript",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10 border-yellow-500/30",
    delay: "0.8s",
    x: "left-[3%]",
    y: "top-[42%]"
  },
  {
    text: "React",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10 border-cyan-400/30",
    delay: "2s",
    x: "right-[5%]",
    y: "top-[12%]"
  },
  {
    text: "Figma",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/30",
    delay: "0.4s",
    x: "right-[6%]",
    y: "top-[72%]"
  },
  {
    text: "UI/UX",
    color: "text-pink-500",
    bg: "bg-pink-500/10 border-pink-500/30",
    delay: "1.2s",
    x: "left-[1%]",
    y: "top-[78%]"
  },
  {
    text: "Tailwind",
    color: "text-teal-400",
    bg: "bg-teal-400/10 border-teal-400/30",
    delay: "2.5s",
    x: "right-[3%]",
    y: "top-[40%]"
  }
];

const FLOATING_TECH_ICONS = [
  {
    id: "html5",
    src: "/icons/tech/html5.svg",
    x: "left-[1%]",
    y: "top-[28%]",
    size: "h-16 w-16",
    delay: "0.6s",
    rotate: "-rotate-6"
  },
  {
    id: "css3",
    src: "/icons/tech/css3.svg",
    x: "left-[13%]",
    y: "bottom-[10%]",
    size: "h-16 w-16",
    delay: "1s",
    rotate: "rotate-6"
  },
  {
    id: "javascript",
    src: "/icons/tech/javascript.svg",
    x: "left-[1%]",
    y: "top-[55%]",
    size: "h-14 w-14",
    delay: "1.8s",
    rotate: "rotate-3"
  },
  {
    id: "typescript",
    src: "/icons/tech/typescript.svg",
    x: "right-[1%]",
    y: "top-[52%]",
    size: "h-16 w-16",
    delay: "2.2s",
    rotate: "-rotate-3"
  },
  {
    id: "react",
    src: "/icons/tech/react.svg",
    x: "right-[13%]",
    y: "top-[8%]",
    size: "h-20 w-20",
    delay: "0.3s",
    rotate: "rotate-12"
  },
  {
    id: "figma",
    src: "/icons/tech/figma.svg",
    x: "right-[2%]",
    y: "top-[22%]",
    size: "h-14 w-14",
    delay: "1.4s",
    rotate: "-rotate-6"
  },
  {
    id: "nodejs",
    src: "/icons/tech/nodejs.svg",
    x: "left-[2%]",
    y: "top-[8%]",
    size: "h-14 w-14",
    delay: "2.8s",
    rotate: "rotate-6"
  }
];

// ─── Square image grid ────────────────────────────────────────────────────────

const HERO_IMAGES = [
  { src: "/images/web-design/2025_0.jpg", alt: "WebDesign 2025 #1" },
  { src: "/images/web-design/2025_7.jpg", alt: "WebDesign 2025 #2" },
  { src: "/images/web-design/2025_3.jpg", alt: "WebDesign 2025 #3" },
  { src: "/images/web-design/2023_1.jpg", alt: "WebDesign 2023 #1" }
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function WebDesignHeroClient({
  title,
  subtitle,
  contestDate,
  registerUrl
}: {
  title: string;
  subtitle: string;
  contestDate?: string;
  registerUrl?: string;
}) {
  const t = useTranslations("webdesign");

  useTransparentHeader({
    hideActions: false,
    textColor: "rgba(255,255,255,0.7)",
    logoColor: "#fff"
  });

  return (
    <section className='relative z-10 flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden px-4 pt-28 pb-16'>
      {/* ── Background Glows + Floating Decorations ── */}
      <div className='pointer-events-none absolute inset-0 select-none overflow-hidden'>
        <div className='absolute top-10 left-[10%] h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[130px] dark:bg-amber-500/20' />
        <div className='absolute top-1/4 right-[10%] h-[450px] w-[450px] rounded-full bg-sky-500/10 blur-[140px] dark:bg-sky-500/20' />

        {FLOATING_KEYWORDS.map((kw) => (
          <span
            className={`absolute hidden rounded-full border px-3 py-1 font-mono font-semibold text-xs backdrop-blur-sm xl:inline-flex ${kw.x} ${kw.y} ${kw.color} ${kw.bg}`}
            key={kw.text}
            style={{
              animation: "wd-float 6s ease-in-out infinite",
              animationDelay: kw.delay,
              animationFillMode: "both"
            }}
          >
            {kw.text}
          </span>
        ))}

        {FLOATING_TECH_ICONS.map((item) => (
          <div
            className={`absolute hidden xl:block ${item.size} ${item.x} ${item.y} ${item.rotate} opacity-60`}
            key={item.id}
            style={{
              animation: "wd-float 7s ease-in-out infinite",
              animationDelay: item.delay,
              animationFillMode: "both"
            }}
          >
            <Image alt='' aria-hidden='true' className='object-contain' fill sizes='80px' src={item.src} />
          </div>
        ))}

        <style>{`
          @keyframes wd-float {
            0%, 100% { transform: translateY(0px) rotate(-1deg); }
            50%       { transform: translateY(-14px) rotate(1deg); }
          }
        `}</style>
      </div>

      {/* ── Main Grid ── */}
      <div className='container mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12'>
        {/* Left: Text */}
        <div className='flex flex-col items-start gap-6 lg:col-span-7'>
          <span className='inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-mono font-semibold text-primary text-xs tracking-wider shadow-xs backdrop-blur-md'>
            <Sparkles className='h-4 w-4' /> {t("heroBadge")}
          </span>

          <h1 className='font-black text-4xl text-foreground leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl'>
            {title}
          </h1>

          <p className='max-w-xl font-medium text-base text-muted-foreground leading-relaxed sm:text-lg'>{subtitle}</p>

          {/* Buttons — only when registerUrl exists */}
          {registerUrl && (
            <div className='mt-2 flex flex-wrap items-center gap-4'>
              <Button
                asChild
                className='h-12 rounded-full bg-primary px-8 font-semibold text-base text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90'
              >
                <a href={registerUrl} rel='noopener noreferrer' target='_blank'>
                  {t("registerBtn")} <ArrowRight className='ml-2 h-4 w-4' />
                </a>
              </Button>
              <Button
                className='h-12 rounded-full border-primary/40 px-8 font-semibold text-base hover:bg-primary/10'
                onClick={() => document.getElementById("rules-section")?.scrollIntoView({ behavior: "smooth" })}
                variant='outline'
              >
                {t("rulesBtn")}
              </Button>
            </div>
          )}

          {/* Countdown */}
          {contestDate && !Number.isNaN(new Date(contestDate).getTime()) && (
            <MinimalCountdownTimer contestDate={contestDate} />
          )}
        </div>

        {/* Right: Free-form collage */}
        <div className='relative flex items-center justify-center lg:col-span-5'>
          <div className='relative h-[420px] w-[380px] sm:h-[460px] sm:w-[420px]'>
            {/* Image 1 — large, top-left, slight tilt left */}
            <div
              className='group absolute top-4 left-0 h-[220px] w-[200px] overflow-hidden rounded-2xl shadow-xl ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-2xl sm:h-[240px] sm:w-[220px]'
              style={{ rotate: "-3deg" }}
            >
              <Image
                alt={HERO_IMAGES[0].alt}
                className='object-cover transition-transform duration-700 group-hover:scale-110'
                fill
                priority
                sizes='(max-width: 768px) 55vw, 28vw'
                src={HERO_IMAGES[0].src}
              />
            </div>

            {/* Image 2 — medium, top-right, tilt right */}
            <div
              className='group absolute top-0 right-0 h-[175px] w-[165px] overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-2xl sm:h-[195px] sm:w-[180px]'
              style={{ rotate: "4deg" }}
            >
              <Image
                alt={HERO_IMAGES[1].alt}
                className='object-cover transition-transform duration-700 group-hover:scale-110'
                fill
                priority
                sizes='(max-width: 768px) 45vw, 22vw'
                src={HERO_IMAGES[1].src}
              />
            </div>

            {/* Image 3 — medium, bottom-left, slight tilt */}
            <div
              className='group absolute bottom-0 left-8 h-[170px] w-[175px] overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-2xl sm:h-[190px] sm:w-[195px]'
              style={{ rotate: "2deg" }}
            >
              <Image
                alt={HERO_IMAGES[2].alt}
                className='object-cover transition-transform duration-700 group-hover:scale-110'
                fill
                sizes='(max-width: 768px) 45vw, 22vw'
                src={HERO_IMAGES[2].src}
              />
            </div>

            {/* Image 4 — small, bottom-right, tilt left */}
            <div
              className='group absolute right-4 bottom-8 h-[150px] w-[145px] overflow-hidden rounded-2xl shadow-md ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl sm:h-[165px] sm:w-[160px]'
              style={{ rotate: "-5deg" }}
            >
              <Image
                alt={HERO_IMAGES[3].alt}
                className='object-cover transition-transform duration-700 group-hover:scale-110'
                fill
                sizes='(max-width: 768px) 40vw, 20vw'
                src={HERO_IMAGES[3].src}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
