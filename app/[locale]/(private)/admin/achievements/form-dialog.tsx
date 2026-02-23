"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { MarkdownEditor } from "@/components/markdown-editor";
import {
  type LinkedMember,
  type MemberOption,
  MemberSelector,
} from "@/components/member-selector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  adminCreateAchievement,
  adminLinkAchievementMember,
  adminUnlinkAchievementMember,
  adminUpdateAchievement,
} from "../actions";
import type { AchievementRow } from "./columns";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement?: AchievementRow | null;
  allMembers?: MemberOption[];
};

export function AchievementFormDialog({
  open,
  onOpenChange,
  achievement,
  allMembers = [],
}: Props) {
  const isEdit = !!achievement;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [linked, setLinked] = useState<LinkedMember[]>([]);

  // Sync linked members when achievement changes
  useEffect(() => {
    if (achievement?.members) {
      setLinked(
        achievement.members.map((m) => ({
          member: {
            id: m.member.id,
            firstName: m.member.firstName,
            lastName: m.member.lastName,
            avatar: null,
            studentId: null,
            webRole: "",
          } as MemberOption,
          role: m.role,
        })),
      );
    } else {
      setLinked([]);
    }
  }, [achievement?.id, open]);

  const handleLink = async (member: MemberOption, role: string) => {
    if (!achievement) {
      setLinked((prev) => [...prev, { member, role: role || null }]);
      return;
    }
    const res = await adminLinkAchievementMember(
      achievement.id,
      member.id,
      role || undefined,
    );
    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
      return;
    }
    setLinked((prev) => [...prev, { member, role: role || null }]);
  };

  const handleUnlink = async (memberId: string) => {
    if (achievement) {
      const res = await adminUnlinkAchievementMember(achievement.id, memberId);
      if (res.error) {
        toast({ variant: "destructive", description: res.error?.message });
        return;
      }
    }
    setLinked((prev) => prev.filter((l) => l.member.id !== memberId));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title") as string,
      summary: (fd.get("summary") as string) || undefined,
      content: (fd.get("content") as string) || undefined,
      date: fd.get("date") as string,
      type: fd.get("type") as string,
      isHighlight: fd.get("isHighlight") === "on",
      relatedUrl: (fd.get("relatedUrl") as string) || undefined,
    };

    let entityId: string | null = achievement?.id ?? null;

    if (isEdit && achievement) {
      const res = await adminUpdateAchievement(achievement.id, payload);
      if (res.error) {
        toast({ variant: "destructive", description: res.error?.message });
        setLoading(false);
        return;
      }
    } else {
      const res = await adminCreateAchievement(payload);
      if (res.error) {
        toast({ variant: "destructive", description: res.error?.message });
        setLoading(false);
        return;
      }
      entityId = (res.data?.payload as { id: string })?.id ?? null;
    }

    // Link any pending members (for create mode)
    if (!isEdit && entityId) {
      for (const l of linked) {
        await adminLinkAchievementMember(
          entityId,
          l.member.id,
          l.role ?? undefined,
        );
      }
    }

    setLoading(false);
    onOpenChange(false);
  };

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa thành tựu" : "Thêm thành tựu mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Cập nhật thông tin thành tựu." : "Thêm thành tựu mới."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4 py-2"
          id="achievement-form"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-1.5">
            <Label>Tên thành tựu *</Label>
            <Input defaultValue={achievement?.title} name="title" required />
          </div>
          <div className="grid gap-1.5">
            <Label>Tóm tắt</Label>
            <Input defaultValue={achievement?.summary ?? ""} name="summary" />
          </div>
          <div className="grid gap-1.5">
            <Label>Chi tiết</Label>
            <MarkdownEditor
              defaultValue={achievement?.content ?? ""}
              minHeight="160px"
              name="content"
              placeholder="Chi tiết (Markdown)..."
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label>Ngày *</Label>
              <Input
                defaultValue={fmtDate(achievement?.date ?? null)}
                name="date"
                required
                type="date"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Loại</Label>
              <Select defaultValue={achievement?.type ?? "TEAM"} name="type">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDIVIDUAL">Cá nhân</SelectItem>
                  <SelectItem value="TEAM">Nhóm</SelectItem>
                  <SelectItem value="CLUB">Toàn CLB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
                <input
                  defaultChecked={achievement?.isHighlight}
                  name="isHighlight"
                  type="checkbox"
                />
                ⭐ Nổi bật
              </label>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Link ngoài</Label>
            <Input
              defaultValue={achievement?.relatedUrl ?? ""}
              name="relatedUrl"
              type="url"
            />
          </div>

          <Separator />

          {/* Member selector */}
          <MemberSelector
            allMembers={allMembers.map((m) => ({
              ...m,
              firstName: m.firstName,
              lastName: m.lastName,
              avatar: m.avatar ?? null,
              studentId: m.studentId ?? null,
              webRole: m.webRole,
            }))}
            linked={linked}
            onLink={handleLink}
            onUnlink={handleUnlink}
          />
        </form>
        <DialogFooter>
          <Button disabled={loading} form="achievement-form" type="submit">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : isEdit ? (
              "Lưu thay đổi"
            ) : (
              "Thêm thành tựu"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
