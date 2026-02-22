"use server";

import { revalidateTag } from "next/cache";
import { _CACHE_ACHIEVEMENTS } from "@/constants/cache";
import { generateSlug, handleErrorServerWithAuth, prisma, requireAdmin } from "./_helpers";

export const adminGetAchievements = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.achievement.findMany({
        orderBy: { date: "desc" },
        include: { members: { include: { member: true } }, relatedPost: { select: { id: true, title: true } } }
      });
    }
  });

export const adminCreateAchievement = async (data: {
  title: string;
  slug?: string;
  summary?: string;
  content?: string;
  thumbnail?: string;
  date: string;
  type?: string;
  isHighlight?: boolean;
  relatedUrl?: string;
  relatedPostId?: string;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const slug = data.slug || generateSlug(data.title);
      const created = await prisma.achievement.create({
        data: {
          title: data.title,
          slug,
          summary: data.summary || null,
          content: data.content || null,
          thumbnail: data.thumbnail || null,
          date: new Date(data.date),
          type: (data.type as "INDIVIDUAL" | "TEAM" | "CLUB") ?? "TEAM",
          isHighlight: data.isHighlight ?? false,
          relatedUrl: data.relatedUrl || null,
          relatedPostId: data.relatedPostId || null
        }
      });
      revalidateTag(_CACHE_ACHIEVEMENTS, "default");
      return created;
    }
  });

export const adminUpdateAchievement = async (
  id: string,
  data: {
    title?: string;
    summary?: string;
    content?: string;
    thumbnail?: string;
    date?: string;
    type?: string;
    isHighlight?: boolean;
    relatedUrl?: string;
    relatedPostId?: string | null;
  }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const updated = await prisma.achievement.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.summary !== undefined && { summary: data.summary }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
          ...(data.date && { date: new Date(data.date) }),
          ...(data.type && { type: data.type as "INDIVIDUAL" | "TEAM" | "CLUB" }),
          ...(data.isHighlight !== undefined && { isHighlight: data.isHighlight }),
          ...(data.relatedUrl !== undefined && { relatedUrl: data.relatedUrl }),
          ...(data.relatedPostId !== undefined && { relatedPostId: data.relatedPostId })
        }
      });
      revalidateTag(_CACHE_ACHIEVEMENTS, "default");
      return updated;
    }
  });

export const adminDeleteAchievement = async (id: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      await prisma.achievement.delete({ where: { id } });
      revalidateTag(_CACHE_ACHIEVEMENTS, "default");
      return { success: true };
    }
  });

export const adminLinkAchievementMember = async (achievementId: string, memberId: string, role?: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const link = await prisma.achievementMember.create({
        data: { achievementId, memberId, role: role || null }
      });
      revalidateTag(_CACHE_ACHIEVEMENTS, "default");
      return link;
    }
  });

export const adminUnlinkAchievementMember = async (achievementId: string, memberId: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      await prisma.achievementMember.delete({
        where: { achievementId_memberId: { achievementId, memberId } }
      });
      revalidateTag(_CACHE_ACHIEVEMENTS, "default");
      return { success: true };
    }
  });
