"use client";

import type { Provider } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LocaleSelect } from "@/components/custom/Header/LocaleSelect.client";
import { ModeToggle } from "@/components/custom/Header/ModeToggle.client";
import { createClient } from "@/configs/supabase/client";
import { _ROUTE_AUTH_CALLBACK } from "@/constants/route";
import { useHandleError } from "@/hooks/use-handle-error";
import type { ResponseType } from "@/types/response";

const LoginClient = () => {
  const t = useTranslations("common.text");
  const tAuth = useTranslations("auth");

  const { handleErrorClient } = useHandleError();

  const handleLogin = async (provider: Provider) => {
    const supabase = createClient();
    const redirectTo = `${location.origin}${_ROUTE_AUTH_CALLBACK}`;

    await handleErrorClient({
      cb: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo },
        });
        return { data, error } as ResponseType;
      },
      withSuccessNotify: false,
    });
  };

  return (
    <div className="flex h-screen w-full">
      {/* Top-right controls (floating) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <LocaleSelect />
        <ModeToggle />
      </div>

      {/* Left side - Hero image + slogan (PC only, 3/4 width) */}
      <div className="relative hidden w-3/4 lg:block">
        <Image
          src="/images/bg/toc2025.jpg"
          alt="MPClub Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 flex flex-col items-start p-10 text-white xl:p-14">
          <div className="mb-4 flex items-center gap-4">
            <Image
              src="/images/logo.png"
              alt="MPClub Logo"
              width={56}
              height={56}
              className="drop-shadow-lg"
            />
            <h1 className="font-bold text-3xl drop-shadow-lg xl:text-4xl">
              MPClub
            </h1>
          </div>
          <p className="max-w-md text-base text-white/90 drop-shadow-md xl:text-lg">
            Where there&apos;s a bug, there&apos;s MPC!
          </p>
          <p className="mt-1 text-sm text-white/60">
            Faculty of Information Technology — HCMOU
          </p>
        </div>
      </div>

      {/* Right side - Login form (1/4 on PC, full on mobile) */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 lg:w-1/4 lg:min-w-90">
        {/* Mobile background image */}
        <div className="absolute inset-0 lg:hidden">
          <Image
            src="/images/bg/toc2025.jpg"
            alt="Background"
            fill
            className="object-cover opacity-5"
          />
        </div>

        <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <Image
              src="/images/logo.png"
              alt="MPClub Logo"
              width={80}
              height={80}
              className="mb-3"
            />
            <h2 className="font-bold text-2xl">MPClub</h2>
            <p className="text-muted-foreground text-sm">
              Where there&apos;s a bug, there&apos;s MPC!
            </p>
          </div>

          <Card className="w-full shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="font-bold text-xl uppercase">
                {tAuth("title2")}
              </CardTitle>
              <CardDescription>{tAuth("description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => handleLogin("google")}
                variant="outline"
                type="button"
              >
                <Image
                  src="/images/icons/google-icon.svg"
                  alt="Google Icon"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                {t("loginWith")} Google
              </Button>

              {/* GitHub login - tạm ẩn */}
              {/* <Button
                className="w-full"
                onClick={() => handleLogin("github")}
                variant="outline"
                type="button"
              >
                <Image
                  src="/images/icons/github-icon.svg"
                  alt="GitHub Icon"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                {t("loginWith")} GitHub
              </Button> */}
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-muted-foreground text-xs">
            &copy; 2025 MPClub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export { LoginClient };
