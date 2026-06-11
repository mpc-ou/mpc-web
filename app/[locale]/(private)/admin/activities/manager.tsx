"use client";

import { Database, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { adminDeleteActivity, adminSeedActivities } from "@/app/_actions/admin";
import { DataTable } from "@/components/data-table";
import { MarkdownContent } from "@/components/markdown-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { type ActivityRow, createColumns } from "./columns";

export function ActivitiesDataTable({ data }: { data: ActivityRow[] }) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [seeding, setSeeding] = useState(false);
  const [viewActivity, setViewActivity] = useState<ActivityRow | null>(null);
  const [searchVal, setSearchVal] = useState("");
  const [search, setSearch] = useState("");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);

  useEffect(() => {
    const handler = setTimeout(() => setSearch(searchVal), 400);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const filteredData = useMemo(() => {
    if (!search.trim()) {
      return data;
    }
    const s = search.toLowerCase();
    return data.filter((d) => d.titleVi.toLowerCase().includes(s) || d.titleEn.toLowerCase().includes(s));
  }, [data, search]);

  const handleEdit = (a: ActivityRow) => router.push(`/admin/activities/${a.id}/edit`);
  const handleView = (a: ActivityRow) => setViewActivity(a);

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xóa hoạt động?",
      description: "Không thể hoàn tác."
    });
    if (!ok) {
      return;
    }
    await handleErrorClient({
      cb: () => adminDeleteActivity(id),
      onSuccess: () => router.refresh()
    });
  };

  const handleSeed = async () => {
    setSeeding(true);
    await handleErrorClient({
      cb: () => adminSeedActivities(),
      onSuccess: () => {
        router.refresh();
        setSeeding(false);
      }
    });
    setSeeding(false);
  };

  const handleBulkDelete = async () => {
    const ok = await confirm({
      title: `Xóa ${selectedIds.length} hoạt động?`,
      description: "Không thể hoàn tác."
    });
    if (!ok) {
      return;
    }
    for (const id of selectedIds) {
      await adminDeleteActivity(id);
    }
    setRowSelection({});
    router.refresh();
  };

  const columns = useMemo(
    () => createColumns(handleEdit, handleDelete, handleView),
    [handleDelete, handleEdit, handleView]
  );

  return (
    <div className='flex flex-col gap-4'>
      <ConfirmDialog />

      <div className='flex items-center justify-end gap-2'>
        {selectedIds.length > 0 && (
          <Button className='h-9' onClick={handleBulkDelete} size='sm' variant='destructive'>
            <Trash2 className='mr-2 h-4 w-4' /> Xóa ({selectedIds.length})
          </Button>
        )}
        <Button className='h-9' disabled={seeding} onClick={handleSeed} size='sm' variant='outline'>
          <Database className='mr-2 h-4 w-4' />
          {seeding ? "Đang nhập..." : "Ghi đè dữ liệu mẫu"}
        </Button>
        <Button className='h-9 font-medium' onClick={() => router.push("/admin/activities/new")}>
          <Plus className='mr-2 h-4 w-4' /> Thêm hoạt động
        </Button>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='relative min-w-[200px] max-w-sm flex-1'>
          <Search className='absolute top-2.5 left-3 h-4 w-4 text-muted-foreground' />
          <Input
            className='h-9 pl-9 text-xs'
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder='Tìm theo tên...'
            value={searchVal}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        onRowSelectionChange={setRowSelection}
        rowSelection={rowSelection}
      />

      {/* View Modal */}
      <Dialog onOpenChange={(open) => !open && setViewActivity(null)} open={!!viewActivity}>
        <DialogContent className='max-h-[90vh] max-w-lg overflow-y-auto'>
          <DialogTitle className='sr-only'>{viewActivity?.titleVi}</DialogTitle>
          {viewActivity && (
            <div className='flex flex-col gap-4 py-2'>
              {/* Thumbnail */}
              {(viewActivity as any)?.thumbnail && (
                <div className='-mx-6 -mt-6 overflow-hidden rounded-t-lg'>
                  <img alt='' className='aspect-video w-full object-cover' src={(viewActivity as any).thumbnail} />
                </div>
              )}

              <div className='text-center'>
                <h2 className='font-bold text-xl'>{viewActivity.titleVi}</h2>
                {viewActivity.titleEn && <p className='text-muted-foreground text-sm'>{viewActivity.titleEn}</p>}
                <div className='mt-2 flex justify-center gap-2'>
                  <Badge variant={viewActivity.isActive ? "default" : "outline"}>
                    {viewActivity.isActive ? "Hiển thị" : "Ẩn"}
                  </Badge>
                  <Badge variant={viewActivity.isInternal ? "default" : "secondary"}>
                    {viewActivity.isInternal ? "Nội bộ" : "Đối ngoại"}
                  </Badge>
                  <Badge variant='secondary'>Slug: {viewActivity.slug}</Badge>
                  <Badge variant='secondary'>Thứ tự: {(viewActivity as any).order ?? 0}</Badge>
                </div>
              </div>

              {(viewActivity as any)?.descriptionVi && (
                <div>
                  <h4 className='mb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>Mô tả</h4>
                  <div className='text-muted-foreground text-sm'>
                    <MarkdownContent content={(viewActivity as any).descriptionVi} />
                  </div>
                  {(viewActivity as any)?.descriptionEn && (
                    <p className='mt-1 text-muted-foreground/60 text-xs italic'>
                      {(viewActivity as any).descriptionEn}
                    </p>
                  )}
                </div>
              )}

              {viewActivity.frequencyVi && (
                <div className='flex items-center gap-2 rounded-lg bg-muted/50 p-3'>
                  <span className='font-medium text-sm'>Tần suất:</span>
                  <span className='text-muted-foreground text-sm'>
                    {viewActivity.frequencyVi}
                    {viewActivity.frequencyEn ? ` / ${viewActivity.frequencyEn}` : ""}
                  </span>
                </div>
              )}

              {/* Gallery */}
              {(viewActivity as any)?.images?.length > 0 && (
                <div>
                  <h4 className='mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                    Ảnh ({(viewActivity as any).images.length})
                  </h4>
                  <div className='grid grid-cols-3 gap-2'>
                    {(viewActivity as any).images.map((img: string, i: number) => (
                      <div className='aspect-square overflow-hidden rounded-lg bg-muted' key={i}>
                        <img alt='' className='h-full w-full object-cover' src={img} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
