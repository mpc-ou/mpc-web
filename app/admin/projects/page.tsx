import { FolderOpen } from "lucide-react";
import { adminGetProjectsPaginated } from "@/app/_actions/admin";
import { AdminPageHeader } from "../_components/admin-page-header";
import type { ProjectRow } from "./columns";
import { ProjectsDataTable } from "./manager";

type SearchParams = Promise<{
  page?: string;
  limit?: string;
  q?: string;
  status?: string;
}>;

export default async function AdminProjectsPage({
  searchParams
}: {
  searchParams: SearchParams;
}): Promise<React.ReactNode> {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const q = params.q || "";
  const status = params.status || "ALL";

  const res = await adminGetProjectsPaginated({
    page,
    limit,
    search: q,
    isActive: status
  });

  const payload = res.data?.payload as { projects?: ProjectRow[]; totalPages?: number } | null;
  const projects = payload?.projects ?? [];
  const totalPages = payload?.totalPages ?? 0;

  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        description='Các dự án nghiên cứu và sản phẩm của câu lạc bộ'
        icon={FolderOpen}
        title='Quản lý Dự án'
      />
      <ProjectsDataTable data={projects} totalPages={totalPages} />
    </div>
  );
}
