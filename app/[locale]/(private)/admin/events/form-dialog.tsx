"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MarkdownEditor } from "@/components/markdown-editor";
import { MultiImageUpload } from "@/components/multi-image-upload";
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
import { uploadToStorage } from "@/utils/supabase-upload";
import { adminCreateEvent, adminUpdateEvent } from "../actions";
import type { EventRow } from "./columns";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: EventRow | null;
};

export function EventFormDialog({ open, onOpenChange, event }: Props) {
  const isEdit = !!event;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bannerUrl, setBannerUrl] = useState<string | null>(event?.thumbnail ?? null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagesUrls, setImagesUrls] = useState<string[]>(event?.images ?? []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBannerUrl(event?.thumbnail ?? null);
    setImagesUrls(event?.images ?? []);
  }, [event?.thumbnail, event?.images]);

  const processBannerFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", description: "Chỉ nhận file ảnh" });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast({ variant: "destructive", description: "Ảnh tối đa 8MB" });
      return;
    }
    setBannerUploading(true);
    try {
      const url = await uploadToStorage(file, "media", "events/banners");
      setBannerUrl(url);
    } catch (err) {
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : "Upload thất bại"
      });
    } finally {
      setBannerUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processBannerFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || undefined,
      location: (fd.get("location") as string) || undefined,
      status: fd.get("status") as string,
      type: fd.get("type") as string,
      startAt: fd.get("startAt") as string,
      endAt: (fd.get("endAt") as string) || null,
      thumbnail: bannerUrl || null,
      images: imagesUrls
    };

    if (isEdit && event) {
      const res = await adminUpdateEvent(event.id, payload);
      if (res.error) {
        toast({ variant: "destructive", description: res.error?.message });
        setLoading(false);
        return;
      }
    } else {
      const res = await adminCreateEvent({
        ...payload,
        endAt: payload.endAt ?? undefined
      });
      if (res.error) {
        toast({ variant: "destructive", description: res.error?.message });
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onOpenChange(false);
  };

  const fmtDate = (d: string | null) => (d ? new Date(d).toISOString().split("T")[0] : "");

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className='max-h-[90vh] max-w-6xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Cập nhật thông tin sự kiện." : "Điền thông tin để tạo sự kiện mới."}
          </DialogDescription>
        </DialogHeader>
        <form className='grid gap-4 py-2' id='event-form' onSubmit={handleSubmit}>
          {/* Banner upload */}
          <div className='grid gap-2'>
            <Label>Banner / Ảnh bìa</Label>
            {bannerUrl ? (
              <div className='relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-border bg-muted'>
                {/* biome-ignore lint/performance/noImgElement: admin preview, no optimization needed */}
                <img alt='Banner' className='h-full w-full object-cover' height={720} src={bannerUrl} width={1280} />
                <button
                  className='absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80'
                  onClick={() => setBannerUrl(null)}
                  title='Xóa banner'
                  type='button'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            ) : (
              <button
                className={`flex h-30 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors disabled:opacity-50 ${isDragOver ? "border-primary bg-primary/10" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
                disabled={bannerUploading}
                onClick={() => fileInputRef.current?.click()}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files?.[0]) {
                    processBannerFile(e.dataTransfer.files[0]);
                  }
                }}
                type='button'
              >
                {bannerUploading ? (
                  <>
                    <Loader2 className='h-5 w-5 animate-spin' />
                    <span className='text-xs'>Đang upload...</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className='h-6 w-6' />
                    <span className='text-xs'>Click để upload banner (max 8MB)</span>
                  </>
                )}
              </button>
            )}
            <input
              accept='image/*'
              className='hidden'
              onChange={handleBannerUpload}
              ref={fileInputRef}
              title='Upload banner'
              type='file'
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='title'>Tên sự kiện *</Label>
            <Input defaultValue={event?.title} id='title' name='title' required />
          </div>

          {/* Description — MarkdownEditor (GFM) */}
          <div className='grid gap-2'>
            <Label>Mô tả chi tiết</Label>
            <MarkdownEditor
              defaultValue={event?.description ?? ""}
              minHeight='180px'
              name='description'
              placeholder='Mô tả sự kiện (hỗ trợ Markdown GFM: **bold**, _italic_, bảng, danh sách...)...'
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='location'>Địa điểm</Label>
            <Input
              defaultValue={event?.location ?? ""}
              id='location'
              name='location'
              placeholder='VD: Hội trường A, TP.HCM...'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='startAt'>Bắt đầu *</Label>
              <Input defaultValue={fmtDate(event?.startAt ?? null)} id='startAt' name='startAt' required type='date' />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='endAt'>Kết thúc</Label>
              <Input defaultValue={fmtDate(event?.endAt ?? null)} id='endAt' name='endAt' type='date' />
            </div>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='status'>Trạng thái</Label>
            <Select defaultValue={event?.status ?? "UPCOMING"} name='status'>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='UPCOMING'>Sắp diễn ra</SelectItem>
                <SelectItem value='ONGOING'>Đang diễn ra</SelectItem>
                <SelectItem value='COMPLETED'>Hoàn thành</SelectItem>
                <SelectItem value='CANCELLED'>Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='type'>Loại sự kiện</Label>
            <Select defaultValue={event?.type ?? "OTHER"} name='type'>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ACADEMIC'>Cuộc thi học thuật</SelectItem>
                <SelectItem value='MEMBER_ACTIVITY'>Hoạt động thành viên</SelectItem>
                <SelectItem value='VOLUNTEER'>Hoạt động tình nguyện</SelectItem>
                <SelectItem value='SEMINAR'>Hội thảo / Seminar</SelectItem>
                <SelectItem value='OTHER'>Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Multi-image gallery */}
          <MultiImageUpload
            initialImages={imagesUrls}
            label='Ảnh sự kiện bổ sung'
            maxImages={10}
            onChange={setImagesUrls}
            storagePath='events/gallery'
          />
        </form>
        <DialogFooter>
          <Button disabled={loading} form='event-form' type='submit'>
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang lưu...
              </>
            ) : isEdit ? (
              "Lưu thay đổi"
            ) : (
              "Tạo sự kiện"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
