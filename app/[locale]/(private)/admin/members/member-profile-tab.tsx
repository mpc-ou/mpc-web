"use client";

import { ImagePlus, Loader2, Upload, UserCircle, X } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/utils/supabase-upload";
import { adminUpdateMember } from "../actions";
import type { MemberRow } from "./columns";

type Props = {
  member: MemberRow;
  onClose: () => void;
};

export function MemberProfileTab({ member, onClose }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [slugValue, setSlugValue] = useState(member.slug ?? "");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(member.avatar ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(
    (member as { coverImage?: string | null }).coverImage ?? null
  );
  const [coverUploading, setCoverUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", description: "Chỉ chấp nhận file ảnh" });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast({ variant: "destructive", description: "Ảnh tối đa 3MB" });
      return;
    }
    setAvatarUploading(true);
    try {
      const url = await uploadToStorage(file, "media", "avatars");
      setAvatarUrl(url);
    } catch {
      toast({ variant: "destructive", description: "Upload avatar thất bại" });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", description: "Chỉ nhận file ảnh" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", description: "Ảnh tối đa 5MB" });
      return;
    }
    setCoverUploading(true);
    try {
      const url = await uploadToStorage(file, "media", "covers");
      setCoverUrl(url);
    } catch {
      toast({ variant: "destructive", description: "Upload cover thất bại" });
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side slug validation
    const slug = slugValue.trim();
    if (!slug) {
      setSlugError("Slug không được để trống");
      return;
    }
    if (slug === "me") {
      setSlugError('Slug không được là "me"');
      return;
    }
    if (!/^[a-z0-9_-]+$/.test(slug)) {
      setSlugError("Slug chỉ được chứa chữ thường, số, dấu gạch ngang và gạch dưới");
      return;
    }
    setSlugError(null);

    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const res = await adminUpdateMember(member.id, {
      firstName: fd.get("firstName") as string,
      lastName: fd.get("lastName") as string,
      phone: (fd.get("phone") as string) || undefined,
      dob: (fd.get("dob") as string) || null,
      studentId: (fd.get("studentId") as string) || undefined,
      bio: (fd.get("bio") as string) || undefined,
      webRole: fd.get("webRole") as "ADMIN" | "COLLABORATOR" | "MEMBER" | "GUEST",
      avatar: avatarUrl ?? undefined,
      coverImage: coverUrl ?? undefined,
      slug
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
    <div className='space-y-4 pt-2'>
      {/* Avatar */}
      <div className='flex items-center gap-4'>
        <Avatar className='h-16 w-16'>
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback className='bg-primary/10 text-primary text-xl'>
            {avatarUploading ? <Loader2 className='h-6 w-6 animate-spin' /> : <UserCircle className='h-8 w-8' />}
          </AvatarFallback>
        </Avatar>
        <div className='flex flex-col gap-1'>
          <Button
            className='h-8 text-xs'
            disabled={avatarUploading}
            onClick={() => fileInputRef.current?.click()}
            size='sm'
            type='button'
            variant='outline'
          >
            <Upload className='mr-1 h-3 w-3' />
            {avatarUploading ? "Đang upload..." : "Đổi avatar"}
          </Button>
          {avatarUrl && (
            <Button
              className='h-7 text-destructive text-xs'
              onClick={() => setAvatarUrl(null)}
              size='sm'
              type='button'
              variant='ghost'
            >
              Xóa ảnh
            </Button>
          )}
          <span className='text-[11px] text-muted-foreground'>JPG, PNG, WebP · max 3MB</span>
        </div>
        <input
          accept='image/*'
          className='hidden'
          onChange={handleAvatarUpload}
          ref={fileInputRef}
          title='Upload avatar'
          type='file'
        />
      </div>

      <Separator />

      <form className='grid gap-4' id='profile-form' onSubmit={handleSubmit}>
        <div className='grid grid-cols-2 gap-3'>
          <div className='grid gap-1.5'>
            <Label htmlFor='firstName'>Họ *</Label>
            <Input defaultValue={member.firstName} id='firstName' name='firstName' required />
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor='lastName'>Tên *</Label>
            <Input defaultValue={member.lastName} id='lastName' name='lastName' required />
          </div>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div className='grid gap-1.5'>
            <Label htmlFor='phone'>Điện thoại</Label>
            <Input defaultValue={member.phone ?? ""} id='phone' name='phone' />
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor='studentId'>Mã sinh viên</Label>
            <Input defaultValue={member.studentId ?? ""} id='studentId' name='studentId' />
          </div>
        </div>
        <div className='grid gap-1.5'>
          <Label htmlFor='slug'>Slug (đường dẫn hồ sơ)</Label>
          <Input
            id='slug'
            name='slug'
            onChange={(e) => {
              setSlugValue(e.target.value.toLowerCase().replace(/\s+/g, "-"));
              setSlugError(null);
            }}
            placeholder='vd: nguyen-van-a'
            value={slugValue}
          />
          {slugError && <p className='text-destructive text-xs'>{slugError}</p>}
        </div>
        <div className='grid gap-1.5'>
          <Label htmlFor='dob'>Ngày sinh</Label>
          <Input
            defaultValue={member.dob ? new Date(member.dob).toISOString().split("T")[0] : ""}
            id='dob'
            name='dob'
            type='date'
          />
        </div>
        <div className='grid gap-1.5'>
          <Label htmlFor='bio'>Giới thiệu bản thân</Label>
          <textarea
            className='min-h-18 rounded-md border border-input bg-background px-3 py-2 text-sm'
            defaultValue={member.bio ?? ""}
            id='bio'
            name='bio'
            placeholder='Viết vài dòng về bản thân...'
          />
        </div>
        <div className='grid gap-1.5'>
          <Label htmlFor='webRole'>Vai trò hệ thống</Label>
          <Select defaultValue={member.webRole ?? "MEMBER"} name='webRole'>
            <SelectTrigger id='webRole'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ADMIN'>Admin</SelectItem>
              <SelectItem value='COLLABORATOR'>Cộng tác viên</SelectItem>
              <SelectItem value='MEMBER'>Thành viên</SelectItem>
              <SelectItem value='GUEST'>Khách</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='flex justify-end'>
          <Button disabled={saving} type='submit'>
            {saving ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang lưu...
              </>
            ) : (
              "Lưu hồ sơ"
            )}
          </Button>
        </div>
      </form>

      {/* Cover photo */}
      <Separator />
      <div className='space-y-2'>
        <Label>Ảnh bìa (Cover Photo)</Label>
        {coverUrl ? (
          <div className='relative overflow-hidden rounded-lg border'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt='Cover' className='max-h-30 w-full object-cover' src={coverUrl} />
            <button
              className='absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80'
              onClick={() => setCoverUrl(null)}
              title='Xóa ảnh bìa'
              type='button'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          </div>
        ) : (
          <button
            className='flex h-20 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-border border-dashed bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground disabled:opacity-50'
            disabled={coverUploading}
            onClick={() => coverInputRef.current?.click()}
            type='button'
          >
            {coverUploading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span className='text-xs'>Đang upload...</span>
              </>
            ) : (
              <>
                <ImagePlus className='h-4 w-4' />
                <span className='text-xs'>Upload ảnh bìa (max 5MB)</span>
              </>
            )}
          </button>
        )}
        <input
          accept='image/*'
          className='hidden'
          onChange={handleCoverUpload}
          ref={coverInputRef}
          title='Upload ảnh bìa'
          type='file'
        />
      </div>
    </div>
  );
}
