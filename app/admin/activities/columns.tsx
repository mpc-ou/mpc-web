"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Activity } from "@/configs/prisma/generated/prisma/client";

export type ActivityRow = Activity;

const SortHeader = ({ label, column }: { label: string; column: Column<ActivityRow, unknown> }) => (
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
  onEdit: (a: ActivityRow) => void,
  onDelete: (id: string) => void,
  onView?: (a: ActivityRow) => void
): ColumnDef<ActivityRow>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <input
        aria-label='Chọn tất cả'
        checked={table.getIsAllPageRowsSelected()}
        className='h-4 w-4 cursor-pointer'
        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        ref={(el) => {
          if (el) {
            el.indeterminate = table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected();
          }
        }}
        type='checkbox'
      />
    ),
    cell: ({ row }) => (
      <input
        aria-label='Chọn dòng'
        checked={row.getIsSelected()}
        className='h-4 w-4 cursor-pointer'
        onChange={(e) => row.toggleSelected(!!e.target.checked)}
        type='checkbox'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "titleVi",
    header: ({ column }) => <SortHeader column={column} label='Tên hoạt động' />,
    cell: ({ row }) => (
      <div className='min-w-0'>
        <p className='truncate font-medium'>{row.original.titleVi}</p>
        {row.original.titleEn && <p className='truncate text-muted-foreground text-xs'>{row.original.titleEn}</p>}
      </div>
    )
  },
  {
    accessorKey: "frequencyVi",
    header: "Tần suất",
    cell: ({ row }) => <span className='text-muted-foreground text-xs'>{row.original.frequencyVi || "—"}</span>
  },
  {
    accessorKey: "isInternal",
    header: "Loại",
    cell: ({ row }) => (
      <Badge variant={row.original.isInternal ? "default" : "secondary"}>
        {row.original.isInternal ? "Nội bộ" : "Đối ngoại"}
      </Badge>
    )
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
    cell: ({ row }) => (
      <div className='flex justify-end gap-1'>
        {onView && (
          <Button onClick={() => onView(row.original)} size='icon' variant='ghost'>
            <Eye className='h-4 w-4' />
          </Button>
        )}
        <Button onClick={() => onEdit(row.original)} size='icon' variant='ghost'>
          <Pencil className='h-4 w-4' />
        </Button>
        <Button onClick={() => onDelete(row.original.id)} size='icon' variant='ghost'>
          <Trash2 className='h-4 w-4 text-destructive' />
        </Button>
      </div>
    )
  }
];
