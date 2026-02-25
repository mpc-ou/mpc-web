import { Calendar } from "lucide-react";
import { GlowingOrbs, FloatingShapes, ConfettiEffect } from "./animations";

export function SlideThankYou({
  endImage,
  year,
}: {
  endImage: string | null;
  year: number;
}) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-slate-950 pt-16">
      <div className="absolute inset-0 blueprint-grid opacity-20" />
      <GlowingOrbs />
      <FloatingShapes />
      <ConfettiEffect />
      {endImage && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20 transition-opacity"
            src={endImage}
          />
          <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="relative z-10 text-center px-8 animate-fade-in-up flex flex-col items-center">
        <div className="mb-8 p-6 rounded-full bg-white/5 border border-white/10 shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 transition-shadow">
          <Calendar className="h-16 w-16 text-orange-400" />
        </div>
        <h2 className="mb-4 font-black text-5xl sm:text-7xl text-white uppercase tracking-tighter [text-shadow:0_4px_20px_rgba(0,0,0,0.8)] drop-shadow-xl">
          Cảm ơn bạn!
        </h2>
        <p className="text-xl sm:text-2xl text-white/80 font-light max-w-2xl leading-relaxed mb-6">
          Một năm{" "}
          <span className="font-bold text-white px-2 rounded bg-white/10">
            {year}
          </span>{" "}
          đầy tự hào vì có sự đồng hành của bạn tại MPC.
        </p>
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent mb-6" />
        <p className="text-orange-400 font-bold tracking-[0.2em] uppercase text-sm animate-pulse">
          Tiếp Tục Tham Gia & Lan Tỏa
        </p>
      </div>
    </div>
  );
}
