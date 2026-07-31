import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getUserPostById } from "@/app/_actions/profile/user-blogs";
import { UserBlogEditForm } from "./form.client";

export const metadata: Metadata = {
  title: "Chỉnh sửa bài viết"
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;

  const res = await getUserPostById(id);

  if (res.error || !res.data?.payload) {
    if (res.error) {
      redirect("/login");
    }
    notFound();
  }

  const post = res.data.payload as {
    id: string;
    titleVi: string;
    titleEn: string;
    slug: string;
    status: string;
    summaryVi: string | null;
    summaryEn: string | null;
    contentVi: string;
    contentEn: string;
    sourceLanguage: string;
    thumbnail: string | null;
    images: string[];
    tags: Array<{ tag: { id: string; name: string; slug: string } }>;
  };

  const mappedPost = {
    id: post.id,
    titleVi: post.titleVi,
    titleEn: post.titleEn,
    slug: post.slug,
    status: post.status,
    type: "BLOG" as const,
    summaryVi: post.summaryVi,
    summaryEn: post.summaryEn,
    contentVi: post.contentVi,
    contentEn: post.contentEn,
    sourceLanguage: (post.sourceLanguage as "VI" | "EN") ?? "VI",
    thumbnail: post.thumbnail,
    images: post.images,
    tags: post.tags.map((t) => ({
      tag: { id: t.tag.id, name: t.tag.name, slug: t.tag.slug }
    }))
  };

  return <UserBlogEditForm post={mappedPost} />;
}
