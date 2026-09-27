"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Terminal, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TerminalSession, useAutoTyping } from "@/components/custom/interactive-terminal.client";
import type { StatsData } from "@/constants/terminal";
import { cn } from "@/lib/utils";

const FACE =
  "absolute rounded-[0.18em] border border-primary/90 bg-[#0b0b0c] shadow-[0_0_0.9em_hsl(var(--primary)/0.45),inset_0_0_0.7em_hsl(var(--primary)/0.12)]";
const EASE = [0.22, 1, 0.36, 1] as const;
const BASE_TILT = { x: -9, y: -20 };
const TILT_RANGE = { x: 5, y: 9 };
const SLIDE_MS = 4500;
const INTERACTIVE_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

type BoxProps = {
  w: number;
  h: number;
  d: number;
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  faceClassName?: string;
  front?: React.ReactNode;
  right?: React.ReactNode;
  top?: React.ReactNode;
};

function Box({ w, h, d, x = 0, y = 0, z = 0, rx = 0, ry = 0, faceClassName, front, right, top }: BoxProps) {
  const face = (width: number, height: number, transform: string, left = 0, topOffset = 0) => ({
    width: `${width}em`,
    height: `${height}em`,
    left: `${left}em`,
    top: `${topOffset}em`,
    transform
  });
  const cls = cn(FACE, faceClassName);

  return (
    <div
      className='absolute top-1/2 left-1/2 [transform-style:preserve-3d]'
      style={{
        width: `${w}em`,
        height: `${h}em`,
        marginLeft: `${-w / 2}em`,
        marginTop: `${-h / 2}em`,
        transform: `translate3d(${x}em, ${y}em, ${z}em) rotateX(${rx}deg) rotateY(${ry}deg)`
      }}
    >
      <div className={cls} style={face(w, h, `rotateY(180deg) translateZ(${d / 2}em)`)} />
      <div className={cls} style={face(d, h, `rotateY(-90deg) translateZ(${w / 2}em)`, (w - d) / 2)} />
      <div className={cls} style={face(w, d, `rotateX(-90deg) translateZ(${h / 2}em)`, 0, (h - d) / 2)} />
      <div className={cls} style={face(d, h, `rotateY(90deg) translateZ(${w / 2}em)`, (w - d) / 2)}>
        {right}
      </div>
      <div className={cls} style={face(w, d, `rotateX(90deg) translateZ(${h / 2}em)`, 0, (h - d) / 2)}>
        {top}
      </div>
      <div className={cls} style={face(w, h, `translateZ(${d / 2}em)`)}>
        {front}
      </div>
    </div>
  );
}

