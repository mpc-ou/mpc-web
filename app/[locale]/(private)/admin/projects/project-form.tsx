"use client";

import { ArrowLeft, ImagePlus, Loader2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  adminCreateProject,
  adminLinkProjectMember,
  adminUnlinkProjectMember,
  adminUpdateProject
} from "@/app/_actions/admin";
import { LanguageToggle, type ViewLanguage } from "@/components/custom/language-toggle";
import { TranslateButton } from "@/components/forms/translate-button";
import { useBilingualForm } from "@/components/forms/use-bilingual-form";
import { MarkdownContent } from "@/components/markdown-content";
import { MarkdownEditor } from "@/components/markdown-editor";
import { type LinkedMember, type MemberOption, MemberSelector } from "@/components/member-selector";
import { type ImageItem, MultiImageUpload } from "@/components/multi-image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STORAGE_BUCKET, STORAGE_PATHS } from "@/constants/storage";
import { UPLOAD_MAX_BANNER_SIZE } from "@/constants/upload";
import { useToast } from "@/hooks/use-toast";
import { pickLang } from "@/lib/utils";
import { uploadToStorage } from "@/utils/supabase-upload";
import type { ProjectRow } from "./columns";

type Props = {
  project?: ProjectRow | null;
  allMembers?: MemberOption[];
};

