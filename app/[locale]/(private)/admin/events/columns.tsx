"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export type EventRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  thumbnail: string | null;
  location: string | null;
  startAt: string;
  endAt: string | null;
  status: string;
  creator: { firstName: string; lastName: string } | null;
};

const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  UPCOMING: { label: "Sắp diễn ra", variant: "default" },
  ONGOING: { label: "Đang diễn ra", variant: "secondary" },
  COMPLETED: { label: "Hoàn thành", variant: "outline" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" }
};

export const createColumns = (
  onEdit: (event: EventRow) => void,
  onDelete: (id: string) => void
): ColumnDef<EventRow>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} variant="ghost">
        Sự kiện
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.title}</div>
        {row.original.location && <div className="text-muted-foreground text-xs">📍 {row.original.location}</div>}
      </div>
    )
  },
  {
    accessorKey: "startAt",
    header: ({ column }) => (
      <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} variant="ghost">
        Thời gian
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const start = new Date(row.original.startAt);
      const end = row.original.endAt ? new Date(row.original.endAt) : null;
      return (
        <div className="text-xs">
          <div>{start.toLocaleDateString("vi-VN")}</div>
          {end && <div className="text-muted-foreground">→ {end.toLocaleDateString("vi-VN")}</div>}
        </div>
      );
    }
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const s = row.getValue("status") as string;
      const info = statusBadge[s] ?? { label: s, variant: "outline" as const };
      return <Badge variant={info.variant}>{info.label}</Badge>;
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id))
  },
  {
    id: "creator",
    header: "Người tạo",
    cell: ({ row }) => {
      const c = row.original.creator;
      return c ? <span className="text-sm">{c.firstName} {c.lastName}</span> : <span className="text-muted-foreground">—</span>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const event = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(event)}>Chỉnh sửa</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(event.id)}>
              Xóa sự kiện
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
