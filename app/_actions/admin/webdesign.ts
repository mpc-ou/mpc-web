"use server";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidateTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_SETTINGS } from "@/constants/cache";
import {
  parseWebDesignConfig,
  parseWebDesignExhibitions,
  WEBDESIGN_CONFIG_KEY,
  WEBDESIGN_EXHIBITIONS_KEY,
  type WebDesignConfig,
  type WebDesignExhibitionItem
} from "@/types/webdesign";
import { handleErrorServerWithAuth } from "@/utils/handle-error-server";
import { requireAdmin } from "./helpers";

export const adminGetWebDesignConfig = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const setting = await prisma.siteSetting.findUnique({ where: { key: WEBDESIGN_CONFIG_KEY } });
      return parseWebDesignConfig(setting?.value);
    }
  });

export const adminSaveWebDesignConfig = async (config: WebDesignConfig) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const result = await prisma.siteSetting.upsert({
        where: { key: WEBDESIGN_CONFIG_KEY },
        update: { value: JSON.stringify(config) },
        create: {
          key: WEBDESIGN_CONFIG_KEY,
          value: JSON.stringify(config),
          description: "Cấu hình trang WebDesign Contest"
        }
      });
      revalidateTag(_CACHE_SETTINGS, "default");
      return result;
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

export const adminSaveWebDesignExhibitions = async (items: WebDesignExhibitionItem[]) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const result = await prisma.siteSetting.upsert({
        where: { key: WEBDESIGN_EXHIBITIONS_KEY },
        update: { value: JSON.stringify(items) },
        create: {
          key: WEBDESIGN_EXHIBITIONS_KEY,
          value: JSON.stringify(items),
          description: "Danh sách triển lãm WebDesign"
        }
      });
      revalidateTag(_CACHE_SETTINGS, "default");
      return result;
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

export const adminSeedWebDesignExhibitionsFromDefault = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const filePath = join(process.cwd(), "configs/data/wd.json");
      const raw = await readFile(filePath, "utf-8");
      const json = JSON.parse(raw) as { teams: LegacyExhibitionTeam[] };
      const items: WebDesignExhibitionItem[] = json.teams.map((team) => ({
        teamName: team.teamName,
        teamMembers: team.teamMembers,
        subjects: team.subjects,
        projectName: { vi: team.projectName, en: team.projectName },
        description: { vi: team.description, en: team.description },
        github: team.github,
        live: team.live,
        thumbnail: team.thumbnail,
        techStack: team.techStack
      }));
      const result = await prisma.siteSetting.upsert({
        where: { key: WEBDESIGN_EXHIBITIONS_KEY },
        update: { value: JSON.stringify(items) },
        create: {
          key: WEBDESIGN_EXHIBITIONS_KEY,
          value: JSON.stringify(items),
          description: "Danh sách triển lãm WebDesign"
        }
      });
      revalidateTag(_CACHE_SETTINGS, "default");
      return result;
    }
  });
