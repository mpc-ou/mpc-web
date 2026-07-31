"use client";

import { Sparkles, Terminal } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { LocaleSelect } from "@/components/custom/header/locale-select.client";
import { ModeToggle } from "@/components/custom/header/mode-toggle.client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHandleError } from "@/hooks/use-handle-error";

const LoginClient = () => {
  const tAuth = useTranslations("auth");

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useHandleError();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const description = params.get("error_description");
      if (description) {
        toast({
          title: tAuth("error.title") || "Đăng nhập thất bại",
          description: decodeURIComponent(description).replace(/\+/g, " "),
          variant: "destructive"
        });
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  }, [tAuth, toast]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) {
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePosition({ x: 0, y: 0 });
  }, []);

  const handleSsoLogin = () => {
    window.location.href = "/api/auth/login";
  };

  const leftLogoTransform = `translate(${mousePosition.x * 25}px, ${mousePosition.y * 25}px) rotate(${mousePosition.x * 5}deg)`;
  const leftTextTransform = `translate(${mousePosition.x * 12}px, ${mousePosition.y * 12}px)`;
  const glowTransform = `translate(${mousePosition.x * 40}px, ${mousePosition.y * 40}px)`;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: decorative mouse-tracking parallax effect
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative mouse-tracking parallax effect
    <div
      className='flex h-screen w-full overflow-hidden bg-slate-50 transition-colors duration-300 dark:bg-[#070b13]'
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      <style>{`
        @keyframes float-up-slow {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float-down-slow {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(12px) rotate(-2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes laser-sweep {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 32px 32px; }
        }
        .animate-float-up {
          animation: float-up-slow 8s ease-in-out infinite;
        }
        .animate-float-down {
          animation: float-down-slow 10s ease-in-out infinite;
        }
        .animate-laser {
          animation: laser-sweep 15s ease-in-out infinite;
        }
        .animate-grid-move {
          animation: grid-move 1s linear infinite;
        }
      `}</style>

      <div className='fixed top-4 right-4 z-50 flex items-center gap-2'>
        <LocaleSelect />
        <ModeToggle />
      </div>

      <div className='relative hidden w-[60%] flex-col justify-between overflow-hidden border-slate-200/40 border-r p-12 lg:flex xl:p-16 dark:border-white/5'>
        <div
          className='absolute inset-0 z-0 scale-105 transition-transform duration-500 ease-out'
          style={{
            transform: `translate(${mousePosition.x * -8}px, ${mousePosition.y * -8}px)`
          }}
        >
          <Image
            alt='Banner background'
            className='object-cover object-center brightness-[0.45] dark:brightness-[0.35]'
            fill
            priority
            src='/images/bg/toc2025.jpg'
          />
          <div className='absolute inset-0 bg-[#070b13]/55 dark:bg-[#070b13]/75' />
          <div className='absolute inset-0 bg-gradient-to-r from-[#070b13]/70 via-transparent to-transparent' />
        </div>

        <div className='relative z-10 flex items-center gap-3'>
          <div
            className='relative h-10 w-10 select-none drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)] filter transition-transform duration-500 ease-out'
            style={{ transform: leftLogoTransform }}
          >
            <Image alt='MPClub Logo' className='object-contain' fill src='/images/logo.png' />
          </div>
          <span className='font-black text-white text-xl tracking-tight'>MPClub</span>
        </div>

        <div
          className='relative z-10 max-w-xl transition-transform duration-500 ease-out'
          style={{ transform: leftTextTransform }}
        >
          <div className='inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/20 px-3 py-1 font-bold text-[11px] text-orange-400 uppercase tracking-wider'>
            <Sparkles className='h-3 w-3 animate-pulse' />
            {tAuth("clubManagementSystem")}
          </div>
          <h1 className='mt-6 font-black text-4xl text-white leading-tight tracking-tight xl:text-5xl'>
            {tAuth("adminPlatform")}
            <br />
            <span className='bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent'>
              {tAuth("membersActivities")}
            </span>
          </h1>
          <p className='mt-4 font-medium text-slate-300 text-sm leading-relaxed'>{tAuth("descriptionLeft")}</p>
        </div>

        <div className='relative z-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs'>
          <span className='font-bold text-slate-300 uppercase tracking-wider'>&copy; {tAuth("copyright")}</span>
          <div className='h-1 w-1 rounded-full bg-slate-500' />
          <span className='font-semibold text-slate-300'>{tAuth("version")}</span>
        </div>
      </div>

      <div className='relative flex flex-1 items-center justify-center p-6 sm:p-10 lg:w-[40%]'>
        <div className='absolute inset-0 z-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] opacity-40 [background-size:16px_16px] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] dark:opacity-30' />

        <div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
          <div className='absolute top-0 bottom-0 w-[180px] animate-laser bg-gradient-to-r from-transparent via-orange-500/10 to-transparent blur-2xl dark:via-orange-400/8' />
        </div>
        <div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
          <div
            className='absolute top-[20%] left-[25%] h-[4px] w-[4px] animate-ping rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
            style={{ animationDuration: "3s" }}
          />
          <div
            className='absolute top-[75%] left-[65%] h-[4px] w-[4px] animate-ping rounded-full bg-orange-400 shadow-[0_0_8px_#fb923c]'
            style={{ animationDuration: "4s", animationDelay: "1.5s" }}
          />
          <div
            className='absolute top-[45%] left-[80%] h-[3px] w-[3px] animate-pulse rounded-full bg-cyan-400/80 shadow-[0_0_6px_#22d3ee]'
            style={{ animationDuration: "2.5s" }}
          />
        </div>

        <div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
          <div className='absolute top-12 left-1/4 h-32 w-32 animate-float-up rounded-full bg-orange-500/5 blur-2xl dark:bg-orange-500/8' />
          <div className='absolute right-1/4 bottom-20 h-40 w-40 animate-float-down rounded-full bg-cyan-500/5 blur-2xl dark:bg-cyan-500/6' />
        </div>

        <div
          className='pointer-events-none absolute top-1/4 left-1/4 z-0 h-[300px] w-[300px] rounded-full bg-orange-500/10 blur-3xl transition-transform duration-500 ease-out dark:bg-orange-500/5'
          style={{ transform: glowTransform }}
        />
        <div className='absolute inset-0 z-0 overflow-hidden lg:hidden'>
          <Image
            alt='Background'
            className='scale-105 object-cover opacity-10 saturate-[1.2] filter'
            fill
            src='/images/bg/toc2025.jpg'
          />
          <div className='absolute inset-0 bg-linear-to-b from-[#070b13]/80 via-[#070b13]/95 to-[#070b13]' />
        </div>

        <div className='relative z-10 flex w-full max-w-md flex-col items-center'>
          <div className='mb-8 flex flex-col items-center text-center lg:hidden'>
            <div className='relative mb-4 h-20 w-20 select-none drop-shadow-[0_4px_12px_rgba(249,115,22,0.3)] filter'>
              <Image alt='MPClub Logo' className='object-contain' fill src='/images/logo.png' />
            </div>
            <h2 className='font-black text-2xl text-slate-900 dark:text-white'>MPClub</h2>
            <p className='mt-1 font-medium text-muted-foreground text-xs'>
              Where there&apos;s a bug, there&apos;s MPC!
            </p>
          </div>

          <Card className='w-full border-slate-200/50 bg-white/80 shadow-2xl backdrop-blur-lg dark:border-white/10 dark:bg-[#0b1324]/80'>
            <CardHeader className='space-y-2 pb-6 text-center'>
              <CardTitle className='flex items-center justify-center gap-2 font-black text-2xl text-slate-900 uppercase tracking-tight dark:text-white'>
                <Terminal className='h-5 w-5 text-orange-500' />
                {tAuth("ssoTitle")}
              </CardTitle>
              <CardDescription className='text-slate-500 text-sm dark:text-slate-400'>
                {tAuth("description")}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6 pt-2 pb-8'>
              <Button
                className='flex h-12 w-full items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 font-semibold text-base transition-all duration-300 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.98]'
                onClick={handleSsoLogin}
                type='button'
              >
                <div className='relative h-6.5 w-6.5 select-none drop-shadow-[0_2px_4px_rgba(255,255,255,0.25)] filter'>
                  <Image alt='Logo' className='object-contain' fill src='/images/logo.png' />
                </div>
                <span>{tAuth("ssoButton")}</span>
              </Button>
            </CardContent>
          </Card>

          <p className='mt-8 text-center font-medium text-[11px] text-slate-400 tracking-wide dark:text-slate-500'>
            &copy; {new Date().getFullYear()} Mobile Programing Club. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export { LoginClient };
