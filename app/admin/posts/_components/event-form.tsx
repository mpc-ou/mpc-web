"use client";

import { Calendar, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminCreateEvent, adminSetPostTags, adminUpdateEvent } from "@/app/_actions/admin";
import type { ViewLanguage } from "@/components/custom/language-toggle";
import type { EditorFormatActions } from "@/components/forms/editor-floating-menus";
import { PreviewDrawer } from "@/components/forms/preview-drawer";
import { UnifiedDocumentCanvas } from "@/components/forms/unified-document-canvas";
import { useBilingualForm } from "@/components/forms/use-bilingual-form";
import { useWorkspaceHistory } from "@/components/forms/use-workspace-history";
import { type ActiveField, type EditorMode, WorkspaceTopToolbar } from "@/components/forms/workspace-top-toolbar";
import { type LocationData, LocationPicker } from "@/components/location-picker";
import { type ImageItem, MultiImageUpload } from "@/components/multi-image-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STORAGE_BUCKET, STORAGE_PATHS } from "@/constants/storage";
import { useToast } from "@/hooks/use-toast";
import { pickLang } from "@/lib/utils";
import type { PostRow } from "../columns";
import { TagInput } from "./tag-input";

type Props = {
  post?: PostRow | null;
};

const NOOP_FORMAT_ACTIONS: EditorFormatActions = {
  insertWrap: () => undefined,
  insertAlignment: () => undefined,
  insertColor: () => undefined,
  insertTable: () => undefined,
  triggerImageUpload: () => undefined
};

function deriveEventGallery(post?: PostRow | null): ImageItem[] {
  if (post?.gallery) {
    return post.gallery
      .filter((g) => g.type === "ADDITIONAL")
      .map((g) => ({ url: g.url, title: g.title ?? undefined, caption: g.caption ?? undefined }));
  }
  return (post?.images ?? []).map((url: string) => ({
    url,
    title: "",
    caption: ""
  }));
}

function buildEventPayload(params: {
  bi: ReturnType<typeof useBilingualForm>;
  locationVi: string;
  locationEn: string;
  latitude: number | null;
  longitude: number | null;
  eventStatus: string;
  eventType: string;
  startAt: string;
  endAt: string;
  bannerUrl: string | null;
  imagesItems: ImageItem[];
  postStatus: string;
}) {
  return {
    title: params.bi.titleVi,
    titleEn: params.bi.titleEn,
    description: params.bi.summaryVi || undefined,
    descriptionEn: params.bi.summaryEn ?? undefined,
    content: params.bi.contentVi || undefined,
    contentEn: params.bi.contentEn || undefined,
    sourceLanguage: params.bi.sourceLanguage,
    locationVi: params.locationVi || null,
    locationEn: params.locationEn || null,
    latitude: params.latitude,
    longitude: params.longitude,
    status: params.eventStatus,
    type: params.eventType,
    startAt: params.startAt,
    endAt: params.endAt || null,
    thumbnail: params.bannerUrl || null,
    images: params.imagesItems,
    postStatus: params.postStatus
  };
}

async function saveEvent(
  isEdit: boolean,
  postId: string | undefined,
  payload: ReturnType<typeof buildEventPayload>,
  tags: string[]
) {
  let targetId = postId;
  if (isEdit && postId) {
    const res = await adminUpdateEvent(postId, payload);
    if (res.error) {
      return { error: res.error.message };
    }
  } else {
    const res = await adminCreateEvent({
      ...payload,
      endAt: payload.endAt ?? undefined
    });
    if (res.error) {
      return { error: res.error.message };
    }
    targetId = (res.data?.payload as { id: string })?.id;
  }

  if (targetId) {
    await adminSetPostTags(targetId, tags);
  }
  return { error: null };
}

function statusLabel(s: string) {
  const m: Record<string, string> = {
    UPCOMING: "Sắp diễn ra",
    ONGOING: "Đang diễn ra",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy"
  };
  return m[s] ?? s;
}

