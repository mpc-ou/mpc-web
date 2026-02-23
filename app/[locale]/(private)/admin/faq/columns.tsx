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

export type FaqRow = {
  id: string;
  questionVi: string;
  answerVi: string;
  questionEn: string;
  answerEn: string;
  order: number;
  isActive: boolean;
};

export const createColumns = (
  onEdit: (f: FaqRow) => void,
  onDelete: (id: string) => void,
): ColumnDef<FaqRow>[] => [
  {
    accessorKey: "order",
    header: ({ column }) => (
      <Button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        # <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.original.order}
      </span>
    ),
  },
  {
    accessorKey: "questionVi",
    header: ({ column }) => (
      <Button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        Câu hỏi (VI) <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <p className="max-w-xs truncate font-medium">{row.original.questionVi}</p>
    ),
  },
  {
    accessorKey: "questionEn",
    header: "Câu hỏi (EN)",
    cell: ({ row }) => (
      <p className="max-w-xs truncate text-muted-foreground text-sm">
        {row.original.questionEn || (
          <span className="italic text-muted-foreground/50">—</span>
        )}
      </p>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "outline"}>
        {row.original.isActive ? "Hiển thị" : "Ẩn"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const f = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(f)}>
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(f.id)}
            >
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
