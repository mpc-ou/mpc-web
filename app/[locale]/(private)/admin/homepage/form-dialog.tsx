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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminUpsertHomepageSection } from "../actions";
import type { SectionRow } from "./columns";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section?: SectionRow | null;
};

export function SectionFormDialog({ open, onOpenChange, section }: Props) {
  const isEdit = !!section;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(section?.type ?? "text");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await adminUpsertHomepageSection({
      key: fd.get("key") as string,
      value: fd.get("value") as string,
      type,
      order: Number(fd.get("order")) || 0
    });
    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
      setLoading(false);
      return;
    }
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog key={section?.id ?? "new"} onOpenChange={onOpenChange} open={open}>
      <DialogContent className='sm:max-w-130'>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Chỉnh sửa: ${section.key}` : "Thêm / Cập nhật section"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Cập nhật giá trị cho section trang chủ." : "Nhập key để tạo mới hoặc cập nhật section đã có."}
          </DialogDescription>
        </DialogHeader>
        <form className='grid gap-4 py-4' id='section-form' onSubmit={handleSubmit}>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='key'>Key *</Label>
              <Input
                defaultValue={section?.key}
                id='key'
                name='key'
                placeholder='hero_title'
                readOnly={isEdit}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label>Loại</Label>
              <Select onValueChange={setType} value={type}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='text'>Text</SelectItem>
                  <SelectItem value='image'>Image URL</SelectItem>
                  <SelectItem value='json'>JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='value'>Giá trị *</Label>
            <textarea
              className='min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              defaultValue={section?.value}
              id='value'
              name='value'
              placeholder={type === "json" ? '{"key": "value"}' : type === "image" ? "https://..." : "Nội dung..."}
              required
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='order'>Thứ tự</Label>
            <Input defaultValue={section?.order ?? 0} id='order' name='order' type='number' />
          </div>
        </form>
        <DialogFooter>
          <Button disabled={loading} form='section-form' type='submit'>
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
