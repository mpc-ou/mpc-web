"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { adminDeletePost } from "../actions";
import { createColumns, type PostRow } from "./columns";
import { PostFormDialog } from "./form-dialog";

export function PostsDataTable({ data }: { data: PostRow[] }) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPost, setEditPost] = useState<PostRow | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredData = useMemo(() => {
    if (statusFilter === "ALL") {
      return data;
    }
    return data.filter((p) => p.status === statusFilter);
  }, [data, statusFilter]);

  const handleEdit = (post: PostRow) => {
    setEditPost(post);
    setDialogOpen(true);
  };
  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xóa bài viết?",
      description: "Hành động này không thể hoàn tác."
    });
    if (!ok) {
      return;
    }
    await handleErrorClient({
      cb: () => adminDeletePost(id),
      onSuccess: () => router.refresh()
    });
  };
  const handleCreate = () => {
    setEditPost(null);
    setDialogOpen(true);
  };
  const columns = useMemo(() => createColumns(handleEdit, handleDelete), []);

  return (
    <>
      <ConfirmDialog />
      <DataTable
        columns={columns}
        data={filteredData}
        filterComponent={
          <div className='flex items-center gap-2'>
            <Select onValueChange={setStatusFilter} value={statusFilter}>
              <SelectTrigger className='h-8 w-[160px]'>
                <SelectValue placeholder='Lọc trạng thái' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Tất cả</SelectItem>
                <SelectItem value='DRAFT'>Nháp</SelectItem>
                <SelectItem value='PENDING_REVIEW'>Chờ duyệt</SelectItem>
                <SelectItem value='PUBLISHED'>Đã xuất bản</SelectItem>
                <SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
              </SelectContent>
            </Select>
            <Button className='ml-auto h-8' onClick={handleCreate} size='sm'>
              <Plus className='mr-2 h-4 w-4' />
              Tạo bài viết
            </Button>
          </div>
        }
        searchKey='title'
        searchPlaceholder='Tìm theo tiêu đề...'
      />
      <PostFormDialog
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditPost(null);
            router.refresh();
          }
        }}
        open={dialogOpen}
        post={editPost}
      />
    </>
  );
}
