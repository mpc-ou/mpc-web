"use server";

import { revalidateTag } from "next/cache";
import { _CACHE_ANNOUNCEMENTS } from "@/constants/cache";
import { handleErrorServerWithAuth, prisma, requireAdmin } from "./_helpers";

export const adminGetAnnouncements = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
    }
  });

export const adminCreateAnnouncement = async (data: {
  content: string;
  linkUrl?: string;
  linkLabel?: string;
  bgColor?: string;
  isActive?: boolean;
  endAt?: string;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const created = await prisma.announcement.create({
        data: {
          content: data.content,
          linkUrl: data.linkUrl || null,
          linkLabel: data.linkLabel || null,
          bgColor: data.bgColor || null,
          isActive: data.isActive ?? true,
          endAt: data.endAt ? new Date(data.endAt) : null
        }
      });
      revalidateTag(_CACHE_ANNOUNCEMENTS, "default");
      return created;
    }
  });

export const adminUpdateAnnouncement = async (
  id: string,
  data: {
    content?: string;
    linkUrl?: string;
    linkLabel?: string;
    bgColor?: string;
    isActive?: boolean;
    endAt?: string | null;
  }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const updated = await prisma.announcement.update({
        where: { id },
        data: {
          ...data,
          endAt: data.endAt === null ? null : data.endAt ? new Date(data.endAt) : undefined
        }
      });
      revalidateTag(_CACHE_ANNOUNCEMENTS, "default");
      return updated;
    }
  });

export const adminDeleteAnnouncement = async (id: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      await prisma.announcement.delete({ where: { id } });
      revalidateTag(_CACHE_ANNOUNCEMENTS, "default");
      return { success: true };
    }
  });
