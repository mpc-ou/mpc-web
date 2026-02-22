"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export type MemberRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  phone: string | null;
  dob: string | null;
  studentId: string | null;
  bio: string | null;
  slug: string | null;
  webRole: string;
  isActive: boolean;
  createdAt: string;
  clubRoles: Array<{ position: string; department: { name: string } | null }>;
};

const roleBadge: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  ADMIN: { label: "Admin", variant: "destructive" },
  COLLABORATOR: { label: "CTV", variant: "default" },
  MEMBER: { label: "Thành viên", variant: "secondary" },
  GUEST: { label: "Khách", variant: "outline" }
};

export const createColumns = (
  onEdit: (member: MemberRow) => void,
  onDelete: (id: string) => void
): ColumnDef<MemberRow>[] => [
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} variant='ghost'>
        Thành viên
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const m = row.original;
      return (
        <div className='flex items-center gap-3'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={m.avatar ?? undefined} />
            <AvatarFallback className='bg-primary/10 font-bold text-primary text-xs'>
              {m.firstName?.[0]}
              {m.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className='font-medium'>
              {m.firstName} {m.lastName}
            </div>
            {m.studentId && <div className='text-muted-foreground text-xs'>{m.studentId}</div>}
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} variant='ghost'>
        Email
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    )
  },
  {
    accessorKey: "webRole",
    header: "Vai trò",
    cell: ({ row }) => {
      const role = row.getValue("webRole") as string;
      const info = roleBadge[role] ?? {
        label: role,
        variant: "outline" as const
      };
      return <Badge variant={info.variant}>{info.label}</Badge>;
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id))
  },
  {
    id: "clubRoles",
    header: "Chức vụ CLB",
    cell: ({ row }) => {
      const roles = row.original.clubRoles;
      if (!roles.length) {
        return <span className='text-muted-foreground'>—</span>;
      }
      return (
        <div className='text-xs'>
          {roles.map((r) => `${r.position}${r.department ? ` - ${r.department.name}` : ""}`).join(", ")}
        </div>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const member = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className='h-8 w-8 p-0' variant='ghost'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(member.email)}>Copy email</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(member)}>Chỉnh sửa</DropdownMenuItem>
            <DropdownMenuItem className='text-destructive' onClick={() => onDelete(member.id)}>
              Xóa thành viên
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
