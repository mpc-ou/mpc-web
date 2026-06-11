"use client";

import type { Provider } from "@supabase/supabase-js";
import { Lock, Mail, Sparkles, Terminal } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { signInWithOAuth, signInWithPassword } from "@/app/_actions/auth/auth";
import { LocaleSelect } from "@/components/custom/header/locale-select.client";
import { ModeToggle } from "@/components/custom/header/mode-toggle.client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { _ROUTE_AUTH_CALLBACK } from "@/constants/route";
import { useHandleError } from "@/hooks/use-handle-error";

const LoginClient = () => {
  const tAuth = useTranslations("auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const { handleErrorClient, toast } = useHandleError();

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

  const handleLogin = async (provider: Provider) => {
    const redirectTo = `${location.origin}${_ROUTE_AUTH_CALLBACK}`;

    await handleErrorClient({
      cb: async () => await signInWithOAuth(provider, redirectTo),
      onSuccess: ({ data }: { data: any }) => {
        if ((data as any)?.payload?.url) {
          window.location.href = (data as any).payload.url;
        }
      },
      withSuccessNotify: false
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(email && password)) {
      return;
    }

    setIsEmailLoading(true);

    await handleErrorClient({
      cb: async () => await signInWithPassword({ email, password }),
      onSuccess: () => {
        window.location.href = "/";
      },
      withSuccessNotify: false
    });

    setIsEmailLoading(false);
  };

  const leftLogoTransform = `translate(${mousePosition.x * 25}px, ${mousePosition.y * 25}px) rotate(${mousePosition.x * 5}deg)`;
  const leftTextTransform = `translate(${mousePosition.x * 12}px, ${mousePosition.y * 12}px)`;
  const glowTransform = `translate(${mousePosition.x * 40}px, ${mousePosition.y * 40}px)`;

  return (
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
            alt='MPClub Banner'
            className='object-cover opacity-95 brightness-[0.85] saturate-[1.05] filter'
            fill
            priority
            src='/images/bg/about.jpg'
          />
        </div>
        <div className='absolute inset-0 z-1 bg-linear-to-tr from-slate-950/70 via-slate-950/70 to-transparent dark:from-slate-950/75 dark:via-slate-950/30' />
        <div className='bottom right, rgba(148, 163, 184, 0.207), transparent 70%) absolute inset-0 z-1 bg-linear-gradient(to' />

        <div
          className='relative z-10 flex items-center gap-4 transition-all duration-300'
          style={{ transform: leftLogoTransform }}
        >
          <div className='relative h-14 w-14 select-none drop-shadow-[0_4px_12px_rgba(249,115,22,0.3)] filter'>
            <Image alt='MPClub Logo' className='object-contain' fill priority src='/images/logo.png' />
          </div>
          <div>
            <h2 className='font-black text-2xl text-white tracking-wider drop-shadow-md'>MPC</h2>
            <p className='font-bold text-[10px] text-orange-400 uppercase tracking-widest'>Mobile Programing Club</p>
          </div>
        </div>

        <div
          className='relative z-10 mt-auto text-white transition-all duration-300 ease-out'
          style={{ transform: leftTextTransform }}
        >
          <div className='mb-2 flex items-center gap-2'>
            <Sparkles className='h-5 w-5 animate-pulse text-orange-400' />
            <span className='font-mono font-semibold text-orange-400 text-xs uppercase tracking-widest'>Slogan</span>
          </div>
          <h1 className='mb-2 font-black text-4xl leading-tight tracking-tight drop-shadow-md xl:text-5xl'>
            Where there&apos;s a bug,
            <br />
            there&apos;s{" "}
            <span className='bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent'>MPC!</span>
          </h1>
          <p className='text-sm text-white/60 tracking-wide'>Faculty of Information Technology — HCMOU</p>
        </div>
      </div>

      <div className='relative flex w-full flex-col items-center justify-center overflow-hidden px-6 text-foreground lg:w-[40%] xl:px-12 dark:text-white'>
        <div
          className='pointer-events-none absolute inset-0 z-0 animate-grid-move opacity-[0.08] dark:opacity-[0.1]'
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        />

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
                {tAuth("title2")}
              </CardTitle>
              <CardDescription className='text-slate-500 text-sm dark:text-slate-400'>
                {tAuth("description")}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <form className='space-y-4' onSubmit={handleEmailLogin}>
                <div className='space-y-2'>
                  <Label
                    className='font-bold text-slate-500 text-xs uppercase tracking-wider dark:text-slate-400'
                    htmlFor='email'
                  >
                    Email
                  </Label>
                  <div className='relative'>
                    <Mail className='absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400' />
                    <Input
                      className='h-11 border-slate-200 bg-white/50 pl-10 focus-visible:ring-orange-500 dark:border-white/10 dark:bg-slate-900/50'
                      id='email'
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder='m.example@gmail.com'
                      required
                      type='email'
                      value={email}
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label
                    className='font-bold text-slate-500 text-xs uppercase tracking-wider dark:text-slate-400'
                    htmlFor='password'
                  >
                    Mật khẩu
                  </Label>
                  <div className='relative'>
                    <Lock className='absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400' />
                    <Input
                      className='h-11 border-slate-200 bg-white/50 pl-10 focus-visible:ring-orange-500 dark:border-white/10 dark:bg-slate-900/50'
                      id='password'
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      type='password'
                      value={password}
                    />
                  </div>
                </div>

                <Button
                  className='h-11 w-full bg-gradient-to-r from-orange-500 to-amber-500 font-semibold text-sm transition-all duration-300 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.98]'
                  disabled={isEmailLoading || !email || !password}
                  type='submit'
                >
                  {isEmailLoading ? (
                    <div className='flex items-center gap-2'>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                      Đăng nhập...
                    </div>
                  ) : (
                    "Đăng nhập bằng Email"
                  )}
                </Button>
              </form>

              <div className='relative py-2'>
                <div className='absolute inset-0 flex items-center'>
                  <Separator className='w-full border-slate-200/60 dark:border-white/10' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-white px-3 font-bold text-[10px] text-slate-400 tracking-wider dark:bg-[#0b1324]'>
                    Hoặc tiếp tục với
                  </span>
                </div>
              </div>

              <div className='flex flex-col gap-3 sm:flex-row'>
                <Button
                  className='h-11 flex-1 border-slate-200 font-medium transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:hover:bg-slate-900 dark:hover:text-white'
                  onClick={() => handleLogin("google")}
                  type='button'
                  variant='outline'
                >
                  <Image
                    alt='Google Icon'
                    className='mr-2'
                    height={18}
                    src='/images/icons/google-icon.svg'
                    width={18}
                  />
                  Google
                </Button>

                <Button
                  className='h-11 flex-1 border-slate-200 font-medium transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:hover:bg-slate-900 dark:hover:text-white'
                  onClick={() => handleLogin("github")}
                  type='button'
                  variant='outline'
                >
                  <Image
                    alt='GitHub Icon'
                    className='mr-2'
                    height={18}
                    src='/images/icons/github-icon.svg'
                    width={18}
                  />
                  GitHub
                </Button>
              </div>
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
