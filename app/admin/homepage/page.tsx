import { LayoutDashboard } from "lucide-react";
import { adminGetHomepageSections } from "@/app/_actions/admin";
import { AdminPageHeader } from "../_components/admin-page-header";
import type { SectionRow } from "./columns";
import { HomepageDataTable } from "./manager";

export default async function AdminHomepagePage(): Promise<React.ReactNode> {
  const { data } = await adminGetHomepageSections();
  const sections = (data?.payload ?? []) as SectionRow[];

  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        description='Cấu hình nội dung các section trang chủ'
        icon={LayoutDashboard}
        title='Quản lý Trang chủ'
      />
      <HomepageDataTable data={sections} />
    </div>
  );
}
