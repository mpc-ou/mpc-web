"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useToast } from "@/hooks/use-toast";
import { adminCreateAnnouncement, adminUpdateAnnouncement } from "../actions";
import type { AnnouncementRow } from "./columns";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: AnnouncementRow | null;
};

export function AnnouncementFormDialog({
  open,
  onOpenChange,
  announcement,
}: Props) {
  const isEdit = !!announcement;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(announcement?.isActive ?? true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      content: fd.get("content") as string,
      linkUrl: (fd.get("linkUrl") as string) || undefined,
      linkLabel: (fd.get("linkLabel") as string) || undefined,
      bgColor: (fd.get("bgColor") as string) || undefined,
      isActive,
      endAt: (fd.get("endAt") as string) || undefined,
    };
    const res =
      isEdit && announcement
        ? await adminUpdateAnnouncement(announcement.id, payload)
        : await adminCreateAnnouncement(payload);
    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
      setLoading(false);
      return;
    }
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog
      key={announcement?.id ?? "new"}
      onOpenChange={onOpenChange}
      open={open}
    >
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa thông báo" : "Thêm thông báo"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Cập nhật nội dung thông báo."
              : "Thêm thông báo mới cho Announcement Bar."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4 py-4"
          id="announcement-form"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-2">
            <Label htmlFor="content">Nội dung *</Label>
            <textarea
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={announcement?.content}
              id="content"
              name="content"
              placeholder="Nội dung thông báo..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="linkUrl">URL nút CTA</Label>
              <Input
                defaultValue={announcement?.linkUrl ?? ""}
                id="linkUrl"
                name="linkUrl"
                placeholder="/auth"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="linkLabel">Text nút CTA</Label>
              <Input
                defaultValue={announcement?.linkLabel ?? ""}
                id="linkLabel"
                name="linkLabel"
                placeholder="Đăng ký ngay"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="bgColor">Màu nền (CSS gradient)</Label>
              <Input
                defaultValue={announcement?.bgColor ?? ""}
                id="bgColor"
                name="bgColor"
                placeholder="linear-gradient(...)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endAt">Ngày hết hạn</Label>
              <Input
                defaultValue={
                  announcement?.endAt ? announcement.endAt.split("T")[0] : ""
                }
                id="endAt"
                name="endAt"
                type="date"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isActive}
              id="isActive"
              onCheckedChange={(v) => setIsActive(!!v)}
            />
            <Label className="cursor-pointer" htmlFor="isActive">
              Kích hoạt ngay
            </Label>
          </div>
        </form>
        <DialogFooter>
          <Button disabled={loading} form="announcement-form" type="submit">
            {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
