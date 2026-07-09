import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/configs/prisma/db";
import { createClientSsr } from "@/configs/supabase/server";
import { UserBlogEditForm } from "./form.client";

export const metadata: Metadata = {
  title: "Chỉnh sửa bài viết"
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClientSsr();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const member = await prisma.member.findUnique({
    where: { id: user.id },
    select: { id: true, webRole: true }
  });
  if (!member) {
    redirect("/");
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } }
  });
  if (!post) {
    notFound();
  }
  if (post.authorId !== member.id && member.webRole !== "ADMIN") {
    redirect("/my-blogs?error=forbidden");
  }
  if (post.status === "PUBLISHED" && member.webRole !== "ADMIN") {
    redirect("/my-blogs?error=published");
  }

  const mappedPost = {
    id: post.id,
    titleVi: post.titleVi,
    titleEn: post.titleEn,
    slug: post.slug,
    status: post.status,
    type: post.type,
    summaryVi: post.summaryVi,
    summaryEn: post.summaryEn,
    contentVi: post.contentVi,
    contentEn: post.contentEn,
    sourceLanguage: post.sourceLanguage as "VI" | "EN",
    thumbnail: post.thumbnail,
    images: post.images,
    tags: post.tags.map((t) => ({
      tag: { id: t.tag.id, name: t.tag.name, slug: t.tag.slug }
    }))
  };

  return <UserBlogEditForm post={mappedPost} />;
}