const KEY_ROWS = [14, 14, 13, 12, 7] as const;
const ids = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}-${i}`);
const LAPTOP_KEY_ROWS = [12, 12, 11, 10] as const;

function Keyboard() {
  return (
    <div className='flex h-full w-full flex-col justify-center gap-[0.28em] p-[0.55em]'>
      {KEY_ROWS.map((count, row) => (
        <div className='flex justify-center gap-[0.28em]' key={`${row}-${count}`}>
          {ids(`key-${row}`, count).map((id, i) => (
            <span
              className={cn(
                "h-[0.95em] rounded-[0.12em] border border-accent/70 bg-accent/10 shadow-[0_0_0.35em_hsl(var(--accent)/0.5)]",
                row === KEY_ROWS.length - 1 && i === 3 ? "w-[6em]" : "w-[1.05em]"
              )}
              key={id}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function PhoneScreen() {
  return (
    <div className='absolute inset-[0.35em] overflow-hidden rounded-[0.7em] bg-black'>
      <Image alt='' className='object-cover object-top' fill sizes='300px' src='/images/mobile.jpg' />
      <span className='absolute top-[0.35em] left-1/2 h-[0.45em] w-[1.6em] -translate-x-1/2 rounded-full bg-black' />
      <span className='pointer-events-none absolute inset-0 bg-linear-to-br from-white/15 via-transparent to-transparent' />
      <div className='pointer-events-none absolute inset-0 flex items-center justify-center bg-black motion-safe:animate-[hero-phone-boot_2.6s_ease-out_0.9s_both] motion-reduce:hidden'>
        <Image
          alt=''
          className='h-[1.8em] w-[1.8em] opacity-0 motion-safe:animate-[hero-phone-logo_2.6s_ease-out_0.9s_both]'
          height={40}
          src='/images/logo.png'
          width={40}
        />
      </div>
    </div>
  );
}

function LaptopDeck() {
  return (
    <div className='flex h-full w-full flex-col items-center gap-[0.22em] px-[0.8em] pt-[0.7em]'>
      {LAPTOP_KEY_ROWS.map((count, row) => (
        <div className='flex gap-[0.22em]' key={`lk-${row}-${count}`}>
          {ids(`lkey-${row}`, count).map((id) => (
            <span className='h-[0.6em] w-[0.72em] rounded-[0.08em] border border-primary/60 bg-primary/10' key={id} />
          ))}
        </div>
      ))}
      <span className='mt-[0.3em] h-[2.2em] w-[4.2em] rounded-[0.2em] border border-primary/60' />
    </div>
  );
}

function Slideshow({ slides, paused }: { slides: string[]; paused: boolean }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (paused || slides.length < 2) {
      return;
    }
    const timer = setInterval(() => setIdx((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  return (
    <div className='absolute inset-[0.45em] overflow-hidden rounded-[0.15em] bg-black motion-safe:animate-[hero-screen-on_1s_ease-out_1.9s_both]'>
      {slides.map((src, i) => (
        <Image
          alt=''
          className={cn(
            "object-cover transition-[opacity,scale] duration-[1200ms] ease-out",
            i === idx ? "scale-105 opacity-100" : "scale-100 opacity-0"
          )}
          fill
          key={src}
          priority={i === 0}
          sizes='360px'
          src={src}
        />
      ))}
      <span className='pointer-events-none absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-white/5' />
      <div className='absolute bottom-[0.45em] left-1/2 flex -translate-x-1/2 gap-[0.25em]'>
        {slides.map((src, i) => (
          <span
            className={cn(
              "h-[0.25em] rounded-full transition-all duration-500",
              i === idx ? "w-[1em] bg-primary" : "w-[0.25em] bg-white/50"
            )}
            key={src}
          />
        ))}
      </div>
    </div>
  );
}

type ScreenProps = {
  lines: ReturnType<typeof useAutoTyping>;
  hidden: boolean;
  interactive: boolean;
};

function ScreenContent({ lines, hidden, interactive }: ScreenProps) {
  return (
    <div className={cn("flex h-full flex-col transition-opacity duration-300", hidden && "opacity-0")}>
      <div className='flex shrink-0 items-center gap-[0.35em] border-slate-700/60 border-b px-[0.7em] py-[0.45em]'>
        <span className='h-[0.5em] w-[0.5em] rounded-full bg-red-500' />
        <span className='h-[0.5em] w-[0.5em] rounded-full bg-yellow-500' />
        <span className='h-[0.5em] w-[0.5em] rounded-full bg-green-500' />
        <span className='ml-[0.4em] font-mono text-[0.55em] text-slate-400'>mpc@terminal ~/MPC</span>
        {interactive && <span className='ml-auto font-mono text-[0.5em] text-primary/80'>click to interact</span>}
      </div>
      <div className='flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-[0.8em] py-[0.6em] font-mono text-[0.62em] leading-[1.55]'>
        {lines.map((line, i) => (
          <div className={cn("truncate", line.color)} key={line.id}>
            {line.text}
            {i === lines.length - 1 && (
              <span className='ml-[0.1em] inline-block h-[1em] w-[0.5em] animate-pulse bg-accent align-middle' />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

type TargetRect = { top: number; left: number; width: number; height: number };

const targetRect = (): TargetRect => {
  const width = Math.min(960, window.innerWidth * 0.92);
  const height = Math.min(640, window.innerHeight * 0.86);
  return { width, height, left: (window.innerWidth - width) / 2, top: (window.innerHeight - height) / 2 };
};

export function HeroPc({ stats, slides }: { stats: StatsData | null; slides: string[] }) {
  const [interactive, setInteractive] = useState(false);
  const [origin, setOrigin] = useState<TargetRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const screenRef = useRef<HTMLButtonElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const open = origin !== null;
  const lines = useAutoTyping(!open);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia(INTERACTIVE_QUERY);
    const update = () => setInteractive(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!(interactive && scene) || open || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    const render = () => {
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      scene.style.transform = `rotateX(${(BASE_TILT.x + current.x).toFixed(3)}deg) rotateY(${(BASE_TILT.y + current.y).toFixed(3)}deg)`;
      frame =
        Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.01 ? requestAnimationFrame(render) : 0;
    };
    const onMove = (e: PointerEvent) => {
      target.x = -(e.clientY / window.innerHeight - 0.5) * TILT_RANGE.x * 2;
      target.y = (e.clientX / window.innerWidth - 0.5) * TILT_RANGE.y * 2;
      if (!frame) {
        frame = requestAnimationFrame(render);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [interactive, open]);

  const close = useCallback(() => setOrigin(null), []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const openTerminal = () => {
    const rect = screenRef.current?.getBoundingClientRect();
    if (rect) {
      setOrigin({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    }
  };

  const screen = (
    <button
      aria-label='Open interactive terminal'
      className={cn(
        "absolute inset-x-[0.7em] top-[0.7em] bottom-[1.7em] overflow-hidden rounded-[0.2em] border border-slate-700/70 bg-[#0a0d12] text-left shadow-[inset_0_0_1.5em_hsl(var(--accent)/0.12)] outline-none",
        interactive
          ? "pointer-events-auto cursor-pointer transition-shadow duration-300 hover:shadow-[inset_0_0_1.5em_hsl(var(--accent)/0.25),0_0_1.4em_hsl(var(--primary)/0.6)] focus-visible:ring-2 focus-visible:ring-primary"
          : "pointer-events-none"
      )}
      disabled={!interactive}
      onClick={openTerminal}
      ref={screenRef}
      tabIndex={interactive ? 0 : -1}
      type='button'
    >
      <span className='absolute inset-0 motion-safe:animate-[hero-screen-on_1s_ease-out_0.35s_both]'>
        <ScreenContent hidden={open} interactive={interactive} lines={lines} />
      </span>
      <span className='pointer-events-none absolute inset-0 bg-[length:100%_0.25em] bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.18)_50%)] opacity-40' />
    </button>
  );

  const monitorFront = (
    <>
      {screen}
      <span className='absolute bottom-[0.55em] left-1/2 h-[0.5em] w-[0.5em] -translate-x-1/2 rounded-full bg-primary shadow-[0_0_0.6em_hsl(var(--primary)/1)]' />
    </>
  );

  return (
    <div className='relative mx-auto aspect-[44/30] w-[44em] text-[7px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13.5px]'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-x-[4em] bottom-[2em] h-[6em] rounded-[50%] bg-primary/25 blur-[3em] dark:bg-primary/30'
      />
      <div className='pointer-events-none absolute inset-0 [perspective-origin:50%_40%] [perspective:110em]'>
        <motion.div
          animate={{ scale: open ? 1.06 : 1 }}
          className='absolute inset-0 [transform-style:preserve-3d]'
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div
            className='absolute inset-0 will-change-transform [transform-style:preserve-3d]'
            ref={sceneRef}
            style={{ transform: `rotateX(${BASE_TILT.x}deg) rotateY(${BASE_TILT.y}deg)` }}
          >
            <Box d={1.4} front={monitorFront} h={16.5} w={26} x={-9} y={-5.5} z={0} />
            <Box d={1.2} h={7} w={2.4} x={-9} y={6.2} z={-2.4} />
            <Box d={6} h={0.5} w={10} x={-9} y={9.95} z={-2.2} />
            <Box d={10} faceClassName='border-primary/80' h={0.5} top={<LaptopDeck />} w={16} x={13.6} y={9.85} z={6} />
            <div
              className='absolute top-1/2 left-1/2 h-0 w-0 [transform-style:preserve-3d]'
              style={{ transform: "translate3d(13.6em, 9.6em, 1em)" }}
            >
              <div className='h-0 w-0 [transform-style:preserve-3d] [transform:rotateX(18deg)] motion-safe:animate-[hero-lid-open_1.8s_cubic-bezier(0.25,1,0.5,1)_0.5s_both]'>
                <Box d={0.35} front={<Slideshow paused={open} slides={slides} />} h={10} w={16} y={-5} />
              </div>
            </div>
            <Box
              d={6.5}
              faceClassName='border-accent/70 shadow-[0_0_0.8em_hsl(var(--accent)/0.35)]'
              h={0.7}
              top={<Keyboard />}
              w={18}
              x={-8}
              y={9.75}
              z={9.5}
            />
            <Box
              d={3.4}
              faceClassName='rounded-[0.8em] border-accent/70 shadow-[0_0_0.8em_hsl(var(--accent)/0.4)]'
              h={0.8}
              w={2.2}
              x={2.6}
              y={9.8}
              z={10}
            />
            <Box
              d={0.6}
              faceClassName='rounded-[0.9em] border-primary/90'
              front={<PhoneScreen />}
              h={9.4}
              rx={10}
              ry={24}
              w={4.8}
              x={-20.5}
              y={5.3}
              z={11}
            />
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes hero-screen-on {
          0% { opacity: 0; transform: scaleY(0.02); filter: brightness(3); }
          25% { opacity: 1; transform: scaleY(0.02); filter: brightness(3); }
          50% { transform: scaleY(1); filter: brightness(1.6); }
          62% { opacity: 0.35; }
          72% { opacity: 1; }
          82% { opacity: 0.6; }
          100% { opacity: 1; transform: scaleY(1); filter: brightness(1); }
        }
        @keyframes hero-lid-open {
          from { transform: rotateX(-88deg); }
          to { transform: rotateX(18deg); }
        }
        @keyframes hero-phone-boot {
          0%, 70% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes hero-phone-logo {
          0% { opacity: 0; transform: scale(0.8); }
          30%, 60% { opacity: 1; transform: scale(1); }
          75%, 100% { opacity: 0; transform: scale(1.05); }
        }
      `}</style>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {origin && (
              <>
                <motion.button
                  animate={{ opacity: 1 }}
                  aria-label='Close terminal'
                  className='fixed inset-0 z-[9998] cursor-default bg-black/75 backdrop-blur-sm'
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  key='backdrop'
                  onClick={close}
                  transition={{ duration: 0.35 }}
                  type='button'
                />
                <motion.div
                  animate={{ ...targetRect(), borderRadius: 16 }}
                  aria-label='MPC terminal'
                  aria-modal
                  className='fixed z-[9999] flex flex-col overflow-hidden border border-primary/60 bg-[#0D1117] shadow-[0_0_80px_-10px_hsl(var(--primary)/0.55)]'
                  exit={{ ...origin, borderRadius: 4, opacity: 0.6 }}
                  initial={{ ...origin, borderRadius: 4 }}
                  key='panel'
                  role='dialog'
                  transition={{ duration: 0.55, ease: EASE }}
                >
                  <div className='flex shrink-0 items-center gap-2 border-slate-700/50 border-b bg-slate-900/90 px-4 py-3'>
                    <button
                      aria-label='Close terminal'
                      className='h-3 w-3 rounded-full bg-red-500/80 transition-colors hover:bg-red-500'
                      onClick={close}
                      type='button'
                    />
                    <span className='h-3 w-3 rounded-full bg-yellow-500/80' />
                    <span className='h-3 w-3 rounded-full bg-green-500/80' />
                    <Terminal className='ml-3 h-3.5 w-3.5 text-primary' />
                    <span className='font-mono text-slate-400 text-xs'>mpc@terminal ~/MPC</span>
                    <button
                      aria-label='Close terminal'
                      className='ml-auto rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white'
                      onClick={close}
                      type='button'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                  <motion.div
                    animate={{ opacity: 1 }}
                    className='flex min-h-0 flex-1 flex-col'
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    initial={{ opacity: 0 }}
                    transition={{ delay: 0.35, duration: 0.25 }}
                  >
                    <TerminalSession onExit={close} stats={stats} />
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
