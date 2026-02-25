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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type AchievementRow = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  thumbnail: string | null;
  date: string;
  type: string;
  isHighlight: boolean;
  relatedUrl: string | null;
  relatedPostId: string | null;
  images: string[];
  members: Array<{
    member: { id: string; firstName: string; lastName: string };
    role: string | null;
  }>;
};

const typeBadge: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  INDIVIDUAL: { label: "Cá nhân", variant: "secondary" },
  TEAM: { label: "Nhóm", variant: "default" },
  CLUB: { label: "Toàn CLB", variant: "destructive" },
};

export const createColumns = (
  onEdit: (a: AchievementRow) => void,
  onDelete: (id: string) => void,
): ColumnDef<AchievementRow>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        Thành tựu <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <div className="max-w-[250px] truncate font-medium">
          {row.original.title}
        </div>
        {row.original.summary && (
          <div className="max-w-[250px] truncate text-muted-foreground text-xs">
            {row.original.summary}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Loại",
    cell: ({ row }) => {
      const t = row.getValue("type") as string;
      const info = typeBadge[t] ?? { label: t, variant: "outline" as const };
      return <Badge variant={info.variant}>{info.label}</Badge>;
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        Ngày <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) =>
      new Date(row.getValue("date")).toLocaleDateString("vi-VN"),
  },
  {
    accessorKey: "isHighlight",
    header: "Nổi bật",
    cell: ({ row }) =>
      row.original.isHighlight ? (
        <span className="text-yellow-500">⭐</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "memberCount",
    header: "Thành viên",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.members.length || "—"}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const a = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(a)}>
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(a.id)}
            >
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
