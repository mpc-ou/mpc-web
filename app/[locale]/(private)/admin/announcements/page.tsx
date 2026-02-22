import { adminGetAnnouncements } from "../actions";
import type { AnnouncementRow } from "./columns";
import { AnnouncementsDataTable } from "./manager";

export default async function AdminAnnouncementsPage() {
  const { data } = await adminGetAnnouncements();
  const announcements = (data?.payload ?? []) as AnnouncementRow[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-bold text-2xl text-foreground">
          📢 Quản lý Thông báo
        </h1>
        <p className="text-muted-foreground text-sm">
          Thông báo hiển thị trên Announcement Bar
        </p>
      </div>
      <AnnouncementsDataTable data={announcements} />
    </div>
  );
}
