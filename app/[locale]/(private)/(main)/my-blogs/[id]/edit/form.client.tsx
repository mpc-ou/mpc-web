"use client";

import { useRouter } from "next/navigation";
import { userUpdateBlog } from "@/app/_actions/profile/blog-create";
import { type BlogFormData, type BlogFormPayload, BlogForm as SharedBlogForm } from "@/components/forms/blog-form";

export function UserBlogEditForm({ post }: { post: BlogFormData }) {
  const router = useRouter();

  const handleUpdate = async (id: string, payload: BlogFormPayload) => {
    const { status: _status, activityId: _activityId, ...rest } = payload;
    const res = await userUpdateBlog(id, {
      ...rest,
      sourceLanguage: payload.sourceLanguage ?? "VI"
    });
    if (res.error) {
      throw new Error(res.error?.message ?? "Lỗi cập nhật");
    }
  };

  const handleSetTags = async (_postId: string, _tags: string[]) => {
    // Tags not supported for user edits yet
  };

  return (
    <div className='mx-auto max-w-7xl px-4 py-8'>
      <SharedBlogForm
        backUrl='/my-blogs'
        onCreate={async () => ""}
        onSetTags={handleSetTags}
        onSuccess={() => router.push("/my-blogs")}
        onUpdate={handleUpdate}
        post={post}
        showPublishedOption={false}
      />
    </div>
  );
}
