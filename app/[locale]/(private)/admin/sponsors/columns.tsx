"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type SponsorRow = {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  logo: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  descriptionVi: string | null;
  descriptionEn: string | null;
  activityId: string | null;
  startAt: string | null;
  endAt: string | null;
  images: string[];
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

export const createColumns = (
  onEdit: (s: SponsorRow) => void,
  onDelete: (id: string) => void
): ColumnDef<SponsorRow>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => <SortHeader column={column} label='Nhà tài trợ' />,
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        {row.original.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt='' className='h-10 w-10 shrink-0 object-contain' src={row.original.logo} />
        )}
        <span className='font-medium text-xs'>{row.original.name}</span>
      </div>
    )
  },
  {
    accessorKey: "website",
    header: "Website",
    cell: ({ row }) =>
      row.original.website ? (
        <a className='text-primary text-xs hover:underline' href={row.original.website} rel='noopener' target='_blank'>
          {row.original.website}
        </a>
      ) : (
        <span className='text-muted-foreground text-xs'>—</span>
      )
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className='text-muted-foreground text-xs'>{row.original.email || "—"}</span>
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
      const s = row.original;
      return (
        <div className='flex items-center gap-0.5'>
          <Button className='h-7 w-7' onClick={() => onEdit(s)} size='icon' title='Chỉnh sửa' variant='ghost'>
            <Pencil className='h-3.5 w-3.5' />
          </Button>
          <Button
            className='h-7 w-7 text-destructive hover:text-destructive'
            onClick={() => onDelete(s.id)}
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
