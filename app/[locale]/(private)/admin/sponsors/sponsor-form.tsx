"use client";

import { ArrowLeft, ImagePlus, Loader2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { adminCreateSponsor, adminUpdateSponsor } from "@/app/_actions/admin";
import { LanguageToggle, type ViewLanguage } from "@/components/custom/language-toggle";
import { TranslateButton } from "@/components/forms/translate-button";
import { useBilingualForm } from "@/components/forms/use-bilingual-form";
import { MarkdownEditor } from "@/components/markdown-editor";
import { type ImageItem, MultiImageUpload } from "@/components/multi-image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/utils/supabase-upload";
import type { SponsorRow } from "./columns";

type Props = {
  sponsor?: SponsorRow | null;
  activities?: Array<{ id: string; titleVi: string }>;
};

export default function SponsorForm({ sponsor, activities = [] }: Props) {
  const isEdit = !!sponsor;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const bi = useBilingualForm({
    titleVi: sponsor?.name ?? "",
    titleEn: sponsor?.nameEn ?? "",
    summaryVi: sponsor?.descriptionVi ?? "",
    summaryEn: sponsor?.descriptionEn ?? "",
    contentVi: "",
    contentEn: "",
    sourceLanguage: "VI"
  });

  const otherLang: ViewLanguage = bi.viewLang === "vi" ? "en" : "vi";

  const [logoUrl, setLogoUrl] = useState<string | null>(sponsor?.logo ?? null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [email, setEmail] = useState(sponsor?.email ?? "");
  const [phone, setPhone] = useState(sponsor?.phone ?? "");
  const [website, setWebsite] = useState(sponsor?.website ?? "");
  const [activityId, setActivityId] = useState(sponsor?.activityId ?? "");
  const [startAt, setStartAt] = useState(sponsor?.startAt ? sponsor.startAt.split("T")[0] : "");
  const [endAt, setEndAt] = useState(sponsor?.endAt ? sponsor.endAt.split("T")[0] : "");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagesItems, setImagesItems] = useState<ImageItem[]>((sponsor?.images ?? []).map((url: string) => ({ url })));

  useEffect(() => {
    setLogoUrl(sponsor?.logo ?? null);
    setImagesItems((sponsor?.images ?? []).map((url: string) => ({ url })));
  }, [sponsor]);

  const processLogoFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", description: "Chỉ nhận file ảnh" });
      return;
    }
    setLogoUploading(true);
    try {
      const url = await uploadToStorage(file, "media", "sponsors");
      setLogoUrl(url);
    } catch {
      toast({ variant: "destructive", description: "Upload thất bại" });
    } finally {
      setLogoUploading(false);
    }
  };

  const getTitle = () => (bi.viewLang === "vi" ? bi.titleVi : bi.titleEn);
  const setTitle = (v: string) => (bi.viewLang === "vi" ? bi.setTitleVi(v) : bi.setTitleEn(v));
  const getDesc = () => (bi.viewLang === "vi" ? (bi.summaryVi ?? "") : (bi.summaryEn ?? ""));
  const setDesc = (v: string) => (bi.viewLang === "vi" ? bi.setSummaryVi(v) : bi.setSummaryEn(v));

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
      name: bi.titleVi,
      nameEn: bi.titleEn || undefined,
      descriptionVi: bi.summaryVi ?? undefined,
      descriptionEn: bi.summaryEn ?? undefined,
      logo: logoUrl ?? undefined,
      email: email || undefined,
      phone: phone || undefined,
      website: website || undefined,
      activityId: activityId || null,
      startAt: startAt || undefined,
      endAt: endAt || undefined,
      images: imagesItems.map((x) => x.url)
    };

    const res = isEdit && sponsor ? await adminUpdateSponsor(sponsor.id, payload) : await adminCreateSponsor(payload);

    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
      setLoading(false);
      return;
    }
    toast({
      variant: "success",
      description: isEdit ? "Cập nhật thành công" : "Tạo nhà tài trợ mới"
    });
    setLoading(false);
    router.push("/admin/sponsors");
    router.refresh();
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between border-b pb-4'>
        <div className='flex items-center gap-3'>
          <Button className='h-9 w-9' onClick={() => router.push("/admin/sponsors")} size='icon' variant='outline'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='font-bold text-foreground text-lg'>
              {isEdit ? `Chỉnh sửa: ${sponsor?.name}` : "Thêm nhà tài trợ mới"}
            </h1>
            <p className='text-muted-foreground text-xs'>Quản lý nhà tài trợ và đối tác</p>
          </div>
        </div>
        <Button className='h-9' disabled={loading} form='sponsor-form' type='submit'>
          {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
          Lưu
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <form className='flex flex-col gap-6' id='sponsor-form' onSubmit={handleSubmit}>
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
              <CardTitle className='font-semibold text-sm'>Thông tin nhà tài trợ</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4'>
              <div className='grid gap-1.5'>
                <Label>Logo</Label>
                {logoUrl ? (
                  <div className='relative flex h-24 items-center justify-center rounded-lg border bg-muted p-2'>
                    <img alt='' className='max-h-full max-w-full object-contain' src={logoUrl} />
                    <button
                      className='absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80'
                      onClick={() => setLogoUrl(null)}
                      type='button'
                    >
                      <X className='h-3.5 w-3.5' />
                    </button>
                  </div>
                ) : (
                  <button
                    className={`flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors ${isDragOver ? "border-primary bg-primary/10" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
                    disabled={logoUploading}
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
                        processLogoFile(e.dataTransfer.files[0]);
                      }
                    }}
                    type='button'
                  >
                    {logoUploading ? (
                      <>
                        <Loader2 className='h-5 w-5 animate-spin' />
                        <span className='text-xs'>Đang upload...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className='h-5 w-5' />
                        <span className='text-xs'>Upload logo</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  accept='image/*'
                  className='hidden'
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      processLogoFile(e.target.files[0]);
                    }
                  }}
                  ref={fileInputRef}
                  type='file'
                />
              </div>

              <div className='grid gap-1.5'>
                <Label>Tên nhà tài trợ *</Label>
                <Input
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Tên nhà tài trợ...'
                  required
                  value={getTitle()}
                />
              </div>

              <div className='grid gap-1.5'>
                <Label>Mô tả</Label>
                <MarkdownEditor
                  defaultValue={getDesc()}
                  key={bi.viewLang}
                  minHeight='160px'
                  name='description'
                  onChange={setDesc}
                  placeholder='Mô tả về nhà tài trợ (Markdown)...'
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='grid gap-1.5'>
                  <Label>Email</Label>
                  <Input
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='email@example.com'
                    type='email'
                    value={email}
                  />
                </div>
                <div className='grid gap-1.5'>
                  <Label>Điện thoại</Label>
                  <Input onChange={(e) => setPhone(e.target.value)} placeholder='0123456789' value={phone} />
                </div>
              </div>

              <div className='grid gap-1.5'>
                <Label>Website</Label>
                <Input
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder='https://...'
                  type='url'
                  value={website}
                />
              </div>

              <div className='grid gap-1.5'>
                <Label>Loại hoạt động</Label>
                <select
                  className='w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm'
                  onChange={(e) => setActivityId(e.target.value)}
                  value={activityId}
                >
                  <option value=''>-- Không --</option>
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.titleVi}
                    </option>
                  ))}
                </select>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='grid gap-1.5'>
                  <Label>Ngày bắt đầu</Label>
                  <Input onChange={(e) => setStartAt(e.target.value)} type='date' value={startAt} />
                </div>
                <div className='grid gap-1.5'>
                  <Label>Ngày kết thúc</Label>
                  <Input onChange={(e) => setEndAt(e.target.value)} type='date' value={endAt} />
                </div>
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
                label='Ảnh nhà tài trợ'
                maxImages={10}
                onChange={setImagesItems}
                storagePath='sponsors/gallery'
              />
            </CardContent>
          </Card>
        </form>

        {/* Preview */}
        <div className='sticky top-6 hidden max-h-[calc(100vh-80px)] flex-col gap-4 overflow-y-auto rounded-xl border bg-background/50 p-6 backdrop-blur-md lg:flex'>
          <div className='flex items-center justify-between border-b pb-2'>
            <h2 className='font-bold text-muted-foreground text-sm uppercase tracking-wider'>Xem trước</h2>
            <LanguageToggle onChange={bi.setViewLang} value={bi.viewLang} />
          </div>
          {logoUrl && <img alt='' className='mx-auto h-20 object-contain' src={logoUrl} />}
          <h1 className='text-center font-bold text-2xl'>{getTitle() || "Tên nhà tài trợ"}</h1>
          {getDesc() && <p className='text-muted-foreground text-sm'>{getDesc()}</p>}
          {/* ... */}
        </div>
      </div>
    </div>
  );
}
