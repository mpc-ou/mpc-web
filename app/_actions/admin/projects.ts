"use server";

import { revalidateTag } from "next/cache";
import { _CACHE_PROJECTS } from "@/constants/cache";
import { generateSlug, handleErrorServerWithAuth, prisma, requireAdmin } from "./helpers";

export const adminGetProjects = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const projects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        include: { members: { include: { member: true } } }
      });
      return projects.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        startDate: p.startDate ? p.startDate.toISOString() : null,
        endDate: p.endDate ? p.endDate.toISOString() : null,
        members: p.members.map((pm) => ({
          ...pm,
          member: {
            ...pm.member,
            createdAt: pm.member.createdAt.toISOString(),
            updatedAt: pm.member.updatedAt.toISOString(),
            dob: pm.member.dob ? pm.member.dob.toISOString() : null
          }
        }))
      }));
    }
  });

export const adminGetProjectsPaginated = async (params: {
  page: number;
  limit: number;
  search?: string;
  isActive?: string;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const page = params.page || 1;
      const limit = params.limit || 10;
      const search = params.search || "";
      const isActiveFilter = params.isActive || "ALL";

      const where: any = {};
      if (isActiveFilter === "ACTIVE") {
        where.isActive = true;
      } else if (isActiveFilter === "INACTIVE") {
        where.isActive = false;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } }
        ];
      }

      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: { members: { include: { member: true } } }
        }),
        prisma.project.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        projects: projects.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
          startDate: p.startDate ? p.startDate.toISOString() : null,
          endDate: p.endDate ? p.endDate.toISOString() : null,
          members: p.members.map((pm) => ({
            ...pm,
            member: {
              ...pm.member,
              createdAt: pm.member.createdAt.toISOString(),
              updatedAt: pm.member.updatedAt.toISOString(),
              dob: pm.member.dob ? pm.member.dob.toISOString() : null
            }
          }))
        })),
        totalPages,
        totalCount: total
      };
    }
  });

export const adminCreateProject = async (data: {
  title: string;
  titleEn?: string;
  slug?: string;
  description?: string;
  descriptionEn?: string;
  content?: string;
  contentEn?: string;
  thumbnail?: string;
  githubUrl?: string;
  websiteUrl?: string;
  videoUrl?: string;
  technologies?: string[];
  startDate?: string;
  endDate?: string;
  images?: string[];
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const slug = data.slug || generateSlug(data.title);
      const created = await prisma.project.create({
        data: {
          title: data.title,
          titleEn: data.titleEn ?? "",
          slug,
          description: data.description || null,
          descriptionEn: data.descriptionEn || null,
          content: data.content || null,
          contentEn: data.contentEn ?? "",
          thumbnail: data.thumbnail || null,
          githubUrl: data.githubUrl || null,
          websiteUrl: data.websiteUrl || null,
          videoUrl: data.videoUrl || null,
          technologies: data.technologies ?? [],
          images: data.images ?? [],
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null
        }
      });
      revalidateTag(_CACHE_PROJECTS, "default");
      return created;
    }
  });

export const adminUpdateProject = async (
  id: string,
  data: {
    title?: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    content?: string;
    contentEn?: string;
    thumbnail?: string;
    githubUrl?: string;
    websiteUrl?: string;
    videoUrl?: string;
    technologies?: string[];
    startDate?: string | null;
    endDate?: string | null;
    isActive?: boolean;
    images?: string[];
  }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const updated = await prisma.project.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.titleEn !== undefined && { titleEn: data.titleEn }),
          ...(data.description !== undefined && {
            description: data.description
          }),
          ...(data.descriptionEn !== undefined && {
            descriptionEn: data.descriptionEn
          }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.contentEn !== undefined && { contentEn: data.contentEn }),
          ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
          ...(data.githubUrl !== undefined && { githubUrl: data.githubUrl }),
          ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl }),
          ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
          ...(data.technologies && { technologies: data.technologies }),
          ...(data.startDate !== undefined && {
            startDate: data.startDate ? new Date(data.startDate) : null
          }),
          ...(data.endDate !== undefined && {
            endDate: data.endDate ? new Date(data.endDate) : null
          }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.images !== undefined && { images: data.images })
        }
      });
      revalidateTag(_CACHE_PROJECTS, "default");
      return updated;
    }
  });

export const adminDeleteProject = async (id: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      await prisma.project.delete({ where: { id } });
      revalidateTag(_CACHE_PROJECTS, "default");
      return { success: true };
    }
  });

export const adminLinkProjectMember = async (projectId: string, memberId: string, role?: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const link = await prisma.projectMember.create({
        data: { projectId, memberId, role: role || null }
      });
      revalidateTag(_CACHE_PROJECTS, "default");
      return link;
    }
  });

export const adminUnlinkProjectMember = async (projectId: string, memberId: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      await prisma.projectMember.delete({
        where: { projectId_memberId: { projectId, memberId } }
      });
      revalidateTag(_CACHE_PROJECTS, "default");
      return { success: true };
    }
  });

export const adminGetProjectById = async (id: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const project = await prisma.project.findUnique({
        where: { id },
        include: { members: { include: { member: true } } }
      });
      if (!project) {
        return { notFound: true };
      }
      return {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        startDate: project.startDate ? project.startDate.toISOString() : null,
        endDate: project.endDate ? project.endDate.toISOString() : null,
        members: project.members.map((pm) => ({
          ...pm,
          member: {
            ...pm.member,
            createdAt: pm.member.createdAt.toISOString(),
            updatedAt: pm.member.updatedAt.toISOString(),
            dob: pm.member.dob ? pm.member.dob.toISOString() : null
          }
        }))
      };
    }
  });
