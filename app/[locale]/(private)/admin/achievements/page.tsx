import { adminGetAchievements, adminGetMembers } from "../actions";
import type { AchievementRow } from "./columns";
import type { MemberOption } from "@/components/member-selector";
import { AchievementsDataTable } from "./manager";

export default async function AdminAchievementsPage() {
  const [achievementsRes, membersRes] = await Promise.all([adminGetAchievements(), adminGetMembers()]);
  const achievements = (achievementsRes.data?.payload ?? []) as AchievementRow[];
  const allMembers = ((membersRes.data?.payload ?? []) as MemberOption[]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-bold text-2xl text-foreground">🏆 Quản lý Thành tựu</h1>
      <AchievementsDataTable allMembers={allMembers} data={achievements} />
    </div>
  );
}
