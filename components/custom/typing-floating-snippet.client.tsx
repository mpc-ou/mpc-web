"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type TypingFloatingSnippetProps = {
  snippet: string;
  initialLeft: string;
  initialTop: string;
};

export const TypingFloatingSnippet = ({ snippet, initialLeft, initialTop }: TypingFloatingSnippetProps) => {
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"idle" | "typing" | "floating" | "waiting">("idle");
  const [position, setPosition] = useState({ left: initialLeft, top: initialTop });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (phase === "idle") {
      const delay = Math.random() * 800 + 200;
      timerRef.current = setTimeout(() => {
        const leftVal = Number.parseFloat(initialLeft);
        const topVal = Number.parseFloat(initialTop);
        const jitterX = (Math.random() - 0.5) * 6; // +/- 3%
        const jitterY = (Math.random() - 0.5) * 6; // +/- 3%
        setPosition({
          left: `${Math.min(95, Math.max(5, leftVal + jitterX))}%`,
          top: `${Math.min(90, Math.max(5, topVal + jitterY))}%`
        });
        setPhase("typing");
      }, delay);
    }

    if (phase === "typing") {
      let currentIndex = 0;
      const typeChar = () => {
        if (currentIndex < snippet.length) {
          setText(snippet.substring(0, currentIndex + 1));
          currentIndex++;
          timerRef.current = setTimeout(typeChar, Math.random() * 30 + 20); // Snappier character typing
        } else {
          setPhase("floating");
        }
      };
      typeChar();
    }

    if (phase === "floating") {
      timerRef.current = setTimeout(() => {
        setPhase("waiting");
      }, 4500);
    }

    if (phase === "waiting") {
      timerRef.current = setTimeout(
        () => {
          setText("");
          setPhase("idle");
        },
        Math.random() * 800 + 400
      );
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [mounted, phase, snippet, initialLeft, initialTop]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes float-fade-snippet {
          0% {
            transform: translateY(0);
            opacity: 0.12;
          }
          10% {
            opacity: 0.12;
          }
          100% {
            transform: translateY(-45px);
            opacity: 0;
          }
        }
        .animate-float-fade-snippet {
          animation: float-fade-snippet 4.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        @keyframes cursor-blink-snippet {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .animate-cursor-snippet {
          animation: cursor-blink-snippet 0.8s step-end infinite;
        }
      `}</style>
      <span
        className={cn(
          "absolute select-none whitespace-nowrap font-mono text-[10.5px] transition-all duration-300",
          "text-slate-900/60 dark:text-cyan-400/70",
          phase === "typing" && "opacity-[0.12] dark:opacity-[0.16]",
          phase === "floating" && "animate-float-fade-snippet",
          phase === "idle" || phase === "waiting" ? "opacity-0" : ""
        )}
        style={{
          left: position.left,
          top: position.top
        }}
      >
        {text}
        {phase === "typing" && (
          <span className='ml-0.5 inline-block h-[0.85em] w-1 animate-cursor-snippet bg-orange-500/75 align-middle dark:bg-cyan-400/80' />
        )}
      </span>
    </>
  );
};
