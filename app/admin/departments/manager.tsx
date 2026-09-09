"use client";

import { Database, Loader2, Pencil, Plus, RefreshCw, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminDeleteDepartment, adminSeedDepartments, adminSyncMembersFromSso } from "@/app/_actions/admin";
import { useHandleError } from "@/app/admin/_hooks/use-handle-error";
import { DataTable } from "@/components/data-table";
import { MarkdownContent } from "@/components/markdown-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { createColumns, type DeptRow } from "./columns";
import { DeptFormDialog } from "./form-dialog";

export function DepartmentsDataTable({ data }: { data: DeptRow[] }) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [seeding, setSeeding] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewDept, setViewDept] = useState<DeptRow | null>(null);

  const [searchVal, setSearchVal] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setSearch(searchVal), 400);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const filteredData = useMemo(() => {
    if (!search.trim()) {
      return data;
    }
    const s = search.toLowerCase();
    return data.filter(
      (d) =>
        d.nameVi.toLowerCase().includes(s) || d.nameEn?.toLowerCase().includes(s) || d.slug.toLowerCase().includes(s)
    );
  }, [data, search]);

  const handleEdit = useCallback((d: DeptRow) => router.push(`/admin/departments/${d.id}/edit`), [router]);

  const handleView = useCallback((d: DeptRow) => setViewDept(d), []);

  const handleDelete = useCallback(
    async (id: string) => {
      const ok = await confirm({
        title: "Xóa ban?",
        description: "Hành động này không thể hoàn tác."
      });
      if (!ok) {
        return;
      }
      await handleErrorClient({
        cb: () => adminDeleteDepartment(id),
        onSuccess: () => router.refresh()
      });
    },
    [confirm, handleErrorClient, router]
  );

  const handleSeed = async () => {
    setSeeding(true);
    await handleErrorClient({
      cb: () => adminSeedDepartments(),
      onSuccess: () => {
        router.refresh();
        setSeeding(false);
      }
    });
    setSeeding(false);
  };

  const handleSyncSso = async () => {
    setSyncing(true);
    await handleErrorClient({
      cb: () => adminSyncMembersFromSso(),
      onSuccess: () => {
        router.refresh();
        setSyncing(false);
      }
    });
    setSyncing(false);
  };

  const columns = useMemo(
    () => createColumns(handleEdit, handleDelete, handleView),
    [handleDelete, handleEdit, handleView]
  );

  return (
    <div className='flex flex-col gap-4'>
      <ConfirmDialog />

      <div className='flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-blue-700 text-xs dark:text-blue-400'>
        Cấu hình các ban hiển thị trên Landing Page. Bạn có thể thêm, sửa, xóa thủ công hoặc nhấn "Đồng bộ SSO" để lấy
        dữ liệu từ SSO.
      </div>

      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='relative min-w-50 max-w-sm flex-1'>
          <Search className='absolute top-2.5 left-3 h-4 w-4 text-muted-foreground' />
          <Input
            className='h-9 pl-9 text-xs'
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder='Tìm theo tên...'
            value={searchVal}
          />
        </div>
        <div className='flex items-center gap-2'>
          <Button onClick={() => setIsCreateOpen(true)} size='sm'>
            <Plus className='mr-1.5 h-4 w-4' /> Thêm ban
          </Button>
          <Button disabled={seeding} onClick={handleSeed} size='sm' variant='outline'>
            {seeding ? <Loader2 className='mr-1.5 h-4 w-4 animate-spin' /> : <Database className='mr-1.5 h-4 w-4' />}
            Khởi tạo mặc định
          </Button>
          <Button disabled={syncing} onClick={handleSyncSso} size='sm' variant='outline'>
            {syncing ? <Loader2 className='mr-1.5 h-4 w-4 animate-spin' /> : <RefreshCw className='mr-1.5 h-4 w-4' />}
            Đồng bộ SSO
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={filteredData} />

      <DeptFormDialog onOpenChange={setIsCreateOpen} open={isCreateOpen} />

      {/* View Modal */}
      <Dialog onOpenChange={(open) => !open && setViewDept(null)} open={!!viewDept}>
        <DialogContent className='max-h-[90vh] max-w-lg overflow-y-auto'>
          <DialogTitle className='sr-only'>{viewDept?.nameVi}</DialogTitle>
          {viewDept && (
            <div className='flex flex-col gap-5 py-2'>
              {/* BG Image */}
              {viewDept?.bgImage && (
                <div className='relative -mx-6 -mt-6 h-40 w-[calc(100%+3rem)] overflow-hidden rounded-t-lg'>
                  <Image alt='' className='object-cover' fill sizes='512px' src={viewDept.bgImage} />
                  <div className='absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent' />
                </div>
              )}

              {/* Header */}
              <div className='text-center'>
                <div className='mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                  <span className='font-bold text-lg text-primary'>{viewDept.icon || viewDept.nameVi[0]}</span>
                </div>
                <h2 className='font-bold text-xl'>{viewDept.nameVi}</h2>
                {viewDept.nameEn && <p className='text-muted-foreground text-sm'>{viewDept.nameEn}</p>}
                <div className='mt-2 flex justify-center gap-2'>
                  <Badge variant={viewDept.isActive ? "default" : "outline"}>
                    {viewDept.isActive ? "Hoạt động" : "Tạm ngưng"}
                  </Badge>
                  <Badge variant='secondary'>Slug: {viewDept.slug}</Badge>
                  <Badge variant='secondary'>Thứ tự: {viewDept.order}</Badge>
                </div>
              </div>

              {/* Description */}
              {viewDept?.descriptionVi && (
                <div>
                  <h4 className='mb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>Mô tả</h4>
                  <p className='text-muted-foreground text-sm leading-relaxed'>{viewDept.descriptionVi}</p>
                  {viewDept?.descriptionEn && (
                    <p className='mt-1 text-muted-foreground/60 text-xs italic'>{viewDept.descriptionEn}</p>
                  )}
                </div>
              )}

              {/* Count */}
              <div className='flex items-center gap-2 rounded-lg bg-muted/50 p-3'>
                <span className='font-medium text-sm'>Thành viên:</span>
                <Badge variant='secondary'>{viewDept._count.clubRoles}</Badge>
              </div>

              {/* Missions */}
              {viewDept?.missionsVi && (
                <div>
                  <h4 className='mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                    Nhiệm vụ
                  </h4>
                  <div className='prose prose-sm max-w-none rounded-lg border bg-muted/20 p-4'>
                    <MarkdownContent content={viewDept.missionsVi} />
                  </div>
                </div>
              )}

              {/* Link */}
              {viewDept?.hyperlink && (
                <div className='flex items-center gap-2 rounded-lg bg-primary/5 p-3'>
                  <span className='font-medium text-primary text-sm'>Liên kết:</span>
                  <a className='text-sm underline' href={viewDept.hyperlink} target='_blank'>
                    {viewDept.linkLabelVi || viewDept.hyperlink}
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className='flex justify-end gap-2 border-t pt-4'>
                <Button
                  onClick={() => {
                    setViewDept(null);
                    router.push(`/admin/departments/${viewDept.id}/edit`);
                  }}
                  size='sm'
                  variant='outline'
                >
                  <Pencil className='mr-1.5 h-3.5 w-3.5' /> Chỉnh sửa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
