import { GlowingOrbs, FloatingShapes, ConfettiEffect } from "./animations";

export function SlideCover({
  coverImage,
  name,
  year,
}: {
  coverImage: string | null;
  name: string;
  year: number;
}) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-slate-950 pt-16">
      <div className="absolute inset-0 blueprint-grid opacity-20" />
      <GlowingOrbs />
      <FloatingShapes />
      <ConfettiEffect />
      {coverImage && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20 transition-opacity"
            src={coverImage}
          />
          <div className="absolute inset-0 bg-orange-600/10 mix-blend-overlay" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
      <div className="relative z-10 text-center px-8 animate-fade-in-up flex flex-col items-center">
        <p className="text-orange-400/90 tracking-[0.4em] font-bold uppercase mb-6 text-sm md:text-base lg:text-lg">
          Slideshow
        </p>
        <h1 className="mb-6 font-black text-5xl text-white [text-shadow:0_4px_20px_rgba(0,0,0,0.8)] drop-shadow-2xl sm:text-7xl lg:text-8xl tracking-tight uppercase leading-tight max-w-4xl animate-pulse-glow">
          {name || "Year Recap"}
        </h1>
        <div className="h-2 w-24 bg-orange-500 rounded-full mb-8 shadow-[0_0_20px_rgba(249,115,22,0.8)]" />
        <p className="text-3xl sm:text-4xl text-white font-black tracking-widest [text-shadow:0_2px_10px_rgba(0,0,0,1)] drop-shadow-lg">
          {year - 1} - {year}
        </p>
      </div>
    </div>
  );
}
