"use client";

import { Users } from "lucide-react";
import Image from "next/image";
import { useTransparentHeader } from "@/hooks/use-transparent-header";

export function MembersHeroClient() {
  useTransparentHeader({
    hideActions: false,
    textColor: "rgba(255,255,255,0.7)",
    logoColor: "#fff",
  });

  return (
    <section className="relative flex min-h-[60vh] w-full flex-col items-center justify-center overflow-hidden bg-muted/20 px-4 pt-20 text-center">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/bg/hero-bg.jpg"
          alt="Members Hero Background"
          fill
          className="object-cover opacity-60 dark:opacity-40"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/50 to-background" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-white">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-white backdrop-blur-md border border-white/20">
          <Users className="h-10 w-10" />
        </div>
        <h1 className="mb-6 font-black text-5xl tracking-tight sm:text-6xl lg:text-7xl text-balance">
          Thành viên
        </h1>
        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-white/80 text-balance">
          Danh sách các thành viên đã và đang đồng hành cùng sự phát triển của
          câu lạc bộ qua từng năm.
        </p>
      </div>
    </section>
  );
}
