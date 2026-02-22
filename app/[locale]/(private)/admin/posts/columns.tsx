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

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  author: { firstName: string; lastName: string } | null;
  category: { name: string } | null;
};

const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Nháp", variant: "outline" },
  PENDING_REVIEW: { label: "Chờ duyệt", variant: "secondary" },
  PUBLISHED: { label: "Đã xuất bản", variant: "default" },
  ARCHIVED: { label: "Lưu trữ", variant: "outline" },
  REJECTED: { label: "Từ chối", variant: "destructive" }
};

export const createColumns = (
  onEdit: (post: PostRow) => void,
  onDelete: (id: string) => void
): ColumnDef<PostRow>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} variant="ghost">
        Tiêu đề
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <div className="max-w-[300px] truncate font-medium">{row.original.title}</div>
        {row.original.category && <div className="text-muted-foreground text-xs">{row.original.category.name}</div>}
      </div>
    )
  },
  {
    id: "author",
    header: "Tác giả",
    cell: ({ row }) => {
      const a = row.original.author;
      return a ? <span className="text-sm">{a.firstName} {a.lastName}</span> : <span className="text-muted-foreground">—</span>;
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
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} variant="ghost">
        Ngày tạo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString("vi-VN")
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const post = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(post)}>Chỉnh sửa</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(post.id)}>
              Xóa bài viết
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
