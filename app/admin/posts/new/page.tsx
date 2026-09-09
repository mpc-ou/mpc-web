import { redirect } from "next/navigation";
import { adminGetMemberOptions } from "@/app/_actions/admin";
import { AchievementForm } from "../_components/achievement-form";
import { BlogForm } from "../_components/blog-form";
import { EventForm } from "../_components/event-form";

type SearchParams = Promise<{ type?: string }>;

export default async function NewPostPage({ searchParams }: { searchParams: SearchParams }) {
  const { type } = await searchParams;

  if (!(type && ["BLOG", "EVENT", "ACHIEVEMENT"].includes(type))) {
    redirect("/admin/posts");
  }

  const { data } = await adminGetMemberOptions();
  const members = (data?.payload as Parameters<typeof AchievementForm>[0]["allMembers"]) ?? [];

  return (
    <div className='flex flex-col gap-6'>
      {type === "BLOG" && <BlogForm />}
      {type === "EVENT" && <EventForm />}
      {type === "ACHIEVEMENT" && <AchievementForm allMembers={members} />}
    </div>
  );
}
