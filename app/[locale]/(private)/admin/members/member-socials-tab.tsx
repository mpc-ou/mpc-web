"use client";

import { Globe, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminUpdateMember } from "../actions";
import type { MemberRow } from "./columns";
import { PLATFORMS, type SocialEntry } from "./types";

type Props = {
  member: MemberRow;
  onClose: () => void;
};

function parseSocials(member: MemberRow): SocialEntry[] {
  try {
    const raw = (member as { socials?: unknown }).socials;
    const parsed = raw ? JSON.parse(JSON.stringify(raw)) : [];
    return Array.isArray(parsed)
      ? parsed.map((s: SocialEntry) => ({
          ...s,
          id: s.id ?? Math.random().toString(36).substring(2)
        }))
      : [];
  } catch {
    return [];
  }
}

export function MemberSocialsTab({ member, onClose }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [socials, setSocials] = useState<SocialEntry[]>(() => parseSocials(member));

  const handleAdd = () => {
    setSocials((prev) => [...prev, { id: Math.random().toString(36).substring(2), platform: "", url: "" }]);
  };

  const handleRemove = (id: string) => {
    setSocials((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdate = (id: string, field: "platform" | "url", value: string) => {
    setSocials((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = socials.map(({ id: _id, ...rest }) => rest);
    const res = await adminUpdateMember(member.id, {
      socials: JSON.stringify(payload)
    });
    setSaving(false);
    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
    } else {
      onClose();
    }
  };

  return (
    <div className='space-y-4 pt-2'>
      <p className='text-muted-foreground text-sm'>Các liên kết mạng xã hội và trang cá nhân. Để trống nếu không có.</p>

      {socials.map((social) => (
        <div className='flex items-center gap-2' key={social.id}>
          <div className='w-40 shrink-0 sm:w-50'>
            <Select
              onValueChange={(val) => handleUpdate(social.id!, "platform", val)}
              value={social.platform || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder='Nền tảng' />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    <span className='flex items-center gap-2'>
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex flex-1 items-center gap-2'>
            <Input
              onChange={(e) => handleUpdate(social.id!, "url", e.target.value)}
              placeholder='Link / Username'
              value={social.url}
            />
            <Button
              className='h-9 w-9 shrink-0 text-destructive'
              onClick={() => handleRemove(social.id!)}
              size='icon'
              type='button'
              variant='ghost'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      ))}

      <Button className='w-full border-dashed' onClick={handleAdd} size='sm' type='button' variant='outline'>
        <Plus className='mr-2 h-4 w-4' />
        Thêm liên kết mới
      </Button>

      <Button className='mt-4 w-full' disabled={saving} onClick={handleSave} type='button'>
        {saving ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Đang lưu...
          </>
        ) : (
          <>
            <Globe className='mr-2 h-4 w-4' />
            Lưu liên kết
          </>
        )}
      </Button>
    </div>
  );
}
