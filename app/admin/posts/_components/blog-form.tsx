"use client";

import { useRouter } from "next/navigation";
import { adminCreatePost, adminSetPostTags, adminUpdatePost } from "@/app/_actions/admin";
import { type BlogFormData, type BlogFormPayload, BlogForm as SharedBlogForm } from "@/components/forms/blog-form";

type Props = {
  post?: BlogFormData | null;
  activities?: Array<{ id: string; titleVi: string }>;
};

export function BlogForm({ post, activities = [] }: Props) {
  const router = useRouter();

  const handleCreate = async (payload: BlogFormPayload): Promise<string | undefined> => {
    const res = await adminCreatePost({
      ...payload,
      activityId: payload.activityId || null
    });
    if (res.error) {
      throw new Error(res.error?.message ?? "Lỗi tạo bài viết");
    }
    return (res.data?.payload as { id: string })?.id;
  };

  const handleUpdate = async (id: string, payload: BlogFormPayload) => {
    const res = await adminUpdatePost(id, {
      ...payload,
      activityId: payload.activityId || null
    });
    if (res.error) {
      throw new Error(res.error?.message ?? "Lỗi cập nhật");
    }
  };

  const handleSetTags = async (postId: string, tags: string[]) => {
    await adminSetPostTags(postId, tags);
  };

  return (
    <SharedBlogForm
      activities={activities}
      backUrl='/admin/posts'
      onCreate={handleCreate}
      onSetTags={handleSetTags}
      onSuccess={() => router.push("/admin/posts")}
      onUpdate={handleUpdate}
      post={post}
    />
  );
}
