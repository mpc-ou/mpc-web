"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { useToast } from "@/hooks/use-toast";
import { adminDeleteFaqItem, adminUpsertSetting } from "../actions";
import { createColumns, type FaqRow } from "./columns";
import { FaqFormDialog } from "./form-dialog";

type Props = {
  data: FaqRow[];
  useTemplate: boolean;
};

export function FaqDataTable({ data, useTemplate: initialUseTemplate }: Props) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editFaq, setEditFaq] = useState<FaqRow | null>(null);
  const [useTemplate, setUseTemplate] = useState(initialUseTemplate);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const handleEdit = (f: FaqRow) => {
    setEditFaq(f);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xóa FAQ?",
      description: "Hành động này không thể hoàn tác."
    });
    if (!ok) {
      return;
    }
    await handleErrorClient({
      cb: () => adminDeleteFaqItem(id),
      onSuccess: () => router.refresh()
    });
  };

  const handleCreate = () => {
    setEditFaq(null);
    setDialogOpen(true);
  };

  const handleToggleTemplate = async (checked: boolean) => {
    setSavingTemplate(true);
    const res = await adminUpsertSetting({
      key: "faq_use_template",
      value: checked ? "true" : "false",
      description: "Dùng mẫu FAQ từ file fqa.json thay vì từ DB"
    });
    if (res.error) {
      toast({ variant: "destructive", description: "Lưu thất bại" });
    } else {
      setUseTemplate(checked);
      toast({
        description: checked ? "Đã bật: dùng mẫu FAQ từ file" : "Đã tắt: dùng FAQ từ cơ sở dữ liệu"
      });
    }
    setSavingTemplate(false);
  };

  const columns = useMemo(() => createColumns(handleEdit, handleDelete), [handleDelete, handleEdit]);

  return (
    <>
      <ConfirmDialog />

      {/* Template toggle */}
      <div className='flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4'>
        <Checkbox
          checked={useTemplate}
          disabled={savingTemplate}
          id='use-template'
          onCheckedChange={(checked) => handleToggleTemplate(checked === true)}
        />
        <Label className='cursor-pointer text-sm' htmlFor='use-template'>
          Dùng mẫu FAQ từ file cấu hình (
          <code className='rounded bg-muted px-1 py-0.5 font-mono text-xs'>configs/data/fqa.json</code>) thay vì từ cơ
          sở dữ liệu
        </Label>
        {savingTemplate && <span className='text-muted-foreground text-xs'>Đang lưu...</span>}
      </div>

      {useTemplate ? (
        <div className='rounded-xl border border-border bg-background p-6 text-center'>
          <p className='text-muted-foreground text-sm'>
            Đang dùng mẫu FAQ từ file{" "}
            <code className='rounded bg-muted px-1 py-0.5 font-mono text-xs'>configs/data/fqa.json</code>. Bỏ tick
            checkbox ở trên để quản lý FAQ từ cơ sở dữ liệu.
          </p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data}
            filterComponent={
              <Button className='ml-auto h-8' onClick={handleCreate} size='sm'>
                <Plus className='mr-2 h-4 w-4' />
                Thêm FAQ
              </Button>
            }
            searchKey='questionVi'
            searchPlaceholder='Tìm theo câu hỏi...'
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
      )}
    </>
  );
}
