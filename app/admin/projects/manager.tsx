"use client";

import { Plus, Search, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState, useTransition } from "react";
import { adminDeleteProject } from "@/app/_actions/admin";
import { useHandleError } from "@/app/admin/_hooks/use-handle-error";
import { DataTable } from "@/components/data-table";
import { ProjectDetailDialog } from "@/components/project-detail-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { createColumns, type ProjectRow } from "./columns";

export function ProjectsDataTable({ data, totalPages }: { data: ProjectRow[]; totalPages: number }) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [viewItem, setViewItem] = useState<ProjectRow | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  const [isPending, startTransition] = useTransition();

  // Search filter via URL using nuqs
  const [searchVal, setSearchVal] = useState("");
  const [q, setQ] = useQueryState("q", {
    defaultValue: "",
    shallow: false,
    startTransition
  });

  const [status, setStatus] = useQueryState("status", {
    defaultValue: "ALL",
    shallow: false,
    startTransition
  });

  const [_page, setPage] = useQueryState("page", {
    shallow: false,
    startTransition
  });

  // Initialize input value from URL
  useEffect(() => {
    setSearchVal(q);
  }, [q]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchVal !== q) {
        setQ(searchVal || null);
        setPage(null); // Reset page on filter/search change
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchVal, q, setQ, setPage]);

  const handleEdit = (p: ProjectRow) => {
    router.push(`/admin/projects/${p.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xóa dự án?",
      description: "Hành động này không thể hoàn tác."
    });
    if (!ok) {
      return;
    }
    await handleErrorClient({
      cb: () => adminDeleteProject(id),
      onSuccess: () => router.refresh()
    });
  };

  const handleCreate = () => {
    router.push("/admin/projects/new");
  };

  const handleView = (p: ProjectRow) => setViewItem(p);

  const columns = createColumns(handleEdit, handleDelete, handleView);

  return (
    <div className='relative flex flex-col gap-4'>
      <ConfirmDialog />

      {/* Visual Loading Overlay */}
      {isPending && (
        <div className='absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/50 backdrop-blur-[1px] transition-all duration-300'>
          <div className='flex flex-col items-center gap-2'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
            <span className='animate-pulse font-medium text-muted-foreground text-xs'>Đang tải dữ liệu...</span>
          </div>
        </div>
      )}

      <div className={isPending ? "pointer-events-none opacity-60 transition-opacity" : "transition-opacity"}>
        {/* Row 2: (empty left) + Actions (right) */}
        <div className='mb-4 flex items-center justify-end gap-2'>
          <Button className='h-9 font-medium' onClick={handleCreate}>
            <Plus className='mr-2 h-4 w-4' />
            Thêm dự án
          </Button>
        </div>

        {/* Row 3: Search (left) + Filters & Column Visibility (right) */}
        <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
          <div className='flex max-w-lg flex-1 items-center gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute top-2.5 left-3 h-4 w-4 text-muted-foreground' />
              <Input
                className='h-9 pl-9 text-xs'
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder='Tìm theo tên dự án...'
                value={searchVal}
              />
            </div>

            <Select
              onValueChange={(val) => {
                setStatus(val === "ALL" ? null : val);
                setPage(null);
              }}
              value={status}
            >
              <SelectTrigger className='h-9 w-[140px] text-xs'>
                <SelectValue placeholder='Trạng thái' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Tất cả</SelectItem>
                <SelectItem value='ACTIVE'>Hoạt động</SelectItem>
                <SelectItem value='INACTIVE'>Kết thúc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center gap-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='h-9 text-xs' variant='outline'>
                  <Settings2 className='mr-2 h-4 w-4' />
                  Cột
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-[150px]'>
                <DropdownMenuLabel>Ẩn/hiện cột</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.description !== false}
                  onCheckedChange={(val) => setColumnVisibility((prev) => ({ ...prev, description: val }))}
                >
                  Mô tả
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.links !== false}
                  onCheckedChange={(val) => setColumnVisibility((prev) => ({ ...prev, links: val }))}
                >
                  Liên kết
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.memberCount !== false}
                  onCheckedChange={(val) => setColumnVisibility((prev) => ({ ...prev, memberCount: val }))}
                >
                  Thành viên
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.isActive !== false}
                  onCheckedChange={(val) => setColumnVisibility((prev) => ({ ...prev, isActive: val }))}
                >
                  Trạng thái
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          columnVisibility={columnVisibility}
          data={data}
          hideToolbar={true}
          onColumnVisibilityChange={setColumnVisibility}
          pageCount={totalPages}
        />
      </div>

      <ProjectDetailDialog
        onOpenChange={(open) => {
          if (!open) {
            setViewItem(null);
          }
        }}
        open={!!viewItem}
        project={viewItem}
      />
    </div>
  );
}