function typeLabel(t: string) {
  const m: Record<string, string> = {
    ACADEMIC: "Cuộc thi học thuật",
    MEMBER_ACTIVITY: "Hoạt động thành viên",
    VOLUNTEER: "Hoạt động tình nguyện",
    SEMINAR: "Hội thảo / Seminar"
  };
  return m[t] ?? "Khác";
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: EventForm manages event state, workspace undo/redo, and 7:3 layout
export function EventForm({ post }: Props) {
  const isEdit = !!post;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const bi = useBilingualForm(post);
  const otherLang: ViewLanguage = bi.viewLang === "vi" ? "en" : "vi";

  const [locationVi, setLocationVi] = useState(post?.locationVi ?? "");
  const [locationEn, setLocationEn] = useState(post?.locationEn ?? "");
  const [latitude, setLatitude] = useState<number | null>(post?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(post?.longitude ?? null);
  const [startAt, setStartAt] = useState(post?.startAt ? new Date(post.startAt).toISOString().split("T")[0] : "");
  const [endAt, setEndAt] = useState(post?.endAt ? new Date(post.endAt).toISOString().split("T")[0] : "");
  const [eventStatus, setEventStatus] = useState(post?.eventStatus ?? "UPCOMING");
  const [eventType, setEventType] = useState(post?.eventType ?? "OTHER");
  const [tags, setTags] = useState<string[]>(post?.tags?.map((t) => t.tag.name) ?? []);
  const [postStatus, setPostStatus] = useState(post?.status ?? "PUBLISHED");
  const [bannerUrl, setBannerUrl] = useState<string | null>(post?.thumbnail ?? null);
  const [imagesItems, setImagesItems] = useState<ImageItem[]>(() => deriveEventGallery(post));

  const [activeField, setActiveField] = useState<ActiveField>("content");
  const [editorMode, setEditorMode] = useState<EditorMode>("preview-edit");
  const [formatActions, setFormatActions] = useState<EditorFormatActions>(NOOP_FORMAT_ACTIONS);
  const [uploadingState, setUploadingState] = useState<{ uploading: boolean; percent: number | null }>({
    uploading: false,
    percent: null
  });

  useEffect(() => {
    setBannerUrl(post?.thumbnail ?? null);
    setImagesItems(deriveEventGallery(post));
    setTags(post?.tags?.map((t) => t.tag.name) ?? []);
    setPostStatus(post?.status ?? "PUBLISHED");
  }, [post]);

  // Global Workspace Snapshot for Undo/Redo
  const workspaceSnapshot = useMemo(
    () => ({
      titleVi: bi.titleVi,
      titleEn: bi.titleEn,
      summaryVi: bi.summaryVi,
      summaryEn: bi.summaryEn,
      contentVi: bi.contentVi,
      contentEn: bi.contentEn,
      sourceLanguage: bi.sourceLanguage,
      locationVi,
      locationEn,
      latitude,
      longitude,
      startAt,
      endAt,
      eventStatus,
      eventType,
      tags,
      postStatus,
      bannerUrl,
      imagesItems
    }),
    [
      bi.titleVi,
      bi.titleEn,
      bi.summaryVi,
      bi.summaryEn,
      bi.contentVi,
      bi.contentEn,
      bi.sourceLanguage,
      locationVi,
      locationEn,
      latitude,
      longitude,
      startAt,
      endAt,
      eventStatus,
      eventType,
      tags,
      postStatus,
      bannerUrl,
      imagesItems
    ]
  );

  const handleRestoreSnapshot = useCallback(
    (snap: typeof workspaceSnapshot) => {
      bi.setTitleVi(snap.titleVi);
      bi.setTitleEn(snap.titleEn);
      bi.setSummaryVi(snap.summaryVi);
      bi.setSummaryEn(snap.summaryEn);
      bi.setContentVi(snap.contentVi);
      bi.setContentEn(snap.contentEn);
      bi.setSourceLanguage(snap.sourceLanguage);
      setLocationVi(snap.locationVi);
      setLocationEn(snap.locationEn);
      setLatitude(snap.latitude);
      setLongitude(snap.longitude);
      setStartAt(snap.startAt);
      setEndAt(snap.endAt);
      setEventStatus(snap.eventStatus);
      setEventType(snap.eventType);
      setTags(snap.tags);
      setPostStatus(snap.postStatus);
      setBannerUrl(snap.bannerUrl);
      setImagesItems(snap.imagesItems);
    },
    [bi]
  );

  const history = useWorkspaceHistory(workspaceSnapshot, handleRestoreSnapshot);

  const handleRegisterFormatActions = useCallback(
    (actions: EditorFormatActions, upState: { uploading: boolean; percent: number | null }) => {
      setFormatActions(actions);
      setUploadingState(upState);
    },
    []
  );

  const getTitle = () => (bi.viewLang === "vi" ? bi.titleVi : bi.titleEn);
  const setTitle = (v: string) => (bi.viewLang === "vi" ? bi.setTitleVi(v) : bi.setTitleEn(v));
  const getDescription = () => (bi.viewLang === "vi" ? (bi.summaryVi ?? "") : (bi.summaryEn ?? ""));
  const setDescription = (v: string) =>
    bi.viewLang === "vi" ? bi.setSummaryVi(v || null) : bi.setSummaryEn(v || null);
  const getContent = () => (bi.viewLang === "vi" ? bi.contentVi : bi.contentEn);
  const setContent = (v: string) => (bi.viewLang === "vi" ? bi.setContentVi(v) : bi.setContentEn(v));

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

    const payload = buildEventPayload({
      bi,
      locationVi,
      locationEn,
      latitude,
      longitude,
      eventStatus,
      eventType,
      startAt,
      endAt,
      bannerUrl,
      imagesItems,
      postStatus
    });

    const result = await saveEvent(isEdit, post?.id, payload, tags);
    if (result.error) {
      toast({ variant: "destructive", description: result.error });
      setLoading(false);
      return;
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

  const displayTitle = pickLang(bi.viewLang, bi.titleVi, bi.titleEn);
  const displayDescription = pickLang(bi.viewLang, bi.summaryVi, bi.summaryEn) ?? "";
  const displayContent = pickLang(bi.viewLang, bi.contentVi, bi.contentEn);
  const displayLocation = pickLang(bi.viewLang, locationVi, locationEn);

  const previewDateLabel = startAt
    ? `${new Date(startAt).toLocaleDateString("vi-VN")}${endAt ? ` → ${new Date(endAt).toLocaleDateString("vi-VN")}` : ""}`
    : null;

  return (
    <div className='flex flex-col gap-6'>
      <WorkspaceTopToolbar
        activeField={activeField}
        canRedo={history.canRedo}
        canUndo={history.canUndo}
        editorMode={editorMode}
        formatActions={formatActions}
        formId='event-form-main'
        heading={isEdit ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
        onBack={() => router.push("/admin/posts")}
        onEditorModeChange={setEditorMode}
        onOpenPreview={() => setPreviewOpen(true)}
        onRedo={history.redo}
        onSourceLanguageChange={bi.setSourceLanguage}
        onTranslated={handleTranslate}
        onUndo={history.undo}
        onViewLangChange={bi.setViewLang}
        saveLabel='Lưu sự kiện'
        saving={loading}
        sourceLanguage={bi.sourceLanguage}
        subheading='Quản lý bài viết, thời gian, địa điểm và thư viện ảnh sự kiện'
        translateFields={translateSrcFields}
        uploadingImage={uploadingState.uploading}
        uploadPercent={uploadingState.percent}
        viewLang={bi.viewLang}
      />

      <form className='grid grid-cols-1 items-start gap-6 lg:grid-cols-12' id='event-form-main' onSubmit={handleSubmit}>
        {/* Left 70%: Unified Document Canvas */}
        <div className='min-w-0 lg:col-span-8'>
          <UnifiedDocumentCanvas
            activeField={activeField}
            bannerBucket={STORAGE_BUCKET}
            bannerLabel='Banner / Ảnh bìa sự kiện (Kéo thả hoặc nhấp để tải lên)'
            bannerStoragePath={STORAGE_PATHS.eventBanners}
            bannerUrl={bannerUrl}
            content={getContent()}
            contentPlaceholder='Nội dung chi tiết sự kiện (Markdown)...'
            editorMode={editorMode}
            inlineMetaBar={
              <div className='flex min-w-0 flex-wrap items-center gap-4 text-muted-foreground text-xs'>
                <span className='flex shrink-0 items-center gap-1.5 font-medium text-foreground'>
                  <Calendar className='h-3.5 w-3.5 shrink-0 text-primary' />
                  {previewDateLabel || "Chưa chọn ngày diễn ra (chỉnh ở cột phải)"}
                </span>
                {displayLocation && (
                  <span
                    className='flex min-w-0 max-w-full items-center gap-1.5 font-medium text-foreground'
                    title={displayLocation}
                  >
                    <MapPin className='h-3.5 w-3.5 shrink-0 text-primary' />
                    <span className='line-clamp-1 min-w-0 break-all'>{displayLocation}</span>
                  </span>
                )}
              </div>
            }
            onActiveFieldChange={setActiveField}
            onBannerChange={setBannerUrl}
            onContentChange={setContent}
            onRegisterFormatActions={handleRegisterFormatActions}
            onSummaryChange={setDescription}
            onTitleChange={setTitle}
            summary={getDescription()}
            summaryPlaceholder='Mô tả ngắn gọn về sự kiện (Hỗ trợ Markdown, có thể để trống)...'
            title={getTitle()}
            titlePlaceholder='Nhập tên sự kiện...'
          />
        </div>

        {/* Right 30%: Event Metadata & Gallery Sidebar */}
        <div className='flex min-w-0 flex-col gap-5 lg:sticky lg:top-28 lg:col-span-4'>
          <Card className='min-w-0 overflow-hidden'>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Thời gian, Địa điểm & Trạng thái</CardTitle>
            </CardHeader>
            <CardContent className='grid min-w-0 gap-4'>
              <div className='grid min-w-0 grid-cols-2 gap-3'>
                <div className='grid min-w-0 gap-1.5'>
                  <Label htmlFor='startAt'>Ngày bắt đầu *</Label>
                  <Input
                    id='startAt'
                    onChange={(e) => setStartAt(e.target.value)}
                    required
                    type='date'
                    value={startAt}
                  />
                </div>
                <div className='grid min-w-0 gap-1.5'>
                  <Label htmlFor='endAt'>Ngày kết thúc</Label>
                  <Input id='endAt' onChange={(e) => setEndAt(e.target.value)} type='date' value={endAt} />
                </div>
              </div>

              <div className='grid min-w-0 gap-1.5'>
                <Label>Địa điểm tổ chức</Label>
                <LocationPicker
                  initial={{
                    lat: latitude,
                    lng: longitude,
                    nameVi: locationVi,
                    nameEn: locationEn
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

              <div className='grid grid-cols-1 gap-3'>
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

                <div className='grid grid-cols-2 gap-3'>
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
                label='Hình ảnh sự kiện'
                maxImages={15}
                onChange={setImagesItems}
                storagePath='events/gallery'
              />
            </CardContent>
          </Card>
        </div>
      </form>

      <PreviewDrawer
        badges={[
          { label: statusLabel(eventStatus), variant: "outline" },
          { label: typeLabel(eventType), variant: "secondary" }
        ]}
        bannerUrl={bannerUrl}
        content={displayContent}
        dateLabel={previewDateLabel}
        galleryUrls={imagesItems.map((i) => i.url)}
        locationLabel={displayLocation}
        onOpenChange={setPreviewOpen}
        onViewLangChange={bi.setViewLang}
        open={previewOpen}
        sourceLanguage={bi.sourceLanguage}
        summary={displayDescription}
        tags={tags}
        title={displayTitle}
        titlePlaceholder='Tên sự kiện hiển thị ở đây'
        viewLang={bi.viewLang}
      />
    </div>
  );
}
