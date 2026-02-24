"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { adminDeleteEvent } from "../actions";
import { createColumns, type EventRow } from "./columns";
import { EventFormDialog } from "./form-dialog";
import { AdminViewDialog } from "@/components/custom/admin-view-dialog";
import { Badge } from "@/components/ui/badge";

export function EventsDataTable({ data }: { data: EventRow[] }) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<EventRow | null>(null);
  const [viewEvent, setViewEvent] = useState<EventRow | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredData = useMemo(() => {
    if (statusFilter === "ALL") {
      return data;
    }
    return data.filter((e) => e.status === statusFilter);
  }, [data, statusFilter]);

  const handleEdit = (event: EventRow) => {
    setEditEvent(event);
    setDialogOpen(true);
  };
  const handleView = (event: EventRow) => {
    setViewEvent(event);
  };
  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xóa sự kiện?",
      description: "Hành động này không thể hoàn tác.",
    });
    if (!ok) {
      return;
    }
    await handleErrorClient({
      cb: () => adminDeleteEvent(id),
      onSuccess: () => router.refresh(),
    });
  };
  const handleCreate = () => {
    setEditEvent(null);
    setDialogOpen(true);
  };

  const columns = useMemo(
    () => createColumns(handleEdit, handleDelete, handleView),
    [],
  );

  return (
    <>
      <ConfirmDialog />
      <DataTable
        columns={columns}
        data={filteredData}
        filterComponent={
          <div className="flex items-center gap-2">
            <Select onValueChange={setStatusFilter} value={statusFilter}>
              <SelectTrigger className="h-8 w-40">
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="UPCOMING">Sắp diễn ra</SelectItem>
                <SelectItem value="ONGOING">Đang diễn ra</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            <Button className="ml-auto h-8" onClick={handleCreate} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Tạo sự kiện
            </Button>
          </div>
        }
        searchKey="title"
        searchPlaceholder="Tìm theo tên sự kiện..."
      />

      <AdminViewDialog
        open={!!viewEvent}
        onOpenChange={(open) => {
          if (!open) setViewEvent(null);
        }}
        title="Thông tin sự kiện"
        onEdit={() => {
          if (viewEvent) {
            setViewEvent(null);
            handleEdit(viewEvent);
          }
        }}
        onDelete={() => {
          if (viewEvent) {
            setViewEvent(null);
            handleDelete(viewEvent.id);
          }
        }}
        data={
          viewEvent
            ? [
                { label: "Tên sự kiện", value: viewEvent.title, colSpan: 2 },
                { label: "Đường dẫn (Slug)", value: viewEvent.slug },
                { label: "Địa điểm", value: viewEvent.location },
                {
                  label: "Thời gian bắt đầu",
                  value: new Date(viewEvent.startAt).toLocaleString("vi-VN"),
                },
                {
                  label: "Thời gian kết thúc",
                  value: viewEvent.endAt
                    ? new Date(viewEvent.endAt).toLocaleString("vi-VN")
                    : "—",
                },
                {
                  label: "Trạng thái",
                  value: <Badge variant="outline">{viewEvent.status}</Badge>,
                },
                {
                  label: "Người tạo",
                  value: viewEvent.creator
                    ? `${viewEvent.creator.firstName} ${viewEvent.creator.lastName}`
                    : "—",
                },
                {
                  label: "Mô tả ngắn",
                  value: viewEvent.description,
                  colSpan: 2,
                },
              ]
            : []
        }
      />

      <EventFormDialog
        event={editEvent}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditEvent(null);
            router.refresh();
          }
        }}
        open={dialogOpen}
      />
    </>
  );
}
