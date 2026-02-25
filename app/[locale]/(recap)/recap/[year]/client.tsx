"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
  Home,
} from "lucide-react";

import type { RecapData } from "@/lib/recap-data";

import { SlideCover } from "./components/slide-cover";
import { SlideStats } from "./components/slide-stats";
import { SlideNewMembers } from "./components/slide-new-members";
import { SlideExecutiveBoard } from "./components/slide-executive-board";
import { SlideTimeline } from "./components/slide-timeline";
import { SlideThankYou } from "./components/slide-thank-you";

export function RecapSlideViewer({
  recapData,
  name,
  year,
  coverImage,
  coverImage2,
  coverImage3,
  endImage,
  musicUrl,
}: {
  recapData: RecapData;
  name: string;
  year: number;
  coverImage: string | null;
  coverImage2: string | null;
  coverImage3: string | null;
  endImage: string | null;
  musicUrl: string | null;
}) {
  const router = useRouter();

  const hasExec =
    recapData.executiveBoard && recapData.executiveBoard.length > 0;
  const execOffset = hasExec ? 1 : 0;
  // Cover, Stats, NewMembers, [ExecBoard?], ...timeline, ThankYou
  const totalSlides = 3 + execOffset + recapData.timeline.length + 1;

  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const goNext = useCallback(
    () => setCurrent((p) => Math.min(p + 1, totalSlides - 1)),
    [totalSlides],
  );
  const goPrev = useCallback(() => setCurrent((p) => Math.max(p - 1, 0)), []);

  // Auto-play
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(goNext, 8000);
    return () => clearInterval(timer);
  }, [autoPlay, goNext]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") router.push("/recap");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, router]);

  // Audio control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
  }, [volume, muted]);

  // Try autoplay on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Browser might block autoplay
      });
    }

    // Cleanup audio on unmount
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Start audio on first interaction
  const startAudio = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
  };

  const getSlideInfo = (idx: number) => {
    if (idx === 0) return { title: "Trang bìa", date: "" };
    if (idx === 1) return { title: "Tình hình hoạt động", date: "" };
    if (idx === 2) return { title: "Thế hệ tiếp nối", date: "" };
    if (hasExec && idx === 3) return { title: "Ban điều hành", date: "" };
    if (idx === totalSlides - 1) return { title: "Lời tri ân", date: "" };

    const timelineIdx = idx - (3 + execOffset);
    const item = recapData.timeline[timelineIdx];
    if (item) {
      const d = new Date(item.date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return { title: item.title, date: d };
    }
    return { title: "Slide", date: "" };
  };

  // Progress
  const progress = totalSlides > 1 ? (current / (totalSlides - 1)) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950 select-none cursor-default"
      onClick={startAudio}
    >
      {/* Audio */}
      {musicUrl && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio autoPlay loop muted={muted} ref={audioRef} src={musicUrl} />
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3">
        {/* Left */}
        <div className="flex items-center gap-2">
          <button
            className="rounded-full bg-white/10 p-2 text-white/70 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
            onClick={() => router.push("/recap")}
            title="Thoát"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            className="rounded-full bg-white/10 p-2 text-white/70 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
            onClick={() => router.push("/")}
            title="Trang chủ"
          >
            <Home className="h-4 w-4" />
          </button>
        </div>

        {/* Center — slide counter */}
        <span className="rounded-full bg-white/10 px-3 py-1 text-white/60 text-xs backdrop-blur-md tabular-nums">
          {current + 1} / {totalSlides}
        </span>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Auto-play toggle */}
          <button
            className={`rounded-full p-2 backdrop-blur-md transition-colors ${autoPlay ? "bg-orange-500/30 text-orange-500" : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"}`}
            onClick={() => setAutoPlay(!autoPlay)}
            title={autoPlay ? "Tạm dừng tự động" : "Tự động chạy"}
          >
            {autoPlay ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>

          {/* Volume */}
          {musicUrl && (
            <div className="group relative">
              <button
                className="rounded-full bg-white/10 p-2 text-white/70 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
                onClick={() => {
                  setMuted(!muted);
                  startAudio();
                }}
                title={muted ? "Bật nhạc" : "Tắt nhạc"}
              >
                {muted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <div className="absolute right-0 top-full mt-0 hidden rounded-lg bg-white/10 p-4 backdrop-blur-md group-hover:block">
                <input
                  className="h-20 w-1 accent-orange-500"
                  max={1}
                  min={0}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  step={0.1}
                  style={{ writingMode: "vertical-lr", direction: "rtl" }}
                  type="range"
                  value={volume}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide content */}
      <div className="h-full w-full">
        {current === 0 && (
          <SlideCover coverImage={coverImage} name={name} year={year} />
        )}
        {current === 1 && (
          <SlideStats
            active={current === 1}
            coverImage2={coverImage2}
            stats={recapData.stats}
          />
        )}
        {current === 2 && (
          <SlideNewMembers
            coverImage3={coverImage3}
            members={recapData.newMembers}
          />
        )}
        {hasExec && current === 3 && (
          <SlideExecutiveBoard members={recapData.executiveBoard} />
        )}
        {current >= 3 + execOffset &&
          current < 3 + execOffset + recapData.timeline.length && (
            <SlideTimeline
              item={recapData.timeline[current - (3 + execOffset)]}
            />
          )}
        {current === totalSlides - 1 && (
          <SlideThankYou endImage={endImage} year={year} />
        )}
      </div>

      {/* Navigation arrows (desktop arrows) */}
      <button
        className="absolute inset-y-0 left-0 z-20 flex w-20 md:w-32 items-center justify-start pl-4 opacity-0 transition-opacity hover:opacity-100 bg-gradient-to-r from-black/50 to-transparent"
        onClick={() => {
          startAudio();
          goPrev();
        }}
      >
        <ChevronLeft className="h-10 w-10 text-white/70 hover:text-white transition-colors" />
      </button>
      <button
        className="absolute inset-y-0 right-0 z-20 flex w-20 md:w-32 items-center justify-end pr-4 opacity-0 transition-opacity hover:opacity-100 bg-gradient-to-l from-black/50 to-transparent"
        onClick={() => {
          startAudio();
          goNext();
        }}
      >
        <ChevronRight className="h-10 w-10 text-white/70 hover:text-white transition-colors" />
      </button>

      {/* Seek Progress Bar (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-2 hover:h-4 lg:hover:h-5 transition-all group/progress z-50 flex cursor-pointer bg-black/40">
        {/* Filled secondary progress */}
        <div
          className="absolute top-0 left-0 bottom-0 bg-orange-500 transition-all duration-500 ease-out z-0 pointer-events-none backdrop-blur-sm"
          style={{ width: `${progress}%` }}
        />

        {Array.from({ length: totalSlides }).map((_, i) => {
          const info = getSlideInfo(i);
          return (
            <div
              className="relative h-full flex-1 z-10 group/node hover:bg-white/10 transition-colors"
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(i);
                startAudio();
              }}
            >
              {/* Hidden line mark for items */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 h-full w-[1px] bg-white/20 hidden group-hover/progress:block" />

              <div className="pointer-events-none absolute bottom-full left-1/2 mb-3 hidden -translate-x-1/2 flex-col items-center group-hover/node:flex w-max z-[100]">
                <div className="rounded-xl bg-black/90 px-3 py-2 text-center text-xs text-white shadow-xl backdrop-blur-md border border-white/10">
                  <p className="font-bold whitespace-nowrap">{info.title}</p>
                  {info.date && (
                    <p className="text-orange-400 mt-0.5 text-[10px] font-semibold">
                      {info.date}
                    </p>
                  )}
                </div>
                {/* Arrow down */}
                <div className="h-2 w-2 rotate-45 bg-black/90 border-r border-b border-white/10 -mt-1 shadow-sm" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Global animations & styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes fade-in-up {
              from { opacity: 0; transform: translateY(30px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes pulse-glow {
              0%, 100% { transform: scale(1); opacity: 0.6; }
              50% { transform: scale(1.1); opacity: 1; }
            }
            @keyframes confetti {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0) rotate(-5deg); }
              50% { transform: translateY(-20px) rotate(5deg); }
            }
            @keyframes float-slow {
              0%, 100% { transform: translateY(0) rotate(2deg); }
              50% { transform: translateY(-30px) rotate(-2deg); }
            }
            .animate-pulse-glow {
              animation: pulse-glow 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            .animate-confetti {
              animation: confetti linear forwards;
            }
            .animate-float {
              animation: float 6s ease-in-out infinite;
            }
            .animate-float-slow {
              animation: float-slow 10s ease-in-out infinite;
            }
            .animate-fade-in-up {
              animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
            }
            .blueprint-grid {
              background-image: 
                linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
              background-size: 40px 40px;
              background-position: center center;
            }
            .custom-scrollbar::-webkit-scrollbar {
              width: 5px;
              height: 5px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.2);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.3);
            }
          `,
        }}
      />
    </div>
  );
}
