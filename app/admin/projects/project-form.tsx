"use client";

import { Calendar, Code2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
  adminCreateProject,
  adminLinkProjectMember,
  adminUnlinkProjectMember,
  adminUpdateProject,
  adminUpdateProjectMembers
} from "@/app/_actions/admin";
import type { ViewLanguage } from "@/components/custom/language-toggle";
import type { EditorFormatActions } from "@/components/forms/editor-floating-menus";
import { PreviewDrawer } from "@/components/forms/preview-drawer";
import { UnifiedDocumentCanvas } from "@/components/forms/unified-document-canvas";
import { useBilingualForm } from "@/components/forms/use-bilingual-form";
import { useWorkspaceHistory } from "@/components/forms/use-workspace-history";
import { type ActiveField, type EditorMode, WorkspaceTopToolbar } from "@/components/forms/workspace-top-toolbar";
import { type LinkedMember, type MemberOption, MemberSelector } from "@/components/member-selector";
import { type ImageItem, MultiImageUpload } from "@/components/multi-image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STORAGE_BUCKET, STORAGE_PATHS } from "@/constants/storage";
import { useToast } from "@/hooks/use-toast";
import { getFullName, pickLang } from "@/lib/utils";
import type { ProjectRow } from "./columns";

type Props = {
  project?: ProjectRow | null;
  allMembers?: MemberOption[];
};

const NOOP_FORMAT_ACTIONS: EditorFormatActions = {
  insertWrap: () => undefined,
  insertAlignment: () => undefined,
  insertColor: () => undefined,
  insertTable: () => undefined,
  triggerImageUpload: () => undefined
};

