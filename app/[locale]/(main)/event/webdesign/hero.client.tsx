"use client";

import { MonitorPlay } from "lucide-react";
import { useTransparentHeader } from "@/hooks/use-transparent-header";
import Image from "next/image";

export function WebDesignHeroClient({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  useTransparentHeader({
    hideActions: false,
    textColor: "rgba(255,255,255,0.7)",
    logoColor: "#fff",
  });

  return (
    <section className="relative flex min-h-[60vh] w-full flex-col items-center justify-center overflow-hidden bg-muted/20 px-4 pt-20 text-center mb-20">
      <div className="absolute inset-0 z-0 bg-black">
        <Image
          src="/images/web-design/2025_0.jpg"
          alt="Web Design Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-50 dark:opacity-40"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/50 to-background" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-white">
        <h1 className="mb-6 font-black text-4xl tracking-tight sm:text-5xl lg:text-7xl text-balance uppercase">
          {title}
        </h1>
        <p className="mx-auto max-w-2xl text-lg sm:text-lg text-white/80 text-balance">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
