"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, ArrowRight, Image as ImageIcon, Loader2, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  adminCreateGalleryImage,
  adminDeleteGalleryImage,
  adminDeleteGalleryImages,
  adminSeedDefaultGalleryImages,
  adminUpdateGalleryOrders
} from "@/app/_actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { GalleryImage } from "@/configs/prisma/generated/prisma/client";
import { UPLOAD_MAX_BATCH_SIZE, UPLOAD_MAX_IMAGE_SIZE } from "@/constants/upload";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { cn } from "@/lib/utils";
import { uploadToStorage } from "@/services/supabase-upload";

const GALLERY_TYPES = [
  { value: "common", label: "Trang chủ" },
  { value: "webdesign", label: "WebDesign Competition" }
] as const;

const GALLERY_CATEGORY_DETAILS: Record<
  string,
  { title: string; description: string; icon: string; bgGradient: string }
> = {
  common: {
    title: "Trang chủ",
    description: "Hình ảnh chung hiển thị trên slideshow trang chủ CLB.",
    icon: "🏠",
    bgGradient: "from-blue-500/10 to-indigo-500/10 border-blue-500/20"
  },
  webdesign: {
    title: "WebDesign Competition",
    description: "Cuộc thi thiết kế và lập trình Website thường niên.",
    icon: "💻",
    bgGradient: "from-cyan-500/10 to-sky-500/10 border-cyan-500/20"
  }
} as const;

