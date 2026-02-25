"use client";

import { Loader2 } from "lucide-react";
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
import { adminCreateDepartment, adminUpdateDepartment } from "../actions";
import type { DeptRow } from "./columns";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dept?: DeptRow | null;
};

export function DeptFormDialog({ open, onOpenChange, dept }: Props) {
  const isEdit = !!dept;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(dept?.isActive ?? true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      nameVi: fd.get("nameVi") as string,
      nameEn: (fd.get("nameEn") as string) || undefined,
      slug: fd.get("slug") as string,
      descriptionVi: (fd.get("descriptionVi") as string) || undefined,
      descriptionEn: (fd.get("descriptionEn") as string) || undefined,
      icon: (fd.get("icon") as string) || undefined,
      order: Number(fd.get("order")) || 0,
      isActive,
    };

    const res =
      isEdit && dept
        ? await adminUpdateDepartment(dept.id, payload)
        : await adminCreateDepartment(payload);

    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
      setLoading(false);
      return;
    }
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog key={dept?.id ?? "new"} onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-140">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa ban" : "Thêm ban mới"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Cập nhật thông tin ban."
              : "Tạo một ban mới trong câu lạc bộ."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4 py-4"
          id="dept-form"
          onSubmit={handleSubmit}
        >
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nameVi">Tên ban (Tiếng Việt) *</Label>
              <Input
                defaultValue={dept?.nameVi}
                id="nameVi"
                name="nameVi"
                placeholder="Ban Lập trình"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nameEn">Tên ban (Tiếng Anh)</Label>
              <Input
                defaultValue={dept?.nameEn ?? ""}
                id="nameEn"
                name="nameEn"
                placeholder="Programming Dept"
              />
            </div>
          </div>

          {/* Slug + Icon + Order */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 grid gap-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                defaultValue={dept?.slug}
                id="slug"
                name="slug"
                placeholder="programming"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order">Thứ tự</Label>
              <Input
                defaultValue={dept?.order ?? 0}
                id="order"
                name="order"
                placeholder="0"
                type="number"
              />
            </div>
          </div>

          {/* Icon */}
          <div className="grid gap-2">
            <Label htmlFor="icon">Icon (Lucide icon name)</Label>
            <Input
              defaultValue={dept?.icon ?? ""}
              id="icon"
              name="icon"
              placeholder="Code, Camera, PenTool..."
            />
          </div>

          {/* Description Vi/En */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="descriptionVi">Mô tả (Tiếng Việt)</Label>
              <Input
                defaultValue={dept?.descriptionVi ?? ""}
                id="descriptionVi"
                name="descriptionVi"
                placeholder="Ban phụ trách..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descriptionEn">Mô tả (Tiếng Anh)</Label>
              <Input
                id="descriptionEn"
                name="descriptionEn"
                placeholder="The department handles..."
              />
            </div>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isActive}
              id="isActive"
              onCheckedChange={(v) => setIsActive(!!v)}
            />
            <Label className="cursor-pointer font-normal" htmlFor="isActive">
              Đang hoạt động
            </Label>
          </div>
        </form>
        <DialogFooter>
          <Button disabled={loading} form="dept-form" type="submit">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : isEdit ? (
              "Lưu thay đổi"
            ) : (
              "Thêm ban"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
