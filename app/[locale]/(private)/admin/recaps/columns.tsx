"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type RecapRow = {
  year: number;
  name: string;
  description: string | null;
  coverImage?: string | null;
  isPublished: boolean;
  createdAt: string;
};

const SortHeader = ({ label, column }: { label: string; column: any }) => (
  <Button
    className='h-auto p-0 font-medium text-muted-foreground text-xs hover:text-foreground'
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    variant='ghost'
  >
    {label}
    <ArrowUpDown className='ml-1 h-3 w-3' />
  </Button>
);

export const createColumns = (
  onEdit: (year: number) => void,
  onDelete: (year: number) => void,
  onView: (year: number) => void,
  onTogglePublish: (year: number, isPublished: boolean) => void
): ColumnDef<RecapRow>[] => [
  {
    accessorKey: "year",
    header: ({ column }) => <SortHeader column={column} label='Năm' />,
    cell: ({ row }) => <span className='font-bold text-sm'>{row.original.year}</span>
  },
  {
    accessorKey: "name",
    header: "Tên Recap",
    cell: ({ row }) => (
      <div>
        <div className='font-medium text-xs'>{row.original.name}</div>
        {row.original.description && (
          <div className='mt-0.5 line-clamp-1 text-[10px] text-muted-foreground'>{row.original.description}</div>
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
        <div className='flex items-center gap-0.5'>
          <Button className='h-7 w-7' onClick={() => onView(recap.year)} size='icon' title='Xem Recap' variant='ghost'>
            <ExternalLink className='h-3.5 w-3.5' />
          </Button>
          <Button className='h-7 w-7' onClick={() => onEdit(recap.year)} size='icon' title='Sửa' variant='ghost'>
            <Pencil className='h-3.5 w-3.5' />
          </Button>
          <Button
            className='h-7 w-7'
            onClick={() => onTogglePublish(recap.year, !recap.isPublished)}
            size='icon'
            title={recap.isPublished ? "Hủy xuất bản" : "Xuất bản"}
            variant='ghost'
          >
            {recap.isPublished ? <EyeOff className='h-3.5 w-3.5' /> : <Eye className='h-3.5 w-3.5' />}
          </Button>
          <Button
            className='h-7 w-7 text-destructive hover:text-destructive'
            onClick={() => onDelete(recap.year)}
            size='icon'
            title='Xóa'
            variant='ghost'
          >
            <Trash2 className='h-3.5 w-3.5' />
          </Button>
        </div>
      );
    }
  }
];
