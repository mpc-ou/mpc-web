"use server";

import { revalidateTag } from "next/cache";
import { _CACHE_PROJECTS } from "@/constants/cache";
import { generateSlug, handleErrorServerWithAuth, prisma, requireAdmin } from "./_helpers";

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

export const adminCreateProject = async (data: {
  title: string;
  slug?: string;
  description?: string;
  content?: string;
  thumbnail?: string;
  githubUrl?: string;
  websiteUrl?: string;
  videoUrl?: string;
  technologies?: string[];
  startDate?: string;
  endDate?: string;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const slug = data.slug || generateSlug(data.title);
      const created = await prisma.project.create({
        data: {
          title: data.title,
          slug,
          description: data.description || null,
          content: data.content || null,
          thumbnail: data.thumbnail || null,
          githubUrl: data.githubUrl || null,
          websiteUrl: data.websiteUrl || null,
          videoUrl: data.videoUrl || null,
          technologies: data.technologies ?? [],
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
    description?: string;
    content?: string;
    thumbnail?: string;
    githubUrl?: string;
    websiteUrl?: string;
    videoUrl?: string;
    technologies?: string[];
    startDate?: string | null;
    endDate?: string | null;
    isActive?: boolean;
  }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const updated = await prisma.project.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
          ...(data.githubUrl !== undefined && { githubUrl: data.githubUrl }),
          ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl }),
          ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
          ...(data.technologies && { technologies: data.technologies }),
          ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
          ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
          ...(data.isActive !== undefined && { isActive: data.isActive })
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
