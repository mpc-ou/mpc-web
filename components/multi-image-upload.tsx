"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { adminRegisterTempImage } from "@/app/_actions/admin";
import { Label } from "@/components/ui/label";
import { STORAGE_BUCKET } from "@/constants/storage";
import { UPLOAD_MAX_BANNER_SIZE } from "@/constants/upload";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/services/supabase-upload";

export type ImageItem = {
  url: string;
  title?: string;
  caption?: string;
};

type Props = {
  label?: string;
  initialImages?: (string | ImageItem)[];
  maxImages?: number;
  storagePath: string;
  onChange: (images: ImageItem[]) => void;
};

export function MultiImageUpload({
  label = "Thư viện ảnh",
  initialImages = [],
  maxImages = 10,
  storagePath,
  onChange
}: Props) {
  const { toast } = useToast();

  const normalizedInitial = initialImages.map((img) => {
    if (typeof img === "string") {
      return { url: img, title: "", caption: "" };
    }
    return {
      url: img.url,
      title: img.title ?? "",
      caption: img.caption ?? ""
    };
  });

  const [images, setImages] = useState<ImageItem[]>(normalizedInitial);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const norm = initialImages.map((img) => {
      if (typeof img === "string") {
        return { url: img, title: "", caption: "" };
      }
      return {
        url: img.url,
        title: img.title ?? "",
        caption: img.caption ?? ""
      };
    });
    if (JSON.stringify(norm) !== JSON.stringify(images)) {
      setImages(norm);
    }
  }, [initialImages, images]);

  const canAdd = images.length < maxImages;

  const handleFiles = async (files: File[]) => {
    const allowed = files.slice(0, maxImages - images.length);
    if (allowed.length === 0) {
      return;
    }

    setUploading(true);
    const newItems: ImageItem[] = [];
    for (const file of allowed) {
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          description: `Bỏ qua "${file.name}": chỉ nhận file ảnh`
        });
        continue;
      }
      if (file.size > UPLOAD_MAX_BANNER_SIZE) {
        toast({
          variant: "destructive",
          description: `Bỏ qua "${file.name}": ảnh tối đa 8MB`
        });
        continue;
      }
      try {
        const url = await uploadToStorage(file, STORAGE_BUCKET, storagePath);
        await adminRegisterTempImage(url);
        newItems.push({ url, title: "", caption: "" });
      } catch (err) {
        toast({
          variant: "destructive",
          description: `Upload thất bại "${file.name}": ${err instanceof Error ? err.message : "lỗi không xác định"}`
        });
      }
    }
    setUploading(false);
    const updated = [...images, ...newItems];
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

  const updateImageField = (idx: number, field: "title" | "caption", value: string) => {
    const updated = images.map((img, i) => {
      if (i === idx) {
        return { ...img, [field]: value };
      }
      return img;
    });
    setImages(updated);
    onChange(updated);
  };

  return (
    <div className='space-y-3'>
      <Label>
        {label}{" "}
        <span className='font-normal text-muted-foreground text-xs'>
          ({images.length}/{maxImages})
        </span>
      </Label>

      {/* Gallery grid */}
      {images.length > 0 && (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
          {images.map((img, idx) => (
            <div
              className='group relative flex flex-col space-y-2 rounded-lg border bg-muted/40 p-2'
              key={img.url || idx}
            >
              {/* Image preview */}
              <div className='relative aspect-video w-full overflow-hidden rounded-md border bg-muted'>
                <Image
                  alt={`Gallery ${idx + 1}`}
                  className='object-cover'
                  fill
                  sizes='(min-width: 768px) 33vw, 100vw'
                  src={img.url}
                />
                <button
                  className='absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80'
                  onClick={() => removeImage(idx)}
                  title='Xóa ảnh'
                  type='button'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              </div>

              <div className='space-y-1.5'>
                <input
                  className='w-full rounded border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary'
                  onChange={(e) => updateImageField(idx, "title", e.target.value)}
                  placeholder='Tiêu đề ảnh...'
                  value={img.title || ""}
                />
                <input
                  className='w-full rounded border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary'
                  onChange={(e) => updateImageField(idx, "caption", e.target.value)}
                  placeholder='Ghi chú/Mô tả ảnh...'
                  value={img.caption || ""}
                />
              </div>
            </div>
          ))}
        </div>
      )}

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
