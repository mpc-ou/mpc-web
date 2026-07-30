import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { adminGetActivities } from "@/app/_actions/admin";
import type { Activity } from "@/configs/prisma/generated/prisma/client";
import { generatePageSeo } from "@/utils/seo";
import ActivityForm from "../../activity-form";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "activities-edit",
    locale,
    pathname: "/admin/activities/edit"
  });
}

export default async function EditActivityPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const res = await adminGetActivities();
  const activities = (res.data?.payload as Activity[] | undefined) ?? [];
  const activity = activities.find((a) => a.id === id);
  if (!activity) {
    notFound();
  }
  return <ActivityForm activity={activity} />;
}
