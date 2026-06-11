import { Megaphone } from "lucide-react";
import { adminGetAnnouncements } from "@/app/_actions/admin";
import { AdminPageHeader } from "../_components/admin-page-header";
import type { AnnouncementRow } from "./columns";
import { AnnouncementsDataTable } from "./manager";

export default async function AdminAnnouncementsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactNode> {
  const { locale } = await params;
  const { data } = await adminGetAnnouncements();
  const announcements = (data?.payload ?? []) as AnnouncementRow[];

  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        description='Thông báo hiển thị trên Announcement Bar'
        icon={Megaphone}
        title='Quản lý Thông báo'
      />
      <AnnouncementsDataTable data={announcements} locale={locale} />
    </div>
  );
}
