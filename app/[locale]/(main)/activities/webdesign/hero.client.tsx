"use client";

import { MonitorPlay } from "lucide-react";
import Image from "next/image";
import { useTransparentHeader } from "@/hooks/use-transparent-header";

export function WebDesignHeroClient({ title, subtitle }: { title: string; subtitle: string }) {
  useTransparentHeader({
    hideActions: false,
    textColor: "rgba(255,255,255,0.7)",
    logoColor: "#fff"
  });

  return (
    <section className='relative mb-20 flex min-h-[60vh] w-full flex-col items-center justify-center overflow-hidden bg-muted/20 px-4 pt-20 text-center'>
      <div className='absolute inset-0 z-0 bg-black'>
        <Image
          alt='Web Design Hero'
          className='absolute inset-0 h-full w-full object-cover opacity-50 dark:opacity-40'
          fill
          priority
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw'
          src='/images/web-design/2025_0.jpg'
        />
        <div className='absolute inset-0 bg-linear-to-b from-black/80 via-black/50 to-background' />
      </div>

      <div className='relative z-10 mx-auto max-w-4xl px-4 text-white'>
        <h1 className='mb-6 text-balance font-black text-4xl uppercase tracking-tight sm:text-5xl lg:text-7xl'>
          {title}
        </h1>
        <p className='mx-auto max-w-2xl text-balance text-lg text-white/80 sm:text-lg'>{subtitle}</p>
      </div>
    </section>
  );
}
