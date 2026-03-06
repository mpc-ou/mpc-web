"use client";

import { Users } from "lucide-react";
import Image from "next/image";
import { useTransparentHeader } from "@/hooks/use-transparent-header";

export function MembersHeroClient() {
  useTransparentHeader({
    hideActions: false,
    textColor: "rgba(255,255,255,0.7)",
    logoColor: "#fff"
  });

  return (
    <section className='relative flex min-h-[60vh] w-full flex-col items-center justify-center overflow-hidden bg-muted/20 px-4 pt-20 text-center'>
      <div className='absolute inset-0 z-0'>
        <Image
          alt='Members Hero Background'
          className='object-cover opacity-90 dark:opacity-80'
          fill
          priority
          sizes='100vw'
          src='/images/bg/members.jpg'
        />
        <div className='absolute inset-0 bg-linear-to-b from-black/80 via-black/50 to-background' />
      </div>

      <div className='relative z-10 mx-auto max-w-4xl px-4 text-white'>
        <h1 className='mb-6 text-balance font-black text-5xl tracking-tight sm:text-6xl lg:text-7xl'>Thành viên</h1>
        <p className='mx-auto max-w-2xl text-balance text-lg text-white/80 sm:text-xl'>
          Danh sách các thành viên đã và đang đồng hành cùng sự phát triển của câu lạc bộ qua từng năm.
        </p>
      </div>
    </section>
  );
}
