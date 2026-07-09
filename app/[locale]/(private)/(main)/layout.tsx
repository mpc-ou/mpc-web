import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { PageLayoutSkeleton } from "@/components/custom/loading";
import { PageLayout } from "@/components/custom/page-layout";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function MainLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<PageLayoutSkeleton />}>
      <PageLayout>{children}</PageLayout>
    </Suspense>
  );
}
