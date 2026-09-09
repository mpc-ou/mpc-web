import { notFound } from "next/navigation";
import { adminGetMemberOptions, adminGetPostById } from "@/app/_actions/admin";
import { AchievementForm } from "../../_components/achievement-form";
import { BlogForm } from "../../_components/blog-form";
import { EventForm } from "../../_components/event-form";
import type { PostRow } from "../../columns";

type Params = Promise<{ id: string }>;

export default async function EditPostPage({ params }: { params: Params }) {
  const { id } = await params;

  const [{ data: postData }, { data: membersData }] = await Promise.all([
    adminGetPostById(id),
    adminGetMemberOptions()
  ]);

  if (!postData?.payload) {
    notFound();
  }

  const mappedPost = postData.payload as unknown as PostRow;
  const members = (membersData?.payload as Parameters<typeof AchievementForm>[0]["allMembers"]) ?? [];

  return (
    <div className='flex flex-col gap-6'>
      {mappedPost.type === "BLOG" && (
        <BlogForm
          post={{
            ...mappedPost,
            gallery: mappedPost.gallery?.map((g) => ({
              url: g.url,
              title: g.title ?? undefined,
              caption: g.caption ?? undefined,
              type: g.type
            }))
          }}
        />
      )}
      {mappedPost.type === "EVENT" && <EventForm post={mappedPost} />}
      {mappedPost.type === "ACHIEVEMENT" && <AchievementForm allMembers={members} post={mappedPost} />}
    </div>
  );
}
