"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import type { MemberOption } from "@/components/member-selector";
import { ProjectDetailDialog } from "@/components/project-detail-dialog";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { adminDeleteProject } from "../actions";
import { createColumns, type ProjectRow } from "./columns";
import { ProjectFormDialog } from "./form-dialog";

export function ProjectsDataTable({
  data,
  allMembers = [],
}: {
  data: ProjectRow[];
  allMembers?: MemberOption[];
}) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ProjectRow | null>(null);
  const [viewItem, setViewItem] = useState<ProjectRow | null>(null);

  const handleEdit = (p: ProjectRow) => {
    setEditItem(p);
    setDialogOpen(true);
  };
  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xóa dự án?",
      description: "Hành động này không thể hoàn tác.",
    });
    if (!ok) {
      return;
    }
    await handleErrorClient({
      cb: () => adminDeleteProject(id),
      onSuccess: () => router.refresh(),
    });
  };
  const handleCreate = () => {
    setEditItem(null);
    setDialogOpen(true);
  };
  const handleView = (p: ProjectRow) => setViewItem(p);
  const columns = useMemo(
    () => createColumns(handleEdit, handleDelete, handleView),
    [],
  );

  return (
    <>
      <ConfirmDialog />
      <DataTable
        columns={columns}
        data={data}
        filterComponent={
          <Button className="ml-auto h-8" onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Thêm dự án
          </Button>
        }
        searchKey="title"
        searchPlaceholder="Tìm theo tên dự án..."
      />
      <ProjectDetailDialog
        onOpenChange={(open) => {
          if (!open) {
            setViewItem(null);
          }
        }}
        open={!!viewItem}
        project={viewItem}
      />
      <ProjectFormDialog
        allMembers={allMembers}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditItem(null);
            router.refresh();
          }
        }}
        open={dialogOpen}
        project={editItem}
      />
    </>
  );
}
