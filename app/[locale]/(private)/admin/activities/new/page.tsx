import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { generatePageSeo } from "@/utils/seo";
import ActivityForm from "../activity-form";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({ page: "activities-new", locale, pathname: "/admin/activities/new" });
}

export default async function NewActivityPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ActivityForm />;
}
