"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminCreatePost, adminUpdatePost } from "../actions";
import type { PostRow } from "./columns";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: PostRow | null;
};

export function PostFormDialog({ open, onOpenChange, post }: Props) {
  const isEdit = !!post;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    if (isEdit && post) {
      const res = await adminUpdatePost(post.id, {
        title: fd.get("title") as string,
        summary: (fd.get("summary") as string) || undefined,
        content: fd.get("content") as string,
        status: fd.get("status") as string,
      });
      if (res.error) {
        toast({ variant: "destructive", description: res.error?.message });
        setLoading(false);
        return;
      }
    } else {
      const res = await adminCreatePost({
        title: fd.get("title") as string,
        summary: (fd.get("summary") as string) || undefined,
        content: fd.get("content") as string,
        status: fd.get("status") as string,
      });
      if (res.error) {
        toast({ variant: "destructive", description: res.error?.message });
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Cập nhật nội dung bài viết." : "Viết bài viết mới."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4 py-4"
          id="post-form"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-2">
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input
              defaultValue={post?.title}
              id="title"
              name="title"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="summary">Tóm tắt</Label>
            <Input
              defaultValue={post?.summary ?? ""}
              id="summary"
              name="summary"
            />
          </div>
          <div className="grid gap-2">
            <Label>Nội dung *</Label>
            <MarkdownEditor
              defaultValue={post?.content ?? ""}
              name="content"
              placeholder="Nội dung bài viết (Markdown)..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select defaultValue={post?.status ?? "DRAFT"} name="status">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Nháp</SelectItem>
                <SelectItem value="PENDING_REVIEW">Chờ duyệt</SelectItem>
                <SelectItem value="PUBLISHED">Xuất bản</SelectItem>
                <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
        <DialogFooter>
          <Button disabled={loading} form="post-form" type="submit">
            {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo bài viết"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
