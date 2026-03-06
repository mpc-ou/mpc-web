"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink, Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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

export type RecapRow = {
  year: number;
  name: string;
  description: string | null;
  isPublished: boolean;
  createdAt: string;
};

export const createColumns = (
  onEdit: (year: number) => void,
  onDelete: (year: number) => void,
  onView: (year: number) => void,
  onTogglePublish: (year: number, isPublished: boolean) => void
): ColumnDef<RecapRow>[] => [
  {
    accessorKey: "year",
    header: ({ column }) => (
      <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} variant='ghost'>
        Năm
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => <span className='font-bold text-lg'>{row.original.year}</span>
  },
  {
    accessorKey: "name",
    header: "Tên Recap",
    cell: ({ row }) => (
      <div>
        <div className='font-medium'>{row.original.name}</div>
        {row.original.description && (
          <div className='mt-0.5 line-clamp-1 text-muted-foreground text-xs'>{row.original.description}</div>
        )}
      </div>
    )
  },
  {
    accessorKey: "isPublished",
    header: "Trạng thái",
    cell: ({ row }) =>
      row.original.isPublished ? <Badge variant='default'>Đã xuất bản</Badge> : <Badge variant='secondary'>Nháp</Badge>
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const recap = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className='h-8 w-8 p-0' variant='ghost'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView(recap.year)}>
              <ExternalLink className='mr-2 h-4 w-4' />
              Xem Recap
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(recap.year)}>
              <Pencil className='mr-2 h-4 w-4' />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTogglePublish(recap.year, !recap.isPublished)}>
              {recap.isPublished ? (
                <>
                  <EyeOff className='mr-2 h-4 w-4' /> Hủy xuất bản
                </>
              ) : (
                <>
                  <Eye className='mr-2 h-4 w-4' /> Xuất bản
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-destructive' onClick={() => onDelete(recap.year)}>
              <Trash2 className='mr-2 h-4 w-4' />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
