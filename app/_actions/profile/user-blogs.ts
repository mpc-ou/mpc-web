"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_POSTS } from "@/constants/cache";
import { getBlogPermissionLevel, hasBlogCreationPermission } from "@/services/blog-permission";
import { handleErrorServerWithAuth } from "@/utils/handle-error-server";

// ── Get user's own posts ──

export const getUserPosts = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const member = await prisma.member.findUnique({
        where: { id: user?.id },
        select: {
          id: true,
          webRole: true
        }
      });
      if (!member) {
        return { posts: [] };
      }

      const posts = await prisma.post.findMany({
        where: { authorId: member.id, type: "BLOG" },
        orderBy: { createdAt: "desc" },
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
          thumbnail: true
        }
      });

      return {
        posts: posts.map((p) => ({
          ...p,
          title: p.titleVi,
          createdAt: p.createdAt.toISOString(),
          publishedAt: p.publishedAt?.toISOString() ?? null
        })),
        webRole: member.webRole
      };
    }
  });

// ── Create blog post (user) ──

export const userCreateBlog = async (data: {
  title: string;
  titleEn?: string;
  summary?: string;
  summaryEn?: string;
  content: string;
  contentEn?: string;
  sourceLanguage?: "VI" | "EN";
  thumbnail?: string | null;
  images?: { url: string; title?: string; caption?: string }[];
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const member = await prisma.member.findUnique({
        where: { id: user?.id },
        select: { id: true, webRole: true }
      });
      if (!member) {
        throw new Error("Bạn cần có tài khoản thành viên để đăng bài.");
      }

      // Check permission
      const level = await getBlogPermissionLevel();
      if (!hasBlogCreationPermission(member.webRole, level)) {
        throw new Error("Bạn không có quyền đăng bài viết.");
      }

      const slug = `${data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${Math.floor(Date.now() / 1000)}`;

      const normalizedImages = (data.images ?? []).map((img) => (typeof img === "string" ? img : img.url));

      const post = await prisma.post.create({
        data: {
          type: "BLOG",
          titleVi: data.title,
          titleEn: data.titleEn ?? "",
          slug,
          summaryVi: data.summary ?? null,
          summaryEn: data.summaryEn ?? null,
          contentVi: data.content,
          contentEn: data.contentEn ?? "",
          sourceLanguage: data.sourceLanguage ?? "VI",
          thumbnail: data.thumbnail ?? null,
          status: "PENDING_REVIEW",
          authorId: member.id,
          images: normalizedImages
        }
      });

      revalidateTag(_CACHE_POSTS, "default");
      return { id: post.id, slug: post.slug };
    }
  });

// ── Update blog post (owner only, only if PENDING_REVIEW or DRAFT) ──

export const userUpdateBlog = async (
  postId: string,
  data: {
    title: string;
    titleEn?: string;
    summary?: string;
    summaryEn?: string;
    content: string;
    contentEn?: string;
    sourceLanguage?: "VI" | "EN";
    thumbnail?: string | null;
    images?: { url: string; title?: string; caption?: string }[];
  }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const member = await prisma.member.findUnique({
        where: { id: user?.id },
        select: { id: true, webRole: true }
      });
      if (!member) {
        throw new Error("Unauthorized");
      }

      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) {
        throw new Error("Bài viết không tồn tại.");
      }
      if (post.authorId !== member.id && member.webRole !== "ADMIN") {
        throw new Error("Bạn không có quyền sửa bài viết này.");
      }
      if (post.status === "PUBLISHED" && member.webRole !== "ADMIN") {
        throw new Error("Bài viết đã xuất bản, không thể sửa.");
      }

      const normalizedImages = (data.images ?? []).map((img) => (typeof img === "string" ? img : img.url));

      const updated = await prisma.post.update({
        where: { id: postId },
        data: {
          titleVi: data.title,
          titleEn: data.titleEn ?? "",
          summaryVi: data.summary ?? null,
          summaryEn: data.summaryEn ?? null,
          contentVi: data.content,
          contentEn: data.contentEn ?? "",
          sourceLanguage: data.sourceLanguage ?? "VI",
          thumbnail: data.thumbnail ?? null,
          images: normalizedImages
        }
      });

      revalidateTag(_CACHE_POSTS, "default");
      return { id: updated.id, slug: updated.slug };
    }
  });

// ── Get single post by ID (for editing) ──

export const getUserPostById = async (postId: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const member = await prisma.member.findUnique({
        where: { id: user?.id },
        select: { id: true, webRole: true }
      });
      if (!member) {
        throw new Error("Unauthorized");
      }

      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          tags: { include: { tag: true } }
        }
      });
      if (!post) {
        throw new Error("Bài viết không tồn tại.");
      }
      if (post.authorId !== member.id && member.webRole !== "ADMIN") {
        throw new Error("Bạn không có quyền xem bài viết này.");
      }

      return {
        id: post.id,
        titleVi: post.titleVi,
        titleEn: post.titleEn,
        slug: post.slug,
        status: post.status,
        summaryVi: post.summaryVi,
        summaryEn: post.summaryEn,
        contentVi: post.contentVi,
        contentEn: post.contentEn,
        sourceLanguage: post.sourceLanguage,
        thumbnail: post.thumbnail,
        images: post.images,
        tags: post.tags.map((t) => ({
          tag: { id: t.tag.id, name: t.tag.name, slug: t.tag.slug }
        }))
      };
    }
  });
