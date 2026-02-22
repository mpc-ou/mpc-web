import { Suspense } from "react";
import type { ReactNode } from "react";
import { PageLayout } from "@/components/custom/PageLayout";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <PageLayout>{children}</PageLayout>
    </Suspense>
  );
}
