"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  type LinkedMember,
  MemberSelector,
  type MemberOption,
} from "@/components/member-selector";
import { MarkdownEditor } from "@/components/markdown-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  adminCreateProject,
  adminLinkProjectMember,
  adminUnlinkProjectMember,
  adminUpdateProject,
} from "../actions";
import type { ProjectRow } from "./columns";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectRow | null;
  allMembers?: MemberOption[];
};

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  allMembers = [],
}: Props) {
  const isEdit = !!project;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [techs, setTechs] = useState<string[]>(project?.technologies ?? []);
  const [techInput, setTechInput] = useState("");
  const [linked, setLinked] = useState<LinkedMember[]>([]);

  useEffect(() => {
    setTechs(project?.technologies ?? []);
    if (project?.members) {
      setLinked(
        project.members.map((m) => ({
          member: {
            id: m.member.id,
            firstName: m.member.firstName,
            lastName: m.member.lastName,
            avatar: null,
            studentId: null,
            webRole: "",
          } as MemberOption,
          role: m.role,
        })),
      );
    } else {
      setLinked([]);
    }
  }, [project?.id, open]);

  const addTech = () => {
    const t = techInput.trim();
    if (t && !techs.includes(t)) setTechs([...techs, t]);
    setTechInput("");
  };

  const handleLink = async (member: MemberOption, role: string) => {
    if (!project) {
      setLinked((prev) => [...prev, { member, role: role || null }]);
      return;
    }
    const res = await adminLinkProjectMember(
      project.id,
      member.id,
      role || undefined,
    );
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
      githubUrl: (fd.get("githubUrl") as string) || undefined,
      websiteUrl: (fd.get("websiteUrl") as string) || undefined,
      videoUrl: (fd.get("videoUrl") as string) || undefined,
      technologies: techs,
      startDate: (fd.get("startDate") as string) || undefined,
      endDate: (fd.get("endDate") as string) || undefined,
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
        await adminLinkProjectMember(
          entityId,
          l.member.id,
          l.role ?? undefined,
        );
      }
    }

    setLoading(false);
    onOpenChange(false);
  };

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa dự án" : "Thêm dự án mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Cập nhật thông tin dự án." : "Thêm dự án mới."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4 py-2"
          id="project-form"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-1.5">
            <Label>Tên dự án *</Label>
            <Input defaultValue={project?.title} name="title" required />
          </div>
          <div className="grid gap-1.5">
            <Label>Mô tả ngắn</Label>
            <Input
              defaultValue={project?.description ?? ""}
              name="description"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Chi tiết</Label>
            <MarkdownEditor
              defaultValue={project?.content ?? ""}
              minHeight="160px"
              name="content"
              placeholder="Chi tiết dự án (Markdown)..."
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label>GitHub</Label>
              <Input
                defaultValue={project?.githubUrl ?? ""}
                name="githubUrl"
                type="url"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Website</Label>
              <Input
                defaultValue={project?.websiteUrl ?? ""}
                name="websiteUrl"
                type="url"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Video</Label>
              <Input
                defaultValue={project?.videoUrl ?? ""}
                name="videoUrl"
                type="url"
              />
            </div>
          </div>
          {/* Tech tags */}
          <div className="grid gap-1.5">
            <Label>Công nghệ</Label>
            <div className="flex gap-2">
              <Input
                className="h-8 text-sm"
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTech();
                  }
                }}
                placeholder="Tên công nghệ, Enter để thêm..."
                value={techInput}
              />
              <Button
                onClick={addTech}
                size="sm"
                type="button"
                variant="outline"
              >
                +
              </Button>
            </div>
            {techs.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {techs.map((t) => (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                    key={t}
                  >
                    {t}
                    <button
                      className="hover:text-destructive"
                      onClick={() => setTechs(techs.filter((x) => x !== t))}
                      type="button"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Bắt đầu</Label>
              <Input
                defaultValue={fmtDate(project?.startDate ?? null)}
                name="startDate"
                type="date"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Kết thúc</Label>
              <Input
                defaultValue={fmtDate(project?.endDate ?? null)}
                name="endDate"
                type="date"
              />
            </div>
          </div>

          <Separator />

          <MemberSelector
            allMembers={allMembers}
            linked={linked}
            onLink={handleLink}
            onUnlink={handleUnlink}
          />
        </form>
        <DialogFooter>
          <Button disabled={loading} form="project-form" type="submit">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
