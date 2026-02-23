"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { adminCreateDepartment } from "../actions";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      slug: fd.get("slug") as string,
      description: (fd.get("description") as string) || undefined,
      order: Number(fd.get("order")) || 0
    };
    const res = await adminCreateDepartment(payload);
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
      <DialogContent className='sm:max-w-120'>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa ban" : "Thêm ban mới"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Cập nhật thông tin ban." : "Tạo một ban mới trong câu lạc bộ."}
          </DialogDescription>
        </DialogHeader>
        <form className='grid gap-4 py-4' id='dept-form' onSubmit={handleSubmit}>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Tên ban *</Label>
              <Input defaultValue={dept?.name} id='name' name='name' placeholder='Ban Lập trình' required />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='slug'>Slug *</Label>
              <Input defaultValue={dept?.slug} id='slug' name='slug' placeholder='programming' required />
            </div>
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='description'>Mô tả</Label>
            <Input
              defaultValue={dept?.description ?? ""}
              id='description'
              name='description'
              placeholder='Mô tả về ban (tùy chọn)'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='order'>Thứ tự</Label>
            <Input defaultValue={dept?.order ?? 0} id='order' name='order' placeholder='0' type='number' />
          </div>
        </form>
        <DialogFooter>
          <Button disabled={loading} form='dept-form' type='submit'>
            {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