function fmtDate(d: string | null | undefined) {
  return d ? new Date(d).toISOString().split("T")[0] : "";
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: ProjectForm manages complex state, workspace undo/redo, and 7:3 layout
export default function ProjectForm({ project, allMembers = [] }: Props) {
  const isEdit = !!project;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const bi = useBilingualForm(
    project
      ? {
          titleVi: project.title,
          titleEn: project.titleEn,
          summaryVi: project.description,
          summaryEn: project.descriptionEn,
          contentVi: project.content ?? "",
          contentEn: project.contentEn ?? ""
        }
      : null
  );

  const otherLang: ViewLanguage = bi.viewLang === "vi" ? "en" : "vi";

  const [startDate, setStartDate] = useState(() => fmtDate(project?.startDate));
  const [endDate, setEndDate] = useState(() => fmtDate(project?.endDate));
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(project?.websiteUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(project?.videoUrl ?? "");
  const [techs, setTechs] = useState<string[]>(project?.technologies ?? []);
  const [techInput, setTechInput] = useState("");
  const [linked, setLinked] = useState<LinkedMember[]>(() =>
    (project?.members ?? []).map((m) => ({
      member: {
        id: m.member.id,
        firstName: m.member.firstName,
        lastName: m.member.lastName,
        avatar: null,
        studentId: null,
        webRole: ""
      } as MemberOption,
      role: m.role,
      joinedAt: m.joinedAt ?? null
    }))
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(project?.thumbnail ?? null);
  const [imagesItems, setImagesItems] = useState<ImageItem[]>(
    ((project as { images?: string[] } | null | undefined)?.images ?? []).map((url) => ({ url }))
  );

  const [activeField, setActiveField] = useState<ActiveField>("content");
  const [editorMode, setEditorMode] = useState<EditorMode>("preview-edit");
  const [formatActions, setFormatActions] = useState<EditorFormatActions>(NOOP_FORMAT_ACTIONS);
  const [uploadingState, setUploadingState] = useState<{ uploading: boolean; percent: number | null }>({
    uploading: false,
    percent: null
  });

  // Global Workspace Snapshot for Undo/Redo
  const workspaceSnapshot = useMemo(
    () => ({
      titleVi: bi.titleVi,
      titleEn: bi.titleEn,
      summaryVi: bi.summaryVi,
      summaryEn: bi.summaryEn,
      contentVi: bi.contentVi,
      contentEn: bi.contentEn,
      startDate,
      endDate,
      githubUrl,
      websiteUrl,
      videoUrl,
      techs,
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
      startDate,
      endDate,
      githubUrl,
      websiteUrl,
      videoUrl,
      techs,
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
      setStartDate(snap.startDate);
      setEndDate(snap.endDate);
      setGithubUrl(snap.githubUrl);
      setWebsiteUrl(snap.websiteUrl);
      setVideoUrl(snap.videoUrl);
      setTechs(snap.techs);
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

  const addTech = () => {
    const t = techInput.trim();
    if (t && !techs.includes(t)) {
      setTechs([...techs, t]);
    }
    setTechInput("");
  };

  const handleLink = async (member: MemberOption, role: string, joinedAt: string | null) => {
    const entry = { member, role: role || null, joinedAt };
    if (!project) {
      setLinked((prev) => [...prev, entry]);
      return;
    }
    const res = await adminLinkProjectMember(project.id, member.id, role || undefined, joinedAt);
    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
      return;
    }
    setLinked((prev) => [...prev, entry]);
  };

  const handleUpdateLinked = (memberId: string, updates: Partial<LinkedMember>) => {
    setLinked((prev) => prev.map((l) => (l.member.id === memberId ? { ...l, ...updates } : l)));
  };

  const handleUnlink = async (memberId: string) => {
    if (project) {
      const res = await adminUnlinkProjectMember(project.id, memberId);
      if (res.error) {
        toast({ variant: "destructive", description: res.error?.message });
        return;
      }
    }
    setLinked((prev) => prev.filter((l) => l.member.id !== memberId));
  };

  const persistProject = async (payload: Parameters<typeof adminCreateProject>[0]) => {
    if (isEdit && project) {
      return {
        error: (await adminUpdateProject(project.id, payload)).error,
        id: project.id
      };
    }
    const res = await adminCreateProject(payload);
    return {
      error: res.error,
      id: (res.data?.payload as { id: string } | undefined)?.id ?? null
    };
  };

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: handleSubmit project form payload
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: bi.titleVi,
      titleEn: bi.titleEn || undefined,
      description: bi.summaryVi ?? undefined,
      descriptionEn: bi.summaryEn ?? undefined,
      content: bi.contentVi ?? undefined,
      contentEn: bi.contentEn ?? undefined,
      thumbnail: thumbnailUrl ?? undefined,
      githubUrl: githubUrl || undefined,
      websiteUrl: websiteUrl || undefined,
      videoUrl: videoUrl || undefined,
      technologies: techs,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      images: imagesItems.map((x) => x.url)
    };

    const { error, id: entityId } = await persistProject(payload);
    if (error) {
      toast({ variant: "destructive", description: error?.message });
      setLoading(false);
      return;
    }

    if (!isEdit && entityId) {
      for (const l of linked) {
        await adminLinkProjectMember(entityId, l.member.id, l.role ?? undefined, l.joinedAt ?? null);
      }
    }

    if (isEdit && project && linked.length > 0) {
      const res = await adminUpdateProjectMembers(
        project.id,
        linked.map((l) => ({ memberId: l.member.id, role: l.role, joinedAt: l.joinedAt ?? null }))
      );
      if (res.error) {
        toast({ variant: "destructive", description: res.error.message });
        setLoading(false);
        return;
      }
    }

    toast({
      variant: "success",
      description: isEdit ? "Cập nhật dự án thành công" : "Tạo dự án mới thành công"
    });
    setLoading(false);
    router.push("/admin/projects");
    router.refresh();
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

  const getTitle = () => (bi.viewLang === "vi" ? bi.titleVi : bi.titleEn);
  const setTitleField = (v: string) => (bi.viewLang === "vi" ? bi.setTitleVi(v) : bi.setTitleEn(v));
  const getDescription = () => (bi.viewLang === "vi" ? (bi.summaryVi ?? "") : (bi.summaryEn ?? ""));
  const setDescriptionField = (v: string) =>
    bi.viewLang === "vi" ? bi.setSummaryVi(v || null) : bi.setSummaryEn(v || null);
  const getContent = () => (bi.viewLang === "vi" ? bi.contentVi : bi.contentEn);
  const setContentField = (v: string) => (bi.viewLang === "vi" ? bi.setContentVi(v) : bi.setContentEn(v));

  const translateSrcFields = {
    title: bi.viewLang === "vi" ? bi.titleVi : bi.titleEn,
    summary: bi.viewLang === "vi" ? bi.summaryVi : bi.summaryEn,
    content: bi.viewLang === "vi" ? bi.contentVi : bi.contentEn
  };

  const displayTitle = pickLang(bi.viewLang, bi.titleVi, bi.titleEn);
  const displayDescription = pickLang(bi.viewLang, bi.summaryVi, bi.summaryEn) ?? "";
  const displayContent = pickLang(bi.viewLang, bi.contentVi, bi.contentEn);

  const previewDateLabel = startDate
    ? `${new Date(startDate).toLocaleDateString("vi-VN")} → ${endDate ? new Date(endDate).toLocaleDateString("vi-VN") : "Hiện tại"}`
    : null;

  return (
    <div className='flex flex-col gap-6'>
      <WorkspaceTopToolbar
        activeField={activeField}
        canRedo={history.canRedo}
        canUndo={history.canUndo}
        editorMode={editorMode}
        formatActions={formatActions}
        formId='project-form-main'
        heading={isEdit ? `Chỉnh sửa: ${project?.title}` : "Thêm dự án mới"}
        onBack={() => router.push("/admin/projects")}
        onEditorModeChange={setEditorMode}
        onOpenPreview={() => setPreviewOpen(true)}
        onRedo={history.redo}
        onTranslated={handleTranslate}
        onUndo={history.undo}
        onViewLangChange={bi.setViewLang}
        saveLabel='Lưu dự án'
        saving={loading}
        subheading={isEdit ? "Cập nhật thông tin chi tiết của dự án" : "Tạo một dự án nghiên cứu hoặc sản phẩm mới"}
        translateFields={translateSrcFields}
        uploadingImage={uploadingState.uploading}
        uploadPercent={uploadingState.percent}
        viewLang={bi.viewLang}
      />

      <form
        className='grid grid-cols-1 items-start gap-6 lg:grid-cols-12'
        id='project-form-main'
        onSubmit={handleSubmit}
      >
        {/* Left 70%: Unified Document Canvas */}
        <div className='min-w-0 lg:col-span-8'>
          <UnifiedDocumentCanvas
            activeField={activeField}
            bannerBucket={STORAGE_BUCKET}
            bannerLabel='Ảnh thumbnail dự án (Kéo thả hoặc nhấp để tải lên)'
            bannerStoragePath={STORAGE_PATHS.projects}
            bannerUrl={thumbnailUrl}
            content={getContent()}
            contentPlaceholder='Chi tiết dự án (Markdown)...'
            editorMode={editorMode}
            inlineMetaBar={
              <div className='flex min-w-0 flex-wrap items-center gap-4 text-muted-foreground text-xs'>
                <span className='flex shrink-0 items-center gap-1.5 font-medium text-foreground'>
                  <Calendar className='h-3.5 w-3.5 shrink-0 text-primary' />
                  {previewDateLabel || "Chưa chọn ngày dự án (chỉnh ở cột phải)"}
                </span>
                {techs.length > 0 && (
                  <span className='flex min-w-0 items-center gap-1.5 font-medium text-primary'>
                    <Code2 className='h-3.5 w-3.5 shrink-0' />
                    <span className='line-clamp-1 min-w-0 break-all'>{techs.join(" • ")}</span>
                  </span>
                )}
              </div>
            }
            onActiveFieldChange={setActiveField}
            onBannerChange={setThumbnailUrl}
            onContentChange={setContentField}
            onRegisterFormatActions={handleRegisterFormatActions}
            onSummaryChange={setDescriptionField}
            onTitleChange={setTitleField}
            summary={getDescription()}
            summaryPlaceholder='Tóm tắt ngắn gọn về dự án (Hỗ trợ Markdown, có thể để trống)...'
            title={getTitle()}
            titlePlaceholder='Nhập tên dự án...'
          />
        </div>

        {/* Right 30%: Project Info, Links, Techs, Members & Gallery Sidebar */}
        <div className='flex min-w-0 flex-col gap-5 lg:sticky lg:top-28 lg:col-span-4'>
          <Card className='min-w-0 overflow-hidden'>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Thời gian, Liên kết & Công nghệ</CardTitle>
            </CardHeader>
            <CardContent className='grid min-w-0 gap-4'>
              <div className='grid grid-cols-2 gap-3'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='startDate'>Ngày bắt đầu</Label>
                  <Input
                    id='startDate'
                    name='startDate'
                    onChange={(e) => setStartDate(e.target.value)}
                    type='date'
                    value={startDate}
                  />
                </div>
                <div className='grid gap-1.5'>
                  <Label htmlFor='endDate'>Ngày kết thúc</Label>
                  <Input
                    id='endDate'
                    name='endDate'
                    onChange={(e) => setEndDate(e.target.value)}
                    type='date'
                    value={endDate}
                  />
                </div>
              </div>

              <div className='grid gap-3'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='githubUrl'>GitHub Link</Label>
                  <Input
                    id='githubUrl'
                    name='githubUrl'
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder='https://github.com/...'
                    type='url'
                    value={githubUrl}
                  />
                </div>
                <div className='grid gap-1.5'>
                  <Label htmlFor='websiteUrl'>Website Link</Label>
                  <Input
                    id='websiteUrl'
                    name='websiteUrl'
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder='https://...'
                    type='url'
                    value={websiteUrl}
                  />
                </div>
                <div className='grid gap-1.5'>
                  <Label htmlFor='videoUrl'>YouTube / Video Link</Label>
                  <Input
                    id='videoUrl'
                    name='videoUrl'
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder='https://youtube.com/watch?...'
                    type='url'
                    value={videoUrl}
                  />
                </div>
              </div>

              <div className='grid gap-1.5 border-t pt-4'>
                <Label>Công nghệ sử dụng</Label>
                <div className='flex gap-2'>
                  <Input
                    className='h-9 text-xs'
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTech();
                      }
                    }}
                    placeholder='Tên công nghệ, Enter để thêm...'
                    value={techInput}
                  />
                  <Button className='h-9 px-3' onClick={addTech} size='sm' type='button' variant='outline'>
                    + Thêm
                  </Button>
                </div>
                {techs.length > 0 && (
                  <div className='mt-1.5 flex flex-wrap gap-1.5'>
                    {techs.map((t) => (
                      <span
                        className='inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs'
                        key={t}
                      >
                        {t}
                        <button
                          className='ml-1 cursor-pointer font-bold text-muted-foreground hover:text-destructive'
                          onClick={() => setTechs(techs.filter((x) => x !== t))}
                          type='button'
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Thành viên tham gia</CardTitle>
            </CardHeader>
            <CardContent>
              <MemberSelector
                allMembers={allMembers}
                joinedAtHint='Ngày tham gia dự án - để trống sẽ dùng ngày bắt đầu dự án'
                linked={linked}
                onLink={handleLink}
                onUnlink={handleUnlink}
                onUpdate={handleUpdateLinked}
                withImage={false}
                withJoinedAt
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Thư viện ảnh bổ sung</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiImageUpload
                initialImages={imagesItems}
                label='Ảnh bổ sung dự án'
                maxImages={10}
                onChange={setImagesItems}
                storagePath='projects/gallery'
              />
            </CardContent>
          </Card>
        </div>
      </form>

      <PreviewDrawer
        bannerUrl={thumbnailUrl}
        content={displayContent}
        dateLabel={previewDateLabel}
        galleryUrls={imagesItems.map((i) => i.url)}
        membersList={linked.map((l) => ({
          id: l.member.id,
          label: `${getFullName(l.member.firstName, l.member.middleName, l.member.lastName, "vi")}${l.role ? ` (${l.role})` : ""}`
        }))}
        onOpenChange={setPreviewOpen}
        onViewLangChange={bi.setViewLang}
        open={previewOpen}
        summary={displayDescription}
        tagPrefix=''
        tags={techs}
        title={displayTitle}
        titlePlaceholder='Tên dự án hiển thị ở đây'
        viewLang={bi.viewLang}
      />
    </div>
  );
}
