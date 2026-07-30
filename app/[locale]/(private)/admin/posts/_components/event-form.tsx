"use client";

import { ArrowLeft, ImagePlus, Loader2, Save, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { adminCreateEvent, adminSetPostTags, adminUpdateEvent } from "@/app/_actions/admin";
import { LanguageToggle, type ViewLanguage } from "@/components/custom/language-toggle";
import { TranslateButton } from "@/components/forms/translate-button";
import { useBilingualForm } from "@/components/forms/use-bilingual-form";
import { type LocationData, LocationPicker } from "@/components/location-picker";
import { MarkdownContent } from "@/components/markdown-content";
import { MarkdownEditor } from "@/components/markdown-editor";
import { type ImageItem, MultiImageUpload } from "@/components/multi-image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STORAGE_BUCKET, STORAGE_PATHS } from "@/constants/storage";
import { UPLOAD_MAX_BANNER_SIZE } from "@/constants/upload";
import { useToast } from "@/hooks/use-toast";
import { pickLang } from "@/lib/utils";
import { uploadToStorage } from "@/services/supabase-upload";
import type { PostRow } from "../columns";
import { TagInput } from "./tag-input";

type Props = {
  post?: PostRow | null;
};

export function EventForm({ post }: Props) {
  const isEdit = !!post;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const bi = useBilingualForm(post);

  const displayTitle = pickLang(bi.viewLang, bi.titleVi, bi.titleEn);
  const displayDescription = pickLang(bi.viewLang, bi.summaryVi, bi.summaryEn) ?? "";
  const displayContent = pickLang(bi.viewLang, bi.contentVi, bi.contentEn);
  const otherLang: ViewLanguage = bi.viewLang === "vi" ? "en" : "vi";

  const [locationVi, setLocationVi] = useState(post?.locationVi ?? "");
  const [locationEn, setLocationEn] = useState(post?.locationEn ?? "");
  const [latitude, setLatitude] = useState<number | null>(post?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(post?.longitude ?? null);
  const displayLocation = pickLang(bi.viewLang, locationVi, locationEn);
  const [startAt, setStartAt] = useState(post?.startAt ? new Date(post.startAt).toISOString().split("T")[0] : "");
  const [endAt, setEndAt] = useState(post?.endAt ? new Date(post.endAt).toISOString().split("T")[0] : "");
  const [eventStatus, setEventStatus] = useState(post?.eventStatus ?? "UPCOMING");
  const [eventType, setEventType] = useState(post?.eventType ?? "OTHER");
  const [tags, setTags] = useState<string[]>(post?.tags?.map((t) => t.tag.name) ?? []);
  const [postStatus, setPostStatus] = useState(post?.status ?? "PUBLISHED");

  const [bannerUrl, setBannerUrl] = useState<string | null>(post?.thumbnail ?? null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const initialAdditionalImages = post?.gallery
    ? post.gallery
        .filter((g) => g.type === "ADDITIONAL")
        .map((g) => ({ url: g.url, title: g.title ?? undefined, caption: g.caption ?? undefined }))
    : (post?.images ?? []).map((url: string) => ({
        url,
        title: "",
        caption: ""
      }));
  const [imagesItems, setImagesItems] = useState<ImageItem[]>(initialAdditionalImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewContent, setPreviewContent] = useState(displayContent);

  useEffect(() => {
    const handler = setTimeout(() => setPreviewContent(displayContent), 400);
    return () => clearTimeout(handler);
  }, [displayContent]);

  useEffect(() => {
    setBannerUrl(post?.thumbnail ?? null);
    const additional = post?.gallery
      ? post.gallery
          .filter((g) => g.type === "ADDITIONAL")
          .map((g) => ({ url: g.url, title: g.title ?? undefined, caption: g.caption ?? undefined }))
      : (post?.images ?? []).map((url: string) => ({
          url,
          title: "",
          caption: ""
        }));
    setImagesItems(additional);
    setTags(post?.tags?.map((t) => t.tag.name) ?? []);
    setPostStatus(post?.status ?? "PUBLISHED");
  }, [post]);

  const getTitle = () => (bi.viewLang === "vi" ? bi.titleVi : bi.titleEn);
  const setTitle = (v: string) => (bi.viewLang === "vi" ? bi.setTitleVi(v) : bi.setTitleEn(v));
  const getDescription = () => (bi.viewLang === "vi" ? (bi.summaryVi ?? "") : (bi.summaryEn ?? ""));
  const setDescription = (v: string) =>
    bi.viewLang === "vi" ? bi.setSummaryVi(v || null) : bi.setSummaryEn(v || null);
  const getContent = () => (bi.viewLang === "vi" ? bi.contentVi : bi.contentEn);
  const setContent = (v: string) => (bi.viewLang === "vi" ? bi.setContentVi(v) : bi.setContentEn(v));

  const processBannerFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", description: "Chỉ nhận file ảnh" });
      return;
    }
    if (file.size > UPLOAD_MAX_BANNER_SIZE) {
      toast({ variant: "destructive", description: "Ảnh tối đa 8MB" });
      return;
    }
    setBannerUploading(true);
    try {
      const url = await uploadToStorage(file, STORAGE_BUCKET, STORAGE_PATHS.eventBanners);
      setBannerUrl(url);
    } catch (err) {
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : "Upload thất bại"
      });
    } finally {
      setBannerUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processBannerFile(file);
    }
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: bi.titleVi,
      titleEn: bi.titleEn,
      description: bi.summaryVi || undefined,
      descriptionEn: bi.summaryEn ?? undefined,
      content: bi.contentVi || undefined,
      contentEn: bi.contentEn || undefined,
      sourceLanguage: bi.sourceLanguage,
      locationVi: locationVi || null,
      locationEn: locationEn || null,
      latitude,
      longitude,
      status: eventStatus,
      type: eventType,
      startAt,
      endAt: endAt || null,
      thumbnail: bannerUrl || null,
      images: imagesItems,
      postStatus
    };

    let postId = post?.id;

    if (isEdit && post) {
      const res = await adminUpdateEvent(post.id, payload);
      if (res.error) {
        toast({ variant: "destructive", description: res.error?.message });
        setLoading(false);
        return;
      }
    } else {
      const res = await adminCreateEvent({
        ...payload,
        endAt: payload.endAt ?? undefined
      });
      if (res.error) {
        toast({ variant: "destructive", description: res.error?.message });
        setLoading(false);
        return;
      }
      postId = (res.data?.payload as { id: string })?.id;
    }

    if (postId) {
      await adminSetPostTags(postId, tags);
    }

    toast({
      variant: "success",
      description: isEdit ? "Cập nhật sự kiện thành công!" : "Tạo sự kiện thành công!"
    });
    setLoading(false);
    router.push("/admin/posts");
  };

  const translateSrcFields = {
    title: bi.viewLang === "vi" ? bi.titleVi : bi.titleEn,
    summary: bi.viewLang === "vi" ? bi.summaryVi : bi.summaryEn,
    content: bi.viewLang === "vi" ? bi.contentVi : bi.contentEn
  };

  const statusLabel = (s: string) => {
    const m: Record<string, string> = {
      UPCOMING: "Sắp diễn ra",
      ONGOING: "Đang diễn ra",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy"
    };
    return m[s] ?? s;
  };

  const typeLabel = (t: string) => {
    const m: Record<string, string> = {
      ACADEMIC: "Cuộc thi học thuật",
      MEMBER_ACTIVITY: "Hoạt động thành viên",
      VOLUNTEER: "Hoạt động tình nguyện",
      SEMINAR: "Hội thảo / Seminar"
    };
    return m[t] ?? "Khác";
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between border-b pb-4'>
        <div className='flex items-center gap-3'>
          <Button className='h-9 w-9' onClick={() => router.push("/admin/posts")} size='icon' variant='outline'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='font-bold text-foreground text-lg'>{isEdit ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}</h1>
            <p className='text-muted-foreground text-xs'>
              Quản lý các thông tin chi tiết và thư viện ảnh của sự kiện clb tổ chức
            </p>
          </div>
        </div>
        <Button className='h-9' disabled={loading} form='event-form-main' type='submit'>
          {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
          Lưu sự kiện
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {}
        <form className='flex flex-col gap-6' id='event-form-main' onSubmit={handleSubmit}>
          {}
          <Card>
            <CardHeader className='py-3'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <LanguageToggle onChange={bi.setViewLang} sourceLanguage={bi.sourceLanguage} value={bi.viewLang} />
                <div className='flex items-center gap-3'>
                  <div className='flex items-center gap-1.5'>
                    <Label className='text-muted-foreground text-xs'>Ngôn ngữ gốc:</Label>
                    <Select
                      defaultValue={bi.sourceLanguage}
                      name='sourceLanguage'
                      onValueChange={(v) => bi.setSourceLanguage(v as "VI" | "EN")}
                    >
                      <SelectTrigger className='h-7 w-28 text-xs'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='VI'>🇻🇳 Tiếng Việt</SelectItem>
                        <SelectItem value='EN'>🇬🇧 English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <TranslateButton
                    disabled={!(translateSrcFields.title || translateSrcFields.content)}
                    fields={translateSrcFields}
                    from={bi.viewLang}
                    label={bi.viewLang === "vi" ? "Dịch → 🇬🇧" : "Dịch → 🇻🇳"}
                    onTranslated={handleTranslate}
                    to={otherLang}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Thông tin sự kiện</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4'>
              {}
              <div className='grid gap-1.5'>
                <Label>Banner / Ảnh bìa</Label>
                {bannerUrl ? (
                  <div className='relative aspect-video max-h-50 overflow-hidden rounded-lg border bg-muted'>
                    <Image alt='Banner' className='object-cover' fill sizes='400px' src={bannerUrl} />
                    <button
                      className='absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80'
                      onClick={() => setBannerUrl(null)}
                      title='Xóa banner'
                      type='button'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                ) : (
                  <button
                    className={`flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors disabled:opacity-50 ${isDragOver ? "border-primary bg-primary/10" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
                    disabled={bannerUploading}
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
                        processBannerFile(e.dataTransfer.files[0]);
                      }
                    }}
                    type='button'
                  >
                    {bannerUploading ? (
                      <>
                        <Loader2 className='h-5 w-5 animate-spin' />
                        <span className='text-xs'>Đang upload...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className='h-5 w-5' />
                        <span className='text-xs'>Upload banner (max 8MB)</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  accept='image/*'
                  className='hidden'
                  onChange={handleBannerUpload}
                  ref={fileInputRef}
                  title='Upload banner'
                  type='file'
                />
              </div>

              <div className='grid gap-1.5'>
                <Label htmlFor='title'>Tên sự kiện *</Label>
                <Input
                  id='title'
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Nhập tên sự kiện...'
                  required
                  value={getTitle()}
                />
              </div>

              <div className='grid gap-1.5'>
                <Label htmlFor='description'>Mô tả ngắn</Label>
                <Input
                  id='description'
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Mô tả ngắn gọn về sự kiện...'
                  value={getDescription()}
                />
              </div>

              <div className='grid gap-1.5'>
                <Label>Địa điểm</Label>
                <LocationPicker
                  initial={{
                    lat: post?.latitude,
                    lng: post?.longitude,
                    nameVi: post?.locationVi,
                    nameEn: post?.locationEn
                  }}
                  onChange={(data: LocationData | null) => {
                    if (data) {
                      setLocationVi(data.displayNameVi);
                      setLocationEn(data.displayNameEn);
                      setLatitude(data.lat);
                      setLongitude(data.lng);
                    } else {
                      setLocationVi("");
                      setLocationEn("");
                      setLatitude(null);
                      setLongitude(null);
                    }
                  }}
                  placeholder='Tìm kiếm địa điểm tổ chức sự kiện...'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='startAt'>Bắt đầu *</Label>
                  <Input
                    id='startAt'
                    onChange={(e) => setStartAt(e.target.value)}
                    required
                    type='date'
                    value={startAt}
                  />
                </div>
                <div className='grid gap-1.5'>
                  <Label htmlFor='endAt'>Kết thúc</Label>
                  <Input id='endAt' onChange={(e) => setEndAt(e.target.value)} type='date' value={endAt} />
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='postStatus'>Trạng thái hiển thị *</Label>
                  <Select onValueChange={setPostStatus} value={postStatus}>
                    <SelectTrigger className='h-9 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='DRAFT'>Nháp</SelectItem>
                      <SelectItem value='PENDING_REVIEW'>Chờ duyệt</SelectItem>
                      <SelectItem value='PUBLISHED'>Xuất bản</SelectItem>
                      <SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-1.5'>
                  <Label htmlFor='status'>Trạng thái sự kiện</Label>
                  <Select onValueChange={setEventStatus} value={eventStatus}>
                    <SelectTrigger className='h-9 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='UPCOMING'>Sắp diễn ra</SelectItem>
                      <SelectItem value='ONGOING'>Đang diễn ra</SelectItem>
                      <SelectItem value='COMPLETED'>Hoàn thành</SelectItem>
                      <SelectItem value='CANCELLED'>Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-1.5'>
                  <Label htmlFor='type'>Loại sự kiện</Label>
                  <Select onValueChange={setEventType} value={eventType}>
                    <SelectTrigger className='h-9 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='ACADEMIC'>Cuộc thi học thuật</SelectItem>
                      <SelectItem value='MEMBER_ACTIVITY'>Hoạt động thành viên</SelectItem>
                      <SelectItem value='VOLUNTEER'>Hoạt động tình nguyện</SelectItem>
                      <SelectItem value='SEMINAR'>Hội thảo / Seminar</SelectItem>
                      <SelectItem value='OTHER'>Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='border-t pt-4'>
                <TagInput onChange={setTags} selectedTags={tags} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Nội dung chi tiết (Markdown)</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4'>
              <div className='grid gap-1.5'>
                <MarkdownEditor
                  defaultValue={getContent()}
                  key={bi.viewLang}
                  minHeight='300px'
                  name='content'
                  onChange={setContent}
                  placeholder='Nội dung chi tiết sự kiện (Markdown)...'
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Thư viện ảnh bổ sung (Gallery)</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiImageUpload
                initialImages={imagesItems}
                label='Hình ảnh sự kiện'
                maxImages={15}
                onChange={setImagesItems}
                storagePath='events/gallery'
              />
            </CardContent>
          </Card>
        </form>

        {}
        <div className='sticky top-6 hidden max-h-[calc(100vh-80px)] flex-col gap-4 overflow-y-auto rounded-xl border bg-background/50 p-6 backdrop-blur-md lg:flex'>
          <div className='flex items-center justify-between border-b pb-2'>
            <h2 className='font-bold text-muted-foreground text-sm uppercase tracking-wider'>Xem trước giao diện</h2>
            <LanguageToggle onChange={bi.setViewLang} sourceLanguage={bi.sourceLanguage} value={bi.viewLang} />
          </div>

          <div className='space-y-6'>
            {bannerUrl && (
              <div className='relative aspect-video w-full overflow-hidden rounded-lg border bg-muted'>
                <Image alt='Banner preview' className='object-cover' fill sizes='500px' src={bannerUrl} />
              </div>
            )}

            <div>
              <div className='mb-2 flex items-center gap-2'>
                <Badge variant='outline'>{statusLabel(eventStatus)}</Badge>
                <Badge variant='secondary'>{typeLabel(eventType)}</Badge>
              </div>
              <h1 className='font-bold text-2xl text-foreground'>{displayTitle || "Tên sự kiện hiển thị ở đây"}</h1>

              {tags.length > 0 && (
                <div className='mt-2 flex flex-wrap gap-1.5'>
                  {tags.map((t) => (
                    <Badge className='px-2 py-0.5 font-medium text-[10px]' key={t} variant='secondary'>
                      #{t}
                    </Badge>
                  ))}
                </div>
              )}

              {displayLocation && <p className='mt-2 text-muted-foreground text-xs'>📍 {displayLocation}</p>}
              {startAt && (
                <p className='text-muted-foreground text-xs'>
                  🗓 {new Date(startAt).toLocaleDateString("vi-VN")}
                  {endAt && ` → ${new Date(endAt).toLocaleDateString("vi-VN")}`}
                </p>
              )}
              {displayDescription && (
                <p className='mt-3 border-l-2 pl-3 text-muted-foreground text-sm italic leading-relaxed'>
                  {displayDescription}
                </p>
              )}
            </div>

            {previewContent ? (
              <div className='border-t pt-4'>
                <MarkdownContent content={previewContent} />
              </div>
            ) : (
              <div className='border-t pt-4 text-center text-muted-foreground text-xs italic'>
                Nội dung chi tiết (Markdown) sẽ được hiển thị ở đây...
              </div>
            )}

            {imagesItems.length > 0 && (
              <div className='space-y-2 border-t pt-4'>
                <h3 className='font-bold text-muted-foreground text-xs uppercase tracking-wider'>
                  Thư viện ảnh ({imagesItems.length})
                </h3>
                <div className='grid grid-cols-3 gap-2'>
                  {imagesItems.map((item, i) => (
                    <div className='relative aspect-square overflow-hidden rounded-md border bg-muted' key={item.url}>
                      <Image alt={`Gallery preview ${i}`} className='object-cover' fill sizes='150px' src={item.url} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
