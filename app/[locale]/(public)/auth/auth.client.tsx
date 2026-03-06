"use client";

import type { Provider } from "@supabase/supabase-js";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { signInWithOAuth, signInWithPassword } from "@/app/[locale]/actions/auth";
import { LocaleSelect } from "@/components/custom/Header/LocaleSelect.client";
import { ModeToggle } from "@/components/custom/Header/ModeToggle.client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { _ROUTE_AUTH_CALLBACK } from "@/constants/route";
import { useHandleError } from "@/hooks/use-handle-error";

const LoginClient = () => {
  const t = useTranslations("common.text");
  const tAuth = useTranslations("auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);

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

  return (
    <div className='flex h-screen w-full'>
      {/* Top-right controls (floating) */}
      <div className='fixed top-4 right-4 z-50 flex items-center gap-2'>
        <LocaleSelect />
        <ModeToggle />
      </div>

      {/* Left side - Hero image + slogan (PC only, 3/4 width) */}
      <div className='relative hidden w-3/4 lg:block'>
        <Image alt='MPClub Banner' className='object-cover' fill priority src='/images/bg/toc2025.jpg' />
        <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent' />
        <div className='absolute bottom-0 left-0 flex flex-col items-start p-10 text-white xl:p-14'>
          <div className='mb-4 flex items-center gap-4'>
            <Image alt='MPClub Logo' className='drop-shadow-lg' height={56} src='/images/logo.png' width={56} />
            <h1 className='font-bold text-3xl drop-shadow-lg xl:text-4xl'>MPClub</h1>
          </div>
          <p className='max-w-md text-base text-white/90 drop-shadow-md xl:text-lg'>
            Where there&apos;s a bug, there&apos;s MPC!
          </p>
          <p className='mt-1 text-sm text-white/60'>Faculty of Information Technology — HCMOU</p>
        </div>
      </div>

      {/* Right side - Login form (1/4 on PC, full on mobile) */}
      <div className='relative flex w-full flex-col items-center justify-center px-6 lg:w-1/4 lg:min-w-90'>
        {/* Mobile background image */}
        <div className='absolute inset-0 lg:hidden'>
          <Image alt='Background' className='object-cover opacity-5' fill src='/images/bg/toc2025.jpg' />
        </div>

        <div className='relative z-10 flex w-full max-w-sm flex-col items-center'>
          {/* Mobile logo */}
          <div className='mb-8 flex flex-col items-center lg:hidden'>
            <Image alt='MPClub Logo' className='mb-3' height={80} src='/images/logo.png' width={80} />
            <h2 className='font-bold text-2xl'>MPClub</h2>
            <p className='text-muted-foreground text-sm'>Where there&apos;s a bug, there&apos;s MPC!</p>
          </div>

          <Card className='w-full shadow-lg'>
            <CardHeader className='text-center'>
              <CardTitle className='font-bold text-xl uppercase'>{tAuth("title2")}</CardTitle>
              <CardDescription>{tAuth("description")}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <form className='space-y-3' onSubmit={handleEmailLogin}>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='m.example@gmail.com'
                    required
                    type='email'
                    value={email}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='password'>Mật khẩu</Label>
                  <Input
                    id='password'
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    type='password'
                    value={password}
                  />
                </div>
                <Button className='w-full' disabled={isEmailLoading || !email || !password} type='submit'>
                  {isEmailLoading ? "Đang đăng nhập..." : "Đăng nhập bằng Email"}
                </Button>
              </form>

              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <Separator className='w-full' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-card px-2 text-muted-foreground'>Hoặc tiếp tục với</span>
                </div>
              </div>

              <div className='flex flex-col gap-3'>
                <Button className='w-full' onClick={() => handleLogin("google")} type='button' variant='outline'>
                  <Image
                    alt='Google Icon'
                    className='mr-2'
                    height={20}
                    src='/images/icons/google-icon.svg'
                    width={20}
                  />
                  Google
                </Button>

                <Button className='w-full' onClick={() => handleLogin("github")} type='button' variant='outline'>
                  <Image
                    alt='GitHub Icon'
                    className='mr-2'
                    height={20}
                    src='/images/icons/github-icon.svg'
                    width={20}
                  />
                  GitHub
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className='mt-6 text-center text-muted-foreground text-xs'>&copy; 2025 MPClub. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export { LoginClient };
