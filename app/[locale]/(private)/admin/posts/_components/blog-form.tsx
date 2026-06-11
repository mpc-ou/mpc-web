"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminCreatePost, adminSetPostTags, adminUpdatePost } from "@/app/_actions/admin";
import { type BlogFormData, type BlogFormPayload, BlogForm as SharedBlogForm } from "@/components/forms/blog-form";

type Props = {
  post?: BlogFormData | null;
  activities?: Array<{ id: string; titleVi: string }>;
};

export function BlogForm({ post, activities = [] }: Props) {
  const router = useRouter();
  const [activityId, setActivityId] = useState<string>((post as any)?.activityId ?? "");

  const handleCreate = async (payload: BlogFormPayload): Promise<string | undefined> => {
    const res = await adminCreatePost({
      ...payload,
      activityId: activityId || null
    } as any);
    if (res.error) {
      throw new Error(res.error?.message ?? "Lỗi tạo bài viết");
    }
    return (res.data?.payload as { id: string })?.id;
  };

  const handleUpdate = async (id: string, payload: BlogFormPayload) => {
    const res = await adminUpdatePost(id, {
      ...payload,
      activityId: activityId || null
    } as any);
    if (res.error) {
      throw new Error(res.error?.message ?? "Lỗi cập nhật");
    }
  };

  const handleSetTags = async (postId: string, tags: string[]) => {
    await adminSetPostTags(postId, tags);
  };

  return (
    <div className='flex flex-col gap-6'>
      {activities.length > 0 && (
        <div className='rounded-xl border bg-card p-4'>
          <div className='flex items-center gap-3'>
            <label className='font-medium text-sm'>Loại hoạt động</label>
            <select
              className='rounded-md border border-input bg-transparent px-3 py-1.5 text-sm'
              onChange={(e) => setActivityId(e.target.value)}
              value={activityId}
            >
              <option value=''>-- Không --</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.titleVi}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <SharedBlogForm
        backUrl='/admin/posts'
        onCreate={handleCreate}
        onSetTags={handleSetTags}
        onSuccess={() => router.push("/admin/posts")}
        onUpdate={handleUpdate}
        post={post}
      />
    </div>
  );
}
