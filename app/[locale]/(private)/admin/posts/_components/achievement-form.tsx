"use client";

import { ArrowLeft, ImagePlus, Loader2, Save, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  adminCreateAchievement,
  adminLinkAchievementMember,
  adminSetPostTags,
  adminUnlinkAchievementMember,
  adminUpdateAchievement,
  adminUpdateAchievementMember
} from "@/app/_actions/admin";
import { LanguageToggle, type ViewLanguage } from "@/components/custom/language-toggle";
import { TranslateButton } from "@/components/forms/translate-button";
import { useBilingualForm } from "@/components/forms/use-bilingual-form";
import type { LocationData } from "@/components/location-picker";
import { LocationPicker } from "@/components/location-picker";
import { MarkdownContent } from "@/components/markdown-content";
import { MarkdownEditor } from "@/components/markdown-editor";
import { type LinkedMember, type MemberOption, MemberSelector } from "@/components/member-selector";
import { type ImageItem, MultiImageUpload } from "@/components/multi-image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { STORAGE_BUCKET, STORAGE_PATHS } from "@/constants/storage";
import { UPLOAD_MAX_IMAGE_SIZE } from "@/constants/upload";
import { useToast } from "@/hooks/use-toast";
import { getFullName, pickLang } from "@/lib/utils";
import { uploadToStorage } from "@/services/supabase-upload";
import type { PostRow } from "../columns";
import { TagInput } from "./tag-input";

type Props = {
  post?: PostRow | null;
  allMembers?: MemberOption[];
};