function SortableImage({
  img,
  onDelete,
  isSelected,
  onSelectChange
}: {
  img: GalleryImage;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelectChange: (id: string, selected: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: img.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      className='group relative cursor-grab overflow-hidden rounded-xl border border-border bg-background shadow-xs transition-all duration-300 hover:shadow-md active:cursor-grabbing'
      ref={setNodeRef}
      style={style}
    >
      {/* Checkbox Selection */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: stops the drag handle from starting when clicking the checkbox, not itself an interactive control */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: same as above */}
      <div
        className='absolute top-3 left-3 z-10 rounded bg-background/90 p-1 transition-colors hover:bg-background'
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Checkbox checked={isSelected} onCheckedChange={(checked) => onSelectChange(img.id, !!checked)} />
      </div>

      <button
        aria-label='Kéo để sắp xếp lại'
        className='relative aspect-video w-full bg-muted'
        type='button'
        {...attributes}
        {...listeners}
      >
        <Image
          alt={img.caption ?? "Gallery"}
          className='pointer-events-none object-cover'
          fill
          sizes='(min-width: 768px) 25vw, 50vw'
          src={img.url}
        />
      </button>

      <div className='flex items-center justify-between gap-2 p-3'>
        <span className='truncate font-medium text-muted-foreground text-xs' title={img.caption ?? ""}>
          {img.caption ?? `#${img.order}`}
        </span>
        <Button
          className='h-7 flex-shrink-0 text-xs'
          onClick={(e) => {
            e.stopPropagation();
            onDelete(img.id);
          }}
          size='sm'
          variant='destructive'
        >
          Xóa
        </Button>
      </div>
    </div>
  );
}

export function GalleryManager({ images: initialImages }: { images: GalleryImage[] }) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPending, startTransition] = useTransition();

  const [images, setImages] = useState(initialImages);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<{ url: string; file: File }[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Selection & Filtering State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchVal, setSearchVal] = useState("");
  const [search, setSearch] = useState("");
  const [uploadType, setUploadType] = useState<string>("common");
  const [seeding, setSeeding] = useState(false);

  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchVal);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const processFiles = (filesList: FileList | File[]) => {
    const files = Array.from(filesList);
    if (!files.length) {
      return;
    }

    if (files.length > 20) {
      setUploadError("Tối đa 20 ảnh một lần");
      return;
    }

    let totalSize = 0;
    for (const f of files) {
      if (f.size > UPLOAD_MAX_IMAGE_SIZE) {
        setUploadError(`Ảnh ${f.name} vượt quá 5MB`);
        return;
      }
      totalSize += f.size;
    }

    if (totalSize > UPLOAD_MAX_BATCH_SIZE) {
      setUploadError("Tổng dung lượng tải lên không vượt quá 100MB");
      return;
    }

    const newPreviews = files.map((f) => ({
      url: URL.createObjectURL(f),
      file: f
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
      const typeForUpload = selectedType || uploadType;
      const existingTypeImages = images.filter((img) => img.type === typeForUpload);

      for (let i = 0; i < previews.length; i++) {
        const url = await uploadToStorage(previews[i].file, "gallery");
        await adminCreateGalleryImage({
          url,
          caption: previews[i].file.name,
          type: typeForUpload,
          order: existingTypeImages.length + i
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
      description: "Hành động này không thể hoàn tác."
    });
    if (!ok) {
      return;
    }

    await handleErrorClient({
      cb: () => adminDeleteGalleryImage(id),
      onSuccess: () => {
        setImages((prev) => prev.filter((img) => img.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        startTransition(() => {
          router.refresh();
        });
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    const ok = await confirm({
      title: `Xóa ${selectedIds.length} ảnh đã chọn?`,
      description: "Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn các ảnh khỏi cơ sở dữ liệu."
    });
    if (!ok) {
      return;
    }

    await handleErrorClient({
      cb: () => adminDeleteGalleryImages(selectedIds),
      onSuccess: () => {
        setImages((prev) => prev.filter((img) => !selectedIds.includes(img.id)));
        setSelectedIds([]);
        startTransition(() => {
          router.refresh();
        });
      }
    });
  };

  const handleSeedDefaults = async () => {
    const ok = await confirm({
      title: "Đổ ảnh mặc định?",
      description: "Hệ thống sẽ quét các thư mục ảnh sự kiện gốc và tự động nạp các ảnh chưa tồn tại vào database."
    });
    if (!ok) {
      return;
    }

    setSeeding(true);
    await handleErrorClient({
      cb: () => adminSeedDefaultGalleryImages(),
      onSuccess: ({ data }) => {
        const payload = data?.payload as { seededCount?: number } | undefined;
        const count = payload?.seededCount ?? 0;
        alert(`Đã nạp thành công ${count} ảnh mặc định vào database!`);
        startTransition(() => {
          router.refresh();
        });
      }
    });
    setSeeding(false);
  };

  const handleSelectChange = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const filteredImages = useMemo(() => {
    return images
      .filter((img) => {
        const matchType = !selectedType || img.type === selectedType;
        const matchSearch = !search.trim() || img.caption?.toLowerCase().includes(search.toLowerCase());
        return matchType && matchSearch;
      })
      .sort((a, b) => a.order - b.order);
  }, [images, selectedType, search]);

  const handleToggleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedIds(filteredImages.map((img) => img.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      // Find index within the filtered, ordered subset
      const oldIndex = filteredImages.findIndex((i) => i.id === active.id);
      const newIndex = filteredImages.findIndex((i) => i.id === over?.id);

      const reorderedFiltered = arrayMove(filteredImages, oldIndex, newIndex);

      // Re-map orders
      const updatedOrders = reorderedFiltered.map((img, idx) => ({
        id: img.id,
        order: idx
      }));

      // Apply locally to images state
      setImages((prev) => {
        return prev.map((img) => {
          const matched = updatedOrders.find((u) => u.id === img.id);
          return matched ? { ...img, order: matched.order } : img;
        });
      });

      await handleErrorClient({
        cb: () => adminUpdateGalleryOrders(updatedOrders)
      });
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <ConfirmDialog />

      {selectedType === null ? (
        /* 1. Category Overview Landing Page */
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-end gap-2'>
            <Button
              className='h-9 gap-1.5 border-primary/20 text-primary text-xs hover:bg-primary/5'
              disabled={seeding}
              onClick={handleSeedDefaults}
              variant='outline'
            >
              {seeding ? <Loader2 className='h-4 w-4 animate-spin' /> : <Sparkles className='h-4 w-4' />}
              {seeding ? "Đang xử lý..." : "Đổ ảnh mặc định"}
            </Button>
            <Button
              className='h-9 font-semibold text-xs'
              onClick={() => {
                setUploadType("common");
                setDialogOpen(true);
              }}
            >
              <Plus className='mr-1.5 h-4 w-4' />
              Thêm ảnh
            </Button>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {GALLERY_TYPES.map((t) => {
              const details = GALLERY_CATEGORY_DETAILS[t.value] || {
                title: t.label,
                description: "Quản lý hình ảnh của nhóm này.",
                icon: "🖼️",
                bgGradient: "from-gray-500/10 to-slate-500/10 border-gray-500/20"
              };
              const count = images.filter((img) => img.type === t.value).length;

              return (
                <div
                  className={cn(
                    "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-6 shadow-xs transition-all duration-300 hover:border-primary/20 hover:shadow-md",
                    "bg-gradient-to-br",
                    details.bgGradient
                  )}
                  key={t.value}
                >
                  <div>
                    <div className='mb-4 flex items-center justify-between'>
                      <span className='text-3xl'>{details.icon}</span>
                      <Badge className='bg-background/80 font-semibold backdrop-blur-xs' variant='secondary'>
                        {count} hình ảnh
                      </Badge>
                    </div>
                    <h3 className='mb-2 font-bold text-foreground text-lg'>{details.title}</h3>
                    <p className='text-muted-foreground text-xs leading-relaxed'>{details.description}</p>
                  </div>
                  <div className='mt-6 flex items-center justify-end border-border/40 border-t pt-4'>
                    <Button
                      className='gap-1.5 font-semibold text-xs transition-transform group-hover:translate-x-0.5'
                      onClick={() => {
                        setSelectedType(t.value);
                        setSearchVal("");
                        setSelectedIds([]);
                      }}
                      size='sm'
                    >
                      Xem & Quản lý
                      <ArrowRight className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 2. Category Detail Management Page */
        <div className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <Button
              className='h-9 gap-1.5 text-muted-foreground text-xs'
              onClick={() => {
                setSelectedType(null);
                setSearchVal("");
                setSelectedIds([]);
              }}
              variant='ghost'
            >
              <ArrowLeft className='h-4 w-4' />
              Quay lại danh sách nhóm
            </Button>

            <div className='flex items-center gap-2'>
              {selectedIds.length > 0 && (
                <Button className='h-9 text-xs' onClick={handleBulkDelete} variant='destructive'>
                  <Trash2 className='mr-1.5 h-4 w-4' />
                  Xóa {selectedIds.length} ảnh đã chọn
                </Button>
              )}

              <Button className='h-9 gap-1.5 text-xs' disabled={seeding} onClick={handleSeedDefaults} variant='outline'>
                <Sparkles className='h-4 w-4' />
                Đổ ảnh mặc định
              </Button>

              <Button className='h-9 gap-1.5 font-semibold text-xs' onClick={() => setDialogOpen(true)}>
                <Plus className='h-4 w-4' />
                Thêm ảnh mới
              </Button>
            </div>
          </div>

          {selectedType && GALLERY_CATEGORY_DETAILS[selectedType] && (
            <div className='mb-2 rounded-2xl border border-border bg-card p-6 shadow-xs'>
              <div className='flex items-center gap-4'>
                <span className='text-4xl'>{GALLERY_CATEGORY_DETAILS[selectedType].icon}</span>
                <div>
                  <h2 className='font-bold text-foreground text-xl'>{GALLERY_CATEGORY_DETAILS[selectedType].title}</h2>
                  <p className='mt-1 text-muted-foreground text-xs'>
                    {GALLERY_CATEGORY_DETAILS[selectedType].description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search & Bulk Action row */}
          <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/20 p-2'>
            <div className='flex flex-wrap items-center gap-4'>
              <div className='flex h-9 items-center space-x-2 rounded-md border bg-background px-3 py-2'>
                <Checkbox
                  checked={filteredImages.length > 0 && selectedIds.length === filteredImages.length}
                  id='select-all'
                  onCheckedChange={handleToggleSelectAll}
                />
                <label className='cursor-pointer select-none font-medium text-xs' htmlFor='select-all'>
                  Chọn tất cả trong nhóm này ({filteredImages.length})
                </label>
              </div>

              <div className='relative min-w-[240px] max-w-sm'>
                <Search className='absolute top-2.5 left-3 h-4 w-4 text-muted-foreground' />
                <Input
                  className='h-9 pl-9 text-xs'
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder='Tìm theo caption...'
                  value={searchVal}
                />
              </div>
            </div>
          </div>

          <div className='mt-2 min-h-[200px]'>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
              <SortableContext items={filteredImages} strategy={rectSortingStrategy}>
                <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
                  {filteredImages.map((img) => (
                    <SortableImage
                      img={img}
                      isSelected={selectedIds.includes(img.id)}
                      key={img.id}
                      onDelete={handleDelete}
                      onSelectChange={handleSelectChange}
                    />
                  ))}
                  {filteredImages.length === 0 && (
                    <div className='col-span-full rounded-2xl border border-border border-dashed bg-card py-16 text-center'>
                      <ImageIcon className='mx-auto mb-3 h-12 w-12 text-muted-foreground/30' />
                      <p className='font-medium text-muted-foreground text-sm'>
                        Không tìm thấy hình ảnh nào trong nhóm này.
                      </p>
                      <Button className='mt-4 text-xs' onClick={() => setDialogOpen(true)} size='sm'>
                        <Plus className='mr-1.5 h-3.5 w-3.5' /> Thêm ảnh mới
                      </Button>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
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
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Upload ảnh mới</DialogTitle>
            <DialogDescription>
              {selectedType
                ? `Tải hình ảnh lên nhóm: ${GALLERY_CATEGORY_DETAILS[selectedType]?.title || selectedType}.`
                : "Chọn loại ảnh và tải lên."}{" "}
              (Tối đa 20 ảnh/lần, 5MB/ảnh, 100MB tổng)
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            {/* Select upload type only if no specific category is selected */}
            {!selectedType && (
              <div className='flex flex-col gap-2'>
                <label className='font-semibold text-foreground text-xs' htmlFor='gallery-upload-type'>
                  Phân loại ảnh
                </label>
                <Select onValueChange={setUploadType} value={uploadType}>
                  <SelectTrigger className='h-9 w-full text-xs' id='gallery-upload-type'>
                    <SelectValue placeholder='Chọn phân loại' />
                  </SelectTrigger>
                  <SelectContent>
                    {GALLERY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <button
              className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors ${
                isDragOver ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
              onClick={() => fileRef.current?.click()}
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
                if (e.dataTransfer.files) {
                  processFiles(e.dataTransfer.files);
                }
              }}
              type='button'
            >
              {previews.length > 0 ? (
                <div className='grid w-full grid-cols-4 gap-2 sm:grid-cols-5'>
                  {previews.map((p) => (
                    <div className='relative aspect-square' key={p.url}>
                      <Image alt='Preview' className='rounded-lg object-cover' fill sizes='100px' src={p.url} />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <span className='text-4xl text-muted-foreground/50'>📸</span>
                  <p className='font-medium text-muted-foreground text-sm'>
                    Kéo thả ảnh vào đây hoặc Click để chọn ảnh
                  </p>
                  <p className='text-muted-foreground/60 text-xs'>Hỗ trợ chọn nhiều ảnh</p>
                </>
              )}
            </button>
            <input
              accept='image/*'
              className='hidden'
              multiple
              onChange={handleFileChange}
              ref={fileRef}
              title='Chọn ảnh để upload'
              type='file'
            />
            {uploadError && <p className='font-semibold text-destructive text-sm'>{uploadError}</p>}
          </div>
          <DialogFooter>
            <Button disabled={uploading || !previews.length} onClick={handleUpload}>
              {uploading ? "Đang upload..." : "Bắt đầu upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
