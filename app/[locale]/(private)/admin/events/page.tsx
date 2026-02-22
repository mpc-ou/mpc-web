import { adminGetEvents } from "../actions";
import type { EventRow } from "./columns";
import { EventsDataTable } from "./table";

export default async function AdminEventsPage() {
  const { data } = await adminGetEvents();
  const events = (data?.payload ?? []) as EventRow[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-bold text-2xl text-foreground">📅 Quản lý Sự kiện</h1>
      <EventsDataTable data={events} />
    </div>
  );
}
