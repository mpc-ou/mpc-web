"use client";

import { useRouter } from "next/navigation";
import { userCreateBlog, userUpdateBlog } from "@/app/_actions/profile/blog-create";
import { type BlogFormData, type BlogFormPayload, BlogForm as SharedBlogForm } from "@/components/forms/blog-form";

export function UserBlogCreateForm({ post }: { post?: BlogFormData | null }) {
  const router = useRouter();
  const isEdit = !!post;

  const handleCreate = async (payload: BlogFormPayload): Promise<string | undefined> => {
    const res = await userCreateBlog({
      ...payload,
      sourceLanguage: payload.sourceLanguage ?? "VI"
    } as any);
    if (res.error) {
      throw new Error(res.error?.message ?? "Lỗi tạo bài viết");
    }
    return (res.data?.payload as { id: string })?.id;
  };

  const handleUpdate = async (id: string, payload: BlogFormPayload) => {
    const res = await userUpdateBlog(id, {
      ...payload,
      sourceLanguage: payload.sourceLanguage ?? "VI"
    } as any);
    if (res.error) {
      throw new Error(res.error?.message ?? "Lỗi cập nhật");
    }
  };

  const handleSetTags = async (_postId: string, _tags: string[]) => {
    // User blog creation doesn't support tags yet
  };

  return (
    <div className='mx-auto max-w-7xl px-4 py-8'>
      <SharedBlogForm
        backUrl='/my-blogs'
        onCreate={handleCreate}
        onSetTags={handleSetTags}
        onSuccess={() => router.push("/my-blogs")}
        onUpdate={handleUpdate}
        post={post}
        showPublishedOption={false}
      />
    </div>
  );
}
