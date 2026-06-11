"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type SectionRow = {
  id: string;
  key: string;
  value: string;
  type: string;
  order: number;
  isActive: boolean;
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

export const createColumns = (onEdit: (s: SectionRow) => void): ColumnDef<SectionRow>[] => [
  {
    accessorKey: "order",
    header: ({ column }) => <SortHeader column={column} label='#' />,
    cell: ({ row }) => <span className='text-muted-foreground text-xs'>{row.original.order}</span>
  },
  {
    accessorKey: "key",
    header: "Key",
    cell: ({ row }) => <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]'>{row.original.key}</code>
  },
  {
    accessorKey: "type",
    header: "Loại",
    cell: ({ row }) => <Badge variant='outline'>{row.original.type}</Badge>
  },
  {
    accessorKey: "value",
    header: "Giá trị",
    cell: ({ row }) => {
      const { value, type } = row.original;
      if (type === "image") {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt='preview' className='h-8 w-12 rounded object-cover' src={value} />
        );
      }
      return <p className='max-w-xs truncate text-muted-foreground text-xs'>{value}</p>;
    }
  },
  {
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "outline"}>{row.original.isActive ? "Hiện" : "Ẩn"}</Badge>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const s = row.original;
      return (
        <div className='flex items-center gap-0.5'>
          <Button className='h-7 w-7' onClick={() => onEdit(s)} size='icon' title='Chỉnh sửa' variant='ghost'>
            <Pencil className='h-3.5 w-3.5' />
          </Button>
        </div>
      );
    }
  }
];
