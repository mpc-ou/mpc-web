"use server";

import { cacheTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { getBlogPermissionLevel, hasBlogCreationPermission } from "@/services/blog-permission";
import { handleErrorServerNoAuth, handleErrorServerWithAuth } from "@/utils/handle-error-server";

// Cache tag for blogs
const _CACHE_BLOGS = "blogs-cache-tag";

export const getBlogsPageData = async (validPage: number, take: number, locale = "vi") =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_BLOGS);

      const skip = (validPage - 1) * take;

      const where = {
        type: "BLOG" as const,
        status: "PUBLISHED" as const
      };

      const [total, blogs] = await Promise.all([
        prisma.post.count({ where }),
        prisma.post.findMany({
          where,
          skip,
          take,
          orderBy: { publishedAt: "desc" },
          select: {
            id: true,
            titleVi: true,
            titleEn: true,
            slug: true,
            summaryVi: true,
            summaryEn: true,
            thumbnail: true,
            publishedAt: true,
            createdAt: true,
            author: {
              select: {
                firstName: true,
                lastName: true,
                middleName: true,
                avatar: true,
                slug: true
              }
            },
            tags: {
              include: {
                tag: { select: { id: true, name: true, slug: true } }
              }
            }
          }
        })
      ]);

      const totalPages = Math.ceil(total / take);
      const isEn = locale === "en";

      return {
        blogs: blogs.map((b) => ({
          ...b,
          title: isEn && b.titleEn ? b.titleEn : b.titleVi,
          description: isEn && b.summaryEn ? b.summaryEn : b.summaryVi,
          publishedAt: (b.publishedAt || b.createdAt).toISOString(),
          // normalise tag shape for client
          tags: b.tags.map((t) => ({
            tag: { nameVi: t.tag.name, nameEn: t.tag.name, id: t.tag.id }
          }))
        })),
        totalPages
      };
    }
  });

export const getBlogBySlug = async (slug: string, locale = "vi") =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_BLOGS);

      const post = await prisma.post.findUnique({
        where: { slug, status: { in: ["PUBLISHED", "UNLISTED"] } },
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
              middleName: true,
              avatar: true,
              slug: true
            }
          },
          tags: {
            include: { tag: { select: { id: true, name: true, slug: true } } }
          },
          gallery: { orderBy: { order: "asc" } },
          achievementMembers: {
            include: {
              member: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  middleName: true,
                  avatar: true,
                  slug: true
                }
              }
            }
          }
        }
      });

      if (!post) {
        return { blog: null };
      }

      const isEn = locale === "en";

      return {
        blog: {
          ...post,
          title: isEn && post.titleEn ? post.titleEn : post.titleVi,
          description: isEn && post.summaryEn ? post.summaryEn : post.summaryVi,
          content: isEn && post.contentEn ? post.contentEn : post.contentVi,
          status: post.status,
          creator: post.author,
          publishedAt: (post.publishedAt || post.createdAt).toISOString(),
          startAt: post.startAt?.toISOString() ?? null,
          endAt: post.endAt?.toISOString() ?? null,
          achievementDate: post.achievementDate?.toISOString() ?? null,
          tags: post.tags.map((t) => ({
            tag: { id: t.tag.id, nameVi: t.tag.name, nameEn: t.tag.name }
          }))
        }
      };
    }
  });

/** Like getBlogBySlug but also returns non-published posts if the current user is the author. */
export const getBlogBySlugForUser = async (slug: string, locale = "vi") =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const member = await prisma.member.findUnique({
        where: { id: user?.id },
        select: { id: true, webRole: true }
      });
      if (!member) {
        return { blog: null };
      }

      const post = await prisma.post.findUnique({
        where: { slug },
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
              middleName: true,
              avatar: true,
              slug: true
            }
          },
          tags: {
            include: { tag: { select: { id: true, name: true, slug: true } } }
          },
          gallery: { orderBy: { order: "asc" } },
          achievementMembers: {
            include: {
              member: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  middleName: true,
                  avatar: true,
                  slug: true
                }
              }
            }
          }
        }
      });

      if (!post) {
        return { blog: null };
      }

      // Only allow if user is author or admin
      if (post.authorId !== member.id && member.webRole !== "ADMIN") {
        return { blog: null };
      }

      const isEn = locale === "en";

      return {
        blog: {
          ...post,
          title: isEn && post.titleEn ? post.titleEn : post.titleVi,
          description: isEn && post.summaryEn ? post.summaryEn : post.summaryVi,
          content: isEn && post.contentEn ? post.contentEn : post.contentVi,
          status: post.status,
          creator: post.author,
          publishedAt: (post.publishedAt || post.createdAt).toISOString(),
          startAt: post.startAt?.toISOString() ?? null,
          endAt: post.endAt?.toISOString() ?? null,
          achievementDate: post.achievementDate?.toISOString() ?? null,
          tags: post.tags.map((t) => ({
            tag: { id: t.tag.id, nameVi: t.tag.name, nameEn: t.tag.name }
          }))
        }
      };
    }
  });

