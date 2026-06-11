import { redirect } from "next/navigation";
import { prisma } from "@/configs/prisma/db";
import { AchievementForm } from "../_components/achievement-form";
import { BlogForm } from "../_components/blog-form";
import { EventForm } from "../_components/event-form";

type SearchParams = Promise<{ type?: string }>;

export default async function NewPostPage({ searchParams }: { searchParams: SearchParams }) {
  const { type } = await searchParams;

  if (!(type && ["BLOG", "EVENT", "ACHIEVEMENT"].includes(type))) {
    redirect("/admin/posts");
  }

  // Load all members for achievement selector
  const members = await prisma.member.findMany({
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatar: true,
      studentId: true,
      webRole: true
    }
  });

  return (
    <div className='flex flex-col gap-6'>
      {type === "BLOG" && <BlogForm />}
      {type === "EVENT" && <EventForm />}
      {type === "ACHIEVEMENT" && <AchievementForm allMembers={members} />}
    </div>
  );
}
