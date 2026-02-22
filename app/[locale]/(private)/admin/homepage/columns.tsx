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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SectionRow = {
  id: string;
  key: string;
  value: string;
  type: string;
  order: number;
  isActive: boolean;
};

export const createColumns = (
  onEdit: (s: SectionRow) => void,
): ColumnDef<SectionRow>[] => [
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
    accessorKey: "key",
    header: "Key",
    cell: ({ row }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
        {row.original.key}
      </code>
    ),
  },
  {
    accessorKey: "type",
    header: "Loại",
    cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
  },
  {
    accessorKey: "value",
    header: "Giá trị",
    cell: ({ row }) => {
      const { value, type } = row.original;
      if (type === "image") {
        return (
          <img
            alt="preview"
            className="h-10 w-16 rounded object-cover"
            src={value}
          />
        );
      }
      return (
        <p className="max-w-xs truncate text-muted-foreground text-sm">
          {value}
        </p>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "outline"}>
        {row.original.isActive ? "Hiện" : "Ẩn"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const s = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(s)}>
              Chỉnh sửa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
