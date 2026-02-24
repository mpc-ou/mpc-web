"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Calendar, Mail, ShieldIcon, User } from "lucide-react";
import type { MemberRow } from "./columns";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberRow | null;
  onEdit: (member: MemberRow) => void;
  onDelete: (id: string) => void;
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
  GUEST: { label: "Khách", variant: "outline" },
};

export function MemberViewDialog({
  open,
  onOpenChange,
  member,
  onEdit,
  onDelete,
}: Props) {
  if (!member) return null;

  const initials = `${member.firstName?.[0] ?? ""}${member.lastName?.[0] ?? ""}`;
  const roleInfo = roleBadge[member.webRole] ?? {
    label: member.webRole,
    variant: "outline" as const,
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
        <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
          <Avatar className="h-16 w-16">
            <AvatarImage src={member.avatar ?? undefined} />
            <AvatarFallback className="bg-primary/10 font-bold text-xl text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-2xl text-left">
              {member.firstName} {member.lastName}
            </DialogTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="flex items-center gap-1 text-sm">
                <Mail className="h-3.5 w-3.5" /> {member.email}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={member.isActive ? "default" : "destructive"}>
                {member.isActive ? "Hoạt động" : "Khóa"}
              </Badge>
              <Badge
                variant={roleInfo.variant}
                className="flex items-center gap-1"
              >
                <ShieldIcon className="h-3 w-3" /> {roleInfo.label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <User className="h-5 w-5" /> Thông tin cá nhân
            </h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 text-muted-foreground">
                <span className="col-span-1">MSSV:</span>{" "}
                <span className="col-span-2 text-foreground font-medium">
                  {member.studentId || "—"}
                </span>
              </div>
              <div className="grid grid-cols-3 text-muted-foreground">
                <span className="col-span-1">Ngày sinh:</span>{" "}
                <span className="col-span-2 text-foreground font-medium">
                  {member.dob
                    ? new Date(member.dob).toLocaleDateString("vi-VN")
                    : "—"}
                </span>
              </div>
              <div className="grid grid-cols-3 text-muted-foreground">
                <span className="col-span-1">Điện thoại:</span>{" "}
                <span className="col-span-2 text-foreground font-medium">
                  {member.phone || "—"}
                </span>
              </div>
              <div className="grid grid-cols-3 text-muted-foreground">
                <span className="col-span-1">URL cá nhân:</span>{" "}
                <span className="col-span-2 text-foreground font-medium">
                  {member.slug || "—"}
                </span>
              </div>
              <div className="grid grid-cols-3 text-muted-foreground">
                <span className="col-span-1">Ngày tham gia:</span>{" "}
                <span className="col-span-2 text-foreground font-medium">
                  {new Date(member.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Chức vụ câu lạc bộ
            </h3>
            {member.clubRoles.length > 0 ? (
              <div className="flex flex-col gap-2">
                {member.clubRoles.map((role, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg border p-3"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {role.position}
                      </span>
                      {role.department && (
                        <span className="text-xs text-muted-foreground">
                          {role.department.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Chưa có chức vụ nào
              </p>
            )}

            {member.bio && (
              <div className="mt-6">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Giới thiệu:
                </h4>
                <p className="text-sm border-l-2 border-primary/50 pl-3">
                  {member.bio}
                </p>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button variant="default" onClick={() => onEdit(member)}>
            Sửa thông tin
          </Button>
          <Button variant="destructive" onClick={() => onDelete(member.id)}>
            Xóa thành viên
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
