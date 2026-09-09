import { notFound } from "next/navigation";
import { adminGetActivities, adminGetSponsors } from "@/app/_actions/admin";
import type { SponsorRow } from "../../columns";
import SponsorForm from "../../sponsor-form";

export default async function EditSponsorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [sponsorsRes, actRes] = await Promise.all([adminGetSponsors(), adminGetActivities()]);
  const sponsors = (sponsorsRes.data?.payload as unknown as SponsorRow[]) ?? [];
  const sponsor = sponsors.find((s) => s.id === id);
  if (!sponsor) {
    notFound();
  }
  const activities = (actRes.data?.payload as Array<{ id: string; titleVi: string }>) ?? [];
  return <SponsorForm activities={activities} sponsor={sponsor} />;
}
