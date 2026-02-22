"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { adminDeleteSponsor } from "../actions";
import { type SponsorRow, createColumns } from "./columns";
import { SponsorFormDialog } from "./form-dialog";

export function SponsorsDataTable({ data }: { data: SponsorRow[] }) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSponsor, setEditSponsor] = useState<SponsorRow | null>(null);

  const handleEdit = (s: SponsorRow) => {
    setEditSponsor(s);
    setDialogOpen(true);
  };
  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xóa nhà tài trợ?",
      description: "Hành động này không thể hoàn tác.",
    });
    if (!ok) return;
    await handleErrorClient({
      cb: () => adminDeleteSponsor(id),
      onSuccess: () => router.refresh(),
    });
  };
  const handleCreate = () => {
    setEditSponsor(null);
    setDialogOpen(true);
  };
  const columns = useMemo(() => createColumns(handleEdit, handleDelete), []);

  return (
    <>
      <ConfirmDialog />
      <DataTable
        columns={columns}
        data={data}
        filterComponent={
          <Button className="ml-auto h-8" onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Thêm nhà tài trợ
          </Button>
        }
        searchKey="name"
        searchPlaceholder="Tìm theo tên..."
      />
      <SponsorFormDialog
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditSponsor(null);
            router.refresh();
          }
        }}
        open={dialogOpen}
        sponsor={editSponsor}
      />
    </>
  );
}
