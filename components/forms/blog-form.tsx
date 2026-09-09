"use client";

import { ArrowLeft, ImagePlus, Loader2, Save, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LanguageToggle, type ViewLanguage } from "@/components/custom/language-toggle";
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
import { TagInput } from "./tag-input";
import { TranslateButton } from "./translate-button";
import { useBilingualForm } from "./use-bilingual-form";

export type BlogFormData = {
  id?: string;
  titleVi: string;
  titleEn: string;
  slug: string;
  status: string;
  type: string;
  summaryVi: string | null;
  summaryEn: string | null;
  contentVi: string;
  contentEn: string;
  sourceLanguage: "VI" | "EN";
  thumbnail?: string | null;
  tags?: Array<{ tag: { id: string; name: string; slug: string } }>;
  gallery?: Array<{
    url: string;
    title?: string;
    caption?: string;
    type: string;
  }>;
  images?: string[];
};

export type BlogFormPayload = {
  title: string;
  titleEn?: string;
  summary?: string;
  summaryEn?: string;
  content: string;
  contentEn?: string;
  sourceLanguage?: "VI" | "EN";
  thumbnail?: string | null;
  status: string;
  images: ImageItem[];
  activityId?: string | null;
};

type Props = {
  post?: BlogFormData | null;
  onCreate: (payload: BlogFormPayload) => Promise<string | undefined>;
  onUpdate: (id: string, payload: BlogFormPayload) => Promise<void>;
  onSetTags: (postId: string, tags: string[]) => Promise<void>;
  backUrl?: string;
  onSuccess?: () => void;
  /** When false, hides PUBLISHED option — for regular users who can only submit DRAFT or PENDING_REVIEW */
  showPublishedOption?: boolean;
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: BlogForm manages rich blog editor state
export function BlogForm({
  post,
  onCreate,
  onUpdate,
  onSetTags,
  backUrl,
  onSuccess,
  showPublishedOption = true
}: Props) {
  const isEdit = !!post;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const bi = useBilingualForm(post);

  const displayTitle = pickLang(bi.viewLang, bi.titleVi, bi.titleEn);
  const displaySummary = pickLang(bi.viewLang, bi.summaryVi, bi.summaryEn) ?? "";
  const displayContent = pickLang(bi.viewLang, bi.contentVi, bi.contentEn);
  const otherLang: ViewLanguage = bi.viewLang === "vi" ? "en" : "vi";

  const [tags, setTags] = useState<string[]>(post?.tags?.map((t) => t.tag.name) ?? []);
  const initialAdditionalImages = post?.gallery
    ? post.gallery.filter((g) => g.type === "ADDITIONAL")
    : (post?.images ?? []).map((url: string) => ({
        url,
        title: "",
        caption: ""
      }));
  const [imagesItems, setImagesItems] = useState<ImageItem[]>(initialAdditionalImages);

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(post?.thumbnail ?? null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewContent, setPreviewContent] = useState(displayContent);

  useEffect(() => {
    const handler = setTimeout(() => setPreviewContent(displayContent), 400);
    return () => clearTimeout(handler);
  }, [displayContent]);

  useEffect(() => {
    setThumbnailUrl(post?.thumbnail ?? null);
    const additional = post?.gallery
      ? post.gallery.filter((g) => g.type === "ADDITIONAL")
      : (post?.images ?? []).map((url: string) => ({
          url,
          title: "",
          caption: ""
        }));
    setImagesItems(additional);
    setTags(post?.tags?.map((t) => t.tag.name) ?? []);
  }, [post]);

  const getTitle = () => (bi.viewLang === "vi" ? bi.titleVi : bi.titleEn);
  const setTitle = (v: string) => (bi.viewLang === "vi" ? bi.setTitleVi(v) : bi.setTitleEn(v));
  const getSummary = () => (bi.viewLang === "vi" ? (bi.summaryVi ?? "") : (bi.summaryEn ?? ""));
  const setSummary = (v: string) => (bi.viewLang === "vi" ? bi.setSummaryVi(v || null) : bi.setSummaryEn(v || null));
  const getContent = () => (bi.viewLang === "vi" ? bi.contentVi : bi.contentEn);
  const setContent = (v: string) => (bi.viewLang === "vi" ? bi.setContentVi(v) : bi.setContentEn(v));

  const processThumbnailFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", description: "Chỉ nhận file ảnh" });
      return;
    }
    if (file.size > UPLOAD_MAX_BANNER_SIZE) {
      toast({ variant: "destructive", description: "Ảnh tối đa 8MB" });
      return;
    }
    setThumbnailUploading(true);
    try {
      const url = await uploadToStorage(file, STORAGE_BUCKET, STORAGE_PATHS.blogThumbnails);
      setThumbnailUrl(url);
    } catch (err) {
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : "Upload thất bại"
      });
    } finally {
      setThumbnailUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processThumbnailFile(file);
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

    const fd = new FormData(e.currentTarget);
    const payload: BlogFormPayload = {
      title: bi.titleVi,
      titleEn: bi.titleEn,
      summary: bi.summaryVi ?? undefined,
      summaryEn: bi.summaryEn ?? undefined,
      content: bi.contentVi,
      contentEn: bi.contentEn,
      sourceLanguage: bi.sourceLanguage,
      thumbnail: thumbnailUrl,
      status: fd.get("status") as string,
      images: imagesItems
    };

    try {
      let postId = post?.id;

      if (isEdit && post?.id) {
        await onUpdate(post.id, payload);
      } else {
        postId = await onCreate(payload);
      }

      if (postId) {
        await onSetTags(postId, tags);
      }

      toast({
        variant: "success",
        description: isEdit ? "Cập nhật bài viết thành công!" : "Tạo bài viết thành công!"
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : "Lỗi"
      });
    } finally {
      setLoading(false);
    }
  };

  const translateSrcFields = {
    title: bi.viewLang === "vi" ? bi.titleVi : bi.titleEn,
    summary: bi.viewLang === "vi" ? bi.summaryVi : bi.summaryEn,
    content: bi.viewLang === "vi" ? bi.contentVi : bi.contentEn
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between border-b pb-4'>
        <div className='flex items-center gap-3'>
          {backUrl && (
            <a href={backUrl}>
              <Button className='h-9 w-9' size='icon' type='button' variant='outline'>
                <ArrowLeft className='h-4 w-4' />
              </Button>
            </a>
          )}
          <div>
            <h1 className='font-bold text-foreground text-lg'>{isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}</h1>
            <p className='text-muted-foreground text-xs'>
              Soạn thảo bài đăng tin tức, blog hoặc chia sẻ kiến thức của câu lạc bộ
            </p>
          </div>
        </div>
        <Button className='h-9' disabled={loading} form='blog-form-main' type='submit'>
          {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
          Lưu bài viết
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {}
        <form className='flex flex-col gap-6' id='blog-form-main' onSubmit={handleSubmit}>
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
              <CardTitle className='font-semibold text-sm'>Thông tin bài viết</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4'>
              <div className='grid gap-1.5'>
                <Label>Ảnh bìa (Thumbnail)</Label>
                {thumbnailUrl ? (
                  <div className='relative aspect-video max-h-50 overflow-hidden rounded-lg border bg-muted'>
                    <Image alt='Thumbnail' className='object-cover' fill sizes='400px' src={thumbnailUrl} />
                    <button
                      className='absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80'
                      onClick={() => setThumbnailUrl(null)}
                      title='Xóa ảnh bìa'
                      type='button'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                ) : (
                  <button
                    className={`flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors disabled:opacity-50 ${isDragOver ? "border-primary bg-primary/10" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
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
                        <span className='text-xs'>Upload ảnh bìa (max 8MB)</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  accept='image/*'
                  className='hidden'
                  onChange={handleThumbnailUpload}
                  ref={fileInputRef}
                  type='file'
                />
              </div>

              <div className='grid gap-1.5'>
                <div className='flex items-center gap-2'>
                  <Label htmlFor='title'>Tiêu đề *</Label>
                  {bi.viewLang === "vi" && !bi.titleVi && bi.titleEn && (
                    <span className='rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-600'>
                      Đang hiển thị tiếng Anh (fallback)
                    </span>
                  )}
                  {bi.viewLang === "en" && !bi.titleEn && bi.titleVi && (
                    <span className='rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-600'>
                      Showing Vietnamese (fallback)
                    </span>
                  )}
                </div>
                <Input
                  id='title'
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Nhập tiêu đề bài viết...'
                  required
                  value={getTitle()}
                />
              </div>

              <div className='grid gap-1.5'>
                <div className='flex items-center gap-2'>
                  <Label htmlFor='summary'>Tóm tắt</Label>
                  {bi.viewLang === "vi" && !bi.summaryVi && bi.summaryEn && (
                    <span className='rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-600'>fallback</span>
                  )}
                  {bi.viewLang === "en" && !bi.summaryEn && bi.summaryVi && (
                    <span className='rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-600'>fallback</span>
                  )}
                </div>
                <Input
                  id='summary'
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder='Tóm tắt ngắn gọn nội dung...'
                  value={getSummary()}
                />
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
                  placeholder='Nội dung bài viết (Markdown GFM)...'
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Phân loại & Xuất bản</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4'>
              <div className='grid max-w-xs gap-1.5'>
                <Label htmlFor='status'>Trạng thái</Label>
                <Select defaultValue={post?.status ?? "DRAFT"} name='status'>
                  <SelectTrigger className='h-9 text-xs'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='DRAFT'>Nháp</SelectItem>
                    <SelectItem value='PENDING_REVIEW'>Chờ xét duyệt</SelectItem>
                    {showPublishedOption && <SelectItem value='PUBLISHED'>Xuất bản</SelectItem>}
                    <SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='border-t pt-4'>
                <TagInput onChange={setTags} selectedTags={tags} />
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
                label='Hình ảnh trong thư viện'
                maxImages={15}
                onChange={setImagesItems}
                storagePath='blogs/gallery'
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
            {thumbnailUrl && (
              <div className='relative aspect-video w-full overflow-hidden rounded-lg border bg-muted'>
                <Image alt='Thumbnail preview' className='object-cover' fill sizes='500px' src={thumbnailUrl} />
              </div>
            )}
            <div>
              <h1 className='font-bold text-2xl text-foreground'>
                {displayTitle || "Tiêu đề bài viết hiển thị ở đây"}
              </h1>
              {tags.length > 0 && (
                <div className='mt-2 flex flex-wrap gap-1.5'>
                  {tags.map((t) => (
                    <Badge className='px-2 py-0.5 font-medium text-[10px]' key={t} variant='secondary'>
                      #{t}
                    </Badge>
                  ))}
                </div>
              )}
              {displaySummary && (
                <p className='mt-3 border-l-2 pl-3 text-muted-foreground text-sm italic leading-relaxed'>
                  {displaySummary}
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
