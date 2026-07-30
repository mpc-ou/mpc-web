"use client";

import { ArrowLeft, ImagePlus, Loader2, Save, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { adminCreateActivity, adminUpdateActivity } from "@/app/_actions/admin";
import { LanguageToggle, type ViewLanguage } from "@/components/custom/language-toggle";
import { TranslateButton } from "@/components/forms/translate-button";
import { useBilingualForm } from "@/components/forms/use-bilingual-form";
import { MarkdownEditor } from "@/components/markdown-editor";
import { type ImageItem, MultiImageUpload } from "@/components/multi-image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/services/supabase-upload";
import type { ActivityRow } from "./columns";

const FREQ_OPTIONS = [
  { value: "weekly", vi: "Hằng tuần", en: "Weekly" },
  { value: "monthly", vi: "Hằng tháng", en: "Monthly" },
  { value: "yearly", vi: "Hằng năm", en: "Annually" },
  { value: "semester", vi: "Hằng kỳ", en: "Every Semester" },
  { value: "none", vi: "Không cố định", en: "Irregular" }
] as const;

type Props = {
  activity?: ActivityRow | null;
};

type ActivityBilingual = {
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  frequencyVi: string | null;
  frequencyEn: string | null;
};

export default function ActivityForm({ activity }: Props) {
  const isEdit = !!activity;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const bi = useBilingualForm({
    titleVi: activity?.titleVi ?? "",
    titleEn: activity?.titleEn ?? "",
    summaryVi: activity?.descriptionVi ?? "",
    summaryEn: activity?.descriptionEn ?? "",
    contentVi: "",
    contentEn: "",
    sourceLanguage: "VI"
  });

  const otherLang: ViewLanguage = bi.viewLang === "vi" ? "en" : "vi";

  const [frequencyVi, setFrequencyVi] = useState(activity?.frequencyVi ?? "monthly");
  const [frequencyEn, setFrequencyEn] = useState(activity?.frequencyEn ?? "monthly");
  const [hyperlink, setHyperlink] = useState(activity?.hyperlink ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(activity?.thumbnail ?? null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagesItems, setImagesItems] = useState<ImageItem[]>((activity?.images ?? []).map((url: string) => ({ url })));

  useEffect(() => {
    setThumbnailUrl(activity?.thumbnail ?? null);
    setImagesItems((activity?.images ?? []).map((url: string) => ({ url })));
  }, [activity]);

  const processThumbnailFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", description: "Chỉ nhận file ảnh" });
      return;
    }
    setThumbnailUploading(true);
    try {
      const url = await uploadToStorage(file, "media", "activities");
      setThumbnailUrl(url);
    } catch {
      toast({ variant: "destructive", description: "Upload thất bại" });
    } finally {
      setThumbnailUploading(false);
    }
  };

  const getTitle = () => (bi.viewLang === "vi" ? bi.titleVi : bi.titleEn);
  const setTitle = (v: string) => (bi.viewLang === "vi" ? bi.setTitleVi(v) : bi.setTitleEn(v));
  const getDesc = () => (bi.viewLang === "vi" ? (bi.summaryVi ?? "") : (bi.summaryEn ?? ""));
  const setDesc = (v: string) => (bi.viewLang === "vi" ? bi.setSummaryVi(v) : bi.setSummaryEn(v));
  const getFreq = () => (bi.viewLang === "vi" ? frequencyVi : frequencyEn);
  const setFreq = (v: string) => (bi.viewLang === "vi" ? setFrequencyVi(v) : setFrequencyEn(v));
  const getFreqLabel = () => {
    const val = bi.viewLang === "vi" ? frequencyVi : frequencyEn;
    return FREQ_OPTIONS.find((o) => o.value === val)?.[bi.viewLang === "vi" ? "vi" : "en"] ?? "";
  };

  const translateSrcFields = {
    title: bi.viewLang === "vi" ? bi.titleVi : bi.titleEn,
    summary: bi.viewLang === "vi" ? bi.summaryVi : bi.summaryEn
  };

  const handleTranslate = (result: { title?: string; summary?: string; content?: string }) => {
    if (result.title !== undefined) {
      otherLang === "vi" ? bi.setTitleVi(result.title) : bi.setTitleEn(result.title);
    }
    if (result.summary !== undefined) {
      otherLang === "vi" ? bi.setSummaryVi(result.summary) : bi.setSummaryEn(result.summary);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      titleVi: bi.titleVi,
      titleEn: bi.titleEn || undefined,
      descriptionVi: bi.summaryVi ?? undefined,
      descriptionEn: bi.summaryEn ?? undefined,
      frequencyVi: frequencyVi || undefined,
      frequencyEn: frequencyEn || undefined,
      hyperlink: hyperlink || undefined,
      thumbnail: thumbnailUrl ?? undefined,
      images: imagesItems.map((x) => x.url)
    };

    const res =
      isEdit && activity ? await adminUpdateActivity(activity.id, payload) : await adminCreateActivity(payload);

    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
      setLoading(false);
      return;
    }

    toast({
      variant: "success",
      description: isEdit ? "Cập nhật thành công" : "Tạo hoạt động mới"
    });
    setLoading(false);
    router.push("/admin/activities");
    router.refresh();
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between border-b pb-4'>
        <div className='flex items-center gap-3'>
          <Button className='h-9 w-9' onClick={() => router.push("/admin/activities")} size='icon' variant='outline'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='font-bold text-foreground text-lg'>
              {isEdit ? `Chỉnh sửa: ${activity?.titleVi}` : "Thêm hoạt động mới"}
            </h1>
            <p className='text-muted-foreground text-xs'>Quản lý hoạt động định kỳ của CLB</p>
          </div>
        </div>
        <Button className='h-9' disabled={loading} form='activity-form' type='submit'>
          {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
          Lưu
        </Button>
      </div>

      <form className='mx-auto flex w-full max-w-2xl flex-col gap-6' id='activity-form' onSubmit={handleSubmit}>
        <Card>
          <CardHeader className='py-3'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <LanguageToggle onChange={bi.setViewLang} value={bi.viewLang} />
              <TranslateButton
                disabled={!translateSrcFields.title}
                fields={translateSrcFields}
                from={bi.viewLang}
                label={bi.viewLang === "vi" ? "Dịch → 🇬🇧" : "Dịch → 🇻🇳"}
                onTranslated={handleTranslate}
                to={otherLang}
              />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className='py-4'>
            <CardTitle className='font-semibold text-sm'>Thông tin hoạt động</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4'>
            <div className='grid gap-1.5'>
              <Label>Tên hoạt động *</Label>
              <Input
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Nhập tên hoạt động...'
                required
                value={getTitle()}
              />
            </div>

            <div className='grid gap-1.5'>
              <Label>Mô tả</Label>
              <MarkdownEditor
                defaultValue={getDesc()}
                key={bi.viewLang}
                minHeight='200px'
                name='description'
                onChange={setDesc}
                placeholder='Mô tả về hoạt động (Markdown)...'
              />
            </div>

            <div className='grid gap-1.5'>
              <Label>Tần suất</Label>
              <Select onValueChange={setFreq} value={getFreq()}>
                <SelectTrigger className='h-9 text-sm'>
                  <SelectValue>{getFreqLabel()}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FREQ_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {bi.viewLang === "vi" ? opt.vi : opt.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-1.5'>
              <Label>Liên kết CTA (tùy chọn)</Label>
              <Input
                onChange={(e) => setHyperlink(e.target.value)}
                placeholder='/activities/webdesign'
                value={hyperlink}
              />
            </div>

            <div className='grid gap-1.5'>
              <Label>Ảnh đại diện</Label>
              {thumbnailUrl ? (
                <div className='relative aspect-video max-h-50 overflow-hidden rounded-lg border bg-muted'>
                  <Image alt='' className='object-cover' fill sizes='400px' src={thumbnailUrl} />
                  <button
                    className='absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80'
                    onClick={() => setThumbnailUrl(null)}
                    type='button'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
              ) : (
                <button
                  className={`flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors ${isDragOver ? "border-primary bg-primary/10" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
                  disabled={thumbnailUploading}
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
                      processThumbnailFile(e.dataTransfer.files[0]);
                    }
                  }}
                  type='button'
                >
                  {thumbnailUploading ? (
                    <>
                      <Loader2 className='h-5 w-5 animate-spin' />
                      <span className='text-xs'>Đang upload...</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className='h-5 w-5' />
                      <span className='text-xs'>Upload thumbnail</span>
                    </>
                  )}
                </button>
              )}
              <input
                accept='image/*'
                className='hidden'
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    processThumbnailFile(e.target.files[0]);
                  }
                }}
                ref={fileInputRef}
                type='file'
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='py-4'>
            <CardTitle className='font-semibold text-sm'>Thư viện ảnh</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiImageUpload
              initialImages={imagesItems}
              label='Ảnh hoạt động'
              maxImages={10}
              onChange={setImagesItems}
              storagePath='activities/gallery'
            />
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
