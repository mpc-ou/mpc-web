import { FileText } from "lucide-react";
import { adminGetPostsPaginated } from "@/app/_actions/admin";
import { AdminPageHeader } from "../_components/admin-page-header";
import type { PostRow } from "./columns";
import { PostsDataTable } from "./table";

type SearchParams = Promise<{
  page?: string;
  limit?: string;
  q?: string;
  type?: string;
  status?: string;
}>;

export default async function AdminPostsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}): Promise<React.ReactNode> {
  const { locale } = await params;
  const sparams = await searchParams;
  const page = Number(sparams.page) || 1;
  const limit = Number(sparams.limit) || 10;
  const search = sparams.q || "";
  const typeFilter = (sparams.type || "ALL") as "ALL" | "BLOG" | "EVENT" | "ACHIEVEMENT";

  // Requirement: Default status filter to "PUBLISHED"
  const statusFilter = sparams.status || "PUBLISHED";

  const res = await adminGetPostsPaginated({
    page,
    limit,
    search,
    type: typeFilter,
    status: statusFilter
  });

  const posts = ((res.data?.payload as any)?.posts ?? []) as PostRow[];
  const totalCount = ((res.data?.payload as any)?.total ?? 0) as number;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        description='Biên soạn và quản lý bài viết, sự kiện và thành tựu của câu lạc bộ'
        icon={FileText}
        title='Quản lý Nội dung'
      />
      <PostsDataTable
        initialPosts={posts}
        initialTotalCount={totalCount}
        initialTotalPages={totalPages}
        locale={locale}
      />
    </div>
  );
}
