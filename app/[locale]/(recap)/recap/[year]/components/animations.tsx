import { Calendar, FolderGit2, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

export function GlowingOrbs() {
  return (
    <div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
      <div className='absolute top-[10%] left-[5%] h-72 w-72 animate-pulse-glow rounded-full bg-blue-600/30 blur-[100px] md:h-96 md:w-96' />
      <div
        className='absolute right-[5%] bottom-[20%] h-72 w-72 animate-pulse-glow rounded-full bg-purple-600/30 blur-[100px] md:h-96 md:w-96'
        style={{ animationDelay: "2s" }}
      />
      <div
        className='absolute top-[40%] right-[30%] h-64 w-64 animate-pulse-glow rounded-full bg-emerald-600/20 blur-[90px]'
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
    const colors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-pink-500", "bg-purple-500", "bg-white/80"];
    setPieces(
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        width: 8 + Math.random() * 8,
        height: 15 + Math.random() * 15,
        animDelay: Math.random() * 5,
        animDuration: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)]
      }))
    );
  }, []);

  if (pieces.length === 0) {
    return null;
  }

  return (
    <div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
      {pieces.map((p) => (
        <div
          className={`absolute -top-10 rounded-sm ${p.color} animate-confetti shadow-black/20 shadow-sm`}
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

export function FloatingShapes() {
  return (
    <div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
      {/* Decorative SVG shapes floating gently */}
      <div className='absolute top-1/4 left-[15%] animate-float opacity-30' style={{ animationDelay: "0s" }}>
        <Trophy className='h-16 w-16 text-amber-500/50' />
      </div>
      <div className='absolute right-[20%] bottom-1/3 animate-float opacity-30' style={{ animationDelay: "2s" }}>
        <Calendar className='h-20 w-20 text-blue-500/50' />
      </div>
      <div className='absolute top-[15%] right-[10%] animate-float-slow opacity-20' style={{ animationDelay: "1s" }}>
        <div className='h-16 w-16 rounded-full border-4 border-pink-500/50 border-dashed' />
      </div>
      <div className='absolute bottom-[20%] left-[25%] animate-float-slow opacity-20' style={{ animationDelay: "3s" }}>
        <FolderGit2 className='h-24 w-24 text-emerald-500/50' />
      </div>
    </div>
  );
}
