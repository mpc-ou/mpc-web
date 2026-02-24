"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
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

export const createColumns = (
  onEdit: (p: ProjectRow) => void,
  onDelete: (id: string) => void,
  onView?: (p: ProjectRow) => void,
): ColumnDef<ProjectRow>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        Dự án <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div
        className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-1 -m-1 rounded-md transition-colors"
        onClick={() => onView?.(row.original)}
      >
        {row.original.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="rounded border object-cover h-12 w-12"
            src={row.original.thumbnail}
          />
        )}
        <div>
          <div className="max-w-50 truncate font-medium text-primary hover:underline">
            {row.original.title}
          </div>
          {row.original.description && (
            <div className="max-w-50 truncate text-muted-foreground text-xs">
              {row.original.description}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    id: "technologies",
    header: "Công nghệ",
    cell: ({ row }) => {
      const techs = row.original.technologies ?? [];
      if (!techs.length) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {techs.slice(0, 3).map((t) => (
            <Badge className="text-[10px]" key={t} variant="outline">
              {t}
            </Badge>
          ))}
          {techs.length > 3 && (
            <Badge className="text-[10px]" variant="outline">
              +{techs.length - 3}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "links",
    header: "Links",
    cell: ({ row }) => {
      const p = row.original;
      const links = [
        p.githubUrl && { label: "GitHub", url: p.githubUrl },
        p.websiteUrl && { label: "Web", url: p.websiteUrl },
      ].filter(Boolean) as { label: string; url: string }[];
      if (!links.length) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="flex gap-2">
          {links.map((l) => (
            <a
              className="inline-flex items-center gap-1 text-primary text-xs hover:underline"
              href={l.url}
              key={l.label}
              rel="noopener"
              target="_blank"
            >
              <ExternalLink className="h-3 w-3" />
              {l.label}
            </a>
          ))}
        </div>
      );
    },
  },
  {
    id: "memberCount",
    header: "Thành viên",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.members.length || "—"}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "outline"}>
        {row.original.isActive ? "Hoạt động" : "Kết thúc"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            {onView && (
              <DropdownMenuItem onClick={() => onView(p)}>
                Xem chi tiết
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(p)}>
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(p.id)}
            >
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
