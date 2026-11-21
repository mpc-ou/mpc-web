"use client";

import { Search, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminUpsertSetting } from "@/app/_actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SEO_SETTING_KEYS } from "@/constants/seo";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/services/supabase-upload";

export function SeoSettings({ settingsMap }: { settingsMap: Record<string, string> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [seoOgImage, setSeoOgImage] = useState(settingsMap[SEO_SETTING_KEYS.ogImage] ?? "");

  const handleSeoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      setLoading(true);
      setSeoOgImage(await uploadToStorage(file, "media", "branding"));
    } catch (err) {
      toast({
        variant: "destructive",
        description: `Lỗi tải ảnh: ${err instanceof Error ? err.message : "Thất bại"}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSeo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const values = {
      [SEO_SETTING_KEYS.keywords]: (fd.get(SEO_SETTING_KEYS.keywords) as string) || "",
      [SEO_SETTING_KEYS.descriptionVi]: (fd.get(SEO_SETTING_KEYS.descriptionVi) as string) || "",
      [SEO_SETTING_KEYS.descriptionEn]: (fd.get(SEO_SETTING_KEYS.descriptionEn) as string) || "",
      [SEO_SETTING_KEYS.ogImage]: seoOgImage
    };
    try {
      for (const [key, value] of Object.entries(values)) {
        await adminUpsertSetting({ key, value: value.trim(), description: `SEO: ${key}` });
      }
      toast({ description: "Đã lưu cài đặt SEO" });
      router.refresh();
    } catch (err) {
      toast({
        variant: "destructive",
        description: `Không thể lưu SEO: ${err instanceof Error ? err.message : "Thất bại"}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='rounded-xl border border-border bg-background p-5 shadow-sm'>
      <h2 className='mb-1 flex items-center gap-2 font-semibold text-foreground text-lg'>
        <Search className='h-5 w-5 text-primary' /> SEO & Link preview
      </h2>
      <p className='mb-4 text-muted-foreground text-xs'>
        Từ khoá áp dụng cho mọi trang (cộng thêm bộ từ khoá mặc định). Mô tả dùng cho trang chủ. Ảnh preview dùng khi
        trang không có ảnh riêng — nên dùng ảnh ngang 1200×630, không chèn chữ.
      </p>
      <form className='grid gap-4' onSubmit={handleSaveSeo}>
        <div className='grid gap-2'>
          <Label htmlFor={SEO_SETTING_KEYS.keywords}>Từ khoá (phân tách bằng dấu phẩy hoặc xuống dòng)</Label>
          <Textarea
            defaultValue={settingsMap[SEO_SETTING_KEYS.keywords] ?? ""}
            id={SEO_SETTING_KEYS.keywords}
            name={SEO_SETTING_KEYS.keywords}
            placeholder='MPC, MPClub, Câu lạc bộ lập trình trên thiết bị di động, ...'
            rows={3}
          />
        </div>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='grid gap-2'>
            <Label htmlFor={SEO_SETTING_KEYS.descriptionVi}>Mô tả trang chủ (VI)</Label>
            <Textarea
              defaultValue={settingsMap[SEO_SETTING_KEYS.descriptionVi] ?? ""}
              id={SEO_SETTING_KEYS.descriptionVi}
              maxLength={170}
              name={SEO_SETTING_KEYS.descriptionVi}
              rows={3}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor={SEO_SETTING_KEYS.descriptionEn}>Mô tả trang chủ (EN)</Label>
            <Textarea
              defaultValue={settingsMap[SEO_SETTING_KEYS.descriptionEn] ?? ""}
              id={SEO_SETTING_KEYS.descriptionEn}
              maxLength={170}
              name={SEO_SETTING_KEYS.descriptionEn}
              rows={3}
            />
          </div>
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='seo-og-image'>Ảnh preview mặc định</Label>
          <div className='flex flex-wrap items-center gap-3'>
            <Input
              className='max-w-md'
              id='seo-og-image'
              onChange={(e) => setSeoOgImage(e.target.value)}
              placeholder='/images/og/mpclub.jpg'
              value={seoOgImage}
            />
            <Label className='inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs hover:bg-muted'>
              <Upload className='h-3.5 w-3.5' /> Tải ảnh
              <input accept='image/*' className='hidden' onChange={handleSeoImageUpload} type='file' />
            </Label>
          </div>
          {seoOgImage && (
            <div className='relative aspect-[1200/630] w-full max-w-sm overflow-hidden rounded-lg border border-border bg-muted'>
              <Image alt='' className='object-cover' fill sizes='384px' src={seoOgImage} />
            </div>
          )}
        </div>
        <Button className='w-fit' disabled={loading} type='submit'>
          {loading ? "Đang lưu..." : "Lưu SEO"}
        </Button>
      </form>
    </section>
  );
}
