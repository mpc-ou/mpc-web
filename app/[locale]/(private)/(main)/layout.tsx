import type { ReactNode } from "react";
import { Suspense } from "react";
import { PageLayoutSkeleton } from "@/components/custom/loading";
import { PageLayout } from "@/components/custom/page-layout";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageLayoutSkeleton />}>
      <PageLayout>{children}</PageLayout>
    </Suspense>
  );
}
