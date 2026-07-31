import "@/app/globals.css";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { redirect } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { adminGetLayoutData } from "@/app/_actions/admin";
import { ThemeProvider } from "@/components/theme-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn, getFullName } from "@/lib/utils";
import { AdminLayoutWrapper } from "./_components/admin-layout-wrapper";

export const metadata: Metadata = {
  title: {
    template: "%s | MPC Admin",
    default: "MPC Admin"
  },
  robots: { index: false, follow: false }
};

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
  style: ["italic", "normal"]
});

async function AdminLayoutInner({ children }: { children: ReactNode }) {
  const { data, error } = await adminGetLayoutData();

  if (error || !data?.payload) {
    if (error?.message?.includes("Unauthorized")) {
      redirect("/auth");
    }
    redirect("/");
  }

  const { member, logoUrl } = data.payload as {
    member: {
      webRole: string;
      firstName: string;
      middleName: string | null;
      lastName: string;
      avatar: string | null;
    };
    logoUrl: string;
  };
  const memberName = getFullName(member.firstName, member.middleName, member.lastName, "vi");

  return (
    <AdminLayoutWrapper
      logoUrl={logoUrl}
      memberAvatar={member.avatar}
      memberName={memberName}
      memberRole={member.webRole}
    >
      {children}
    </AdminLayoutWrapper>
  );
}

function AdminLayoutFallback() {
  return (
    <div className='flex h-screen flex-col'>
      {/* Header skeleton */}
      <div className='flex h-14 items-center justify-between border-border border-b bg-background px-4'>
        <Skeleton className='h-5 w-40' />
        <Skeleton className='h-8 w-8 rounded-full' />
      </div>
      <div className='flex flex-1 overflow-hidden'>
        {/* Sidebar skeleton */}
        <div className='hidden w-56 flex-col gap-2 border-border border-r bg-background p-4 md:flex'>
          <Skeleton className='mb-4 h-6 w-28' />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton className='h-8 w-full rounded-md' key={`nav-${i.toString()}`} />
          ))}
        </div>
        {/* Content skeleton */}
        <div className='flex-1 bg-muted/30 p-6'>
          <div className='flex flex-col gap-6'>
            <Skeleton className='h-8 w-56' />
            <Skeleton className='h-4 w-36' />
            <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton className='h-24 rounded-xl' key={`card-${i.toString()}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head />
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
              <Suspense fallback={<AdminLayoutFallback />}>
                <AdminLayoutInner>{children}</AdminLayoutInner>
              </Suspense>
            </TooltipProvider>
            <Toaster />
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
