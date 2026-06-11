import { Roboto } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import NextTopLoader from "nextjs-toploader";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { _LOCALES } from "@/constants/lang";
import { TransparentHeaderProvider } from "@/hooks/use-transparent-header";
import { cn } from "@/lib/utils";
import type { locale } from "@/types/global";
import { ThemeProvider } from "../theme-provider";
import { Toaster } from "../ui/toaster";
import { TooltipProvider } from "../ui/tooltip";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
  style: ["italic", "normal"]
});

import { prisma } from "@/configs/prisma/db";

function hexToHslValues(hex: string): string {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = Number.parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = Number.parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = Number.parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return `${hDeg} ${sPct}% ${lPct}%`;
}

type BaseLayoutType = { children: ReactNode; locale: locale };

export async function BaseLayout({ children, locale }: BaseLayoutType) {
  const [messages, primaryColorSetting, faviconSetting] = await Promise.all([
    getMessages(),
    prisma.siteSetting.findUnique({ where: { key: "site_primary_color" } }),
    prisma.siteSetting.findUnique({ where: { key: "site_favicon" } })
  ]);

  const faviconUrl = faviconSetting?.value || "/favicon.ico";
  const primaryColorHex = primaryColorSetting?.value || "#f97316";
  const primaryColorHsl = hexToHslValues(primaryColorHex);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link href={faviconUrl} rel='icon' />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            :root, .dark {
              --primary: ${primaryColorHsl};
              --ring: ${primaryColorHsl};
            }
          `
          }}
        />
      </head>
      <body className={cn(roboto.className, "flex h-screen w-screen flex-col")}>
        <NuqsAdapter>
          <ThemeProvider attribute='class' defaultTheme='system' disableTransitionOnChange enableSystem>
            <NextTopLoader
              color='hsl(var(--primary))'
              crawl={true}
              crawlSpeed={200}
              easing='ease'
              height={3}
              initialPosition={0.08}
              shadow='0 0 10px hsl(var(--primary) / 0.7), 0 0 5px hsl(var(--primary) / 0.4)'
              showSpinner={false}
              speed={200}
            />
            <TooltipProvider>
              <NextIntlClientProvider messages={messages}>
                <TransparentHeaderProvider>{children}</TransparentHeaderProvider>
              </NextIntlClientProvider>
            </TooltipProvider>
            <Toaster />
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
