import { notFound } from "next/navigation";
import { prisma } from "@/configs/prisma/db";
import { AchievementForm } from "../../_components/achievement-form";
import { BlogForm } from "../../_components/blog-form";
import { EventForm } from "../../_components/event-form";
import type { PostRow } from "../../columns";

type Params = Promise<{ id: string }>;

export default async function EditPostPage({ params }: { params: Params }) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      titleVi: true,
      titleEn: true,
      slug: true,
      status: true,
      type: true,
      createdAt: true,
      publishedAt: true,
      summaryVi: true,
      summaryEn: true,
      contentVi: true,
      contentEn: true,
      sourceLanguage: true,
      thumbnail: true,
      locationVi: true,
      locationEn: true,
      latitude: true,
      longitude: true,
      startAt: true,
      endAt: true,
      eventStatus: true,
      eventType: true,
      achievementType: true,
      achievementDate: true,
      isHighlight: true,
      relatedUrl: true,
      images: true,
      tags: { select: { tag: true } },
      author: { select: { firstName: true, lastName: true } },
      category: { select: { name: true } },
      gallery: {
        orderBy: { order: "asc" }
      },
      achievementMembers: {
        include: {
          member: {
            select: { id: true, firstName: true, lastName: true, avatar: true }
          }
        }
      }
    }
  });

  if (!post) {
    notFound();
  }

  const mappedPost = {
    ...post,
    title: post.titleVi,
    titleVi: post.titleVi,
    titleEn: post.titleEn,
    summary: post.summaryVi,
    summaryVi: post.summaryVi,
    summaryEn: post.summaryEn,
    content: post.contentVi,
    contentVi: post.contentVi,
    contentEn: post.contentEn,
    sourceLanguage: post.sourceLanguage,
    startAt: post.startAt?.toISOString() ?? null,
    endAt: post.endAt?.toISOString() ?? null,
    achievementDate: post.achievementDate?.toISOString() ?? null,
    members: post.achievementMembers,
    tags: post.tags
  } as unknown as PostRow;

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
