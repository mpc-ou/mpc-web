"use client";

import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { adminDeleteSponsor } from "@/app/_actions/admin";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { createColumns, type SponsorRow } from "./columns";

export function SponsorsDataTable({ data }: { data: SponsorRow[] }) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Search filter
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
      (sp) =>
        sp.name.toLowerCase().includes(s) ||
        sp.email?.toLowerCase().includes(s) ||
        sp.website?.toLowerCase().includes(s)
    );
  }, [data, search]);

  const handleEdit = (s: SponsorRow) => router.push(`/admin/sponsors/${s.id}/edit`);

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xóa nhà tài trợ?",
      description: "Hành động này không thể hoàn tác."
    });
    if (!ok) {
      return;
    }
    await handleErrorClient({
      cb: () => adminDeleteSponsor(id),
      onSuccess: () => router.refresh()
    });
  };

  const columns = useMemo(() => createColumns(handleEdit, handleDelete), [handleDelete, handleEdit]);

  return (
    <div className='flex flex-col gap-4'>
      <ConfirmDialog />

      <div className='flex items-center justify-end gap-2'>
        <Button className='h-9 font-medium' onClick={() => router.push("/admin/sponsors/new")}>
          <Plus className='mr-2 h-4 w-4' /> Thêm nhà tài trợ
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

      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}
