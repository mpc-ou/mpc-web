import { ConfettiEffect, FloatingShapes, GlowingOrbs } from "./animations";

export function SlideCover({ coverImage, name, year }: { coverImage: string | null; name: string; year: number }) {
  return (
    <div className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-slate-950 pt-16'>
      <div className='blueprint-grid absolute inset-0 opacity-20' />
      <GlowingOrbs />
      <FloatingShapes />
      <ConfettiEffect />
      {coverImage && (
        <div className='absolute inset-0'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=''
            className='absolute inset-0 h-full w-full object-cover opacity-20 transition-opacity'
            src={coverImage}
          />
          <div className='absolute inset-0 bg-orange-600/10 mix-blend-overlay' />
        </div>
      )}
      <div className='absolute inset-0 bg-black/20' />
      <div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60' />
      <div className='relative z-10 flex animate-fade-in-up flex-col items-center px-8 text-center'>
        <p className='mb-6 font-bold text-orange-400/90 text-sm uppercase tracking-[0.4em] md:text-base lg:text-lg'>
          Slideshow
        </p>
        <h1 className='mb-6 max-w-4xl animate-pulse-glow font-black text-5xl text-white uppercase leading-tight tracking-tight drop-shadow-2xl [text-shadow:0_4px_20px_rgba(0,0,0,0.8)] sm:text-7xl lg:text-8xl'>
          {name || "Year Recap"}
        </h1>
        <div className='mb-8 h-2 w-24 rounded-full bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)]' />
        <p className='font-black text-3xl text-white tracking-widest drop-shadow-lg [text-shadow:0_2px_10px_rgba(0,0,0,1)] sm:text-4xl'>
          {year - 1} - {year}
        </p>
      </div>
    </div>
  );
}
