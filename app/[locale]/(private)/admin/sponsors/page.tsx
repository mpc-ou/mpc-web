import { HandHeart } from "lucide-react";
import { adminGetSponsors } from "@/app/_actions/admin";
import { AdminPageHeader } from "../_components/admin-page-header";
import type { SponsorRow } from "./columns";
import { SponsorsDataTable } from "./table";

export default async function AdminSponsorsPage(): Promise<React.ReactNode> {
  const { data } = await adminGetSponsors();
  const sponsors = (data?.payload ?? []) as SponsorRow[];

  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        description='Danh sách các tổ chức và cá nhân tài trợ câu lạc bộ'
        icon={HandHeart}
        title='Quản lý Nhà tài trợ'
      />
      <SponsorsDataTable data={sponsors} />
    </div>
  );
}
