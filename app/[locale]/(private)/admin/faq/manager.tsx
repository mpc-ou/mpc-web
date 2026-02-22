"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { adminDeleteFaqItem } from "../actions";
import { type FaqRow, createColumns } from "./columns";
import { FaqFormDialog } from "./form-dialog";

export function FaqDataTable({ data }: { data: FaqRow[] }) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editFaq, setEditFaq] = useState<FaqRow | null>(null);

  const handleEdit = (f: FaqRow) => {
    setEditFaq(f);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xóa FAQ?",
      description: "Hành động này không thể hoàn tác.",
    });
    if (!ok) return;
    await handleErrorClient({
      cb: () => adminDeleteFaqItem(id),
      onSuccess: () => router.refresh(),
    });
  };

  const handleCreate = () => {
    setEditFaq(null);
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
            Thêm FAQ
          </Button>
        }
        searchKey="question"
        searchPlaceholder="Tìm theo câu hỏi..."
      />
      <FaqFormDialog
        faq={editFaq}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditFaq(null);
            router.refresh();
          }
        }}
        open={dialogOpen}
      />
    </>
  );
}
