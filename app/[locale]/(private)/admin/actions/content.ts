"use server";

import { revalidateTag } from "next/cache";
import { _CACHE_FAQ, _CACHE_GALLERY, _CACHE_HOMEPAGE, _CACHE_SETTINGS } from "@/constants/cache";
import { handleErrorServerWithAuth, prisma, requireAdmin } from "./_helpers";

// ─── FAQ ────────────────────────────────

export const adminGetFaqItems = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.faqItem.findMany({ orderBy: { order: "asc" } });
    }
  });

export const adminCreateFaqItem = async (data: { question: string; answer: string; locale?: string; order?: number }) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const created = await prisma.faqItem.create({ data: { ...data, locale: data.locale ?? "vi" } });
      revalidateTag(_CACHE_FAQ, "default");
      return created;
    }
  });

export const adminUpdateFaqItem = async (
  id: string,
  data: { question?: string; answer?: string; locale?: string; order?: number; isActive?: boolean }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const updated = await prisma.faqItem.update({ where: { id }, data });
      revalidateTag(_CACHE_FAQ, "default");
      return updated;
    }
  });

export const adminDeleteFaqItem = async (id: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      await prisma.faqItem.delete({ where: { id } });
      revalidateTag(_CACHE_FAQ, "default");
      return { success: true };
    }
  });

// ─── GALLERY ────────────────────────────

export const adminGetGalleryImages = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.galleryImage.findMany({ orderBy: { order: "asc" } });
    }
  });

export const adminCreateGalleryImage = async (data: { url: string; caption?: string; order?: number }) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const created = await prisma.galleryImage.create({ data });
      revalidateTag(_CACHE_GALLERY, "default");
      return created;
    }
  });

export const adminDeleteGalleryImage = async (id: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      await prisma.galleryImage.delete({ where: { id } });
      revalidateTag(_CACHE_GALLERY, "default");
      return { success: true };
    }
  });

// ─── HOMEPAGE SECTIONS ──────────────────

export const adminGetHomepageSections = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.homepageSection.findMany({ orderBy: { order: "asc" } });
    }
  });

export const adminUpsertHomepageSection = async (data: {
  key: string;
  value: string;
  type?: string;
  order?: number;
  isActive?: boolean;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const result = await prisma.homepageSection.upsert({
        where: { key: data.key },
        update: { value: data.value, type: data.type, order: data.order, isActive: data.isActive },
        create: data
      });
      revalidateTag(_CACHE_HOMEPAGE, "default");
      return result;
    }
  });

// ─── SITE SETTINGS ──────────────────────

export const adminGetSettings = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
    }
  });

export const adminUpsertSetting = async (data: { key: string; value: string; description?: string }) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const result = await prisma.siteSetting.upsert({
        where: { key: data.key },
        update: { value: data.value, description: data.description },
        create: data
      });
      revalidateTag(_CACHE_SETTINGS, "default");
      return result;
    }
  });
