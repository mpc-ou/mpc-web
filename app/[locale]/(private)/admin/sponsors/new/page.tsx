import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { adminGetActivities } from "@/app/_actions/admin";
import { generatePageSeo } from "@/utils/seo";
import SponsorForm from "../sponsor-form";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "sponsors-new",
    locale,
    pathname: "/admin/sponsors/new"
  });
}

export default async function NewSponsorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const actRes = await adminGetActivities();
  const activities = (actRes.data?.payload as any[]) ?? [];
  return <SponsorForm activities={activities} />;
}
