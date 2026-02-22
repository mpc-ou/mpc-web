import { adminGetDepartments, adminGetMembers } from "../actions";
import type { MemberRow } from "./columns";
import { MembersDataTable } from "./table";

export default async function AdminMembersPage() {
  const [membersRes, depsRes] = await Promise.all([adminGetMembers(), adminGetDepartments()]);
  const members = (membersRes.data?.payload ?? []) as MemberRow[];
  const departments = ((depsRes.data?.payload ?? []) as { id: string; name: string }[]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-bold text-2xl text-foreground">👥 Quản lý Thành viên</h1>
      <MembersDataTable data={members} departments={departments} />
    </div>
  );
}
