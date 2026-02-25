import { useState, useEffect } from "react";
import { Trophy, Calendar, FolderGit2 } from "lucide-react";

export function GlowingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-[10%] left-[5%] w-72 h-72 md:w-96 md:h-96 bg-blue-600/30 rounded-full blur-[100px] animate-pulse-glow" />
      <div
        className="absolute bottom-[20%] right-[5%] w-72 h-72 md:w-96 md:h-96 bg-purple-600/30 rounded-full blur-[100px] animate-pulse-glow"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-[40%] right-[30%] w-64 h-64 bg-emerald-600/20 rounded-full blur-[90px] animate-pulse-glow"
        style={{ animationDelay: "4s" }}
      />
    </div>
  );
}

export function ConfettiEffect() {
  const [pieces, setPieces] = useState<
    {
      id: number;
      left: number;
      width: number;
      height: number;
      animDelay: number;
      animDuration: number;
      color: string;
    }[]
  >([]);

  useEffect(() => {
    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-pink-500",
      "bg-purple-500",
      "bg-white/80",
    ];
    setPieces(
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        width: 8 + Math.random() * 8,
        height: 15 + Math.random() * 15,
        animDelay: Math.random() * 5,
        animDuration: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
      })),
    );
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {pieces.map((p) => (
        <div
          key={p.id}
          className={`absolute -top-10 rounded-sm ${p.color} animate-confetti shadow-sm shadow-black/20`}
          style={{
            left: `${p.left}%`,
            width: `${p.width}px`,
            height: `${p.height}px`,
            animationDelay: `${p.animDelay}s`,
            animationDuration: `${p.animDuration}s`,
          }}
        />
      ))}
    </div>
  );
}

export function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Decorative SVG shapes floating gently */}
      <div
        className="absolute top-1/4 left-[15%] opacity-30 animate-float"
        style={{ animationDelay: "0s" }}
      >
        <Trophy className="h-16 w-16 text-amber-500/50" />
      </div>
      <div
        className="absolute bottom-1/3 right-[20%] opacity-30 animate-float"
        style={{ animationDelay: "2s" }}
      >
        <Calendar className="h-20 w-20 text-blue-500/50" />
      </div>
      <div
        className="absolute top-[15%] right-[10%] opacity-20 animate-float-slow"
        style={{ animationDelay: "1s" }}
      >
        <div className="w-16 h-16 border-4 border-dashed border-pink-500/50 rounded-full" />
      </div>
      <div
        className="absolute bottom-[20%] left-[25%] opacity-20 animate-float-slow"
        style={{ animationDelay: "3s" }}
      >
        <FolderGit2 className="h-24 w-24 text-emerald-500/50" />
      </div>
    </div>
  );
}
