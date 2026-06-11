"use client";

import { ArrowLeft, ImagePlus, Loader2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { adminCreateDepartment, adminUpdateDepartment } from "@/app/_actions/admin";
import { LanguageToggle, type ViewLanguage } from "@/components/custom/language-toggle";
import { TranslateButton } from "@/components/forms/translate-button";
import { useBilingualForm } from "@/components/forms/use-bilingual-form";
import { MarkdownEditor } from "@/components/markdown-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/utils/supabase-upload";
import type { DeptRow } from "./columns";

type Props = {
  dept?: DeptRow & {
    missionsVi?: string;
    missionsEn?: string;
    linkLabelVi?: string | null;
    linkLabelEn?: string | null;
    bgImage?: string | null;
  };
};

export default function DeptForm({ dept }: Props) {
  const isEdit = !!dept;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const bi = useBilingualForm({
    titleVi: dept?.nameVi ?? "",
    titleEn: dept?.nameEn ?? "",
    summaryVi: dept?.descriptionVi ?? "",
    summaryEn: (dept as any)?.descriptionEn ?? "",
    contentVi: dept?.missionsVi ?? "",
    contentEn: dept?.missionsEn ?? "",
    sourceLanguage: "VI"
  });

  const otherLang: ViewLanguage = bi.viewLang === "vi" ? "en" : "vi";
  const [slug, setSlug] = useState(dept?.slug ?? "");
  const [icon, setIcon] = useState(dept?.icon ?? "");
  const [bgImage, setBgImage] = useState((dept as any)?.bgImage ?? "");
  const [bgImageUploading, setBgImageUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkLabelVi, setLinkLabelVi] = useState((dept as any)?.linkLabelVi ?? "");
  const [linkLabelEn, setLinkLabelEn] = useState((dept as any)?.linkLabelEn ?? "");
  const [hyperlink, setHyperlink] = useState((dept as any)?.hyperlink ?? "");
  const [order, setOrder] = useState(dept?.order ?? 0);
  const [isActive, setIsActive] = useState(dept?.isActive ?? true);

  const processBgImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", description: "Chỉ nhận file ảnh" });
      return;
    }
    setBgImageUploading(true);
    try {
      const url = await uploadToStorage(file, "media", "departments");
      setBgImage(url);
    } catch {
      toast({ variant: "destructive", description: "Upload thất bại" });
    } finally {
      setBgImageUploading(false);
    }
  };

  const getTitle = () => (bi.viewLang === "vi" ? bi.titleVi : bi.titleEn);
  const setTitle = (v: string) => (bi.viewLang === "vi" ? bi.setTitleVi(v) : bi.setTitleEn(v));
  const getDesc = () => (bi.viewLang === "vi" ? (bi.summaryVi ?? "") : (bi.summaryEn ?? ""));
  const setDesc = (v: string) => (bi.viewLang === "vi" ? bi.setSummaryVi(v) : bi.setSummaryEn(v));
  const getMissions = () => (bi.viewLang === "vi" ? bi.contentVi : bi.contentEn);
  const setMissions = (v: string) => (bi.viewLang === "vi" ? bi.setContentVi(v) : bi.setContentEn(v));

  const translateSrcFields = {
    title: bi.viewLang === "vi" ? bi.titleVi : bi.titleEn,
    summary: bi.viewLang === "vi" ? bi.summaryVi : bi.summaryEn,
    content: bi.viewLang === "vi" ? bi.contentVi : bi.contentEn
  };

  const handleTranslate = (result: { title?: string; summary?: string; content?: string }) => {
    if (result.title !== undefined) {
      otherLang === "vi" ? bi.setTitleVi(result.title) : bi.setTitleEn(result.title);
    }
    if (result.summary !== undefined) {
      otherLang === "vi" ? bi.setSummaryVi(result.summary) : bi.setSummaryEn(result.summary);
    }
    if (result.content !== undefined) {
      otherLang === "vi" ? bi.setContentVi(result.content) : bi.setContentEn(result.content);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      nameVi: bi.titleVi,
      nameEn: bi.titleEn || undefined,
      slug,
      descriptionVi: bi.summaryVi ?? undefined,
      descriptionEn: bi.summaryEn ?? undefined,
      missionsVi: bi.contentVi,
      missionsEn: bi.contentEn,
      icon: icon || undefined,
      bgImage: bgImage || undefined,
      linkLabelVi: linkLabelVi || undefined,
      linkLabelEn: linkLabelEn || undefined,
      hyperlink: hyperlink || undefined,
      order,
      isActive
    };

    const res = isEdit && dept ? await adminUpdateDepartment(dept.id, payload) : await adminCreateDepartment(payload);

    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
      setLoading(false);
      return;
    }
    toast({
      variant: "success",
      description: isEdit ? "Cập nhật thành công" : "Tạo ban mới"
    });
    setLoading(false);
    router.push("/admin/departments");
    router.refresh();
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between border-b pb-4'>
        <div className='flex items-center gap-3'>
          <Button className='h-9 w-9' onClick={() => router.push("/admin/departments")} size='icon' variant='outline'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='font-bold text-foreground text-lg'>
              {isEdit ? `Chỉnh sửa: ${dept?.nameVi}` : "Thêm ban mới"}
            </h1>
            <p className='text-muted-foreground text-xs'>Quản lý ban/phòng trong CLB</p>
          </div>
        </div>
        <Button className='h-9' disabled={loading} form='dept-form' type='submit'>
          {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
          Lưu
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <form className='flex flex-col gap-6' id='dept-form' onSubmit={handleSubmit}>
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
              <CardTitle className='font-semibold text-sm'>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4'>
              <div className='grid gap-1.5'>
                <Label>Tên ban *</Label>
                <Input
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Tên ban...'
                  required
                  value={getTitle()}
                />
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='grid gap-1.5'>
                  <Label>Slug *</Label>
                  <Input onChange={(e) => setSlug(e.target.value)} placeholder='programming' required value={slug} />
                </div>
                <div className='grid gap-1.5'>
                  <Label>Thứ tự</Label>
                  <Input onChange={(e) => setOrder(Number(e.target.value))} type='number' value={order} />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='grid gap-1.5'>
                  <Label>Icon (Lucide)</Label>
                  <Input onChange={(e) => setIcon(e.target.value)} placeholder='Code, Camera...' value={icon} />
                </div>
                <div className='grid gap-1.5'>
                  <Label>Ảnh nền</Label>
                  {bgImage ? (
                    <div className='relative flex aspect-video max-h-[180px] items-center justify-center overflow-hidden rounded-lg border bg-muted'>
                      <img alt='' className='h-full w-full object-cover' src={bgImage} />
                      <button
                        className='absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80'
                        onClick={() => setBgImage("")}
                        type='button'
                      >
                        <X className='h-3.5 w-3.5' />
                      </button>
                    </div>
                  ) : (
                    <button
                      className={`flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors ${isDragOver ? "border-primary bg-primary/10" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
                      disabled={bgImageUploading}
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
                          processBgImage(e.dataTransfer.files[0]);
                        }
                      }}
                      type='button'
                    >
                      {bgImageUploading ? (
                        <>
                          <Loader2 className='h-5 w-5 animate-spin' />
                          <span className='text-xs'>Đang upload...</span>
                        </>
                      ) : (
                        <>
                          <ImagePlus className='h-5 w-5' />
                          <span className='text-xs'>Upload ảnh nền</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    accept='image/*'
                    className='hidden'
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        processBgImage(e.target.files[0]);
                      }
                    }}
                    ref={fileInputRef}
                    type='file'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Mô tả</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4'>
              <div className='grid gap-1.5'>
                <Label>Mô tả ban</Label>
                <textarea
                  className='min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm'
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder='Mô tả về ban...'
                  value={getDesc()}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Nhiệm vụ (Markdown)</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownEditor
                defaultValue={getMissions()}
                key={bi.viewLang}
                minHeight='200px'
                name='missions'
                onChange={setMissions}
                placeholder='Liệt kê nhiệm vụ của ban (mỗi dòng 1 mục, cách dòng trống để tách đoạn)...'
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Liên kết</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-3'>
              <div className='grid gap-1.5'>
                <Label>Đường dẫn</Label>
                <Input onChange={(e) => setHyperlink(e.target.value)} placeholder='/projects' value={hyperlink} />
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='grid gap-1.5'>
                  <Label>Nhãn (VI)</Label>
                  <Input
                    onChange={(e) => setLinkLabelVi(e.target.value)}
                    placeholder='Xem các dự án'
                    value={linkLabelVi}
                  />
                </div>
                <div className='grid gap-1.5'>
                  <Label>Nhãn (EN)</Label>
                  <Input
                    onChange={(e) => setLinkLabelEn(e.target.value)}
                    placeholder='View our projects'
                    value={linkLabelEn}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className='flex items-center gap-2'>
            <input checked={isActive} id='isActive' onChange={(e) => setIsActive(e.target.checked)} type='checkbox' />
            <Label className='cursor-pointer font-normal' htmlFor='isActive'>
              Đang hoạt động
            </Label>
          </div>
        </form>
      </div>
    </div>
  );
}
