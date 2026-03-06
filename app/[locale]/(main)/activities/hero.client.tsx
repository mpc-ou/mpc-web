"use client";

import { CalendarHeart } from "lucide-react";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { useTransparentHeader } from "@/hooks/use-transparent-header";

export function EventsHeroClient({ title, subtitle }: { title: string; subtitle: string }) {
  useTransparentHeader({
    hideActions: false,
    textColor: "rgba(255,255,255,0.7)",
    logoColor: "#fff"
  });

  return (
    <section className='relative flex min-h-[60vh] w-full flex-col items-center justify-center overflow-hidden bg-muted/20 px-4 pt-20 text-center'>
      <div className='absolute inset-0 z-0'>
        <Image
          alt='Events Hero Background'
          className='absolute inset-0 h-full w-full object-cover opacity-90 dark:opacity-80'
          fill
          priority
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw'
          src='/images/birthday/2025_0.jpg'
        />
        <div className='absolute inset-0 bg-linear-to-b from-black/80 via-black/50 to-background' />
      </div>

      <ScrollReveal className='relative z-10 mx-auto max-w-4xl px-4 text-white'>
        <h1 className='mb-6 text-balance font-black text-5xl tracking-tight sm:text-6xl lg:text-7xl'>{title}</h1>
        <p className='mx-auto max-w-2xl text-balance text-lg text-white/80 sm:text-xl'>{subtitle}</p>
      </ScrollReveal>
    </section>
  );
}
