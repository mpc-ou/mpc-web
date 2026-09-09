import { connection } from "next/server";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { BaseLayout } from "@/components/custom/base-layout";
import { ErrorContent } from "@/components/custom/error-content.client";
import { LoadingComponent } from "@/components/custom/loading";

function NotFound() {
  const t = useTranslations("defaultPage.notFound");

  return <ErrorContent description={t("description")} redirect={t("redirect")} statusCode={404} title={t("title")} />;
}

async function NotFoundContent() {
  await connection();

  return (
    <BaseLayout locale='en'>
      <NotFound />
    </BaseLayout>
  );
}

export default function SuspenseNotFound() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <NotFoundContent />
    </Suspense>
  );
}
