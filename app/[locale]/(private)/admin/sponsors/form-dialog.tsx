"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/utils/supabase-upload";
import { adminCreateSponsor, adminUpdateSponsor } from "../actions";
import type { SponsorRow } from "./columns";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sponsor?: SponsorRow | null;
};

export function SponsorFormDialog({ open, onOpenChange, sponsor }: Props) {
  const isEdit = !!sponsor;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(sponsor?.logo ?? null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLogoUrl(sponsor?.logo ?? null);
  }, [sponsor?.id, open]);

  const processLogoFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", description: "Chỉ chấp nhận file ảnh" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", description: "Ảnh tối đa 5MB" });
      return;
    }

    setLogoUploading(true);
    try {
      const url = await uploadToStorage(file, "media", "sponsors");
      setLogoUrl(url);
    } catch {
      toast({ variant: "destructive", description: "Upload ảnh thất bại" });
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processLogoFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      website: (fd.get("website") as string) || undefined,
      email: (fd.get("email") as string) || undefined,
      phone: (fd.get("phone") as string) || undefined,
      description: (fd.get("description") as string) || undefined,
      logo: logoUrl || undefined,
    };

    const res =
      isEdit && sponsor
        ? await adminUpdateSponsor(sponsor.id, payload)
        : await adminCreateSponsor(payload);
    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
      setLoading(false);
      return;
    }
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa nhà tài trợ" : "Thêm nhà tài trợ"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Cập nhật thông tin." : "Thêm nhà tài trợ mới."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4 py-4"
          id="sponsor-form"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-2">
            <Label>Tên *</Label>
            <Input defaultValue={sponsor?.name} name="name" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Website</Label>
              <Input
                defaultValue={sponsor?.website ?? ""}
                name="website"
                type="url"
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                defaultValue={sponsor?.email ?? ""}
                name="email"
                type="email"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Điện thoại</Label>
              <Input defaultValue={sponsor?.phone ?? ""} name="phone" />
            </div>
            <div className="grid gap-2">
              <Label>Logo</Label>
              {logoUrl ? (
                <div className="relative overflow-hidden rounded-lg border h-[120px] bg-muted w-full flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Logo"
                    className="object-contain w-full h-full"
                    src={logoUrl}
                  />
                  <button
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                    onClick={() => setLogoUrl(null)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  className={`flex h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors disabled:opacity-50 ${isDragOver ? "border-primary bg-primary/10" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
                  disabled={logoUploading}
                  onClick={() => logoInputRef.current?.click()}
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
                    if (e.dataTransfer.files?.[0]) {
                      processLogoFile(e.dataTransfer.files[0]);
                    }
                  }}
                  type="button"
                >
                  {logoUploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-xs">Đang upload...</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-xs">Upload ảnh (max 5MB)</span>
                    </>
                  )}
                </button>
              )}
              <input
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                ref={logoInputRef}
                type="file"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Mô tả</Label>
            <textarea
              className="min-h-15 rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue={sponsor?.description ?? ""}
              name="description"
              title="Mô tả nhà tài trợ"
            />
          </div>
        </form>
        <DialogFooter>
          <Button disabled={loading} form="sponsor-form" type="submit">
            {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
