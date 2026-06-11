import { connection } from "next/server";
import { useTranslations } from "next-intl";
import { BaseLayout } from "@/components/custom/base-layout";
import { ErrorContent } from "@/components/custom/error-content.client";
import type { locale } from "@/types/global";

type Params = Promise<{ locale: string }>;
type SearchParams = Promise<{ code?: string }>;

export default async function ErrorPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  await connection();
  const { locale: rawLocale } = await params;
  const locale = rawLocale as locale;
  const { code } = await searchParams;
  const statusCode = Number(code) || 500;

  const keyMap: Record<number, keyof IntlMessages["defaultPage"]> = {
    401: "unauthorized",
    403: "forbidden",
    500: "serverError",
    502: "badGateway"
  };

  const i18nKey = keyMap[statusCode] ?? "serverError";

  return (
    <BaseLayout locale={locale}>
      <ErrorPageContent i18nKey={i18nKey} statusCode={statusCode} />
    </BaseLayout>
  );
}

function ErrorPageContent({ i18nKey, statusCode }: { i18nKey: keyof IntlMessages["defaultPage"]; statusCode: number }) {
  const t = useTranslations(`defaultPage.${i18nKey}` as any);

  const is401 = statusCode === 401;

  return (
    <ErrorContent
      description={t("description")}
      redirect={is401 ? (t as any)("redirect") : (t as any)("redirect")}
      redirectHref={is401 ? "/login" : "/"}
      reminder={(t as any)("reminder")}
      statusCode={statusCode}
      title={t("title")}
    />
  );
}
