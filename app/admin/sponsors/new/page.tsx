import { adminGetActivities } from "@/app/_actions/admin";
import SponsorForm from "../sponsor-form";

export default async function NewSponsorPage() {
  const actRes = await adminGetActivities();
  const activities = (actRes.data?.payload as Array<{ id: string; titleVi: string }>) ?? [];
  return <SponsorForm activities={activities} />;
}
