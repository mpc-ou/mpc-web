"use server";

import { cacheTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_RECAPS } from "@/constants/cache";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

export const getPublishedRecaps = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      const recaps = await prisma.yearRecap.findMany({
        where: { isPublished: true },
        orderBy: { year: "desc" },
        select: {
          year: true,
          name: true,
          description: true,
          coverImage: true,
        },
      });
      return { recaps };
    },
  });

export const getRecapByYear = async (year: number) =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_RECAPS);

      const recap = await prisma.yearRecap.findUnique({
        where: { year, isPublished: true },
      });
      if (!recap) return { recap: null };

      return {
        recap: {
          ...recap,
          createdAt: recap.createdAt.toISOString(),
          updatedAt: recap.updatedAt.toISOString(),
        },
      };
    },
  });
