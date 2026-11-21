"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ViewLanguage } from "@/components/custom/language-toggle";
import { type ImageItem, MultiImageUpload } from "@/components/multi-image-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STORAGE_BUCKET, STORAGE_PATHS } from "@/constants/storage";
import { useToast } from "@/hooks/use-toast";
import { pickLang } from "@/lib/utils";
import type { EditorFormatActions } from "./editor-floating-menus";
import { PreviewDrawer } from "./preview-drawer";
import { TagInput } from "./tag-input";
import { UnifiedDocumentCanvas } from "./unified-document-canvas";
import { useBilingualForm } from "./use-bilingual-form";
import { useWorkspaceHistory } from "./use-workspace-history";
import { type ActiveField, type EditorMode, WorkspaceTopToolbar } from "./workspace-top-toolbar";

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
  activityId?: string | null;
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
  /** When false, hides PUBLISHED option - for regular users who can only submit DRAFT or PENDING_REVIEW */
  showPublishedOption?: boolean;
  /** Optional activities list for Admin Blog form */
  activities?: Array<{ id: string; titleVi: string }>;
  /** Custom sticky top class for public layout vs admin layout */
  stickyTopClass?: string;
};

const NOOP_FORMAT_ACTIONS: EditorFormatActions = {
  insertWrap: () => undefined,
  insertAlignment: () => undefined,
  insertColor: () => undefined,
  insertTable: () => undefined,
  triggerImageUpload: () => undefined
};

function deriveInitialGallery(post?: BlogFormData | null): ImageItem[] {
  if (post?.gallery) {
    return post.gallery.filter((g) => g.type === "ADDITIONAL");
  }
  return (post?.images ?? []).map((url: string) => ({
    url,
    title: "",
    caption: ""
  }));
}

