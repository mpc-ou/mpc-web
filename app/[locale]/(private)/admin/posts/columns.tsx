"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getFullName } from "@/lib/utils";
import { formatLocalDate } from "@/utils/handle-datetime";

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  type: "BLOG" | "EVENT" | "ACHIEVEMENT";
  summary: string | null;
  content: string;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  thumbnail?: string | null;
  author: { firstName: string; middleName?: string | null; lastName: string } | null;
  category: { name: string } | null;

  // Bilingual fields
  titleVi: string;
  titleEn: string;
  summaryVi: string | null;
  summaryEn: string | null;
  contentVi: string;
  contentEn: string;
  sourceLanguage: "VI" | "EN";

  // Event-specific
  locationVi?: string | null;
  locationEn?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  eventStatus?: string | null;
  eventType?: string | null;

  // Achievement-specific
  achievementType?: string | null;
  achievementDate?: string | null;
  isHighlight?: boolean;
  relatedUrl?: string | null;
  images?: string[];
  members?: Array<{
    member: { id: string; firstName: string; lastName: string; avatar: string | null };
    role?: string | null;
    prize?: string | null;
    imageUrl?: string | null;
  }>;
  gallery?: Array<{
    id: string;
    url: string;
    title?: string | null;
    caption?: string | null;
    type: string;
    order: number;
  }>;
  tags?: Array<{ tag: { id: string; name: string; slug: string } }>;
};

const statusBadge: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  DRAFT: { label: "Nháp", variant: "outline" },
  PENDING_REVIEW: { label: "Chờ duyệt", variant: "secondary" },
  PUBLISHED: { label: "Đã xuất bản", variant: "default" },
  ARCHIVED: { label: "Lưu trữ", variant: "outline" },
  REJECTED: { label: "Từ chối", variant: "destructive" },
  UPCOMING: { label: "Sắp diễn ra", variant: "secondary" },
  ONGOING: { label: "Đang diễn ra", variant: "default" },
  COMPLETED: { label: "Hoàn thành", variant: "outline" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" }
};

const SortHeader = ({ label, column }: { label: string; column: Column<PostRow, unknown> }) => (
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
  onEdit: (post: PostRow) => void,
  onDelete: (id: string, type: "BLOG" | "EVENT" | "ACHIEVEMENT") => void,
  onView: (post: PostRow) => void,
  locale = "vi"
): ColumnDef<PostRow>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label='Chọn tất cả'
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label='Chọn dòng'
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "thumbnail",
    header: "Ảnh",
    cell: ({ row }) => {
      const url = row.original.thumbnail;
      return url ? (
        <div className='relative h-10 w-16 overflow-hidden rounded-md border bg-muted'>
          <Image alt={row.original.title} className='object-cover' fill sizes='64px' src={url} />
        </div>
      ) : (
        <div className='flex h-10 w-16 select-none items-center justify-center rounded-md border border-dashed bg-muted/30 text-[10px] text-muted-foreground'>
          Không ảnh
        </div>
      );
    },
    enableSorting: false
  },
  {
    accessorKey: "title",
    header: ({ column }) => <SortHeader column={column} label='Tiêu đề' />,
    cell: ({ row }) => (
      <button
        className='-m-1 w-full cursor-pointer rounded-md p-1 text-left transition-colors hover:bg-muted/50'
        onClick={() => onView(row.original)}
        type='button'
      >
        <div className='max-w-75 truncate font-medium text-primary hover:underline'>{row.original.title}</div>
        {row.original.category && <div className='text-muted-foreground text-xs'>{row.original.category.name}</div>}
      </button>
    )
  },
  {
    accessorKey: "type",
    header: "Loại",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const typeColors: Record<string, string> = {
        BLOG: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        EVENT: "bg-green-500/10 text-green-600 border-green-500/20",
        ACHIEVEMENT: "bg-amber-500/10 text-amber-600 border-amber-500/20"
      };
      const typeLabels: Record<string, string> = {
        BLOG: "Bài viết",
        EVENT: "Sự kiện",
        ACHIEVEMENT: "Thành tựu"
      };
      return (
        <Badge className={typeColors[type] || ""} variant='outline'>
          {typeLabels[type] || type}
        </Badge>
      );
    }
  },
  {
    id: "sourceLanguage",
    header: "Ngôn ngữ",
    cell: ({ row }) => {
      const sl = row.original.sourceLanguage;
      const hasEn = !!row.original.titleEn;
      const hasVi = !!row.original.titleVi;
      return (
        <div className='flex items-center gap-1'>
          <span
            className={sl === "VI" ? "font-bold text-foreground" : "text-muted-foreground/40"}
            title={hasVi ? "Có bản tiếng Việt" : "Chưa có bản tiếng Việt"}
          >
            🇻🇳
          </span>
          <span className='text-[10px] text-muted-foreground'>/</span>
          <span
            className={sl === "EN" ? "font-bold text-foreground" : "text-muted-foreground/40"}
            title={hasEn ? "Has English version" : "No English version"}
          >
            🇬🇧
          </span>
        </div>
      );
    },
    enableSorting: false
  },
  {
    id: "author",
    header: "Tác giả",
    cell: ({ row }) => {
      const a = row.original.author;
      return a ? (
        <span className='text-xs'>{getFullName(a.firstName, a.middleName, a.lastName, "vi")}</span>
      ) : (
        <span className='text-muted-foreground'>—</span>
      );
    }
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const s = row.getValue("status") as string;
      const info = statusBadge[s] ?? { label: s, variant: "outline" as const };
      return <Badge variant={info.variant}>{info.label}</Badge>;
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id))
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortHeader column={column} label='Ngày tạo' />,
    cell: ({ row }) => (
      <span className='text-muted-foreground text-xs'>{formatLocalDate(row.getValue("createdAt"), locale)}</span>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const post = row.original;
      return (
        <div className='flex items-center gap-0.5'>
          <Button className='h-7 w-7' onClick={() => onView(post)} size='icon' title='Xem' variant='ghost'>
            <Eye className='h-3.5 w-3.5' />
          </Button>
          <Button className='h-7 w-7' onClick={() => onEdit(post)} size='icon' title='Sửa' variant='ghost'>
            <Pencil className='h-3.5 w-3.5' />
          </Button>
          <Button
            className='h-7 w-7 text-destructive hover:text-destructive'
            onClick={() => onDelete(post.id, post.type)}
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
