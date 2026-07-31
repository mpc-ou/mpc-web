import { notFound } from "next/navigation";
import { adminGetActivities } from "@/app/_actions/admin";
import type { Activity } from "@/configs/prisma/generated/prisma/client";
import ActivityForm from "../../activity-form";

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await adminGetActivities();
  const activities = (res.data?.payload as Activity[] | undefined) ?? [];
  const activity = activities.find((a) => a.id === id);
  if (!activity) {
    notFound();
  }
  return <ActivityForm activity={activity} />;
}
