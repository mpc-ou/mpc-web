"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { adminDeleteDepartment } from "../actions";
import { createColumns, type DeptRow } from "./columns";
import { DeptFormDialog } from "./form-dialog";

export function DepartmentsDataTable({ data }: { data: DeptRow[] }) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDept, setEditDept] = useState<DeptRow | null>(null);

  const handleEdit = (d: DeptRow) => {
    setEditDept(d);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xóa ban?",
      description: "Hành động này không thể hoàn tác. Các vai trò thuộc ban này cũng sẽ bị ảnh hưởng."
    });
    if (!ok) {
      return;
    }
    await handleErrorClient({
      cb: () => adminDeleteDepartment(id),
      onSuccess: () => router.refresh()
    });
  };

  const handleCreate = () => {
    setEditDept(null);
    setDialogOpen(true);
  };

  const columns = useMemo(() => createColumns(handleEdit, handleDelete), [handleDelete, handleEdit]);

  return (
    <>
      <ConfirmDialog />
      <DataTable
        columns={columns}
        data={data}
        filterComponent={
          <Button className='ml-auto h-8' onClick={handleCreate} size='sm'>
            <Plus className='mr-2 h-4 w-4' />
            Thêm ban
          </Button>
        }
        searchKey='name'
        searchPlaceholder='Tìm theo tên...'
      />
      <DeptFormDialog
        dept={editDept}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditDept(null);
            router.refresh();
          }
        }}
        open={dialogOpen}
      />
    </>
  );
}
