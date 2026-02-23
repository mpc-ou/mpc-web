"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { uploadToStorage } from "@/utils/supabase-upload";
import { adminCreateGalleryImage, adminDeleteGalleryImage } from "../actions";

type GalleryImage = {
  id: string;
  url: string;
  caption: string | null;
  order: number;
  isActive: boolean;
};

export function GalleryManager({ images }: { images: GalleryImage[] }) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setUploadError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setUploadError("Vui lòng chọn ảnh");
      return;
    }

    const formEl = e.currentTarget;
    setUploading(true);
    try {
      const url = await uploadToStorage(file, "gallery");
      const fd = new FormData(formEl);
      const res = await adminCreateGalleryImage({
        url,
        caption: (fd.get("caption") as string) || undefined,
        order: Number(fd.get("order")) || 0,
      });
      if (res.error) {
        setUploadError(
          typeof res.error === "string" ? res.error : "Upload thất bại",
        );
        return;
      }
      setDialogOpen(false);
      setPreview(null);
      router.refresh();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xóa ảnh?",
      description: "Hành động này không thể hoàn tác.",
    });
    if (!ok) {
      return;
    }
    await handleErrorClient({
      cb: () => adminDeleteGalleryImage(id),
      onSuccess: () => router.refresh(),
    });
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setPreview(null);
      setUploadError(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ConfirmDialog />

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{images.length} ảnh</p>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Thêm ảnh
        </Button>
      </div>

      {/* Upload dialog */}
      <Dialog onOpenChange={handleOpenChange} open={dialogOpen}>
        <DialogContent className="sm:max-w-120">
          <DialogHeader>
            <DialogTitle>Upload ảnh mới</DialogTitle>
            <DialogDescription>
              Chọn ảnh từ máy tính để thêm vào gallery.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4 py-4"
            id="gallery-form"
            onSubmit={handleUpload}
          >
            {/* Drop zone */}
            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-border border-dashed p-6 transition-colors hover:border-primary/50 hover:bg-muted/30"
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fileRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
            >
              {preview ? (
                <img
                  alt="Preview"
                  className="max-h-48 rounded-lg object-contain"
                  src={preview}
                />
              ) : (
                <>
                  <span className="text-4xl">📷</span>
                  <p className="text-muted-foreground text-sm">
                    Click để chọn ảnh
                  </p>
                  <p className="text-muted-foreground/60 text-xs">
                    PNG, JPG, WEBP — tối đa 5MB
                  </p>
                </>
              )}
            </div>
            <input
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              ref={fileRef}
              title="Chọn ảnh để upload"
              type="file"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="caption">Caption</Label>
                <Input
                  id="caption"
                  name="caption"
                  placeholder="Mô tả ảnh (tùy chọn)"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order">Thứ tự</Label>
                <Input defaultValue="0" id="order" name="order" type="number" />
              </div>
            </div>
            {uploadError && (
              <p className="text-destructive text-sm">{uploadError}</p>
            )}
          </form>
          <DialogFooter>
            <Button
              disabled={uploading || !preview}
              form="gallery-form"
              type="submit"
            >
              {uploading ? "Đang upload..." : "Upload ảnh"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <div
            className="group overflow-hidden rounded-xl border border-border bg-background"
            key={img.id}
          >
            <div className="aspect-video bg-muted">
              <img
                alt={img.caption ?? "Gallery"}
                className="h-full w-full object-cover"
                src={img.url}
              />
            </div>
            <div className="flex items-center justify-between p-3">
              <span className="truncate text-muted-foreground text-xs">
                {img.caption ?? `#${img.order}`}
              </span>
              <Button
                className="h-7 text-xs"
                onClick={() => handleDelete(img.id)}
                size="sm"
                variant="destructive"
              >
                Xóa
              </Button>
            </div>
          </div>
        ))}
        {images.length === 0 && (
          <p className="col-span-full py-8 text-center text-muted-foreground">
            Chưa có ảnh nào
          </p>
        )}
      </div>
    </div>
  );
}
