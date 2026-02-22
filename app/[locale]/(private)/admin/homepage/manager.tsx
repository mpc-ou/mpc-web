"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { type SectionRow, createColumns } from "./columns";
import { SectionFormDialog } from "./form-dialog";

export function HomepageDataTable({ data }: { data: SectionRow[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSection, setEditSection] = useState<SectionRow | null>(null);

  const handleEdit = (s: SectionRow) => {
    setEditSection(s);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditSection(null);
    setDialogOpen(true);
  };

  const columns = useMemo(() => createColumns(handleEdit), []);

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        filterComponent={
          <Button className="ml-auto h-8" onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Thêm section
          </Button>
        }
        searchKey="key"
        searchPlaceholder="Tìm theo key..."
      />
      <SectionFormDialog
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditSection(null);
            router.refresh();
          }
        }}
        open={dialogOpen}
        section={editSection}
      />
    </>
  );
}
