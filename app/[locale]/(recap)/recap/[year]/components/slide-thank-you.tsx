import { Calendar } from "lucide-react";
import { ConfettiEffect, FloatingShapes, GlowingOrbs } from "./animations";

export function SlideThankYou({ endImage, year }: { endImage: string | null; year: number }) {
  return (
    <div className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-slate-950 pt-16'>
      <div className='blueprint-grid absolute inset-0 opacity-20' />
      <GlowingOrbs />
      <FloatingShapes />
      <ConfettiEffect />
      {endImage && (
        <div className='absolute inset-0'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=''
            className='absolute inset-0 h-full w-full object-cover opacity-20 transition-opacity'
            src={endImage}
          />
          <div className='absolute inset-0 bg-orange-500/10 mix-blend-overlay' />
        </div>
      )}
      <div className='absolute inset-0 bg-black/30' />
      <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
      <div className='relative z-10 flex animate-fade-in-up flex-col items-center px-8 text-center'>
        <div className='mb-8 rounded-full border border-white/10 bg-white/5 p-6 shadow-orange-500/10 shadow-xl transition-shadow hover:shadow-orange-500/20'>
          <Calendar className='h-16 w-16 text-orange-400' />
        </div>
        <h2 className='mb-4 font-black text-5xl text-white uppercase tracking-tighter drop-shadow-xl [text-shadow:0_4px_20px_rgba(0,0,0,0.8)] sm:text-7xl'>
          Cảm ơn bạn!
        </h2>
        <p className='mb-6 max-w-2xl font-light text-white/80 text-xl leading-relaxed sm:text-2xl'>
          Một năm <span className='rounded bg-white/10 px-2 font-bold text-white'>{year}</span> đầy tự hào vì có sự đồng
          hành của bạn tại MPC.
        </p>
        <div className='mb-6 h-px w-32 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent' />
        <p className='animate-pulse font-bold text-orange-400 text-sm uppercase tracking-[0.2em]'>
          Tiếp Tục Tham Gia & Lan Tỏa
        </p>
      </div>
    </div>
  );
}
