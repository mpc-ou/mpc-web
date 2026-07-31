"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { handleErrorServerWithAuth } from "@/utils/handle-error-server";
import { generateSlug, requireAdmin } from "./helpers";

const _CACHE_ACTIVITIES = "activities";
const LEADING_SLASH_RE = /^\//;
const IMAGE_EXT_RE = /\.(jpg|jpeg|png|webp|gif)$/i;

export const adminGetActivities = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.activity.findMany({ orderBy: { order: "asc" } });
    }
  });

export const adminCreateActivity = async (data: {
  titleVi: string;
  titleEn?: string;
  slug?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  frequencyVi?: string;
  frequencyEn?: string;
  hyperlink?: string;
  thumbnail?: string;
  images?: string[];
  isActive?: boolean;
  order?: number;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const slug = data.slug || generateSlug(data.titleVi);
      const created = await prisma.activity.create({
        data: {
          titleVi: data.titleVi,
          titleEn: data.titleEn ?? "",
          slug,
          descriptionVi: data.descriptionVi ?? "",
          descriptionEn: data.descriptionEn ?? "",
          frequencyVi: data.frequencyVi ?? null,
          frequencyEn: data.frequencyEn ?? null,
          hyperlink: data.hyperlink ?? null,
          thumbnail: data.thumbnail ?? null,
          images: data.images ?? [],
          isActive: data.isActive ?? true,
          order: data.order ?? 0
        }
      });
      revalidateTag(_CACHE_ACTIVITIES, "default");
      return created;
    }
  });

export const adminUpdateActivity = async (
  id: string,
  data: {
    titleVi?: string;
    titleEn?: string;
    descriptionVi?: string;
    descriptionEn?: string;
    frequencyVi?: string | null;
    frequencyEn?: string | null;
    hyperlink?: string | null;
    thumbnail?: string | null;
    images?: string[];
    isActive?: boolean;
    order?: number;
  }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const updated = await prisma.activity.update({ where: { id }, data });
      revalidateTag(_CACHE_ACTIVITIES, "default");
      return updated;
    }
  });

export const adminDeleteActivity = async (id: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      await prisma.activity.delete({ where: { id } });
      revalidateTag(_CACHE_ACTIVITIES, "default");
      return { success: true };
    }
  });

export const adminSeedActivities = async () =>
  handleErrorServerWithAuth({
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: one-time admin seed script migrating configs/data/activities.json into the DB; not worth splitting up for a single call site
    cb: async ({ user }) => {
      await requireAdmin(user);
      const data = (await import("@/configs/data/activities.json")).default as {
        internalEvents: Array<{
          id: string;
          vi: { title: string; description: string; frequency: string };
          en: { title: string; description: string; frequency: string };
          imageFolder?: string;
          href?: string;
          images?: string[];
        }>;
        externalEvents: Array<{
          id: string;
          vi: { title: string; description: string; frequency: string };
          en: { title: string; description: string; frequency: string };
          imageFolder?: string;
          href?: string;
          images?: string[];
        }>;
      };

      let count = 0;
      const all = [...data.internalEvents, ...data.externalEvents];

      // Read images from public folder
      const fsModule = await import("node:fs");
      const pathModule = await import("node:path");

      let publicDir = "";
      try {
        const candidateDirs = [
          pathModule.join(process.cwd(), "public"),
          pathModule.join(process.cwd(), ".next", "standalone", "public"),
          pathModule.join(process.cwd(), "..", "public")
        ];
        publicDir = candidateDirs.find((d) => fsModule.existsSync(d)) ?? "";
      } catch {
        // fs not available (e.g. Vercel serverless) — use pre-computed images from config
      }

      for (let i = 0; i < all.length; i++) {
        const item = all[i];
        let images: string[] = [];

        if (item.images && item.images.length > 0) {
          images = item.images;
        } else if (item.imageFolder && publicDir) {
          const relFolder = item.imageFolder.replace(LEADING_SLASH_RE, "");
          const folderPath = pathModule.join(publicDir, relFolder);
          try {
            if (fsModule.existsSync(folderPath)) {
              images = fsModule
                .readdirSync(folderPath)
                .filter((f) => IMAGE_EXT_RE.test(f))
                .sort((a, b) => b.localeCompare(a))
                .map((f) => `${item.imageFolder}/${f}`);
            }
          } catch {
            /* fs not available — use empty */
          }
        }

        const thumbnail = images.length > 0 ? images[0] : null;

        const existing = await prisma.activity.findUnique({
          where: { slug: item.id }
        });

        const payload = {
          slug: item.id,
          titleVi: item.vi.title,
          titleEn: item.en.title,
          descriptionVi: item.vi.description,
          descriptionEn: item.en.description,
          frequencyVi: item.vi.frequency,
          frequencyEn: item.en.frequency,
          isInternal: data.internalEvents.some((e) => e.id === item.id),
          thumbnail: thumbnail ?? undefined,
          images,
          order: i
        };

        if (existing) {
          await prisma.activity.update({
            where: { id: existing.id },
            data: payload
          });
        } else {
          await prisma.activity.create({ data: payload });
        }
        count++;
      }

      revalidateTag(_CACHE_ACTIVITIES, "default");
      return { success: true, count };
    }
  });
