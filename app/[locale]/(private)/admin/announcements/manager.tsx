"use client";

import { Plus, Search, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { adminDeleteAnnouncement, adminUpdateAnnouncement } from "@/app/_actions/admin";
import { DataTable } from "@/components/data-table";
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
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { type AnnouncementRow, createColumns } from "./columns";
import { AnnouncementFormDialog } from "./form-dialog";

export function AnnouncementsDataTable({ locale, data }: { locale: string; data: AnnouncementRow[] }) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<AnnouncementRow | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  // Search filter
  const [searchVal, setSearchVal] = useState("");
  const [search, setSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchVal);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchVal]);

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
    () => createColumns(handleEdit, handleToggle, handleDelete, locale),
    [handleDelete, handleEdit, handleToggle, locale]
  );

  const filteredData = useMemo(() => {
    return data.filter((a) => {
      if (!search.trim()) {
        return true;
      }
      return (
        a.contentVi.toLowerCase().includes(search.toLowerCase()) ||
        a.contentEn.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [data, search]);

  return (
    <div className='flex flex-col gap-4'>
      <ConfirmDialog />

      {/* Row 2: (empty left) + Actions (right) */}
      <div className='flex items-center justify-end gap-2'>
        <Button className='h-9 font-medium' onClick={handleCreate}>
          <Plus className='mr-2 h-4 w-4' />
          Thêm thông báo
        </Button>
      </div>

      {/* Row 3: Search (left) + Filters & Column Visibility (right) */}
      <div className='flex flex-wrap items-center justify-between gap-2'>
        {/* Search */}
        <div className='relative min-w-[200px] max-w-sm flex-1'>
          <Search className='absolute top-2.5 left-3 h-4 w-4 text-muted-foreground' />
          <Input
            className='h-9 pl-9 text-xs'
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder='Tìm theo nội dung...'
            value={searchVal}
          />
        </div>

        {/* Column visibility */}
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
                checked={columnVisibility.content !== false}
                onCheckedChange={(val) => setColumnVisibility((prev) => ({ ...prev, content: val }))}
              >
                Nội dung
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.isActive !== false}
                onCheckedChange={(val) => setColumnVisibility((prev) => ({ ...prev, isActive: val }))}
              >
                Trạng thái
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.createdAt !== false}
                onCheckedChange={(val) => setColumnVisibility((prev) => ({ ...prev, createdAt: val }))}
              >
                Ngày tạo
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        columnVisibility={columnVisibility}
        data={filteredData}
        hideToolbar={true}
        onColumnVisibilityChange={setColumnVisibility}
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
    </div>
  );
}
