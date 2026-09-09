"use server";

import { translate } from "bing-translate-api";
import { revalidateTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_FAQ, _CACHE_GALLERY, _CACHE_HOMEPAGE, _CACHE_SETTINGS } from "@/constants/cache";
import { translateTextWithDeepseek } from "@/services/deepseek";
import { handleErrorServerWithAuth } from "@/utils/handle-error-server";
import { requireAdmin } from "./helpers";

export const adminGetFaqItems = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.faqItem.findMany({ orderBy: { order: "asc" } });
    }
  });

export const adminGetFaqItemById = async (id: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.faqItem.findUnique({ where: { id } });
    }
  });

export const adminCreateFaqItem = async (data: {
  questionVi: string;
  answerVi: string;
  questionEn?: string;
  answerEn?: string;
  target?: string;
  order?: number;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const created = await prisma.faqItem.create({
        data: {
          questionVi: data.questionVi,
          answerVi: data.answerVi,
          questionEn: data.questionEn ?? "",
          answerEn: data.answerEn ?? "",
          target: data.target ?? "GENERAL",
          order: data.order ?? 0
        }
      });
      revalidateTag(_CACHE_FAQ, "default");
      return created;
    }
  });

export const adminUpdateFaqItem = async (
  id: string,
  data: {
    questionVi?: string;
    answerVi?: string;
    questionEn?: string;
    answerEn?: string;
    target?: string;
    order?: number;
    isActive?: boolean;
  }
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

export const adminSeedDefaultFaqItems = async (target?: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);

      const faqJson = (await import("@/configs/data/fqa.json")).default as unknown as Record<
        string,
        Array<{ vi: { q: string; a: string }; en: { q: string; a: string } }>
      >;

      let seededCount = 0;
      const targets = target ? [target] : Object.keys(faqJson).filter((k) => k !== "_README");

      for (const t of targets) {
        const items = faqJson[t];
        if (!Array.isArray(items)) {
          continue;
        }

        await prisma.faqItem.deleteMany({ where: { target: t } });

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          await prisma.faqItem.create({
            data: {
              questionVi: item.vi.q,
              answerVi: item.vi.a,
              questionEn: item.en.q,
              answerEn: item.en.a,
              target: t,
              order: i,
              isActive: true
            }
          });
          seededCount++;
        }
      }

      revalidateTag(_CACHE_FAQ, "default");
      return { success: true, seededCount };
    }
  });

export const adminTranslateText = async (text: string, from: string, to: string, engine?: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      if (engine === "deepseek") {
        if (!process.env.DEEPSEEK_API_KEY) {
          throw new Error("Không tìm thấy DEEPSEEK_API_KEY. Hãy chọn Bing hoặc cấu hình API Key.");
        }
        try {
          const translation = await translateTextWithDeepseek(text, from, to);
          return { translation };
        } catch (err) {
          console.error("Deepseek translation error:", err);
          throw new Error(`Lỗi dịch thuật Deepseek: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      try {
        const res = await translate(text, from, to);
        return { translation: res?.translation || "" };
      } catch (err) {
        console.error("Bing translation error:", err);
        throw new Error(`Lỗi dịch thuật Bing: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  });

export const adminGetGalleryImages = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.galleryImage.findMany({ orderBy: { order: "asc" } });
    }
  });

export const adminCreateGalleryImage = async (data: { url: string; caption?: string; type?: string; order?: number }) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const created = await prisma.galleryImage.create({
        data: {
          url: data.url,
          caption: data.caption,
          type: data.type ?? "common",
          order: data.order ?? 0
        }
      });
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

export const adminDeleteGalleryImages = async (ids: string[]) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      await prisma.galleryImage.deleteMany({ where: { id: { in: ids } } });
      revalidateTag(_CACHE_GALLERY, "default");
      return { success: true };
    }
  });

export const adminSeedDefaultGalleryImages = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);

      const fs = await import("node:fs");
      const path = await import("node:path");
      const publicDir = path.join(process.cwd(), "public");

      const typeFolders: Record<string, string> = {
        common: "images/home",
        webdesign: "images/web-design"
      };

      let seededCount = 0;

      for (const [type, relPath] of Object.entries(typeFolders)) {
        const folderPath = path.join(publicDir, relPath);
        if (!fs.existsSync(folderPath)) {
          continue;
        }

        const files = fs.readdirSync(folderPath);
        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          if (![".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
            continue;
          }

          const imageUrl = `/${relPath}/${file}`;

          const exists = await prisma.galleryImage.findFirst({
            where: { url: imageUrl }
          });
          if (!exists) {
            await prisma.galleryImage.create({
              data: {
                url: imageUrl,
                caption: file.replace(ext, ""),
                type,
                order: 0,
                isActive: true
              }
            });
            seededCount++;
          }
        }
      }

      revalidateTag(_CACHE_GALLERY, "default");
      return { success: true, seededCount };
    }
  });

export const adminUpdateGalleryOrders = async (items: { id: string; order: number }[]) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const updates = items.map((item) =>
        prisma.galleryImage.update({
          where: { id: item.id },
          data: { order: item.order }
        })
      );
      await prisma.$transaction(updates);
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
        update: {
          value: data.value,
          type: data.type,
          order: data.order,
          isActive: data.isActive
        },
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

// ─── EXTERNAL LINKS ─────────────────────

export const adminGetExternalLinks = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.externalLink.findMany({ orderBy: { order: "asc" } });
    }
  });

export const adminCreateExternalLink = async (data: { label: string; url: string; order?: number }) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const created = await prisma.externalLink.create({ data });
      revalidateTag(_CACHE_SETTINGS, "default");
      return created;
    }
  });

export const adminUpdateExternalLink = async (
  id: string,
  data: { label?: string; url?: string; order?: number; isActive?: boolean }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const updated = await prisma.externalLink.update({ where: { id }, data });
      revalidateTag(_CACHE_SETTINGS, "default");
      return updated;
    }
  });

export const adminDeleteExternalLink = async (id: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      await prisma.externalLink.delete({ where: { id } });
      revalidateTag(_CACHE_SETTINGS, "default");
      return { success: true };
    }
  });
