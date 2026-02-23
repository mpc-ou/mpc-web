"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import type { MemberOption } from "@/components/member-selector";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { adminDeleteAchievement } from "../actions";
import { type AchievementRow, createColumns } from "./columns";
import { AchievementFormDialog } from "./form-dialog";

export function AchievementsDataTable({
  data,
  allMembers = []
}: {
  data: AchievementRow[];
  allMembers?: MemberOption[];
}) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<AchievementRow | null>(null);
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filteredData = useMemo(() => {
    if (typeFilter === "ALL") {
      return data;
    }
    return data.filter((a) => a.type === typeFilter);
  }, [data, typeFilter]);

  const handleEdit = (a: AchievementRow) => {
    setEditItem(a);
    setDialogOpen(true);
  };
  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xóa thành tựu?",
      description: "Hành động này không thể hoàn tác."
    });
    if (!ok) {
      return;
    }
    await handleErrorClient({
      cb: () => adminDeleteAchievement(id),
      onSuccess: () => router.refresh()
    });
  };
  const handleCreate = () => {
    setEditItem(null);
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
            <Select onValueChange={setTypeFilter} value={typeFilter}>
              <SelectTrigger className='h-8 w-35'>
                <SelectValue placeholder='Lọc loại' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Tất cả</SelectItem>
                <SelectItem value='INDIVIDUAL'>Cá nhân</SelectItem>
                <SelectItem value='TEAM'>Nhóm</SelectItem>
                <SelectItem value='CLUB'>Toàn CLB</SelectItem>
              </SelectContent>
            </Select>
            <Button className='ml-auto h-8' onClick={handleCreate} size='sm'>
              <Plus className='mr-2 h-4 w-4' />
              Thêm thành tựu
            </Button>
          </div>
        }
        searchKey='title'
        searchPlaceholder='Tìm theo tên...'
      />
      <AchievementFormDialog
        achievement={editItem}
        allMembers={allMembers}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditItem(null);
            router.refresh();
          }
        }}
        open={dialogOpen}
      />
    </>
  );
}
