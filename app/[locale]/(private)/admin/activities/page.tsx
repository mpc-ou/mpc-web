import { Activity } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { adminGetActivities } from "@/app/_actions/admin";
import type { Activity as ActivityModel } from "@/configs/prisma/generated/prisma/client";
import { generatePageSeo } from "@/utils/seo";
import { AdminPageHeader } from "../_components/admin-page-header";
import { ActivitiesDataTable } from "./manager";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "activities-admin",
    locale,
    pathname: "/admin/activities"
  });
}

export default async function ActivitiesAdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const res = await adminGetActivities();
  const data = (res.data?.payload as ActivityModel[] | undefined) ?? [];
  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        description='Danh sách các hoạt động nội bộ và đối ngoại của CLB'
        icon={Activity}
        title='Quản lý Hoạt động'
      />
      <ActivitiesDataTable data={data} />
    </div>
  );
}