export function BlogForm({
  post,
  onCreate,
  onUpdate,
  onSetTags,
  backUrl,
  onSuccess,
  showPublishedOption = true,
  activities = [],
  stickyTopClass
}: Props) {
  const isEdit = !!post;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const bi = useBilingualForm(post);
  const otherLang: ViewLanguage = bi.viewLang === "vi" ? "en" : "vi";

  const [status, setStatus] = useState<string>(post?.status ?? "DRAFT");
  const [activityId, setActivityId] = useState<string>(post?.activityId ?? "NONE");
  const [tags, setTags] = useState<string[]>(post?.tags?.map((t) => t.tag.name) ?? []);
  const [imagesItems, setImagesItems] = useState<ImageItem[]>(() => deriveInitialGallery(post));
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(post?.thumbnail ?? null);

  const [activeField, setActiveField] = useState<ActiveField>("content");
  const [editorMode, setEditorMode] = useState<EditorMode>("preview-edit");
  const [formatActions, setFormatActions] = useState<EditorFormatActions>(NOOP_FORMAT_ACTIONS);
  const [uploadingState, setUploadingState] = useState<{ uploading: boolean; percent: number | null }>({
    uploading: false,
    percent: null
  });

  useEffect(() => {
    setThumbnailUrl(post?.thumbnail ?? null);
    setImagesItems(deriveInitialGallery(post));
    setTags(post?.tags?.map((t) => t.tag.name) ?? []);
    setStatus(post?.status ?? "DRAFT");
    setActivityId(post?.activityId ?? "NONE");
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
      thumbnailUrl,
      status,
      activityId,
      tags,
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
      thumbnailUrl,
      status,
      activityId,
      tags,
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
      setThumbnailUrl(snap.thumbnailUrl);
      setStatus(snap.status);
      setActivityId(snap.activityId);
      setTags(snap.tags);
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
  const getSummary = () => (bi.viewLang === "vi" ? (bi.summaryVi ?? "") : (bi.summaryEn ?? ""));
  const setSummary = (v: string) => (bi.viewLang === "vi" ? bi.setSummaryVi(v || null) : bi.setSummaryEn(v || null));
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

    const payload: BlogFormPayload = {
      title: bi.titleVi,
      titleEn: bi.titleEn,
      summary: bi.summaryVi ?? undefined,
      summaryEn: bi.summaryEn ?? undefined,
      content: bi.contentVi,
      contentEn: bi.contentEn,
      sourceLanguage: bi.sourceLanguage,
      thumbnail: thumbnailUrl,
      status,
      images: imagesItems,
      activityId: activityId && activityId !== "NONE" ? activityId : null
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
      onSuccess?.();
    } catch (err) {
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : "Lỗi lưu bài viết"
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

  const displayTitle = pickLang(bi.viewLang, bi.titleVi, bi.titleEn);
  const displaySummary = pickLang(bi.viewLang, bi.summaryVi, bi.summaryEn) ?? "";
  const displayContent = pickLang(bi.viewLang, bi.contentVi, bi.contentEn);

  let titleFallbackBadge: string | null = null;
  if (bi.viewLang === "vi" && !bi.titleVi && bi.titleEn) {
    titleFallbackBadge = "Đang trống tiếng Việt (sẽ fallback tiếng Anh)";
  } else if (bi.viewLang === "en" && !bi.titleEn && bi.titleVi) {
    titleFallbackBadge = "Empty English (will fallback to Vietnamese)";
  }

  let summaryFallbackBadge: string | null = null;
  if (bi.viewLang === "vi" && !bi.summaryVi && bi.summaryEn) {
    summaryFallbackBadge = "fallback EN";
  } else if (bi.viewLang === "en" && !bi.summaryEn && bi.summaryVi) {
    summaryFallbackBadge = "fallback VI";
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Sticky Top Workspace Header + Formatting Bar */}
      <WorkspaceTopToolbar
        activeField={activeField}
        backHref={backUrl}
        canRedo={history.canRedo}
        canUndo={history.canUndo}
        editorMode={editorMode}
        formatActions={formatActions}
        formId='blog-form-main'
        heading={isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
        onEditorModeChange={setEditorMode}
        onOpenPreview={() => setPreviewOpen(true)}
        onRedo={history.redo}
        onSourceLanguageChange={bi.setSourceLanguage}
        onTranslated={handleTranslate}
        onUndo={history.undo}
        onViewLangChange={bi.setViewLang}
        saveLabel='Lưu bài viết'
        saving={loading}
        sourceLanguage={bi.sourceLanguage}
        stickyTopClass={stickyTopClass}
        subheading='Soạn thảo trực tiếp như bài viết thực tế — Hỗ trợ Undo/Redo toàn bàn làm việc'
        translateFields={translateSrcFields}
        uploadingImage={uploadingState.uploading}
        uploadPercent={uploadingState.percent}
        viewLang={bi.viewLang}
      />

      {/* 7:3 Main Workspace Grid */}
      <form className='grid grid-cols-1 items-start gap-6 lg:grid-cols-12' id='blog-form-main' onSubmit={handleSubmit}>
        {/* Left 70% (8/12 cols): Unified Document Canvas */}
        <div className='min-w-0 lg:col-span-8'>
          <UnifiedDocumentCanvas
            activeField={activeField}
            bannerBucket={STORAGE_BUCKET}
            bannerLabel='Ảnh bìa bài viết (Thumbnail — Kéo thả hoặc nhấp để tải lên)'
            bannerStoragePath={STORAGE_PATHS.blogThumbnails}
            bannerUrl={thumbnailUrl}
            content={getContent()}
            contentPlaceholder='Nội dung bài viết (Markdown GFM)...'
            editorMode={editorMode}
            onActiveFieldChange={setActiveField}
            onBannerChange={setThumbnailUrl}
            onContentChange={setContent}
            onRegisterFormatActions={handleRegisterFormatActions}
            onSummaryChange={setSummary}
            onTitleChange={setTitle}
            summary={getSummary()}
            summaryFallbackBadge={summaryFallbackBadge}
            summaryPlaceholder='Tóm tắt ngắn gọn (Hỗ trợ Markdown, có thể bỏ trống để tự lấy đoạn đầu bài viết)...'
            title={getTitle()}
            titleFallbackBadge={titleFallbackBadge}
            titlePlaceholder='Nhập tiêu đề bài viết...'
          />
        </div>

        {/* Right 30% (4/12 cols): Info & Metadata Sidebar */}
        <div className='flex min-w-0 flex-col gap-5 lg:sticky lg:top-28 lg:col-span-4'>
          <Card className='min-w-0 overflow-hidden'>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Phân loại & Xuất bản</CardTitle>
            </CardHeader>
            <CardContent className='grid min-w-0 gap-4'>
              <div className='grid gap-1.5'>
                <Label htmlFor='status'>Trạng thái bài viết</Label>
                <Select name='status' onValueChange={setStatus} value={status}>
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

              {activities.length > 0 && (
                <div className='grid gap-1.5'>
                  <Label htmlFor='activityId'>Hoạt động liên quan</Label>
                  <Select onValueChange={setActivityId} value={activityId}>
                    <SelectTrigger className='h-9 text-xs' id='activityId'>
                      <SelectValue placeholder='-- Không chọn --' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='NONE'>-- Không chọn --</SelectItem>
                      {activities.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.titleVi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
        </div>
      </form>

      {/* Right Slide-Over Preview Drawer */}
      <PreviewDrawer
        badges={[{ label: "Blog / Tin tức", variant: "outline" }]}
        bannerUrl={thumbnailUrl}
        content={displayContent}
        galleryUrls={imagesItems.map((i) => i.url)}
        onOpenChange={setPreviewOpen}
        onViewLangChange={bi.setViewLang}
        open={previewOpen}
        sourceLanguage={bi.sourceLanguage}
        summary={displaySummary}
        tags={tags}
        title={displayTitle}
        titlePlaceholder='Tiêu đề bài viết hiển thị ở đây'
        viewLang={bi.viewLang}
      />
    </div>
  );
}
