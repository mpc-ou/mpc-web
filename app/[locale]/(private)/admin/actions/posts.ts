"use server";

import { revalidateTag } from "next/cache";
import { _CACHE_POSTS } from "@/constants/cache";
import { generateSlug, handleErrorServerWithAuth, prisma, requireAdmin } from "./_helpers";

export const adminGetPosts = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.post.findMany({ orderBy: { createdAt: "desc" }, include: { author: true, category: true } });
    }
  });

export const adminDeletePost = async (id: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      await prisma.post.delete({ where: { id } });
      revalidateTag(_CACHE_POSTS, "default");
      return { success: true };
    }
  });

export const adminCreatePost = async (data: {
  title: string;
  slug?: string;
  summary?: string;
  content: string;
  categoryId?: string;
  status?: string;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const admin = await requireAdmin(user);
      const slug = data.slug || generateSlug(data.title);
      const created = await prisma.post.create({
        data: {
          title: data.title,
          slug,
          summary: data.summary || null,
          content: data.content,
          categoryId: data.categoryId || null,
          status: (data.status as "DRAFT" | "PENDING_REVIEW" | "PUBLISHED") ?? "DRAFT",
          authorId: admin.id
        }
      });
      revalidateTag(_CACHE_POSTS, "default");
      return created;
    }
  });

export const adminUpdatePostStatus = async (id: string, status: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const admin = await requireAdmin(user);
      const updateData: Record<string, unknown> = {
        status: status as "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED" | "REJECTED"
      };
      if (status === "PUBLISHED") {
        updateData.publishedAt = new Date();
        updateData.reviewerId = admin.id;
      }
      const updated = await prisma.post.update({ where: { id }, data: updateData });
      revalidateTag(_CACHE_POSTS, "default");
      return updated;
    }
  });

export const adminUpdatePost = async (
  id: string,
  data: { title?: string; summary?: string; content?: string; status?: string; categoryId?: string | null }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const admin = await requireAdmin(user);
      const updateData: Record<string, unknown> = {
        ...(data.title && { title: data.title }),
        ...(data.summary !== undefined && { summary: data.summary || null }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.status && {
          status: data.status as "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED" | "REJECTED"
        })
      };
      if (data.status === "PUBLISHED") {
        updateData.publishedAt = new Date();
        updateData.reviewerId = admin.id;
      }
      const updated = await prisma.post.update({ where: { id }, data: updateData });
      revalidateTag(_CACHE_POSTS, "default");
      return updated;
    }
  });
