import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { adminGetActivities, adminGetSponsors } from "@/app/_actions/admin";
import { generatePageSeo } from "@/utils/seo";
import type { SponsorRow } from "../../columns";
import SponsorForm from "../../sponsor-form";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "sponsors-edit",
    locale,
    pathname: "/admin/sponsors/edit"
  });
}

export default async function EditSponsorPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const [sponsorsRes, actRes] = await Promise.all([adminGetSponsors(), adminGetActivities()]);
  const sponsors = (sponsorsRes.data?.payload as unknown as SponsorRow[]) ?? [];
  const sponsor = sponsors.find((s) => s.id === id);
  if (!sponsor) {
    notFound();
  }
  const activities = (actRes.data?.payload as Array<{ id: string; titleVi: string }>) ?? [];
  return <SponsorForm activities={activities} sponsor={sponsor} />;
}
