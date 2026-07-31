"use client";

import { AlertTriangleIcon, ArrowLeft, Ban, Globe, Lock, RefreshCwIcon, Search, ServerCrash } from "lucide-react";
import Link from "next/link";
import { HeroBackground } from "@/components/custom/hero-background.client";
import { Button } from "@/components/ui/button";

type ErrorContentProps = {
  reset?: () => void;
  statusCode?: number;
  title: string;
  description: string;
  reminder?: string;
  tryAgain?: string;
  redirect?: string;
  redirectHref?: string;
};

const STATUS_COLORS: Record<number, string> = {
  401: "text-amber-500",
  403: "text-orange-500",
  404: "text-blue-500",
  500: "text-red-500",
  502: "text-purple-500"
};

const STATUS_ICONS: Record<number, React.ComponentType<{ className?: string }>> = {
  401: Lock,
  403: Ban,
  404: Search,
  500: ServerCrash,
  502: Globe
};

export function ErrorContent({
  reset,
  statusCode,
  title,
  description,
  reminder,
  tryAgain = "Thử lại",
  redirect = "Về trang chủ",
  redirectHref = "/"
}: ErrorContentProps) {
  const Icon = statusCode ? STATUS_ICONS[statusCode] : null;
  const colorClass = statusCode ? STATUS_COLORS[statusCode] : "text-red-500";

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4'>
      <HeroBackground />

      <div className='relative z-10 flex w-full max-w-lg flex-col items-center text-center'>
        {/* Status code */}
        {statusCode && (
          <div className='mb-2 flex items-center gap-3'>
            {Icon && <Icon className={`h-10 w-10 ${colorClass}`} />}
            <span className={`font-black text-7xl tracking-tighter ${colorClass} opacity-80 md:text-8xl`}>
              {statusCode}
            </span>
          </div>
        )}

        {/* Icon for generic errors */}
        {!statusCode && (
          <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10'>
            <AlertTriangleIcon className='h-8 w-8 text-red-500' />
          </div>
        )}

        {/* Title */}
        <h1 className='mb-3 font-bold text-2xl text-foreground md:text-3xl'>{title}</h1>

        {/* Description */}
        <p className='mb-8 max-w-md text-muted-foreground text-sm leading-relaxed md:text-base'>{description}</p>

        {/* Reminder */}
        {reminder && (
          <div className='mb-6 w-full rounded-xl border border-border bg-muted/40 px-5 py-3'>
            <p className='text-muted-foreground text-xs leading-relaxed'>{reminder}</p>
          </div>
        )}

        {/* Actions */}
        <div className='flex flex-col gap-3 sm:flex-row'>
          {reset && (
            <Button className='gap-2' onClick={() => reset()} size='lg'>
              <RefreshCwIcon className='h-4 w-4' />
              {tryAgain}
            </Button>
          )}
          <Link href={redirectHref} passHref prefetch={true}>
            <Button className='gap-2' size='lg' variant={reset ? "outline" : "default"}>
              <ArrowLeft className='h-4 w-4' />
              {redirect}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
