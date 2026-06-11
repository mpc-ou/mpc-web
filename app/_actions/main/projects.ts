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
            technologies: true,
            startDate: true,
            endDate: true,
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

/**
 * Other active projects (excluding current), up to 4.
 */
export const getOtherProjects = async (excludeSlug: string) =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";

      const projects = await prisma.project.findMany({
        where: { isActive: true, slug: { not: excludeSlug } },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          thumbnail: true,
          technologies: true,
          startDate: true,
          endDate: true,
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
      return { projects };
    }
  });

/**
 * Gold board — top members sorted by achievement count.
 */
export const getGoldBoardMembers = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";

      const members = await prisma.member.findMany({
        where: { clubRoles: { some: {} } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          slug: true,
          _count: { select: { achievementEntries: true, projects: true } },
          clubRoles: {
            include: { department: true },
            orderBy: { startAt: "desc" },
            take: 1
          },
          achievementEntries: {
            include: {
              post: {
                select: {
                  id: true,
                  titleVi: true,
                  titleEn: true,
                  achievementDate: true,
                  achievementType: true,
                  slug: true,
                  thumbnail: true
                }
              }
            },
            orderBy: { post: { achievementDate: "desc" } }
          }
        },
        orderBy: { achievementEntries: { _count: "desc" } },
        take: 12
      });
      return { members };
    }
  });

export const getTrainingPageData = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      const [latestProjects, trainingFormSetting] = await Promise.all([
        prisma.project.findMany({
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
        }),
        prisma.siteSetting.findUnique({
          where: { key: "training_form_url" }
        })
      ]);
      return {
        latestProjects,
        trainingFormUrl: trainingFormSetting?.value || null
      };
    }
  });
