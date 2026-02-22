"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminAddMember } from "../actions";

type Props = {
  onClose: () => void;
};

export function MemberCreateForm({ onClose }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const res = await adminAddMember({
      email: fd.get("email") as string,
      firstName: fd.get("firstName") as string,
      lastName: fd.get("lastName") as string,
      webRole: fd.get("webRole") as "MEMBER" | "COLLABORATOR"
    });
    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
      setSaving(false);
      return;
    }
    setSaving(false);
    onClose();
  };

  return (
    <form className='grid gap-4 py-2' onSubmit={handleSubmit}>
      <div className='grid gap-1.5'>
        <Label>Email Google *</Label>
        <Input name='email' placeholder='email@gmail.com' required type='email' />
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <div className='grid gap-1.5'>
          <Label>Họ *</Label>
          <Input name='firstName' required />
        </div>
        <div className='grid gap-1.5'>
          <Label>Tên *</Label>
          <Input name='lastName' required />
        </div>
      </div>
      <div className='grid gap-1.5'>
        <Label>Vai trò</Label>
        <Select defaultValue='MEMBER' name='webRole'>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='COLLABORATOR'>Cộng tác viên</SelectItem>
            <SelectItem value='MEMBER'>Thành viên</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='flex justify-end'>
        <Button disabled={saving} type='submit'>
          {saving ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Đang tạo...
            </>
          ) : (
            "Thêm thành viên"
          )}
        </Button>
      </div>
    </form>
  );
}
