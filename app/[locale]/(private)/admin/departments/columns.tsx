"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type DeptRow = {
  id: string;
  nameVi: string;
  nameEn: string;
  slug: string;
  descriptionVi: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  _count: { clubRoles: number };
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
  onEdit: (d: DeptRow) => void,
  onDelete: (id: string) => void,
  onView?: (d: DeptRow) => void
): ColumnDef<DeptRow>[] => [
  {
    accessorKey: "order",
    header: ({ column }) => <SortHeader column={column} label='#' />,
    cell: ({ row }) => <span className='text-muted-foreground text-xs'>{row.original.order}</span>
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortHeader column={column} label='Tên' />,
    cell: ({ row }) => (
      <span className='font-medium text-xs'>
        {row.original.nameVi}{" "}
        {row.original.nameEn ? (
          <span className='text-[10px] text-muted-foreground'>/ {row.original.nameEn}</span>
        ) : null}
      </span>
    )
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]'>{row.original.slug}</code>
  },
  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) =>
      row.original.descriptionVi ? (
        <p className='max-w-xs truncate text-muted-foreground text-xs'>{row.original.descriptionVi}</p>
      ) : (
        <span className='text-muted-foreground text-xs'>—</span>
      )
  },
  {
    id: "members",
    header: "Thành viên",
    cell: ({ row }) => <Badge variant='secondary'>{row.original._count.clubRoles}</Badge>
  },
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
      const d = row.original;
      return (
        <div className='flex items-center gap-0.5'>
          {onView && (
            <Button className='h-7 w-7' onClick={() => onView(d)} size='icon' title='Xem' variant='ghost'>
              <Eye className='h-3.5 w-3.5' />
            </Button>
          )}
          <Button className='h-7 w-7' onClick={() => onEdit(d)} size='icon' title='Chỉnh sửa' variant='ghost'>
            <Pencil className='h-3.5 w-3.5' />
          </Button>
          <Button
            className='h-7 w-7 text-muted-foreground hover:text-destructive'
            onClick={() => onDelete(d.id)}
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
