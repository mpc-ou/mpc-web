"use client";

import { Download, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { adminDeleteMember } from "../actions";
import { createColumns, type MemberRow } from "./columns";
import { MemberFormDialog } from "./form-dialog";
import { MemberViewDialog } from "./view-dialog";

type Department = { id: string; name: string };

export function MembersDataTable({ data, departments = [] }: { data: MemberRow[]; departments?: Department[] }) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<MemberRow | null>(null);
  const [viewMember, setViewMember] = useState<MemberRow | null>(null);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    for (const m of data) {
      const year = m.clubRoles?.length
        ? Math.min(...m.clubRoles.map((r) => new Date(r.startAt || m.createdAt).getFullYear())).toString()
        : new Date(m.createdAt).getFullYear().toString();
      years.add(year);
    }
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((m) => {
      const matchRole = roleFilter === "ALL" || m.webRole === roleFilter;
      const mYear = m.clubRoles?.length
        ? Math.min(...m.clubRoles.map((r) => new Date(r.startAt || m.createdAt).getFullYear())).toString()
        : new Date(m.createdAt).getFullYear().toString();
      const matchYear = yearFilter === "ALL" || mYear === yearFilter;
      return matchRole && matchYear;
    });
  }, [data, roleFilter, yearFilter]);

  const handleEdit = (member: MemberRow) => {
    setEditMember(member);
    setDialogOpen(true);
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

  const handleCreate = () => {
    setEditMember(null);
    setDialogOpen(true);
  };

  const handleExportExcel = () => {
    const exportData = filteredData.map((m) => ({
      "Họ tên": `${m.firstName || ""} ${m.lastName || ""}`.trim(),
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

  const columns = useMemo(
    () => createColumns(handleEdit, handleDelete, handleView),
    [handleDelete, handleEdit, handleView]
  );

  const stats = useMemo(() => {
    const total = data.length;
    const guests = data.filter((m) => m.webRole === "GUEST").length;
    const members = data.filter((m) => m.webRole === "MEMBER").length;
    const admins = data.filter((m) => m.webRole === "ADMIN").length;
    const collab = data.filter((m) => m.webRole === "COLLABORATOR").length;
    return { total, guests, members, admins, collab };
  }, [data]);

  return (
    <>
      <ConfirmDialog />
      {/* Stats bar */}
      <div className='flex flex-wrap gap-2 text-sm'>
        <span className='rounded-md bg-muted px-3 py-1 font-medium'>{stats.total} tổng</span>
        <span className='rounded-md bg-red-500/10 px-3 py-1 text-red-500'>{stats.admins} admin</span>
        <span className='rounded-md bg-blue-500/10 px-3 py-1 text-blue-500'>{stats.collab} CTV</span>
        <span className='rounded-md bg-green-500/10 px-3 py-1 text-green-500'>{stats.members} thành viên</span>
        <span className='rounded-md bg-gray-500/10 px-3 py-1 text-gray-400'>{stats.guests} khách</span>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        filterComponent={
          <div className='flex items-center gap-2'>
            <Select onValueChange={setRoleFilter} value={roleFilter}>
              <SelectTrigger className='h-8 w-37.5'>
                <SelectValue placeholder='Lọc vai trò' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Tất cả</SelectItem>
                <SelectItem value='ADMIN'>Admin</SelectItem>
                <SelectItem value='COLLABORATOR'>CTV</SelectItem>
                <SelectItem value='MEMBER'>Thành viên</SelectItem>
                <SelectItem value='GUEST'>Khách</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setYearFilter} value={yearFilter}>
              <SelectTrigger className='h-8 w-32'>
                <SelectValue placeholder='Năm tham gia' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Tất cả các năm</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className='ml-auto h-8' onClick={handleExportExcel} size='sm' variant='outline'>
              <Download className='mr-2 h-4 w-4' />
              Xuất Excel
            </Button>
            <Button className='h-8' onClick={handleCreate} size='sm'>
              <Plus className='mr-2 h-4 w-4' />
              Thêm thành viên
            </Button>
          </div>
        }
        searchKey='email'
        searchPlaceholder='Tìm theo email...'
      />

      <MemberViewDialog
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

      <MemberFormDialog
        departments={departments}
        member={editMember}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditMember(null);
            router.refresh();
          }
        }}
        open={dialogOpen}
      />
    </>
  );
}
