"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FAQ_TARGETS } from "./constants";

export type FaqRow = {
  id: string;
  questionVi: string;
  answerVi: string;
  questionEn: string;
  answerEn: string;
  target: string;
  order: number;
  isActive: boolean;
};

const SortHeader = ({ label, column }: { label: string; column: Column<FaqRow, unknown> }) => (
  <Button
    className='h-auto p-0 font-medium text-muted-foreground text-xs hover:text-foreground'
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    variant='ghost'
  >
    {label}
    <ArrowUpDown className='ml-1 h-3 w-3' />
  </Button>
);

export const createColumns = (onEdit: (f: FaqRow) => void, onDelete: (id: string) => void): ColumnDef<FaqRow>[] => [
  {
    accessorKey: "order",
    header: ({ column }) => <SortHeader column={column} label='#' />,
    cell: ({ row }) => <span className='text-muted-foreground text-xs'>{row.original.order}</span>
  },
  {
    accessorKey: "questionVi",
    header: ({ column }) => <SortHeader column={column} label='Câu hỏi (VI)' />,
    cell: ({ row }) => <p className='max-w-xs truncate font-medium text-xs'>{row.original.questionVi}</p>
  },
  {
    accessorKey: "questionEn",
    header: "Câu hỏi (EN)",
    cell: ({ row }) => (
      <p className='max-w-xs truncate text-muted-foreground text-xs'>
        {row.original.questionEn || <span className='text-muted-foreground/50 text-xs italic'>—</span>}
      </p>
    )
  },
  {
    accessorKey: "target",
    header: ({ column }) => <SortHeader column={column} label='Trang sử dụng' />,
    cell: ({ row }) => {
      const val = row.original.target;
      const targetObj = FAQ_TARGETS.find((t) => t.value === val);
      return (
        <Badge className='font-medium text-[10px]' variant='secondary'>
          {targetObj?.label ?? val}
        </Badge>
      );
    }
  },
  {
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "outline"}>{row.original.isActive ? "Hiển thị" : "Ẩn"}</Badge>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const f = row.original;
      return (
        <div className='flex items-center gap-0.5'>
          <Button className='h-7 w-7' onClick={() => onEdit(f)} size='icon' title='Chỉnh sửa' variant='ghost'>
            <Pencil className='h-3.5 w-3.5' />
          </Button>
          <Button
            className='h-7 w-7 text-destructive hover:text-destructive'
            onClick={() => onDelete(f.id)}
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
