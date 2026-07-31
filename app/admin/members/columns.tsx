"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Copy, ExternalLink, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { _ROUTE_MEMBER_CARD } from "@/constants/route";
import { getFullName } from "@/lib/utils";

const POSITION_ONLY_LABEL: Record<string, string> = {
  PRESIDENT: "Chủ nhiệm",
  VICE_PRESIDENT: "Phó chủ nhiệm",
  ADVISOR: "Cố vấn"
};

export type MemberRow = {
  id: string;
  email: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  avatar: string | null;
  coverImage?: string | null;
  phone: string | null;
  dob: string | null;
  studentId: string | null;
  bio: string | null;
  slug: string | null;
  webRole: string;
  isActive: boolean;
  leftClubAt: string | null;
  createdAt: string;
  showDob?: boolean;
  showPhone?: boolean;
  showStudentId?: boolean;
  spotifyUri?: string | null;
  socials?: unknown;
  clubRoles: Array<{
    id: string;
    position: string;
    department: { id: string; nameVi: string; nameEn: string; slug: string } | null;
    startAt: string;
    endAt: string | null;
  }>;
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

const SortHeader = ({ label, column }: { label: string; column: Column<MemberRow, unknown> }) => (
  <Button
    className='h-auto p-0 font-medium text-muted-foreground text-xs hover:text-foreground'
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    variant='ghost'
  >
    {label}
    <ArrowUpDown className='ml-1 h-3 w-3' />
  </Button>
);

function ClubRolesBadges({ roles }: { roles: MemberRow["clubRoles"] }) {
  if (!roles.length) {
    return <span className='text-muted-foreground text-xs'>—</span>;
  }

  const activeRoles = roles.filter((r) => !r.endAt);
  const displayRoles = (activeRoles.length ? activeRoles : roles).slice(0, 3);

  const uniqueDepts = Array.from(
    new Map(
      displayRoles
        .map((r) => r.department)
        .filter(Boolean)
        .map((d) => [d?.slug, d?.nameVi])
    ).entries()
  );

  if (!uniqueDepts.length) {
    const pos = displayRoles[0]?.position;
    const label = (pos && POSITION_ONLY_LABEL[pos]) ?? pos ?? "CLB";
    return (
      <Badge className='text-[10px]' variant='secondary'>
        {label}
      </Badge>
    );
  }

  return (
    <div className='flex flex-wrap gap-1'>
      {uniqueDepts.map(([slug, name]) => (
        <Badge className='text-[10px]' key={slug} variant='outline'>
          {name}
        </Badge>
      ))}
    </div>
  );
}

export const createColumns = (
  onEdit: (member: MemberRow) => void,
  onDelete: (id: string) => void,
  onView: (member: MemberRow) => void
): ColumnDef<MemberRow>[] => [
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
    accessorKey: "firstName",
    header: ({ column }) => <SortHeader column={column} label='Thành viên' />,
    cell: ({ row }) => {
      const m = row.original;
      return (
        <button
          className='-m-1 flex w-full cursor-pointer items-center gap-3 rounded-md p-1 text-left transition-colors hover:bg-muted/50'
          onClick={() => onView(m)}
          type='button'
        >
          <Avatar className='h-8 w-8'>
            <AvatarImage src={m.avatar ?? undefined} />
            <AvatarFallback className='bg-primary/10 font-bold text-primary text-xs'>
              {m.firstName?.[0]}
              {m.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className='font-medium text-xs'>{getFullName(m.firstName, m.middleName, m.lastName, "vi")}</div>
            {m.studentId && <div className='text-[10px] text-muted-foreground'>{m.studentId}</div>}
          </div>
        </button>
      );
    }
  },
  // ── Email ────────────────────────────────────────────────────────────
  {
    accessorKey: "email",
    header: ({ column }) => <SortHeader column={column} label='Email' />,
    cell: ({ row }) => <span className='text-muted-foreground text-xs'>{row.original.email}</span>
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
    header: "Ban",
    cell: ({ row }) => <ClubRolesBadges roles={row.original.clubRoles} />
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className='flex items-center gap-0.5'>
          <Button className='h-7 w-7' onClick={() => onView(member)} size='icon' title='Xem thông tin' variant='ghost'>
            <Eye className='h-3.5 w-3.5' />
          </Button>
          <Button className='h-7 w-7' onClick={() => onEdit(member)} size='icon' title='Sửa' variant='ghost'>
            <Pencil className='h-3.5 w-3.5' />
          </Button>
          <Button
            className='h-7 w-7'
            onClick={() => {
              navigator.clipboard.writeText(member.email);
            }}
            size='icon'
            title='Copy email'
            variant='ghost'
          >
            <Copy className='h-3.5 w-3.5' />
          </Button>
          {member.slug && (
            <Button asChild className='h-7 w-7' size='icon' title='Xem thẻ thành viên' variant='ghost'>
              <Link href={`${_ROUTE_MEMBER_CARD}?member=${member.slug}`} target='_blank'>
                <ExternalLink className='h-3.5 w-3.5' />
              </Link>
            </Button>
          )}
          <Button
            className='h-7 w-7 text-destructive hover:text-destructive'
            onClick={() => onDelete(member.id)}
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
