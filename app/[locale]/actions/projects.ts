"use server";

import { prisma } from "@/configs/prisma/db";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

export const getProjectsPageData = async (validPage: number, take: number) =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      const skip = (validPage - 1) * take;
      const [total, projects] = await Promise.all([
        prisma.project.count({ where: { isActive: true } }),
        prisma.project.findMany({
          where: { isActive: true },
          skip,
          take,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            thumbnail: true,
            technologies: true
          }
        })
      ]);

      const totalPages = Math.ceil(total / take);

      return { total, projects, totalPages };
    }
  });

export const getProjectDetail = async (slug: string) =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";

      const project = await prisma.project.findUnique({
        where: { slug },
        include: {
          members: {
            include: {
              member: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  slug: true
                }
              }
            }
          }
        }
      });
      return { project };
    }
  });

export const getTrainingPageData = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      const latestProjects = await prisma.project.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          thumbnail: true,
          technologies: true
        }
      });
      return { latestProjects };
    }
  });
