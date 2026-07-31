import { Activity } from "lucide-react";
import { adminGetActivities } from "@/app/_actions/admin";
import type { Activity as ActivityModel } from "@/configs/prisma/generated/prisma/client";
import { AdminPageHeader } from "../_components/admin-page-header";
import { ActivitiesDataTable } from "./manager";

export default async function ActivitiesAdminPage() {
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
