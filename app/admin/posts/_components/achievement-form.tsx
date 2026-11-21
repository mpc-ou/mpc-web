"use client";

import { Calendar, MapPin, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminCreateAchievement,
  adminLinkAchievementMember,
  adminSetPostTags,
  adminUnlinkAchievementMember,
  adminUpdateAchievement,
  adminUpdateAchievementMember
} from "@/app/_actions/admin";
import type { ViewLanguage } from "@/components/custom/language-toggle";
import type { EditorFormatActions } from "@/components/forms/editor-floating-menus";
import { PreviewDrawer, type PreviewDrawerBadge } from "@/components/forms/preview-drawer";
import { UnifiedDocumentCanvas } from "@/components/forms/unified-document-canvas";
import { useBilingualForm } from "@/components/forms/use-bilingual-form";
import { useWorkspaceHistory } from "@/components/forms/use-workspace-history";
import { type ActiveField, type EditorMode, WorkspaceTopToolbar } from "@/components/forms/workspace-top-toolbar";
import type { LocationData } from "@/components/location-picker";
import { LocationPicker } from "@/components/location-picker";
import { type LinkedMember, type MemberOption, MemberSelector } from "@/components/member-selector";
import { type ImageItem, MultiImageUpload } from "@/components/multi-image-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STORAGE_BUCKET, STORAGE_PATHS } from "@/constants/storage";
import { useToast } from "@/hooks/use-toast";
import { getFullName, pickLang } from "@/lib/utils";
import type { PostRow } from "../columns";
import { TagInput } from "./tag-input";

type Props = {
  post?: PostRow | null;
  allMembers?: MemberOption[];
};

const NOOP_FORMAT_ACTIONS: EditorFormatActions = {
  insertWrap: () => undefined,
  insertAlignment: () => undefined,
  insertColor: () => undefined,
  insertTable: () => undefined,
  triggerImageUpload: () => undefined
};

