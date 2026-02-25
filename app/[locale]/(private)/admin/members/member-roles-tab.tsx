"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  adminAddClubRole,
  adminGetMemberClubRoles,
  adminRemoveClubRole,
} from "../actions";
import type { MemberRow } from "./columns";
import { type ClubRoleEntry, type Department, POSITION_LABELS } from "./types";

type Props = {
  member?: MemberRow;
  departments: Department[];
  open: boolean;
};

export function MemberRolesTab({ member, departments, open }: Props) {
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [clubRoles, setClubRoles] = useState<ClubRoleEntry[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [addingRole, setAddingRole] = useState(false);

  useEffect(() => {
    let ignore = false;
    if (open && member) {
      setRolesLoading(true);
      adminGetMemberClubRoles(member.id)
        .then((res) => {
          if (ignore) {
            return;
          }
          if (res.data?.payload) {
            setClubRoles(
              (res.data.payload as ClubRoleEntry[]).map((r) => ({
                ...r,
                startAt: new Date(r.startAt).toISOString(),
                endAt: r.endAt ? new Date(r.endAt).toISOString() : null,
              })),
            );
          }
          setRolesLoading(false);
        })
        .catch(() => {
          if (!ignore) {
            setRolesLoading(false);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, [member?.id, open, member]);

  const handleAddRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!member) {
      return;
    }
    setAddingRole(true);
    const fd = new FormData(e.currentTarget);
    const departmentId = fd.get("departmentId") as string;
    const res = await adminAddClubRole(member.id, {
      position: fd.get("position") as string,
      departmentId:
        departmentId === "none" ? undefined : departmentId || undefined,
      term: fd.get("term") ? Number(fd.get("term")) : undefined,
      startAt: fd.get("startAt") as string,
      endAt: (fd.get("endAt") as string) || undefined,
      note: (fd.get("note") as string) || undefined,
    });
    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
    } else if (res.data?.payload) {
      const newRole = res.data.payload as ClubRoleEntry;
      setClubRoles((prev) => [
        {
          ...newRole,
          startAt: new Date(newRole.startAt).toISOString(),
          endAt: newRole.endAt ? new Date(newRole.endAt).toISOString() : null,
        },
        ...prev,
      ]);
      setShowRoleForm(false);
      (e.target as HTMLFormElement).reset();
    }
    setAddingRole(false);
  };

  const handleRemoveRole = async (roleId: string) => {
    const ok = await confirm({
      title: "Xóa chức vụ?",
      description: "Hành động này không thể hoàn tác.",
    });
    if (!ok) {
      return;
    }
    const res = await adminRemoveClubRole(roleId);
    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
    } else {
      setClubRoles((prev) => prev.filter((r) => r.id !== roleId));
    }
  };

  return (
    <>
      <ConfirmDialog />
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm">Lịch sử chức vụ CLB</p>
          <Button
            onClick={() => setShowRoleForm((v) => !v)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus className="mr-1 h-3 w-3" />
            Thêm chức vụ
          </Button>
        </div>

        {showRoleForm && (
          <form
            className="space-y-3 rounded-lg border border-primary/50 border-dashed bg-primary/5 p-4"
            onSubmit={handleAddRole}
          >
            <p className="font-medium text-primary text-xs uppercase tracking-wide">
              Thêm chức vụ mới
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Chức vụ *</Label>
                <Select name="position" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chức vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(POSITION_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Ban</Label>
                <Select name="departmentId">
                  <SelectTrigger>
                    <SelectValue placeholder="Không có" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có (cấp CLB)</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nameVi || d.slug}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label>Nhiệm kỳ</Label>
                <Input
                  min={2010}
                  name="term"
                  placeholder="VD: 2024"
                  type="number"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Bắt đầu *</Label>
                <Input name="startAt" required type="date" />
              </div>
              <div className="grid gap-1.5">
                <Label>Kết thúc</Label>
                <Input name="endAt" type="date" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Ghi chú</Label>
              <Input name="note" placeholder="Tuỳ chọn..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setShowRoleForm(false)}
                size="sm"
                type="button"
                variant="ghost"
              >
                Huỷ
              </Button>
              <Button disabled={addingRole} size="sm" type="submit">
                {addingRole ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Thêm"
                )}
              </Button>
            </div>
          </form>
        )}

        {rolesLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tải...
          </div>
        ) : clubRoles.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground text-sm">
            Chưa có lịch sử chức vụ nào
          </p>
        ) : (
          <div className="relative space-y-0 pl-4">
            <div className="absolute top-2 bottom-2 left-1.75 w-px bg-border" />
            {clubRoles.map((role) => {
              const isActive = !role.endAt;
              return (
                <div
                  className="relative flex items-start gap-3 pb-4"
                  key={role.id}
                >
                  <div
                    className={`relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 ${isActive ? "border-primary bg-primary" : "border-muted-foreground bg-background"}`}
                  />
                  <div className="flex flex-1 items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {POSITION_LABELS[role.position] ?? role.position}
                        </span>
                        {isActive && (
                          <Badge className="text-[10px]" variant="default">
                            Hiện tại
                          </Badge>
                        )}
                        {role.term && (
                          <Badge className="text-[10px]" variant="outline">
                            NK {role.term}
                          </Badge>
                        )}
                      </div>
                      {role.department && (
                        <span className="text-muted-foreground text-xs">
                          📌 {role.department.nameVi}
                        </span>
                      )}
                      <div className="mt-0.5 text-muted-foreground text-xs">
                        {new Date(role.startAt).toLocaleDateString("vi-VN")}
                        {" → "}
                        {role.endAt
                          ? new Date(role.endAt).toLocaleDateString("vi-VN")
                          : "nay"}
                      </div>
                      {role.note && (
                        <p className="mt-0.5 text-muted-foreground text-xs italic">
                          {role.note}
                        </p>
                      )}
                    </div>
                    <Button
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveRole(role.id)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
