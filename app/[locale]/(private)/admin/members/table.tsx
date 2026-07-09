"use client";

import { ChevronDown, Database, Download, Plus, RefreshCw, Search, Settings2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useMemo, useState, useTransition } from "react";
import * as XLSX from "xlsx";
import { adminBackupUserData, adminDeleteMember, adminGetMembers, adminSyncMembersFromSso } from "@/app/_actions/admin";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { useToast } from "@/hooks/use-toast";
import { getFullName } from "@/lib/utils";
import { createColumns, type MemberRow } from "./columns";
import type { Department } from "./types";
import { MemberViewDialog } from "./view-dialog";

export function MembersDataTable({
  locale,
  data,
  departments = [],
  totalPages = 0,
  stats = { total: 0, admins: 0, collab: 0, members: 0, guests: 0 }
}: {
  locale: string;
  data: MemberRow[];
  departments?: Department[];
  totalPages?: number;
  totalCount?: number;
  stats?: {
    total: number;
    admins: number;
    collab: number;
    members: number;
    guests: number;
  };
}) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const { toast } = useToast();
  const [viewMember, setViewMember] = useState<MemberRow | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPending, startTransition] = useTransition();

  // nuqs search parameter bindings
  const [roleFilter, setRoleFilter] = useQueryState("role", {
    defaultValue: "ALL",
    shallow: false,
    startTransition
  });
  const [yearFilter, setYearFilter] = useQueryState("year", {
    defaultValue: "ALL",
    shallow: false,
    startTransition
  });
  const [deptFilter, setDeptFilter] = useQueryState("dept", {
    defaultValue: "ALL",
    shallow: false,
    startTransition
  });
  const [search, setSearch] = useQueryState("q", {
    defaultValue: "",
    shallow: false,
    startTransition
  });
  const [page, setPage] = useQueryState("page", {
    shallow: false,
    startTransition
  });

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const [searchVal, setSearchVal] = useState(search || "");

  // Sync initial URL search param to searchVal input
  useEffect(() => {
    setSearchVal(search || "");
  }, [search]);

  // Debounce search update to URL & reset page
  useEffect(() => {
    const handler = setTimeout(() => {
      if ((search || "") !== searchVal) {
        setSearch(searchVal || null);
        setPage(null); // Reset page to 1
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchVal, search, setSearch, setPage]);

  const handleRoleChange = (val: string) => {
    setRoleFilter(val);
    setPage(null);
  };

  const handleDeptChange = (val: string) => {
    setDeptFilter(val);
    setPage(null);
  };

  const handleYearChange = (val: string) => {
    setYearFilter(val);
    setPage(null);
  };

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 2020 + 2 }, (_, i) => (currentYear + 1 - i).toString());
  }, []);

  const handleEdit = (member: MemberRow) => {
    router.push(`/admin/members/${member.id}/edit`);
  };

  const handleView = (member: MemberRow) => {
    setViewMember(member);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xóa thành viên?",
      description: "Hành động này sẽ xóa vĩnh viễn thành viên khỏi hệ thống."
    });
    if (!ok) {
      return;
    }
    await handleErrorClient({
      cb: () => adminDeleteMember(id),
      onSuccess: () => router.refresh()
    });
  };

  const selectedIds = (Object.entries(rowSelection) as [string, boolean][])
    .filter(([, v]) => v)
    .map(([idx]) => data[Number(idx)]?.id)
    .filter((id): id is string => Boolean(id));
  const selectedCount = selectedIds.length;

  const handleBulkDelete = async () => {
    if (!selectedCount) {
      return;
    }
    const ok = await confirm({
      title: `Xóa ${selectedCount} thành viên đã chọn?`,
      description: "Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn khỏi hệ thống."
    });
    if (!ok) {
      return;
    }
    await Promise.all(
      selectedIds.map((id) =>
        handleErrorClient({
          cb: () => adminDeleteMember(id),
          // no per-item toast; a single refresh happens after all deletes settle
          onSuccess: () => {
            // intentionally empty
          }
        })
      )
    );
    setRowSelection({});
    router.refresh();
  };

  const handleCreate = () => {
    router.push("/admin/members/new");
  };

  const handleExportExcel = async () => {
    const res = await adminGetMembers();
    const allMembers = Array.isArray(res.data?.payload) ? res.data.payload : [];

    const exportData = allMembers.map((m: any) => ({
      "Họ tên": getFullName(m.firstName, m.middleName, m.lastName, "vi"),
      Email: m.email,
      SĐT: m.phone || "",
      MSSV: m.studentId || "",
      "Vai trò Web": m.webRole,
      "Trạng thái": m.isActive ? "Hoạt động" : "Khóa"
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ThanhVien");
    XLSX.writeFile(wb, "Danh_sach_thanh_vien.xlsx");
  };

  const handleBackupData = async () => {
    toast({
      title: "Đang tạo bản sao lưu",
      description: "Vui lòng chờ trong giây lát...",
      variant: "info"
    });

    await handleErrorClient({
      cb: () => adminBackupUserData(),
      onSuccess: ({ data }) => {
        const backupData = data?.payload;
        if (!backupData) {
          toast({
            title: "Lỗi",
            description: "Không có dữ liệu sao lưu",
            variant: "destructive"
          });
          return;
        }
        const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        const dateStr = new Date().toISOString().split("T")[0];
        downloadAnchor.setAttribute("download", `mpc_user_backup_${dateStr}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        toast({
          title: "Sao lưu thành công",
          description: "Tập tin sao lưu đã được tải xuống.",
          variant: "success"
        });
      },
      withSuccessNotify: false
    });
  };

  const handleSyncFromSso = async () => {
    setIsSyncing(true);
    toast({
      title: "Đang đồng bộ",
      description: "Đang tải dữ liệu thành viên mới nhất từ SSO...",
      variant: "info"
    });

    await handleErrorClient({
      cb: () => adminSyncMembersFromSso(),
      onSuccess: () => {
        toast({
          title: "Đồng bộ thành công",
          description: "Dữ liệu thành viên đã được cập nhật.",
          variant: "success"
        });
        router.refresh();
      },
      withSuccessNotify: false
    });
    setIsSyncing(false);
  };

  const columns = useMemo(
    () => createColumns(handleEdit, handleDelete, handleView),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleDelete, handleEdit, handleView]
  );

  return (
    <div className='flex flex-col gap-4'>
      <ConfirmDialog />

      <div className='flex w-full items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          {selectedCount > 0 && (
            <div className='flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-1.5 text-destructive-foreground text-xs'>
              <span className='font-medium text-destructive'>Đã chọn {selectedCount} dòng</span>
              <Button className='h-7 px-2.5 text-[11px]' onClick={handleBulkDelete} size='sm' variant='destructive'>
                <Trash2 className='mr-1.5 h-3.5 w-3.5' />
                Xóa hàng loạt
              </Button>
            </div>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='h-9' variant='outline'>
                Tác vụ khác
                <ChevronDown className='ml-2 h-3 w-3 opacity-50' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-44'>
              <DropdownMenuItem disabled={isSyncing} onClick={handleSyncFromSso}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                Đồng bộ từ SSO
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                <Download className='mr-2 h-4 w-4' />
                Xuất file Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBackupData}>
                <Database className='mr-2 h-4 w-4' />
                Sao lưu dữ liệu
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='relative min-w-[200px] max-w-sm flex-1'>
          <Search className='absolute top-2.5 left-3 h-4 w-4 text-muted-foreground' />
          <Input
            className='h-9 pl-9 text-xs'
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder='Tìm kiếm thành viên...'
            value={searchVal}
          />
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Select onValueChange={handleRoleChange} value={roleFilter || "ALL"}>
            <SelectTrigger className='h-9 w-40 text-xs'>
              <SelectValue placeholder='Lọc vai trò' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>Tất cả ({stats.total})</SelectItem>
              <SelectItem value='ADMIN'>Admin ({stats.admins})</SelectItem>
              <SelectItem value='COLLABORATOR'>CTV ({stats.collab})</SelectItem>
              <SelectItem value='MEMBER'>Thành viên ({stats.members})</SelectItem>
              <SelectItem value='GUEST'>Khách ({stats.guests})</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={handleDeptChange} value={deptFilter || "ALL"}>
            <SelectTrigger className='h-9 w-40 text-xs'>
              <SelectValue placeholder='Lọc theo ban' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>Tất cả ban</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.slug}>
                  {d.nameVi}
                </SelectItem>
              ))}
              <SelectItem value='NONE'>Cấp CLB</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={handleYearChange} value={yearFilter || "ALL"}>
            <SelectTrigger className='h-9 w-36 text-xs'>
              <SelectValue placeholder='Năm tham gia' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>Tất cả các năm</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  Năm {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
              {[
                { key: "email", label: "Email" },
                { key: "phone", label: "Số điện thoại" },
                { key: "studentId", label: "MSSV" },
                { key: "webRole", label: "Vai trò Web" },
                { key: "clubRoles", label: "Ban" },
                { key: "isActive", label: "Active" }
              ].map(({ key, label }) => (
                <DropdownMenuCheckboxItem
                  checked={columnVisibility[key] !== false}
                  key={key}
                  onCheckedChange={(val) => setColumnVisibility((prev) => ({ ...prev, [key]: val }))}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='relative'>
        {isPending && (
          <div className='absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/50 backdrop-blur-[1px] transition-all duration-300'>
            <div className='flex flex-col items-center gap-2'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <span className='animate-pulse font-medium text-muted-foreground text-xs'>Đang tải dữ liệu...</span>
            </div>
          </div>
        )}
        <div
          className={
            isPending
              ? "pointer-events-none opacity-60 transition-opacity duration-300"
              : "transition-opacity duration-300"
          }
        >
          <DataTable
            columns={columns}
            columnVisibility={columnVisibility}
            data={data}
            hideToolbar={true}
            onColumnVisibilityChange={setColumnVisibility}
            onRowSelectionChange={setRowSelection}
            pageCount={totalPages}
            rowSelection={rowSelection}
          />
        </div>
      </div>

      <MemberViewDialog
        locale={locale}
        member={viewMember}
        onDelete={(id) => {
          setViewMember(null);
          handleDelete(id);
        }}
        onEdit={(m) => {
          setViewMember(null);
          handleEdit(m);
        }}
        onOpenChange={(open) => {
          if (!open) {
            setViewMember(null);
          }
        }}
        open={!!viewMember}
      />
    </div>
  );
}