export default function ProjectForm({ project, allMembers = [] }: Props) {
  const isEdit = !!project;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const bi = useBilingualForm(project as any);

  const otherLang: ViewLanguage = bi.viewLang === "vi" ? "en" : "vi";

  const [techs, setTechs] = useState<string[]>(project?.technologies ?? []);
  const [techInput, setTechInput] = useState("");
  const [linked, setLinked] = useState<LinkedMember[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(project?.thumbnail ?? null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [imagesItems, setImagesItems] = useState<ImageItem[]>(
    ((project as { images?: string[] } | null | undefined)?.images ?? []).map((url) => ({ url }))
  );

  useEffect(() => {
    if (project?.members) {
      setLinked(
        project.members.map((m) => ({
          member: {
            id: m.member.id,
            firstName: m.member.firstName,
            lastName: m.member.lastName,
            avatar: null,
            studentId: null,
            webRole: ""
          } as MemberOption,
          role: m.role
        }))
      );
    }
  }, [project?.members]);

  const processThumbnailFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", description: "Chỉ chấp nhận file ảnh" });
      return;
    }
    if (file.size > UPLOAD_MAX_BANNER_SIZE) {
      toast({ variant: "destructive", description: "Ảnh tối đa 8MB" });
      return;
    }
    setThumbnailUploading(true);
    try {
      const url = await uploadToStorage(file, STORAGE_BUCKET, STORAGE_PATHS.projects);
      setThumbnailUrl(url);
    } catch (err) {
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : "Upload thumbnail thất bại"
      });
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

  const addTech = () => {
    const t = techInput.trim();
    if (t && !techs.includes(t)) {
      setTechs([...techs, t]);
    }
    setTechInput("");
  };

  const handleLink = async (member: MemberOption, role: string) => {
    if (!project) {
      setLinked((prev) => [...prev, { member, role: role || null }]);
      return;
    }
    const res = await adminLinkProjectMember(project.id, member.id, role || undefined);
    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
      return;
    }
    setLinked((prev) => [...prev, { member, role: role || null }]);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: bi.titleVi,
      titleEn: bi.titleEn || undefined,
      description: bi.summaryVi ?? undefined,
      descriptionEn: bi.summaryEn ?? undefined,
      content: bi.contentVi ?? undefined,
      contentEn: bi.contentEn ?? undefined,
      thumbnail: thumbnailUrl ?? undefined,
      githubUrl: (fd.get("githubUrl") as string) || undefined,
      websiteUrl: (fd.get("websiteUrl") as string) || undefined,
      videoUrl: (fd.get("videoUrl") as string) || undefined,
      technologies: techs,
      startDate: (fd.get("startDate") as string) || undefined,
      endDate: (fd.get("endDate") as string) || undefined,
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
        await adminLinkProjectMember(entityId, l.member.id, l.role ?? undefined);
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

  const fmtDate = (d: string | null) => (d ? new Date(d).toISOString().split("T")[0] : "");

  const getTitle = () => (bi.viewLang === "vi" ? bi.titleVi : bi.titleEn);
  const setTitleField = (v: string) => (bi.viewLang === "vi" ? bi.setTitleVi(v) : bi.setTitleEn(v));
  const getDescription = () => (bi.viewLang === "vi" ? (bi.summaryVi ?? "") : (bi.summaryEn ?? ""));
  const setDescriptionField = (v: string) =>
    bi.viewLang === "vi" ? bi.setSummaryVi(v || null) : bi.setSummaryEn(v || null);

  const translateSrcFields = {
    title: bi.viewLang === "vi" ? bi.titleVi : bi.titleEn,
    summary: bi.viewLang === "vi" ? bi.summaryVi : bi.summaryEn,
    content: bi.viewLang === "vi" ? bi.contentVi : bi.contentEn
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between border-b pb-4'>
        <div className='flex items-center gap-3'>
          <Button className='h-9 w-9' onClick={() => router.push("/admin/projects")} size='icon' variant='outline'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='font-bold text-foreground text-lg'>
              {isEdit ? `Chỉnh sửa: ${project?.title}` : "Thêm dự án mới"}
            </h1>
            <p className='text-muted-foreground text-xs'>
              {isEdit ? "Cập nhật thông tin chi tiết của dự án" : "Tạo một dự án nghiên cứu hoặc sản phẩm mới"}
            </p>
          </div>
        </div>
        <Button className='h-9' disabled={loading} form='project-form-main' type='submit'>
          {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
          Lưu dự án
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Left: Editor */}
        <form className='flex flex-col gap-6' id='project-form-main' onSubmit={handleSubmit}>
          {/* Language & Translate bar */}
          <Card>
            <CardHeader className='py-3'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <LanguageToggle onChange={bi.setViewLang} value={bi.viewLang} />
                <TranslateButton
                  disabled={!(translateSrcFields.title || translateSrcFields.content)}
                  fields={translateSrcFields}
                  from={bi.viewLang}
                  label={bi.viewLang === "vi" ? "Dịch → 🇬🇧" : "Dịch → 🇻🇳"}
                  onTranslated={handleTranslate}
                  to={otherLang}
                />
              </div>
            </CardHeader>
          </Card>

          {/* Thumbnail + Info */}
          <Card>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4'>
              {/* Thumbnail */}
              <div className='grid gap-1.5'>
                <Label>Ảnh thumbnail</Label>
                {thumbnailUrl ? (
                  <div className='relative flex aspect-video max-h-[200px] items-center justify-center overflow-hidden rounded-lg border bg-muted'>
                    <img alt='Thumbnail' className='h-full w-full object-cover' src={thumbnailUrl} />
                    <button
                      className='absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80'
                      onClick={() => setThumbnailUrl(null)}
                      title='Xóa thumbnail'
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
                        <span className='text-xs'>Upload thumbnail (max 3MB)</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  accept='image/*'
                  className='hidden'
                  onChange={handleThumbnailUpload}
                  ref={thumbnailInputRef}
                  title='Upload thumbnail'
                  type='file'
                />
              </div>

              {/* Title */}
              <div className='grid gap-1.5'>
                <div className='flex items-center gap-2'>
                  <Label htmlFor='title'>Tên dự án *</Label>
                  {bi.viewLang === "vi" && !bi.titleVi && bi.titleEn && (
                    <span className='rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-600'>fallback</span>
                  )}
                  {bi.viewLang === "en" && !bi.titleEn && bi.titleVi && (
                    <span className='rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-600'>fallback</span>
                  )}
                </div>
                <Input
                  id='title'
                  onChange={(e) => setTitleField(e.target.value)}
                  placeholder='Nhập tên dự án...'
                  required
                  value={getTitle()}
                />
              </div>

              {/* Description */}
              <div className='grid gap-1.5'>
                <Label htmlFor='description'>Mô tả ngắn</Label>
                <Input
                  id='description'
                  onChange={(e) => setDescriptionField(e.target.value)}
                  placeholder='Tóm tắt ngắn gọn về dự án...'
                  value={getDescription()}
                />
              </div>

              {/* Dates */}
              <div className='grid grid-cols-2 gap-3'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='startDate'>Ngày bắt đầu</Label>
                  <Input
                    defaultValue={fmtDate(project?.startDate ?? null)}
                    id='startDate'
                    name='startDate'
                    type='date'
                  />
                </div>
                <div className='grid gap-1.5'>
                  <Label htmlFor='endDate'>Ngày kết thúc</Label>
                  <Input defaultValue={fmtDate(project?.endDate ?? null)} id='endDate' name='endDate' type='date' />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Markdown content */}
          <Card>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Nội dung chi tiết (Markdown)</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4'>
              <MarkdownEditor
                defaultValue={bi.viewLang === "vi" ? bi.contentVi : bi.contentEn}
                key={bi.viewLang}
                minHeight='240px'
                name='content'
                onChange={(v) => (bi.viewLang === "vi" ? bi.setContentVi(v) : bi.setContentEn(v))}
                placeholder='Chi tiết dự án (Markdown)...'
              />
            </CardContent>
          </Card>

          {/* Tech & Links */}
          <Card>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Liên kết & Công nghệ</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4'>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='githubUrl'>GitHub Link</Label>
                  <Input
                    defaultValue={project?.githubUrl ?? ""}
                    id='githubUrl'
                    name='githubUrl'
                    placeholder='https://github.com/...'
                    type='url'
                  />
                </div>
                <div className='grid gap-1.5'>
                  <Label htmlFor='websiteUrl'>Website Link</Label>
                  <Input
                    defaultValue={project?.websiteUrl ?? ""}
                    id='websiteUrl'
                    name='websiteUrl'
                    placeholder='https://...'
                    type='url'
                  />
                </div>
                <div className='grid gap-1.5'>
                  <Label htmlFor='videoUrl'>YouTube Link</Label>
                  <Input
                    defaultValue={project?.videoUrl ?? ""}
                    id='videoUrl'
                    name='videoUrl'
                    placeholder='https://youtube.com/watch?...'
                    type='url'
                  />
                </div>
              </div>

              <div className='grid gap-1.5'>
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
                  <div className='mt-1 flex flex-wrap gap-1'>
                    {techs.map((t) => (
                      <span
                        className='inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs'
                        key={t}
                      >
                        {t}
                        <button
                          className='ml-1 font-bold text-muted-foreground hover:text-destructive'
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

          {/* Gallery */}
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

          {/* Members */}
          <Card>
            <CardHeader className='py-4'>
              <CardTitle className='font-semibold text-sm'>Thành viên tham gia</CardTitle>
            </CardHeader>
            <CardContent>
              <MemberSelector allMembers={allMembers} linked={linked} onLink={handleLink} onUnlink={handleUnlink} />
            </CardContent>
          </Card>
        </form>

        {/* Right: Preview */}
        <div className='sticky top-6 hidden max-h-[calc(100vh-80px)] flex-col gap-4 overflow-y-auto rounded-xl border bg-background/50 p-6 backdrop-blur-md lg:flex'>
          <div className='flex items-center justify-between border-b pb-2'>
            <h2 className='font-bold text-muted-foreground text-sm uppercase tracking-wider'>Xem trước giao diện</h2>
            <LanguageToggle onChange={bi.setViewLang} value={bi.viewLang} />
          </div>

          {thumbnailUrl && (
            <div className='relative aspect-video w-full overflow-hidden rounded-lg border bg-muted'>
              <img alt={getTitle() || "Project Thumbnail"} className='h-full w-full object-cover' src={thumbnailUrl} />
            </div>
          )}

          <div>
            <h1 className='font-bold text-2xl text-foreground'>
              {getTitle() || (bi.viewLang === "vi" ? "Tên dự án hiển thị ở đây" : "Project name appears here")}
            </h1>
            {getDescription() && (
              <p className='mt-2 text-muted-foreground text-sm leading-relaxed'>{getDescription()}</p>
            )}
          </div>

          {techs.length > 0 && (
            <div className='flex flex-wrap gap-1.5'>
              {techs.map((tech) => (
                <span
                  className='rounded-full border bg-secondary px-2.5 py-0.5 font-medium text-secondary-foreground text-xs'
                  key={tech}
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {pickLang(bi.viewLang, bi.contentVi, bi.contentEn) ? (
            <div className='border-t pt-4'>
              <MarkdownContent content={pickLang(bi.viewLang, bi.contentVi, bi.contentEn)} />
            </div>
          ) : (
            <div className='border-t pt-4 text-center text-muted-foreground text-xs italic'>
              {bi.viewLang === "vi"
                ? "Nội dung chi tiết (Markdown) sẽ được hiển thị ở đây..."
                : "Project details (Markdown) will appear here..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