function deriveAchievementGallery(post?: PostRow | null): ImageItem[] {
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

function buildAchievementPayload(params: {
  bi: ReturnType<typeof useBilingualForm>;
  thumbnailUrl: string | null;
  date: string;
  achievementType: string;
  isHighlight: boolean;
  relatedUrl: string;
  locationVi: string;
  locationEn: string;
  latitude: number | null;
  longitude: number | null;
  imagesItems: ImageItem[];
  postStatus: string;
}) {
  return {
    title: params.bi.titleVi,
    titleEn: params.bi.titleEn,
    summary: params.bi.summaryVi || undefined,
    summaryEn: params.bi.summaryEn ?? undefined,
    content: params.bi.contentVi || undefined,
    contentEn: params.bi.contentEn || undefined,
    sourceLanguage: params.bi.sourceLanguage,
    thumbnail: params.thumbnailUrl || undefined,
    date: params.date,
    type: params.achievementType,
    isHighlight: params.isHighlight,
    relatedUrl: params.relatedUrl || undefined,
    locationVi: params.locationVi || null,
    locationEn: params.locationEn || null,
    latitude: params.latitude,
    longitude: params.longitude,
    images: params.imagesItems,
    postStatus: params.postStatus
  };
}

async function saveAchievement(
  isEdit: boolean,
  postId: string | undefined,
  payload: ReturnType<typeof buildAchievementPayload>,
  linked: LinkedMember[],
  tags: string[]
) {
  let entityId: string | null = postId ?? null;

  if (isEdit && postId) {
    const res = await adminUpdateAchievement(postId, payload);
    if (res.error) {
      return { error: res.error.message };
    }
  } else {
    const res = await adminCreateAchievement(payload);
    if (res.error) {
      return { error: res.error.message };
    }
    entityId = (res.data?.payload as { id: string })?.id ?? null;
    if (entityId && linked.length > 0) {
      for (const item of linked) {
        await adminLinkAchievementMember(
          entityId,
          item.member.id,
          item.role || undefined,
          undefined,
          item.imageUrl || null
        );
      }
    }
  }

  if (entityId) {
    await adminSetPostTags(entityId, tags);
  }
  return { error: null };
}

function typeLabel(t: string) {
  const m: Record<string, string> = {
    INDIVIDUAL: "Cá nhân",
    TEAM: "Nhóm",
    CLUB: "Toàn CLB"
  };
  return m[t] ?? t;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: AchievementForm manages complex state, workspace undo/redo, and 7:3 layout
export function AchievementForm({ post, allMembers = [] }: Props) {
  const isEdit = !!post;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const bi = useBilingualForm(post);
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
  const [tags, setTags] = useState<string[]>(post?.tags?.map((t) => t.tag.name) ?? []);
  const [postStatus, setPostStatus] = useState(post?.status ?? "PUBLISHED");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(post?.thumbnail ?? null);
  const [linked, setLinked] = useState<LinkedMember[]>([]);
  const [imagesItems, setImagesItems] = useState<ImageItem[]>(() => deriveAchievementGallery(post));

  const [activeField, setActiveField] = useState<ActiveField>("content");
  const [editorMode, setEditorMode] = useState<EditorMode>("preview-edit");
  const [formatActions, setFormatActions] = useState<EditorFormatActions>(NOOP_FORMAT_ACTIONS);
  const [uploadingState, setUploadingState] = useState<{ uploading: boolean; percent: number | null }>({
    uploading: false,
    percent: null
  });

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
    setImagesItems(deriveAchievementGallery(post));
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
      date,
      achievementType,
      isHighlight,
      relatedUrl,
      locationVi,
      locationEn,
      latitude,
      longitude,
      tags,
      postStatus,
      thumbnailUrl,
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
      date,
      achievementType,
      isHighlight,
      relatedUrl,
      locationVi,
      locationEn,
      latitude,
      longitude,
      tags,
      postStatus,
      thumbnailUrl,
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
      setDate(snap.date);
      setAchievementType(snap.achievementType);
      setIsHighlight(snap.isHighlight);
      setRelatedUrl(snap.relatedUrl);
      setLocationVi(snap.locationVi);
      setLocationEn(snap.locationEn);
      setLatitude(snap.latitude);
      setLongitude(snap.longitude);
      setTags(snap.tags);
      setPostStatus(snap.postStatus);
      setThumbnailUrl(snap.thumbnailUrl);
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

    const payload = buildAchievementPayload({
      bi,
      thumbnailUrl,
      date,
      achievementType,
      isHighlight,
      relatedUrl,
      locationVi,
      locationEn,
      latitude,
      longitude,
      imagesItems,
      postStatus
    });

    const result = await saveAchievement(isEdit, post?.id, payload, linked, tags);
    if (result.error) {
      toast({ variant: "destructive", description: result.error });
      setLoading(false);
      return;
    }

    toast({
      variant: "success",
      description: isEdit ? "Cập nhật thành công!" : "Tạo thành tích thành công!"
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
  const displaySummary = pickLang(bi.viewLang, bi.summaryVi, bi.summaryEn) ?? "";
  const displayContent = pickLang(bi.viewLang, bi.contentVi, bi.contentEn);
  const displayLocation = pickLang(bi.viewLang, locationVi, locationEn);

  const previewBadges: PreviewDrawerBadge[] = [{ label: typeLabel(achievementType), variant: "outline" }];
  if (isHighlight) {
    previewBadges.push({
      label: "Nổi bật",
      className: "border-amber-500/20 bg-amber-500/10 text-amber-600",
      isHighlight: true
    });
  }

  return (
    <div className='flex flex-col gap-6'>
      <WorkspaceTopToolbar
        activeField={activeField}
        canRedo={history.canRedo}
        canUndo={history.canUndo}
        editorMode={editorMode}
        formatActions={formatActions}
        formId='achievement-form-main'
        heading={isEdit ? "Chỉnh sửa thành tựu" : "Tạo thành tựu mới"}
        onBack={() => router.push("/admin/posts")}
        onEditorModeChange={setEditorMode}
        onOpenPreview={() => setPreviewOpen(true)}
        onRedo={history.redo}
        onSourceLanguageChange={bi.setSourceLanguage}
        onTranslated={handleTranslate}
        onUndo={history.undo}
        onViewLangChange={bi.setViewLang}
        saveLabel='Lưu thành tựu'
        saving={loading}
        sourceLanguage={bi.sourceLanguage}
        subheading='Ghi nhận thành tích cá nhân, nhóm hoặc toàn câu lạc bộ'
        translateFields={translateSrcFields}
        uploadingImage={uploadingState.uploading}
        uploadPercent={uploadingState.percent}
        viewLang={bi.viewLang}
      />

      <form
        className='grid grid-cols-1 items-start gap-6 lg:grid-cols-12'
        id='achievement-form-main'
        onSubmit={handleSubmit}
      >
        {/* Left 70%: Unified Document Canvas */}
        <div className='min-w-0 lg:col-span-8'>
          <UnifiedDocumentCanvas
            activeField={activeField}
            bannerBucket={STORAGE_BUCKET}
            bannerLabel='Ảnh đại diện thành tựu (Kéo thả hoặc nhấp để tải lên)'
            bannerStoragePath={STORAGE_PATHS.achievements}
            bannerUrl={thumbnailUrl}
            content={getContent()}
            contentPlaceholder='Nội dung chi tiết thành tựu (Markdown)...'
            editorMode={editorMode}
            inlineMetaBar={
              <div className='flex min-w-0 flex-wrap items-center gap-4 text-muted-foreground text-xs'>
                <span className='flex shrink-0 items-center gap-1.5 font-medium text-amber-500'>
                  <Trophy className='h-3.5 w-3.5 shrink-0' />
                  {typeLabel(achievementType)}
                  {isHighlight ? " • Nổi bật" : ""}
                </span>
                {date && (
                  <span className='flex shrink-0 items-center gap-1.5 font-medium text-foreground'>
                    <Calendar className='h-3.5 w-3.5 shrink-0 text-primary' />
                    {new Date(date).toLocaleDateString("vi-VN")}
                  </span>
                )}
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
            onBannerChange={setThumbnailUrl}
            onContentChange={setContent}
            onRegisterFormatActions={handleRegisterFormatActions}
            onSummaryChange={setSummary}
            onTitleChange={setTitle}
            summary={getSummary()}
            summaryPlaceholder='Giải chú thích / Mô tả ngắn thành tựu (Hỗ trợ Markdown, có thể để trống)...'
            title={getTitle()}
            titlePlaceholder='Nhập tiêu đề thành tựu...'
          />
        </div>

        {/* Right 30%: Info, Members & Gallery Sidebar */}
        <div className='flex min-w-0 flex-col gap-5 lg:sticky lg:top-28 lg:col-span-4'>
          <Card className='min-w-0 overflow-hidden'>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Thông tin & Phân loại thành tựu</CardTitle>
            </CardHeader>
            <CardContent className='grid min-w-0 gap-4'>
              <div className='grid min-w-0 grid-cols-2 gap-3'>
                <div className='grid min-w-0 gap-1.5'>
                  <Label htmlFor='date'>Ngày đạt thành tựu</Label>
                  <Input id='date' onChange={(e) => setDate(e.target.value)} type='date' value={date} />
                </div>
                <div className='grid min-w-0 gap-1.5'>
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
              </div>

              <div className='grid min-w-0 grid-cols-2 gap-3'>
                <div className='grid min-w-0 gap-1.5'>
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
                  <Label className='flex cursor-pointer items-center gap-2 text-xs'>
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

              <div className='grid min-w-0 gap-1.5'>
                <Label htmlFor='relatedUrl'>Liên kết minh chứng / liên quan</Label>
                <Input
                  id='relatedUrl'
                  onChange={(e) => setRelatedUrl(e.target.value)}
                  placeholder='https://...'
                  type='url'
                  value={relatedUrl}
                />
              </div>

              <div className='grid min-w-0 gap-1.5'>
                <Label>Địa điểm (không bắt buộc)</Label>
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
                  placeholder='Tìm kiếm địa điểm liên quan...'
                />
              </div>

              <div className='border-t pt-4'>
                <TagInput onChange={setTags} selectedTags={tags} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Thành viên được tuyên dương</CardTitle>
            </CardHeader>
            <CardContent>
              <MemberSelector
                allMembers={allMembers}
                linked={linked}
                onLink={handleLink}
                onUnlink={handleUnlink}
                onUpdate={handleUpdate}
              />
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
        </div>
      </form>

      <PreviewDrawer
        badges={previewBadges}
        bannerUrl={thumbnailUrl}
        content={displayContent}
        dateLabel={date ? new Date(date).toLocaleDateString("vi-VN") : null}
        galleryUrls={imagesItems.map((i) => i.url)}
        locationLabel={displayLocation}
        membersList={linked.map((l) => ({
          id: l.member.id,
          label: `${getFullName(l.member.firstName, l.member.middleName, l.member.lastName, "vi")}${l.role ? ` (${l.role})` : ""}`
        }))}
        onOpenChange={setPreviewOpen}
        onViewLangChange={bi.setViewLang}
        open={previewOpen}
        sourceLanguage={bi.sourceLanguage}
        summary={displaySummary}
        tags={tags}
        title={displayTitle}
        titlePlaceholder='Tiêu đề thành tựu hiển thị ở đây'
        viewLang={bi.viewLang}
      />
    </div>
  );
}
