"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink, Eye, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type ProjectRow = {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  description: string | null;
  descriptionEn: string | null;
  content: string | null;
  contentEn: string;
  thumbnail: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  videoUrl: string | null;
  technologies: string[];
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  members: Array<{
    member: { id: string; firstName: string; lastName: string };
    role: string | null;
  }>;
};

const SortHeader = ({ label, column }: { label: string; column: Column<ProjectRow, unknown> }) => (
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
  onEdit: (p: ProjectRow) => void,
  onDelete: (id: string) => void,
  onView?: (p: ProjectRow) => void
): ColumnDef<ProjectRow>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => <SortHeader column={column} label='Dự án' />,
    cell: ({ row }) => (
      <button
        className='-m-1 flex w-full cursor-pointer items-center gap-3 rounded-md p-1 text-left transition-colors hover:bg-muted/50'
        onClick={() => onView?.(row.original)}
        type='button'
      >
        {row.original.thumbnail && (
          <Image alt='' className='rounded border object-cover' height={48} src={row.original.thumbnail} width={48} />
        )}
        <div>
          <div className='max-w-50 truncate font-medium text-primary text-xs hover:underline'>{row.original.title}</div>
          {row.original.description && (
            <div className='max-w-50 truncate text-[10px] text-muted-foreground'>{row.original.description}</div>
          )}
        </div>
      </button>
    )
  },
  {
    id: "technologies",
    header: "Công nghệ",
    cell: ({ row }) => {
      const techs = row.original.technologies ?? [];
      if (!techs.length) {
        return <span className='text-muted-foreground text-xs'>—</span>;
      }
      return (
        <div className='flex flex-wrap gap-1'>
          {techs.slice(0, 3).map((t) => (
            <Badge className='text-[10px]' key={t} variant='outline'>
              {t}
            </Badge>
          ))}
          {techs.length > 3 && (
            <Badge className='text-[10px]' variant='outline'>
              +{techs.length - 3}
            </Badge>
          )}
        </div>
      );
    }
  },
  {
    id: "links",
    header: "Links",
    cell: ({ row }) => {
      const p = row.original;
      const links = [
        p.githubUrl && { label: "GitHub", url: p.githubUrl },
        p.websiteUrl && { label: "Web", url: p.websiteUrl }
      ].filter(Boolean) as { label: string; url: string }[];
      if (!links.length) {
        return <span className='text-muted-foreground text-xs'>—</span>;
      }
      return (
        <div className='flex gap-2'>
          {links.map((l) => (
            <a
              className='inline-flex items-center gap-1 text-primary text-xs hover:underline'
              href={l.url}
              key={l.label}
              rel='noopener'
              target='_blank'
            >
              <ExternalLink className='h-3 w-3' />
              {l.label}
            </a>
          ))}
        </div>
      );
    }
  },
  {
    id: "memberCount",
    header: "Thành viên",
    cell: ({ row }) => <span className='text-muted-foreground text-xs'>{row.original.members.length || "—"}</span>
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "outline"}>
        {row.original.isActive ? "Hoạt động" : "Kết thúc"}
      </Badge>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className='flex items-center gap-0.5'>
          {onView && (
            <Button className='h-7 w-7' onClick={() => onView(p)} size='icon' title='Xem chi tiết' variant='ghost'>
              <Eye className='h-3.5 w-3.5' />
            </Button>
          )}
          <Button className='h-7 w-7' onClick={() => onEdit(p)} size='icon' title='Chỉnh sửa' variant='ghost'>
            <Pencil className='h-3.5 w-3.5' />
          </Button>
          <Button
            className='h-7 w-7 text-destructive hover:text-destructive'
            onClick={() => onDelete(p.id)}
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
