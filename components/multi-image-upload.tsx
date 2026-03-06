"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/utils/supabase-upload";

type Props = {
  label?: string;
  initialImages?: string[];
  maxImages?: number;
  storagePath: string; // e.g. "events/gallery"
  onChange: (urls: string[]) => void;
};

export function MultiImageUpload({
  label = "Thư viện ảnh",
  initialImages = [],
  maxImages = 10,
  storagePath,
  onChange
}: Props) {
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAdd = images.length < maxImages;

  const handleFiles = async (files: File[]) => {
    const allowed = files.slice(0, maxImages - images.length);
    if (allowed.length === 0) {
      return;
    }

    setUploading(true);
    const urls: string[] = [];
    for (const file of allowed) {
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          description: `Bỏ qua "${file.name}": chỉ nhận file ảnh`
        });
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast({
          variant: "destructive",
          description: `Bỏ qua "${file.name}": ảnh tối đa 8MB`
        });
        continue;
      }
      try {
        const url = await uploadToStorage(file, "media", storagePath);
        urls.push(url);
      } catch {
        toast({
          variant: "destructive",
          description: `Upload thất bại: ${file.name}`
        });
      }
    }
    setUploading(false);
    const updated = [...images, ...urls];
    setImages(updated);
    onChange(updated);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (idx: number) => {
    const updated = images.filter((_, i) => i !== idx);
    setImages(updated);
    onChange(updated);
  };

  return (
    <div className='space-y-2'>
      <Label>
        {label}{" "}
        <span className='font-normal text-muted-foreground text-xs'>
          ({images.length}/{maxImages})
        </span>
      </Label>

      {/* Gallery grid */}
      {images.length > 0 && (
        <div className='grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5'>
          {images.map((url, idx) => (
            <div
              className='group relative aspect-square overflow-hidden rounded-lg border bg-muted'
              // biome-ignore lint/suspicious/noArrayIndexKey: order-based key is fine for images
              key={idx}
            >
              {/* biome-ignore lint/performance/noImgElement: admin preview */}
              <img
                alt={`Gallery ${idx + 1}`}
                className='h-full w-full object-cover'
                height={200}
                src={url}
                width={200}
              />
              <button
                className='absolute top-1 right-1 hidden rounded-full bg-black/60 p-1 text-white hover:bg-black/80 group-hover:flex'
                onClick={() => removeImage(idx)}
                title='Xóa ảnh'
                type='button'
              >
                <X className='h-3 w-3' />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {canAdd && (
        <button
          className={`flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors disabled:opacity-50 ${
            isDragOver
              ? "border-primary bg-primary/10"
              : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
          disabled={uploading}
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
            handleFiles(Array.from(e.dataTransfer.files));
          }}
          type='button'
        >
          {uploading ? (
            <>
              <Loader2 className='h-5 w-5 animate-spin' />
              <span className='text-xs'>Đang upload...</span>
            </>
          ) : (
            <>
              <ImagePlus className='h-5 w-5' />
              <span className='text-xs'>Thêm ảnh (max {maxImages} ảnh, mỗi ảnh ≤8MB)</span>
            </>
          )}
        </button>
      )}

      <input
        accept='image/*'
        className='hidden'
        multiple
        onChange={(e) => handleFiles(Array.from(e.target.files ?? []))}
        ref={fileInputRef}
        type='file'
      />
    </div>
  );
}