export const getRecentBlogs = async (take = 3, locale = "vi") =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_BLOGS);

      const blogs = await prisma.post.findMany({
        where: {
          type: "BLOG",
          status: "PUBLISHED"
        },
        take,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          titleVi: true,
          titleEn: true,
          slug: true,
          summaryVi: true,
          summaryEn: true,
          thumbnail: true,
          publishedAt: true,
          createdAt: true
        }
      });

      const isEn = locale === "en";

      return {
        blogs: blogs.map((b) => ({
          ...b,
          title: isEn && b.titleEn ? b.titleEn : b.titleVi,
          description: isEn && b.summaryEn ? b.summaryEn : b.summaryVi,
          publishedAt: (b.publishedAt || b.createdAt).toISOString()
        }))
      };
    }
  });

export const getRelatedPosts = async (postId: string, tagIds: string[], type: string, take = 3, locale = "vi") =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_BLOGS);

      let posts: Array<{
        id: string;
        titleVi: string;
        titleEn: string;
        slug: string;
        summaryVi: string | null;
        summaryEn: string | null;
        thumbnail: string | null;
        publishedAt: Date | null;
        createdAt: Date;
        type: string;
      }> = [];

      // Primary: posts sharing tags
      if (tagIds.length > 0) {
        const tagged = await prisma.post.findMany({
          where: {
            status: "PUBLISHED",
            id: { not: postId },
            tags: { some: { tagId: { in: tagIds } } }
          },
          take,
          orderBy: { publishedAt: "desc" },
          select: {
            id: true,
            titleVi: true,
            titleEn: true,
            slug: true,
            summaryVi: true,
            summaryEn: true,
            thumbnail: true,
            publishedAt: true,
            createdAt: true,
            type: true
          }
        });
        posts = tagged;
      }

      // Fallback: same type
      if (posts.length < take) {
        const extra = await prisma.post.findMany({
          where: {
            status: "PUBLISHED",
            type: type as "BLOG" | "EVENT" | "ACHIEVEMENT",
            id: { notIn: [postId, ...posts.map((p) => p.id)] }
          },
          take: take - posts.length,
          orderBy: { publishedAt: "desc" },
          select: {
            id: true,
            titleVi: true,
            titleEn: true,
            slug: true,
            summaryVi: true,
            summaryEn: true,
            thumbnail: true,
            publishedAt: true,
            createdAt: true,
            type: true
          }
        });
        posts = [...posts, ...extra];
      }

      const isEn = locale === "en";

      return posts.map((p) => ({
        ...p,
        title: isEn && p.titleEn ? p.titleEn : p.titleVi,
        description: isEn && p.summaryEn ? p.summaryEn : p.summaryVi,
        publishedAt: (p.publishedAt || p.createdAt).toISOString()
      }));
    }
  });

export const checkUserBlogCreationPermission = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      if (!user) {
        return false;
      }
      const member = await prisma.member.findUnique({
        where: { id: user.id },
        select: { webRole: true }
      });
      if (!member) {
        return false;
      }
      const level = await getBlogPermissionLevel();
      return hasBlogCreationPermission(member.webRole, level);
    }
  });

export const checkUserIsAdmin = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      if (!user) {
        return false;
      }
      const member = await prisma.member.findUnique({
        where: { id: user.id },
        select: { webRole: true }
      });
      return member?.webRole === "ADMIN";
    }
  });
