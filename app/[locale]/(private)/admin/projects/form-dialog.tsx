"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MarkdownEditor } from "@/components/markdown-editor";
import { type LinkedMember, type MemberOption, MemberSelector } from "@/components/member-selector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/utils/supabase-upload";
import { adminCreateProject, adminLinkProjectMember, adminUnlinkProjectMember, adminUpdateProject } from "../actions";
import type { ProjectRow } from "./columns";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectRow | null;
  allMembers?: MemberOption[];
};

export function ProjectFormDialog({ open, onOpenChange, project, allMembers = [] }: Props) {
  const isEdit = !!project;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [techs, setTechs] = useState<string[]>(project?.technologies ?? []);
  const [techInput, setTechInput] = useState("");
  const [linked, setLinked] = useState<LinkedMember[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(project?.thumbnail ?? null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTechs(project?.technologies ?? []);
    setThumbnailUrl(project?.thumbnail ?? null);
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
    } else {
      setLinked([]);
    }
  }, [project.members.map, project?.technologies, project?.thumbnail, project?.members]);

  const processThumbnailFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", description: "Chỉ chấp nhận file ảnh" });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast({ variant: "destructive", description: "Ảnh tối đa 3MB" });
      return;
    }
    setThumbnailUploading(true);
    try {
      const url = await uploadToStorage(file, "media", "projects");
      setThumbnailUrl(url);
    } catch {
      toast({
        variant: "destructive",
        description: "Upload thumbnail thất bại"
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || undefined,
      content: (fd.get("content") as string) || undefined,
      thumbnail: thumbnailUrl ?? undefined,
      githubUrl: (fd.get("githubUrl") as string) || undefined,
      websiteUrl: (fd.get("websiteUrl") as string) || undefined,
      videoUrl: (fd.get("videoUrl") as string) || undefined,
      technologies: techs,
      startDate: (fd.get("startDate") as string) || undefined,
      endDate: (fd.get("endDate") as string) || undefined
    };

    let entityId: string | null = project?.id ?? null;

    if (isEdit && project) {
      const res = await adminUpdateProject(project.id, payload);
      if (res.error) {
        toast({ variant: "destructive", description: res.error?.message });
        setLoading(false);
        return;
      }
    } else {
      const res = await adminCreateProject(payload);
      if (res.error) {
        toast({ variant: "destructive", description: res.error?.message });
        setLoading(false);
        return;
      }
      entityId = (res.data?.payload as { id: string })?.id ?? null;
    }

    // Link pending members on create
    if (!isEdit && entityId) {
      for (const l of linked) {
        await adminLinkProjectMember(entityId, l.member.id, l.role ?? undefined);
      }
    }

    setLoading(false);
    onOpenChange(false);
  };

  const fmtDate = (d: string | null) => (d ? new Date(d).toISOString().split("T")[0] : "");

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-160'>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa dự án" : "Thêm dự án mới"}</DialogTitle>
          <DialogDescription>{isEdit ? "Cập nhật thông tin dự án." : "Thêm dự án mới."}</DialogDescription>
        </DialogHeader>
        <form className='grid gap-4 py-2' id='project-form' onSubmit={handleSubmit}>
          <div className='grid gap-1.5'>
            <Label>Tên dự án *</Label>
            <Input defaultValue={project?.title} name='title' required />
          </div>
          <div className='grid gap-1.5'>
            <Label>Mô tả ngắn</Label>
            <Input defaultValue={project?.description ?? ""} name='description' />
          </div>
          {/* Thumbnail */}
          <div className='grid gap-1.5'>
            <Label>Ảnh thumbnail</Label>
            {thumbnailUrl ? (
              <div className='relative aspect-video w-full overflow-hidden rounded-lg border bg-muted'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt='Thumbnail' className='h-full w-full object-cover' src={thumbnailUrl} />
                <button
                  className='absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80'
                  onClick={() => setThumbnailUrl(null)}
                  title='Xóa thumbnail'
                  type='button'
                >
                  <X className='h-3.5 w-3.5' />
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
          <div className='grid gap-1.5'>
            <Label>Chi tiết</Label>
            <MarkdownEditor
              defaultValue={project?.content ?? ""}
              minHeight='160px'
              name='content'
              placeholder='Chi tiết dự án (Markdown)...'
            />
          </div>
          <div className='grid grid-cols-3 gap-3'>
            <div className='grid gap-1.5'>
              <Label>GitHub</Label>
              <Input defaultValue={project?.githubUrl ?? ""} name='githubUrl' type='url' />
            </div>
            <div className='grid gap-1.5'>
              <Label>Website</Label>
              <Input defaultValue={project?.websiteUrl ?? ""} name='websiteUrl' type='url' />
            </div>
            <div className='grid gap-1.5'>
              <Label>Video</Label>
              <Input defaultValue={project?.videoUrl ?? ""} name='videoUrl' type='url' />
            </div>
          </div>
          {/* Tech tags */}
          <div className='grid gap-1.5'>
            <Label>Công nghệ</Label>
            <div className='flex gap-2'>
              <Input
                className='h-8 text-sm'
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
              <Button onClick={addTech} size='sm' type='button' variant='outline'>
                +
              </Button>
            </div>
            {techs.length > 0 && (
              <div className='flex flex-wrap gap-1'>
                {techs.map((t) => (
                  <span className='inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs' key={t}>
                    {t}
                    <button
                      className='hover:text-destructive'
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
          <div className='grid grid-cols-2 gap-3'>
            <div className='grid gap-1.5'>
              <Label>Bắt đầu</Label>
              <Input defaultValue={fmtDate(project?.startDate ?? null)} name='startDate' type='date' />
            </div>
            <div className='grid gap-1.5'>
              <Label>Kết thúc</Label>
              <Input defaultValue={fmtDate(project?.endDate ?? null)} name='endDate' type='date' />
            </div>
          </div>

          <Separator />

          <MemberSelector allMembers={allMembers} linked={linked} onLink={handleLink} onUnlink={handleUnlink} />
        </form>
        <DialogFooter>
          <Button disabled={loading} form='project-form' type='submit'>
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang lưu...
              </>
            ) : isEdit ? (
              "Lưu thay đổi"
            ) : (
              "Thêm dự án"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
