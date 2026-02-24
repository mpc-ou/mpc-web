"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { adminDeleteAnnouncement, adminUpdateAnnouncement } from "../actions";
import { type AnnouncementRow, createColumns } from "./columns";
import { AnnouncementFormDialog } from "./form-dialog";

export function AnnouncementsDataTable({ data }: { data: AnnouncementRow[] }) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<AnnouncementRow | null>(null);

  const handleEdit = (a: AnnouncementRow) => {
    setEditAnnouncement(a);
    setDialogOpen(true);
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await handleErrorClient({
      cb: () => adminUpdateAnnouncement(id, { isActive: !isActive }),
      onSuccess: () => router.refresh()
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xóa thông báo?",
      description: "Hành động này không thể hoàn tác."
    });
    if (!ok) {
      return;
    }
    await handleErrorClient({
      cb: () => adminDeleteAnnouncement(id),
      onSuccess: () => router.refresh()
    });
  };

  const handleCreate = () => {
    setEditAnnouncement(null);
    setDialogOpen(true);
  };

  const columns = useMemo(
    () => createColumns(handleEdit, handleToggle, handleDelete),
    [handleDelete, handleEdit, handleToggle]
  );

  return (
    <>
      <ConfirmDialog />
      <DataTable
        columns={columns}
        data={data}
        filterComponent={
          <Button className='ml-auto h-8' onClick={handleCreate} size='sm'>
            <Plus className='mr-2 h-4 w-4' />
            Thêm thông báo
          </Button>
        }
        searchKey='content'
        searchPlaceholder='Tìm theo nội dung...'
      />
      <AnnouncementFormDialog
        announcement={editAnnouncement}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditAnnouncement(null);
            router.refresh();
          }
        }}
        open={dialogOpen}
      />
    </>
  );
}
