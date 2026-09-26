"use server";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidateTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_FAQ, _CACHE_SETTINGS } from "@/constants/cache";
import {
  parseWebDesignConfig,
  parseWebDesignExhibitions,
  WEBDESIGN_CONFIG_KEY,
  WEBDESIGN_EXHIBITIONS_KEY,
  WEBDESIGN_FAQ_TARGET,
  type WebDesignExhibitionItem,
  type WebDesignFaq
} from "@/types/webdesign";
import { handleErrorServerWithAuth } from "@/utils/handle-error-server";
import {
  type ValidationResult,
  validateWebDesignConfig,
  validateWebDesignExhibitions,
  validateWebDesignFaqs
} from "@/utils/webdesign-validate";
import { requireAdmin } from "./helpers";

/** Input may come from the raw JSON dev editor, so it is re-validated server-side before saving. */
function assertValid<T>(result: ValidationResult<T>): T {
  if (!result.ok) {
    throw new Error(`Dữ liệu không hợp lệ:\n${result.errors.slice(0, 10).join("\n")}`);
  }
  return result.data;
}

export const adminGetWebDesignConfig = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const setting = await prisma.siteSetting.findUnique({ where: { key: WEBDESIGN_CONFIG_KEY } });
      return parseWebDesignConfig(setting?.value);
    }
  });

export const adminSaveWebDesignConfig = async (input: unknown) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const config = assertValid(validateWebDesignConfig(input));
      await prisma.siteSetting.upsert({
        where: { key: WEBDESIGN_CONFIG_KEY },
        update: { value: JSON.stringify(config) },
        create: {
          key: WEBDESIGN_CONFIG_KEY,
          value: JSON.stringify(config),
          description: "Cấu hình trang WebDesign Contest"
        }
      });
      revalidateTag(_CACHE_SETTINGS, "default");
      return config;
    }
  });

export const adminGetWebDesignExhibitions = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const setting = await prisma.siteSetting.findUnique({ where: { key: WEBDESIGN_EXHIBITIONS_KEY } });
      return parseWebDesignExhibitions(setting?.value);
    }
  });

export const adminSaveWebDesignExhibitions = async (input: unknown) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const items = assertValid(validateWebDesignExhibitions(input));
      await prisma.siteSetting.upsert({
        where: { key: WEBDESIGN_EXHIBITIONS_KEY },
        update: { value: JSON.stringify(items) },
        create: {
          key: WEBDESIGN_EXHIBITIONS_KEY,
          value: JSON.stringify(items),
          description: "Danh sách triển lãm WebDesign"
        }
      });
      revalidateTag(_CACHE_SETTINGS, "default");
      return items;
    }
  });

type LegacyExhibitionTeam = {
  teamName: string;
  teamMembers: string[];
  subjects: string;
  projectName: string;
  description: string;
  github: string;
  live: string;
  thumbnail: string;
  techStack: string[];
};

/** Reads the bundled exhibitions from configs/data/wd.json; the admin reviews them in the draft before saving. */
export const adminGetDefaultWebDesignExhibitions = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const filePath = join(process.cwd(), "configs/data/wd.json");
      const raw = await readFile(filePath, "utf-8");
      const json = JSON.parse(raw) as { teams: LegacyExhibitionTeam[] };
      return json.teams.map(
        (team): WebDesignExhibitionItem => ({
          teamName: team.teamName,
          teamMembers: team.teamMembers,
          subjects: team.subjects,
          projectName: { vi: team.projectName, en: team.projectName },
          description: { vi: team.description, en: team.description },
          github: team.github,
          live: team.live,
          thumbnail: team.thumbnail,
          techStack: team.techStack
        })
      );
    }
  });

const readWebDesignFaqs = async (): Promise<WebDesignFaq[]> => {
  const rows = await prisma.faqItem.findMany({ where: { target: WEBDESIGN_FAQ_TARGET }, orderBy: { order: "asc" } });
  return rows.map((row) => ({
    id: row.id,
    question: { vi: row.questionVi, en: row.questionEn },
    answer: { vi: row.answerVi, en: row.answerEn },
    isActive: row.isActive
  }));
};

export const adminGetWebDesignFaqs = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return readWebDesignFaqs();
    }
  });

/** Replaces the whole WebDesign FAQ list: removed rows are deleted, the rest upserted with their list position as `order`. */
export const adminSaveWebDesignFaqs = async (input: unknown) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const faqs = assertValid(validateWebDesignFaqs(input));
      await prisma.$transaction([
        prisma.faqItem.deleteMany({
          where: { target: WEBDESIGN_FAQ_TARGET, id: { notIn: faqs.map((f) => f.id) } }
        }),
        ...faqs.map((faq, order) => {
          const data = {
            questionVi: faq.question.vi,
            questionEn: faq.question.en,
            answerVi: faq.answer.vi,
            answerEn: faq.answer.en,
            isActive: faq.isActive,
            target: WEBDESIGN_FAQ_TARGET,
            order
          };
          return prisma.faqItem.upsert({ where: { id: faq.id }, update: data, create: { id: faq.id, ...data } });
        })
      ]);
      revalidateTag(_CACHE_FAQ, "default");
      return readWebDesignFaqs();
    }
  });

/** Default WebDesign FAQ from configs/data/fqa.json, loaded into the admin draft (not saved). */
export const adminGetDefaultWebDesignFaqs = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const raw = await readFile(join(process.cwd(), "configs/data/fqa.json"), "utf-8");
      const json = JSON.parse(raw) as Record<
        string,
        Array<{ vi: { q: string; a: string }; en: { q: string; a: string } }>
      >;
      return (json[WEBDESIGN_FAQ_TARGET] ?? []).map(
        (item): Omit<WebDesignFaq, "id"> => ({
          question: { vi: item.vi.q, en: item.en.q },
          answer: { vi: item.vi.a, en: item.en.a },
          isActive: true
        })
      );
    }
  });
