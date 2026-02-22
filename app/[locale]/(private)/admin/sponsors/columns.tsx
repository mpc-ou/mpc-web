"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export type SponsorRow = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  description: string | null;
  isActive: boolean;
};

export const createColumns = (
  onEdit: (s: SponsorRow) => void,
  onDelete: (id: string) => void
): ColumnDef<SponsorRow>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} variant="ghost">
        Nhà tài trợ <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        {row.original.logo && <img alt="" className="h-8 w-8 rounded object-contain" src={row.original.logo} />}
        <span className="font-medium">{row.original.name}</span>
      </div>
    )
  },
  {
    accessorKey: "website",
    header: "Website",
    cell: ({ row }) => row.original.website
      ? <a className="text-primary text-xs hover:underline" href={row.original.website} rel="noopener" target="_blank">{row.original.website}</a>
      : <span className="text-muted-foreground">—</span>
  },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "outline"}>
        {row.original.isActive ? "Hoạt động" : "Tạm ngưng"}
      </Badge>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const s = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(s)}>Chỉnh sửa</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(s.id)}>Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
