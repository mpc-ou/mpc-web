"use client";

import { ImagePlus, Loader2, Music, X } from "lucide-react";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/utils/supabase-upload";

export type PhaseInfoData = {
  year: number;
  name: string;
  description: string | null;
  coverImage: string | null;
  coverImage2: string | null;
  coverImage3: string | null;
  endImage: string | null;
  musicUrl: string | null;
};

type Props = {
  data: PhaseInfoData;
  onChange: (data: PhaseInfoData) => void;
  mode: "create" | "edit";
};

function CoverUpload({
  label,
  value,
  onUpload,
  onRemove,
  folder
}: {
  label: string;
  value: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
  folder: string;
}) {
  const { toast } = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handle = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", description: "Chỉ chấp nhận file ảnh" });
      return;
    }
    setUploading(true);
    try {
      const url = await uploadToStorage(file, "media", folder);
      onUpload(url);
    } catch {
      toast({ variant: "destructive", description: "Upload thất bại" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='space-y-1.5'>
      <Label>{label}</Label>
      {value ? (
        <div className='relative aspect-video w-full overflow-hidden rounded-lg border bg-muted'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={label} className='h-full w-full object-cover' src={value} />
          <button
            className='absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80'
            onClick={onRemove}
            type='button'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      ) : (
        <button
          className='flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-border border-dashed bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-50'
          disabled={uploading}
          onClick={() => ref.current?.click()}
          type='button'
        >
          {uploading ? <Loader2 className='h-5 w-5 animate-spin' /> : <ImagePlus className='h-5 w-5' />}
          <span className='text-xs'>{uploading ? "Đang upload..." : "Upload ảnh"}</span>
        </button>
      )}
      <input
        accept='image/*'
        className='hidden'
        onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])}
        ref={ref}
        type='file'
      />
    </div>
  );
}

export function PhaseInfo({ data, onChange, mode }: Props) {
  const { toast } = useToast();
  const musicRef = useRef<HTMLInputElement>(null);
  const [musicUploading, setMusicUploading] = useState(false);

  const set = (key: keyof PhaseInfoData, value: any) => onChange({ ...data, [key]: value });

  const handleMusicUpload = async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast({
        variant: "destructive",
        description: "Chỉ chấp nhận file audio"
      });
      return;
    }
    setMusicUploading(true);
    try {
      const url = await uploadToStorage(file, "media", "recaps/music");
      set("musicUrl", url);
    } catch {
      toast({ variant: "destructive", description: "Upload nhạc thất bại" });
    } finally {
      setMusicUploading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='font-semibold text-xl'>Thông tin cơ bản</h2>
        <p className='text-muted-foreground text-sm'>Nhập thông tin và ảnh bìa cho recap</p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='grid gap-1.5'>
          <Label>Năm *</Label>
          <Input
            disabled={mode === "edit"}
            max={2100}
            min={2000}
            onChange={(e) => set("year", Number(e.target.value))}
            type='number'
            value={data.year}
          />
        </div>
        <div className='grid gap-1.5'>
          <Label>Tên Recap *</Label>
          <Input onChange={(e) => set("name", e.target.value)} placeholder='VD: MPC Recap 2024' value={data.name} />
        </div>
      </div>

      <div className='grid gap-1.5'>
        <Label>Mô tả</Label>
        <Textarea
          onChange={(e) => set("description", e.target.value)}
          placeholder='Mô tả ngắn về recap...'
          rows={3}
          value={data.description ?? ""}
        />
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <CoverUpload
          folder='recaps/covers'
          label='Ảnh bìa chào (Slide 1)'
          onRemove={() => set("coverImage", null)}
          onUpload={(url) => set("coverImage", url)}
          value={data.coverImage}
        />
        <CoverUpload
          folder='recaps/covers'
          label='Ảnh bìa thông số (Slide 2)'
          onRemove={() => set("coverImage2", null)}
          onUpload={(url) => set("coverImage2", url)}
          value={data.coverImage2}
        />
        <CoverUpload
          folder='recaps/covers'
          label='Ảnh bìa "Bể cá" thành viên mới (Slide 3)'
          onRemove={() => set("coverImage3", null)}
          onUpload={(url) => set("coverImage3", url)}
          value={data.coverImage3}
        />
        <CoverUpload
          folder='recaps/covers'
          label='Ảnh bìa kết thúc (Slide cuối)'
          onRemove={() => set("endImage", null)}
          onUpload={(url) => set("endImage", url)}
          value={data.endImage}
        />
      </div>

      {/* Music upload */}
      <div className='space-y-1.5'>
        <Label>Nhạc nền (tùy chọn)</Label>
        {data.musicUrl ? (
          <div className='flex items-center gap-3 rounded-lg border p-3'>
            <Music className='h-5 w-5 shrink-0 text-primary' />
            <span className='flex-1 truncate text-sm'>{data.musicUrl.split("/").pop()}</span>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio className='h-8' controls src={data.musicUrl} />
            <button
              className='rounded-full p-1 text-muted-foreground hover:text-destructive'
              onClick={() => set("musicUrl", null)}
              type='button'
            >
              <X className='h-4 w-4' />
            </button>
          </div>
        ) : (
          <button
            className='flex h-16 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-border border-dashed bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 disabled:opacity-50'
            disabled={musicUploading}
            onClick={() => musicRef.current?.click()}
            type='button'
          >
            {musicUploading ? <Loader2 className='h-5 w-5 animate-spin' /> : <Music className='h-5 w-5' />}
            <span className='text-sm'>{musicUploading ? "Đang upload..." : "Upload nhạc nền"}</span>
          </button>
        )}
        <input
          accept='audio/*'
          className='hidden'
          onChange={(e) => e.target.files?.[0] && handleMusicUpload(e.target.files[0])}
          ref={musicRef}
          type='file'
        />
      </div>
    </div>
  );
}