export function AchievementForm({ post, allMembers = [] }: Props) {
  const isEdit = !!post;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Bilingual form state
  const bi = useBilingualForm(post);

  const displayTitle = pickLang(bi.viewLang, bi.titleVi, bi.titleEn);
  const displaySummary = pickLang(bi.viewLang, bi.summaryVi, bi.summaryEn) ?? "";
  const displayContent = pickLang(bi.viewLang, bi.contentVi, bi.contentEn);
  const otherLang: ViewLanguage = bi.viewLang === "vi" ? "en" : "vi";

  const [date, setDate] = useState(
    post?.achievementDate ? new Date(post.achievementDate).toISOString().split("T")[0] : ""
  );
  const [achievementType, setAchievementType] = useState(post?.achievementType ?? "TEAM");
  const [isHighlight, setIsHighlight] = useState(post?.isHighlight ?? false);
  const [relatedUrl, setRelatedUrl] = useState(post?.relatedUrl ?? "");
  const [locationVi, setLocationVi] = useState(post?.locationVi ?? "");
  const [locationEn, setLocationEn] = useState(post?.locationEn ?? "");
  const [latitude, setLatitude] = useState<number | null>(post?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(post?.longitude ?? null);
  const displayLocation = pickLang(bi.viewLang, locationVi, locationEn);
  const [tags, setTags] = useState<string[]>(post?.tags?.map((t) => t.tag.name) ?? []);
  const [postStatus, setPostStatus] = useState(post?.status ?? "PUBLISHED");

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(post?.thumbnail ?? null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [linked, setLinked] = useState<LinkedMember[]>([]);
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

  const [previewContent, setPreviewContent] = useState(displayContent);

  useEffect(() => {
    const handler = setTimeout(() => setPreviewContent(displayContent), 400);
    return () => clearTimeout(handler);
  }, [displayContent]);

  // ── Getters/setters for current view language ──
  const getTitle = () => (bi.viewLang === "vi" ? bi.titleVi : bi.titleEn);
  const setTitle = (v: string) => (bi.viewLang === "vi" ? bi.setTitleVi(v) : bi.setTitleEn(v));
  const getSummary = () => (bi.viewLang === "vi" ? (bi.summaryVi ?? "") : (bi.summaryEn ?? ""));
  const setSummary = (v: string) => (bi.viewLang === "vi" ? bi.setSummaryVi(v || null) : bi.setSummaryEn(v || null));
  const getContent = () => (bi.viewLang === "vi" ? bi.contentVi : bi.contentEn);
  const setContent = (v: string) => (bi.viewLang === "vi" ? bi.setContentVi(v) : bi.setContentEn(v));

  const processThumbnailFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", description: "Chỉ chấp nhận file ảnh" });
      return;
    }
    if (file.size > UPLOAD_MAX_IMAGE_SIZE) {
      toast({ variant: "destructive", description: "Ảnh tối đa 5MB" });
      return;
    }
    setThumbnailUploading(true);
    try {
      const url = await uploadToStorage(file, STORAGE_BUCKET, STORAGE_PATHS.achievements);
      setThumbnailUrl(url);
    } catch {
      toast({ variant: "destructive", description: "Upload ảnh thất bại" });
    } finally {
      setThumbnailUploading(false);
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = "";
      }
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processThumbnailFile(file);
    }
  };

  // Sync linked members when post changes
  useEffect(() => {
    if (post?.members) {
      setLinked(
        post.members.map((m) => ({
          member: {
            id: m.member.id,
            firstName: m.member.firstName,
            lastName: m.member.lastName,
            avatar: m.member.avatar ?? null,
            studentId: null,
            webRole: ""
          } as MemberOption,
          role: m.role ?? null,
          imageUrl: m.imageUrl ?? null
        }))
      );
    } else {
      setLinked([]);
    }
    setThumbnailUrl(post?.thumbnail ?? null);
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

  const handleLink = async (member: MemberOption, role: string) => {
    if (!post) {
      setLinked((prev) => [...prev, { member, role: role || null, imageUrl: null }]);
      return;
    }
    const res = await adminLinkAchievementMember(post.id, member.id, role || undefined, undefined, null);
    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
      return;
    }
    setLinked((prev) => [...prev, { member, role: role || null, imageUrl: null }]);
  };

  const handleUpdate = async (memberId: string, updates: Partial<LinkedMember>) => {
    if (!post) {
      setLinked((prev) => prev.map((l) => (l.member.id === memberId ? { ...l, ...updates } : l)));
      return;
    }
    const dbUpdates: {
      role?: string | null;
      prize?: string | null;
      imageUrl?: string | null;
    } = {};
    if (updates.role !== undefined) {
      dbUpdates.role = updates.role;
    }
    if (updates.imageUrl !== undefined) {
      dbUpdates.imageUrl = updates.imageUrl;
    }

    const res = await adminUpdateAchievementMember(post.id, memberId, dbUpdates);
    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
      return;
    }
    setLinked((prev) => prev.map((l) => (l.member.id === memberId ? { ...l, ...updates } : l)));
  };

  const handleUnlink = async (memberId: string) => {
    if (post) {
      const res = await adminUnlinkAchievementMember(post.id, memberId);
      if (res.error) {
        toast({ variant: "destructive", description: res.error?.message });
        return;
      }
    }
    setLinked((prev) => prev.filter((l) => l.member.id !== memberId));
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
      summary: bi.summaryVi || undefined,
      summaryEn: bi.summaryEn ?? undefined,
      content: bi.contentVi || undefined,
      contentEn: bi.contentEn || undefined,
      sourceLanguage: bi.sourceLanguage,
      thumbnail: thumbnailUrl || undefined,
      date,
      type: achievementType,
      isHighlight,
      relatedUrl: relatedUrl || undefined,
      locationVi: locationVi || null,
      locationEn: locationEn || null,
      latitude,
      longitude,
      images: imagesItems,
      postStatus
    };

    let entityId: string | null = post?.id ?? null;

    if (isEdit && post) {
      const res = await adminUpdateAchievement(post.id, payload);
      if (res.error) {
        toast({ variant: "destructive", description: res.error?.message });
        setLoading(false);
        return;
      }
    } else {
      const res = await adminCreateAchievement(payload);
      if (res.error) {
        toast({ variant: "destructive", description: res.error?.message });
        setLoading(false);
        return;
      }
      entityId = (res.data?.payload as { id: string })?.id;
    }

    if (entityId) {
      // Link members for new achievements
      if (!isEdit) {
        for (const l of linked) {
          await adminLinkAchievementMember(entityId, l.member.id, l.role ?? undefined, undefined, l.imageUrl);
        }
      }
      await adminSetPostTags(entityId, tags);
    }

    toast({
      variant: "success",
      description: isEdit ? "Cập nhật thành tựu thành công!" : "Tạo thành tựu thành công!"
    });
    setLoading(false);
    router.push("/admin/posts");
  };

  const translateSrcFields = {
    title: bi.viewLang === "vi" ? bi.titleVi : bi.titleEn,
    summary: bi.viewLang === "vi" ? bi.summaryVi : bi.summaryEn,
    content: bi.viewLang === "vi" ? bi.contentVi : bi.contentEn
  };

  const typeLabel = (t: string) => {
    const m: Record<string, string> = {
      INDIVIDUAL: "Cá nhân",
      TEAM: "Nhóm",
      CLUB: "Toàn CLB"
    };
    return m[t] ?? t;
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between border-b pb-4'>
        <div className='flex items-center gap-3'>
          <Button className='h-9 w-9' onClick={() => router.push("/admin/posts")} size='icon' variant='outline'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='font-bold text-foreground text-lg'>
              {isEdit ? "Chỉnh sửa thành tựu" : "Tạo thành tựu mới"}
            </h1>
            <p className='text-muted-foreground text-xs'>Ghi nhận thành tích cá nhân, nhóm hoặc câu lạc bộ</p>
          </div>
        </div>
        <Button className='h-9' disabled={loading} form='achievement-form-main' type='submit'>
          {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
          Lưu thành tựu
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Left: Editor */}
        <form className='flex flex-col gap-6' id='achievement-form-main' onSubmit={handleSubmit}>
          {/* ── Language controls ── */}
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
              <CardTitle className='font-semibold text-sm'>Thông tin thành tựu</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4'>
              {/* Thumbnail Upload */}
              <div className='grid gap-1.5'>
                <Label>Ảnh đại diện thành tựu</Label>
                {thumbnailUrl ? (
                  <div className='relative aspect-video max-h-50 overflow-hidden rounded-lg border bg-muted'>
                    <Image alt='Achievement' className='object-cover' fill sizes='400px' src={thumbnailUrl} />
                    <button
                      className='absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80'
                      onClick={() => setThumbnailUrl(null)}
                      title='Xóa ảnh'
                      type='button'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                ) : (
                  <button
                    className={`flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors disabled:opacity-50 ${isDragOver ? "border-primary bg-primary/10" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
                    disabled={thumbnailUploading}
                    onClick={() => thumbnailInputRef.current?.click()}
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
                        <span className='text-xs'>Upload ảnh (max 5MB)</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  accept='image/*'
                  className='hidden'
                  onChange={handleThumbnailUpload}
                  ref={thumbnailInputRef}
                  type='file'
                />
              </div>

              {/* Bilingual title */}
              <div className='grid gap-1.5'>
                <Label htmlFor='title'>Tiêu đề *</Label>
                <Input
                  id='title'
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Nhập tiêu đề thành tựu...'
                  required
                  value={getTitle()}
                />
              </div>

              {/* Bilingual summary (annotation/giải chú thích) */}
              <div className='grid gap-1.5'>
                <Label htmlFor='summary'>Giải chú thích / Mô tả ngắn</Label>
                <Input
                  id='summary'
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder='Mô tả ngắn gọn, giải thích thành tựu...'
                  value={getSummary()}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='date'>Ngày đạt thành tựu</Label>
                  <Input id='date' onChange={(e) => setDate(e.target.value)} type='date' value={date} />
                </div>
                <div className='grid gap-1.5'>
                  <Label htmlFor='relatedUrl'>Liên kết liên quan</Label>
                  <Input
                    id='relatedUrl'
                    onChange={(e) => setRelatedUrl(e.target.value)}
                    placeholder='https://...'
                    type='url'
                    value={relatedUrl}
                  />
                </div>
              </div>

              <div className='grid gap-1.5'>
                <Label>Địa điểm (không bắt buộc)</Label>
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
                  placeholder='Tìm kiếm địa điểm liên quan đến thành tựu...'
                />
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='type'>Loại thành tựu</Label>
                  <Select onValueChange={setAchievementType} value={achievementType}>
                    <SelectTrigger className='h-9 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='INDIVIDUAL'>Cá nhân</SelectItem>
                      <SelectItem value='TEAM'>Nhóm</SelectItem>
                      <SelectItem value='CLUB'>Toàn CLB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-1.5'>
                  <Label htmlFor='postStatus'>Trạng thái hiển thị</Label>
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
                <div className='flex items-end pb-2'>
                  <Label className='flex items-center gap-2 text-xs'>
                    <input
                      checked={isHighlight}
                      className='h-4 w-4 rounded border-gray-300'
                      onChange={(e) => setIsHighlight(e.target.checked)}
                      type='checkbox'
                    />
                    Nổi bật (Highlight)
                  </Label>
                </div>
              </div>

              <Separator />

              <div>
                <Label className='mb-2 block text-sm'>Thành viên được tuyên dương</Label>
                <MemberSelector
                  allMembers={allMembers}
                  linked={linked}
                  onLink={handleLink}
                  onUnlink={handleUnlink}
                  onUpdate={handleUpdate}
                />
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
                  placeholder='Nội dung chi tiết thành tựu (Markdown)...'
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
                label='Hình ảnh thành tựu'
                maxImages={15}
                onChange={setImagesItems}
                storagePath='achievements/gallery'
              />
            </CardContent>
          </Card>
        </form>

        {/* Right: Live Preview */}
        <div className='sticky top-6 hidden max-h-[calc(100vh-80px)] flex-col gap-4 overflow-y-auto rounded-xl border bg-background/50 p-6 backdrop-blur-md lg:flex'>
          <div className='flex items-center justify-between border-b pb-2'>
            <h2 className='font-bold text-muted-foreground text-sm uppercase tracking-wider'>Xem trước giao diện</h2>
            <LanguageToggle onChange={bi.setViewLang} sourceLanguage={bi.sourceLanguage} value={bi.viewLang} />
          </div>

          <div className='space-y-6'>
            {thumbnailUrl && (
              <div className='relative aspect-video w-full overflow-hidden rounded-lg border bg-muted'>
                <Image alt='Achievement preview' className='object-cover' fill sizes='500px' src={thumbnailUrl} />
              </div>
            )}

            <div>
              <div className='mb-2 flex items-center gap-2'>
                <Badge variant='outline'>{typeLabel(achievementType)}</Badge>
                {isHighlight && <Badge className='border-amber-500/20 bg-amber-500/10 text-amber-600'>Nổi bật</Badge>}
              </div>
              <h1 className='font-bold text-2xl text-foreground'>
                {displayTitle || "Tiêu đề thành tựu hiển thị ở đây"}
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

              {date && (
                <p className='mt-2 text-muted-foreground text-xs'>📅 {new Date(date).toLocaleDateString("vi-VN")}</p>
              )}

              {displayLocation && <p className='mt-2 text-muted-foreground text-xs'>📍 {displayLocation}</p>}

              {/* Linked members preview */}
              {linked.length > 0 && (
                <div className='mt-3 flex flex-wrap gap-2'>
                  {linked.map((l) => (
                    <Badge className='text-xs' key={l.member.id} variant='secondary'>
                      {getFullName(l.member.firstName, l.member.middleName, l.member.lastName, "vi")}
                      {l.role ? ` — ${l.role}` : ""}
                    </Badge>
                  ))}
                </div>
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
