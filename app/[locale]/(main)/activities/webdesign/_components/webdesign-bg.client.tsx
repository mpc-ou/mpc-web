"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TypingFloatingSnippet } from "@/components/custom/typing-floating-snippet.client";

const WEBDESIGN_SNIPPETS = [
  "const [theme, setTheme] = useState('dark');",
  "<div className='grid grid-cols-12 gap-4'>",
  "background: linear-gradient(135deg, #f97316, #3b82f6);",
  "export default function WebChallenge() {",
  "display: flex; align-items: center; justify-content: center;",
  "@keyframes pulse { 0%, 100% { opacity: 1; } }",
  "const UI = useMemo(() => renderDesign(), []);",
  "box-shadow: 0 25px 50px -12px rgba(249, 115, 22, 0.35);"
];

const snippetPositions = WEBDESIGN_SNIPPETS.map((_, i) => ({
  left: `${(i * 21 + 8) % 85}%`,
  top: `${(i * 19 + 10) % 80}%`
}));

export function WebDesignBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const rafRef = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const gx = (e.clientX - rect.left) / rect.width - 0.5;
    const gy = (e.clientY - rect.top) / rect.height - 0.5;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      setOffset({ x: gx, y: gy });
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMouseMove]);

  const codeTransform = `translate(${offset.x * -16}px, ${offset.y * -16}px)`;
  const orbTransform1 = `translate(${offset.x * 35}px, ${offset.y * 35}px)`;
  const orbTransform2 = `translate(${offset.x * -45}px, ${offset.y * -45}px)`;
  const orbTransform3 = `translate(${offset.x * 25}px, ${offset.y * -35}px)`;

  return (
    <div className='pointer-events-none absolute inset-0 z-0 select-none overflow-hidden' ref={containerRef}>
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-45px) scale(1.15); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(45px) scale(0.85); }
        }
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 32px 32px; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.1); }
        }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 14s ease-in-out infinite; }
        .animate-grid-move { animation: grid-move 16s linear infinite; }
        .animate-pulse-glow { animation: pulse-glow 7s ease-in-out infinite; }
      `}</style>

      {/* Moving animated grid */}
      <div
        className='pointer-events-none absolute inset-0 animate-grid-move opacity-20 dark:opacity-40'
        style={{
          backgroundImage:
            "radial-gradient(rgba(249, 115, 22, 0.35) 1.5px, transparent 1.5px), radial-gradient(rgba(59, 130, 246, 0.25) 1.5px, transparent 1.5px)",
          backgroundSize: "32px 32px, 16px 16px"
        }}
      />

      {/* Dynamic Glowing Parallax Orbs */}
      <div
        className='pointer-events-none absolute top-[5%] left-[5%] z-0 h-[500px] w-[500px] animate-float-slow rounded-full bg-orange-500/15 blur-[120px] transition-transform duration-300 ease-out dark:bg-orange-500/30'
        style={{ transform: orbTransform1 }}
      />
      <div
        className='pointer-events-none absolute top-1/3 right-[5%] z-0 h-[550px] w-[550px] animate-float-reverse rounded-full bg-blue-500/15 blur-[140px] transition-transform duration-300 ease-out dark:bg-blue-500/30'
        style={{ transform: orbTransform2 }}
      />
      <div
        className='pointer-events-none absolute bottom-1/4 left-1/4 z-0 h-[450px] w-[450px] animate-float-slow animate-pulse-glow rounded-full bg-emerald-500/15 blur-[110px] transition-transform duration-300 ease-out dark:bg-emerald-500/25'
        style={{ transform: orbTransform3 }}
      />
      <div className='pointer-events-none absolute top-2/3 right-1/3 z-0 h-[480px] w-[480px] animate-float-reverse rounded-full bg-purple-500/15 blur-[130px] dark:bg-purple-500/25' />

      <div
        className='pointer-events-none absolute inset-0 select-none overflow-hidden transition-transform duration-300 ease-out'
        style={{ transform: codeTransform }}
      >
        {WEBDESIGN_SNIPPETS.map((snippet, i) => {
          const pos = snippetPositions[i];
          if (!pos) {
            return null;
          }
          return <TypingFloatingSnippet initialLeft={pos.left} initialTop={pos.top} key={snippet} snippet={snippet} />;
        })}
      </div>
    </div>
  );
}
