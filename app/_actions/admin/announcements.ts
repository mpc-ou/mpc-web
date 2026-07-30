"use server";

import { revalidateTag } from "next/cache";
import { _CACHE_ANNOUNCEMENTS } from "@/constants/cache";
import { handleErrorServerWithAuth, prisma, requireAdmin } from "./helpers";

export const adminGetAnnouncements = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
    }
  });

export const adminCreateAnnouncement = async (data: {
  contentVi: string;
  contentEn: string;
  linkUrl?: string;
  linkLabelVi?: string;
  linkLabelEn?: string;
  bgColor?: string;
  isActive?: boolean;
  endAt?: string;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const created = await prisma.announcement.create({
        data: {
          contentVi: data.contentVi,
          contentEn: data.contentEn,
          linkUrl: data.linkUrl || null,
          linkLabelVi: data.linkLabelVi || null,
          linkLabelEn: data.linkLabelEn || null,
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
    contentVi?: string;
    contentEn?: string;
    linkUrl?: string;
    linkLabelVi?: string;
    linkLabelEn?: string;
    bgColor?: string;
    isActive?: boolean;
    endAt?: string | null;
  }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      let endAt: Date | null | undefined;
      if (data.endAt === null) {
        endAt = null;
      } else if (data.endAt) {
        endAt = new Date(data.endAt);
      }

      const updated = await prisma.announcement.update({
        where: { id },
        data: {
          ...data,
          endAt
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
