import { getTranslations, setRequestLocale } from "next-intl/server";
import type { locale } from "@/types/global";
import { LoginClient } from "./auth.client";

type PageType = { params: Promise<{ locale: locale }> };

export async function generateMetadata({ params }: PageType) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("title"),
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true
      }
    }
  };
}

export default async function Page({ params }: PageType): Promise<React.ReactNode> {
  const { locale } = await params;
  setRequestLocale(locale as locale);

  return <LoginClient />;
}
