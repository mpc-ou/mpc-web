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
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export type AnnouncementRow = {
  id: string;
  content: string;
  linkUrl: string | null;
  linkLabel: string | null;
  bgColor: string | null;
  isActive: boolean;
  startAt: string;
  endAt: string | null;
};

export const createColumns = (
  onEdit: (a: AnnouncementRow) => void,
  onToggle: (id: string, isActive: boolean) => void,
  onDelete: (id: string) => void
): ColumnDef<AnnouncementRow>[] => [
  {
    accessorKey: "content",
    header: ({ column }) => (
      <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} variant='ghost'>
        Nội dung <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => <p className='max-w-xs truncate text-sm'>{row.original.content}</p>
  },
  {
    id: "link",
    header: "Link CTA",
    cell: ({ row }) => {
      const { linkUrl, linkLabel } = row.original;
      if (!linkUrl) {
        return <span className='text-muted-foreground'>—</span>;
      }
      return (
        <div className='flex flex-col gap-0.5'>
          <span className='font-medium text-xs'>{linkLabel ?? "—"}</span>
          <a className='text-primary text-xs hover:underline' href={linkUrl} rel='noopener noreferrer' target='_blank'>
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
        return <span className='text-muted-foreground'>—</span>;
      }
      return (
        <div className='flex items-center gap-2'>
          <div className='h-5 w-12 rounded border' style={{ background: bg }} title={bg} />
          <span className='max-w-25 truncate text-muted-foreground text-xs'>{bg}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "endAt",
    header: "Hết hạn",
    cell: ({ row }) =>
      row.original.endAt ? (
        <span className='text-xs'>{new Date(row.original.endAt).toLocaleDateString("vi-VN")}</span>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className='h-8 w-8 p-0' variant='ghost'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(a)}>Chỉnh sửa</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggle(a.id, a.isActive)}>
              {a.isActive ? "Tắt thông báo" : "Bật thông báo"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-destructive' onClick={() => onDelete(a.id)}>
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
