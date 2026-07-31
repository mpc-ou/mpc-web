import { Users } from "lucide-react";
import { adminGetDepartments, adminGetMembersPaginated } from "@/app/_actions/admin";
import { AdminPageHeader } from "../_components/admin-page-header";
import type { MemberRow } from "./columns";
import { MembersDataTable } from "./table";
import type { Department } from "./types";

const DEFAULT_LOCALE = "vi";

export default async function AdminMembersPage({
  searchParams
}: {
  searchParams: Promise<{
    q?: string;
    role?: string;
    dept?: string;
    year?: string;
    page?: string;
    limit?: string;
  }>;
}): Promise<React.ReactNode> {
  const sp = await searchParams;
  const q = sp.q || "";
  const role = sp.role || "ALL";
  const dept = sp.dept || "ALL";
  const year = sp.year || "ALL";
  const pageNum = Number.parseInt(sp.page || "1", 10) || 1;
  const limitNum = Number.parseInt(sp.limit || "10", 10) || 10;

  const [membersRes, depsRes] = await Promise.all([
    adminGetMembersPaginated({
      search: q,
      role,
      dept,
      year,
      page: pageNum,
      limit: limitNum
    }),
    adminGetDepartments()
  ]);

  // biome-ignore lint/suspicious/noExplicitAny: response payload structure is dynamic
  const membersPayload = membersRes.data?.payload as any;
  const { payload = [], totalPages = 0, totalCount = 0, stats } = membersPayload ?? {};
  const members = payload as MemberRow[];
  const departments = (depsRes.data?.payload ?? []) as Department[];

  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        description='Danh sách và thông tin thành viên câu lạc bộ'
        icon={Users}
        title='Quản lý Thành viên'
      />
      <MembersDataTable
        data={members}
        departments={departments}
        locale={DEFAULT_LOCALE}
        stats={stats}
        totalCount={totalCount}
        totalPages={totalPages}
      />
    </div>
  );
}
