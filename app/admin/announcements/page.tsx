import { Megaphone } from "lucide-react";
import { adminGetAnnouncements } from "@/app/_actions/admin";
import type { Announcement } from "@/configs/prisma/generated/prisma/client";
import { AdminPageHeader } from "../_components/admin-page-header";
import type { AnnouncementRow } from "./columns";
import { AnnouncementsDataTable } from "./manager";

export default async function AdminAnnouncementsPage(): Promise<React.ReactNode> {
  const { data } = await adminGetAnnouncements();
  const rows = (data?.payload ?? []) as Announcement[];
  const announcements: AnnouncementRow[] = rows.map((a) => ({
    id: a.id,
    contentVi: a.contentVi,
    contentEn: a.contentEn,
    linkUrl: a.linkUrl,
    linkLabelVi: a.linkLabelVi,
    linkLabelEn: a.linkLabelEn,
    bgColor: a.bgColor,
    isActive: a.isActive,
    startAt: a.startAt.toISOString(),
    endAt: a.endAt ? a.endAt.toISOString() : null
  }));

  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        description='Thông báo hiển thị trên Announcement Bar'
        icon={Megaphone}
        title='Quản lý Thông báo'
      />
      <AnnouncementsDataTable data={announcements} locale='vi' />
    </div>
  );
}
