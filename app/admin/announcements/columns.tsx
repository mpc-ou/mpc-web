"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatLocalDate } from "@/utils/handle-datetime";

export type AnnouncementRow = {
  id: string;
  contentVi: string;
  contentEn: string;
  linkUrl: string | null;
  linkLabelVi: string | null;
  linkLabelEn: string | null;
  bgColor: string | null;
  isActive: boolean;
  startAt: string;
  endAt: string | null;
};

const SortHeader = ({ label, column }: { label: string; column: Column<AnnouncementRow, unknown> }) => (
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
  onEdit: (a: AnnouncementRow) => void,
  onToggle: (id: string, isActive: boolean) => void,
  onDelete: (id: string) => void,
  locale = "vi"
): ColumnDef<AnnouncementRow>[] => [
  {
    accessorKey: "contentVi",
    header: ({ column }) => <SortHeader column={column} label='Nội dung' />,
    cell: ({ row }) => (
      <div className='max-w-xs text-xs'>
        <p className='truncate font-medium'>{row.original.contentVi}</p>
        <p className='truncate text-muted-foreground'>{row.original.contentEn}</p>
      </div>
    )
  },
  {
    id: "link",
    header: "Link CTA",
    cell: ({ row }) => {
      const { linkUrl, linkLabelVi, linkLabelEn } = row.original;
      if (!linkUrl) {
        return <span className='text-muted-foreground text-xs'>—</span>;
      }
      return (
        <div className='flex flex-col gap-0.5 text-xs'>
          <span className='font-medium'>{linkLabelVi || linkLabelEn || "—"}</span>
          <a className='text-primary hover:underline' href={linkUrl} rel='noopener noreferrer' target='_blank'>
            {linkUrl}
          </a>
        </div>
      );
    }
  },
  {
    accessorKey: "bgColor",
    header: "Màu nền",
    cell: ({ row }) => {
      const bg = row.original.bgColor;
      if (!bg) {
        return <span className='text-muted-foreground text-xs'>—</span>;
      }
      return (
        <div className='flex items-center gap-2 text-xs'>
          <div className='h-4 w-10 rounded border' style={{ background: bg }} title={bg} />
          <span className='max-w-25 truncate text-muted-foreground'>{bg}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "endAt",
    header: "Hết hạn",
    cell: ({ row }) =>
      row.original.endAt ? (
        <span className='text-xs'>{formatLocalDate(row.original.endAt, locale)}</span>
      ) : (
        <span className='text-muted-foreground text-xs'>Vô thời hạn</span>
      )
  },
  {
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "outline"}>
        {row.original.isActive ? "Đang hiện" : "Đã ẩn"}
      </Badge>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const a = row.original;
      return (
        <div className='flex items-center gap-0.5'>
          <Button className='h-7 w-7' onClick={() => onEdit(a)} size='icon' title='Chỉnh sửa' variant='ghost'>
            <Pencil className='h-3.5 w-3.5' />
          </Button>
          <Button
            className='h-7 w-7 text-muted-foreground hover:text-foreground'
            onClick={() => onToggle(a.id, a.isActive)}
            size='icon'
            title={a.isActive ? "Ẩn thông báo" : "Hiện thông báo"}
            variant='ghost'
          >
            {a.isActive ? <EyeOff className='h-3.5 w-3.5' /> : <Eye className='h-3.5 w-3.5' />}
          </Button>
          <Button
            className='h-7 w-7 text-destructive hover:text-destructive'
            onClick={() => onDelete(a.id)}
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
