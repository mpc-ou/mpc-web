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
import { adminCreateSponsor, adminUpdateSponsor } from "../actions";
import type { SponsorRow } from "./columns";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sponsor?: SponsorRow | null;
};

export function SponsorFormDialog({ open, onOpenChange, sponsor }: Props) {
  const isEdit = !!sponsor;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      website: (fd.get("website") as string) || undefined,
      email: (fd.get("email") as string) || undefined,
      phone: (fd.get("phone") as string) || undefined,
      description: (fd.get("description") as string) || undefined,
      logo: (fd.get("logo") as string) || undefined
    };

    const res = isEdit && sponsor ? await adminUpdateSponsor(sponsor.id, payload) : await adminCreateSponsor(payload);
    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
      setLoading(false);
      return;
    }
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa nhà tài trợ" : "Thêm nhà tài trợ"}</DialogTitle>
          <DialogDescription>{isEdit ? "Cập nhật thông tin." : "Thêm nhà tài trợ mới."}</DialogDescription>
        </DialogHeader>
        <form className='grid gap-4 py-4' id='sponsor-form' onSubmit={handleSubmit}>
          <div className='grid gap-2'>
            <Label>Tên *</Label>
            <Input defaultValue={sponsor?.name} name='name' required />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label>Website</Label>
              <Input defaultValue={sponsor?.website ?? ""} name='website' type='url' />
            </div>
            <div className='grid gap-2'>
              <Label>Email</Label>
              <Input defaultValue={sponsor?.email ?? ""} name='email' type='email' />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label>Điện thoại</Label>
              <Input defaultValue={sponsor?.phone ?? ""} name='phone' />
            </div>
            <div className='grid gap-2'>
              <Label>Logo URL</Label>
              <Input defaultValue={sponsor?.logo ?? ""} name='logo' />
            </div>
          </div>
          <div className='grid gap-2'>
            <Label>Mô tả</Label>
            <textarea
              className='min-h-15 rounded-md border border-input bg-background px-3 py-2 text-sm'
              defaultValue={sponsor?.description ?? ""}
              name='description'
              title='Mô tả nhà tài trợ'
            />
          </div>
        </form>
        <DialogFooter>
          <Button disabled={loading} form='sponsor-form' type='submit'>
            {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
