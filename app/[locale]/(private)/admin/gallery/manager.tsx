"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { uploadToStorage } from "@/utils/supabase-upload";
import {
  adminCreateGalleryImage,
  adminDeleteGalleryImage,
  adminUpdateGalleryOrders,
} from "../actions";
import Image from "next/image";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type GalleryImage = {
  id: string;
  url: string;
  caption: string | null;
  order: number;
  isActive: boolean;
};

function SortableImage({
  img,
  onDelete,
}: {
  img: GalleryImage;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: img.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative overflow-hidden rounded-xl border border-border bg-background cursor-grab active:cursor-grabbing"
    >
      <div className="aspect-video bg-muted" {...attributes} {...listeners}>
        <img
          alt={img.caption ?? "Gallery"}
          className="h-full w-full object-cover pointer-events-none"
          src={img.url}
        />
      </div>
      <div className="flex items-center justify-between p-3">
        <span className="truncate text-muted-foreground text-xs">
          {img.caption ?? `#${img.order}`}
        </span>
        <Button
          className="h-7 text-xs"
          onClick={() => onDelete(img.id)}
          size="sm"
          variant="destructive"
        >
          Xóa
        </Button>
      </div>
    </div>
  );
}

export function GalleryManager({
  images: initialImages,
}: {
  images: GalleryImage[];
}) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPending, startTransition] = useTransition();

  const [images, setImages] = useState(initialImages);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<{ url: string; file: File }[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const processFiles = (filesList: FileList | File[]) => {
    const files = Array.from(filesList);
    if (!files.length) return;

    if (files.length > 20) {
      setUploadError("Tối đa 20 ảnh một lần");
      return;
    }

    let totalSize = 0;
    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) {
        setUploadError(`Ảnh ${f.name} vượt quá 5MB`);
        return;
      }
      totalSize += f.size;
    }

    if (totalSize > 100 * 1024 * 1024) {
      setUploadError("Tổng dung lượng tải lên không vượt quá 100MB");
      return;
    }

    const newPreviews = files.map((f) => ({
      url: URL.createObjectURL(f),
      file: f,
    }));
    setPreviews(newPreviews);
    setUploadError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!previews.length) {
      setUploadError("Vui lòng chọn ảnh");
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      for (let i = 0; i < previews.length; i++) {
        const url = await uploadToStorage(previews[i].file, "gallery");
        await adminCreateGalleryImage({
          url,
          caption: previews[i].file.name,
          order: images.length + i,
        });
      }
      setDialogOpen(false);
      setPreviews([]);
      startTransition(() => {
        router.refresh();
      });
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
    if (!ok) return;

    await handleErrorClient({
      cb: () => adminDeleteGalleryImage(id),
      onSuccess: () => {
        setImages((prev) => prev.filter((img) => img.id !== id));
        startTransition(() => {
          router.refresh();
        });
      },
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((i) => i.id === active.id);
      const newIndex = images.findIndex((i) => i.id === over?.id);

      const newImages = arrayMove(images, oldIndex, newIndex).map(
        (img, idx) => ({
          ...img,
          order: idx,
        }),
      );

      setImages(newImages);

      await handleErrorClient({
        cb: () =>
          adminUpdateGalleryOrders(
            newImages.map((img) => ({ id: img.id, order: img.order })),
          ),
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ConfirmDialog />

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{images.length} ảnh</p>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Thêm ảnh
        </Button>
      </div>

      <Dialog
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setPreviews([]);
            setUploadError(null);
          }
        }}
        open={dialogOpen}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload ảnh mới</DialogTitle>
            <DialogDescription>
              Kéo thả hoặc nhấn vào để chọn ảnh tải lên. (Tối đa 20 ảnh/lần,
              5MB/ảnh, 100MB tổng)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors ${
                isDragOver
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files) {
                  processFiles(e.dataTransfer.files);
                }
              }}
              role="button"
              tabIndex={0}
            >
              {previews.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 w-full">
                  {previews.map((p, idx) => (
                    <div key={idx} className="relative aspect-square">
                      <Image
                        alt="Preview"
                        className="rounded-lg object-cover"
                        fill
                        sizes="100px"
                        src={p.url}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <span className="text-4xl text-muted-foreground/50">📸</span>
                  <p className="text-muted-foreground text-sm">
                    Kéo thả ảnh vào đây hoặc Click để chọn ảnh
                  </p>
                  <p className="text-muted-foreground/60 text-xs">
                    Hỗ trợ chọn nhiều ảnh
                  </p>
                </>
              )}
            </div>
            <input
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              ref={fileRef}
              title="Chọn ảnh để upload"
              type="file"
            />
            {uploadError && (
              <p className="text-destructive text-sm">{uploadError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              disabled={uploading || !previews.length}
              onClick={handleUpload}
            >
              {uploading ? "Đang upload..." : "Bắt đầu upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-[200px]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((img) => (
                <SortableImage key={img.id} img={img} onDelete={handleDelete} />
              ))}
              {images.length === 0 && (
                <p className="col-span-full py-8 text-center text-muted-foreground">
                  Chưa có ảnh nào, hãy thêm ảnh mới
                </p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
