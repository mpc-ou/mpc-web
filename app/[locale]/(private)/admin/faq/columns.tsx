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
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  locale: string;
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
    accessorKey: "question",
    header: ({ column }) => (
      <Button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        Câu hỏi <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <p className="max-w-sm truncate font-medium">{row.original.question}</p>
    ),
  },
  {
    accessorKey: "answer",
    header: "Câu trả lời",
    cell: ({ row }) => (
      <p className="max-w-xs truncate text-muted-foreground text-sm">
        {row.original.answer}
      </p>
    ),
  },
  {
    accessorKey: "locale",
    header: "Ngôn ngữ",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.locale.toUpperCase()}</Badge>
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
