/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: admin CRUD actions for posts (blog/event/achievement) branch heavily on post type by design; splitting each type's logic out is a larger refactor tracked separately */
"use server";

import { revalidateTag } from "next/cache";
import type { PostStatus, Prisma } from "@/configs/prisma/generated/prisma/client";
import { _CACHE_ACHIEVEMENTS, _CACHE_EVENTS, _CACHE_POSTS } from "@/constants/cache";
import { generateSlug, handleErrorServerWithAuth, prisma, requireAdmin } from "./helpers";

// ════════════════════════════════════════════════════════════════
// Shared helpers
// ════════════════════════════════════════════════════════════════

const CACHE_MAP = {
  BLOG: _CACHE_POSTS,
  EVENT: _CACHE_EVENTS,
  ACHIEVEMENT: _CACHE_ACHIEVEMENTS
} as const;

const invalidate = (type: keyof typeof CACHE_MAP) => revalidateTag(CACHE_MAP[type], "default");

const withAdmin = (fn: (admin: Awaited<ReturnType<typeof requireAdmin>>) => Promise<object>) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => fn(await requireAdmin(user))
  });

// ════════════════════════════════════════════════════════════════
// Enums & types (mirrors Prisma enums for client-safe usage)
// ════════════════════════════════════════════════════════════════

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  type: string;
  author: {
    firstName: string;
    middleName?: string | null;
    lastName: string;
  } | null;
  createdAt: string;
};

// ════════════════════════════════════════════════════════════════
// List
// ════════════════════════════════════════════════════════════════

export const adminGetPosts = async (type?: "BLOG" | "EVENT" | "ACHIEVEMENT" | "ALL") =>
  withAdmin(async () =>
    prisma.post
      .findMany({
        where: type && type !== "ALL" ? { type } : undefined,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          titleVi: true,
          titleEn: true,
          slug: true,
          status: true,
          type: true,
          createdAt: true,
          publishedAt: true,
          summaryVi: true,
          summaryEn: true,
          contentVi: true,
          contentEn: true,
          sourceLanguage: true,
          thumbnail: true,
          locationVi: true,
          locationEn: true,
          latitude: true,
          longitude: true,
          startAt: true,
          endAt: true,
          eventStatus: true,
          eventType: true,
          achievementType: true,
          achievementDate: true,
          isHighlight: true,
          relatedUrl: true,
          images: true,
          author: {
            select: { firstName: true, lastName: true, middleName: true }
          },
          category: { select: { name: true } },
          achievementMembers: {
            include: {
              member: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  middleName: true,
                  avatar: true
                }
              }
            }
          }
        }
      })
      .then((posts) =>
        posts.map((p) => ({
          ...p,
          title: p.titleVi,
          titleVi: p.titleVi,
          titleEn: p.titleEn,
          summary: p.summaryVi,
          summaryVi: p.summaryVi,
          summaryEn: p.summaryEn,
          content: p.contentVi,
          contentVi: p.contentVi,
          contentEn: p.contentEn,
          sourceLanguage: p.sourceLanguage,
          startAt: p.startAt?.toISOString() ?? null,
          endAt: p.endAt?.toISOString() ?? null,
          achievementDate: p.achievementDate?.toISOString() ?? null,
          members: p.achievementMembers
        }))
      )
  );

export const adminGetPostsPaginated = async (params: {
  page: number;
  limit: number;
  search?: string;
  type?: "BLOG" | "EVENT" | "ACHIEVEMENT" | "ALL";
  status?: string;
}) =>
  withAdmin(async () => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const search = params.search || "";
    const type = params.type || "ALL";
    const status = params.status || "ALL";

    const where: Prisma.PostWhereInput = {};
    if (type !== "ALL") {
      where.type = type;
    }
    if (status !== "ALL") {
      where.status = status as PostStatus;
    }
    if (search) {
      where.OR = [
        { titleVi: { contains: search, mode: "insensitive" } },
        { titleEn: { contains: search, mode: "insensitive" } },
        { summaryVi: { contains: search, mode: "insensitive" } },
        { summaryEn: { contains: search, mode: "insensitive" } }
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          titleVi: true,
          titleEn: true,
          slug: true,
          status: true,
          type: true,
          createdAt: true,
          publishedAt: true,
          summaryVi: true,
          summaryEn: true,
          contentVi: true,
          contentEn: true,
          sourceLanguage: true,
          thumbnail: true,
          locationVi: true,
          locationEn: true,
          latitude: true,
          longitude: true,
          startAt: true,
          endAt: true,
          eventStatus: true,
          eventType: true,
          achievementType: true,
          achievementDate: true,
          isHighlight: true,
          relatedUrl: true,
          images: true,
          author: {
            select: { firstName: true, lastName: true, middleName: true }
          },
          category: { select: { name: true } },
          achievementMembers: {
            include: {
              member: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  middleName: true,
                  avatar: true
                }
              }
            }
          }
        }
      }),
      prisma.post.count({ where })
    ]);

    const mappedPosts = posts.map((p) => ({
      ...p,
      title: p.titleVi,
      titleVi: p.titleVi,
      titleEn: p.titleEn,
      summary: p.summaryVi,
      summaryVi: p.summaryVi,
      summaryEn: p.summaryEn,
      content: p.contentVi,
      contentVi: p.contentVi,
      contentEn: p.contentEn,
      sourceLanguage: p.sourceLanguage,
      startAt: p.startAt?.toISOString() ?? null,
      endAt: p.endAt?.toISOString() ?? null,
      achievementDate: p.achievementDate?.toISOString() ?? null,
      members: p.achievementMembers
    }));

    return {
      posts: mappedPosts,
      total
    };
  });

export const adminGetBlogPosts = async () => adminGetPosts("BLOG");

export const adminGetEvents = async () =>
  withAdmin(async () =>
    prisma.post
      .findMany({
        where: { type: "EVENT" },
        orderBy: { startAt: "desc" },
        select: {
          id: true,
          titleVi: true,
          slug: true,
          summaryVi: true,
          thumbnail: true,
          locationVi: true,
          locationEn: true,
          latitude: true,
          longitude: true,
          startAt: true,
          endAt: true,
          eventStatus: true,
          eventType: true,
          author: {
            select: { firstName: true, lastName: true, middleName: true }
          }
        }
      })
      .then((list) =>
        list.map((e) => ({
          ...e,
          title: e.titleVi,
          description: e.summaryVi,
          status: e.eventStatus,
          type: e.eventType,
          creator: e.author,
          startAt: e.startAt?.toISOString(),
          endAt: e.endAt?.toISOString() ?? null
        }))
      )
  );

export const adminGetAchievements = async () =>
  withAdmin(async () =>
    prisma.post
      .findMany({
        where: { type: "ACHIEVEMENT" },
        orderBy: { achievementDate: "desc" },
        select: {
          id: true,
          titleVi: true,
          slug: true,
          summaryVi: true,
          contentVi: true,
          thumbnail: true,
          images: true,
          achievementType: true,
          achievementDate: true,
          isHighlight: true,
          relatedUrl: true,
          createdAt: true,
          updatedAt: true,
          achievementMembers: { include: { member: true } }
        }
      })
      .then((list) =>
        list.map((a) => ({
          ...a,
          title: a.titleVi,
          summary: a.summaryVi,
          content: a.contentVi,
          date: a.achievementDate,
          type: a.achievementType,
          members: a.achievementMembers
        }))
      )
  );

// ════════════════════════════════════════════════════════════════
// Delete
// ════════════════════════════════════════════════════════════════

export const adminDeletePost = async (id: string, type: "BLOG" | "EVENT" | "ACHIEVEMENT") =>
  withAdmin(async () => {
    await prisma.post.delete({ where: { id, type } });
    invalidate(type);
    return { success: true };
  });

export const adminDeletePosts = async (ids: string[]) =>
  withAdmin(async () => {
    const posts = await prisma.post.findMany({
      where: { id: { in: ids } },
      select: { type: true }
    });
    const types = Array.from(new Set(posts.map((p) => p.type))) as Array<"BLOG" | "EVENT" | "ACHIEVEMENT">;

    await prisma.post.deleteMany({
      where: { id: { in: ids } }
    });

    for (const t of types) {
      invalidate(t);
    }

    return { success: true };
  });

export const adminDeleteEvent = async (id: string) => adminDeletePost(id, "EVENT");
export const adminDeleteAchievement = async (id: string) => adminDeletePost(id, "ACHIEVEMENT");

// ════════════════════════════════════════════════════════════════
// Create
// ════════════════════════════════════════════════════════════════

const normalizeAdditionalPhotos = (images?: (string | { url: string; title?: string; caption?: string })[]) => {
  if (!images) {
    return [];
  }
  return images.map((img) => {
    if (typeof img === "string") {
      return { url: img, title: "", caption: "" };
    }
    return { url: img.url, title: img.title || "", caption: img.caption || "" };
  });
};

export const adminCreatePost = async (data: {
  title: string;
  titleEn?: string;
  slug?: string;
  summary?: string;
  summaryEn?: string;
  content: string;
  contentEn?: string;
  sourceLanguage?: "VI" | "EN";
  thumbnail?: string | null;
  categoryId?: string;
  activityId?: string | null;
  status?: string;
  images?: (string | { url: string; title?: string; caption?: string })[];
}) =>
  withAdmin(async (admin) => {
    const isAutoPublish = admin.webRole === "ADMIN" || admin.webRole === "COLLABORATOR";
    const normalizedImages = normalizeAdditionalPhotos(data.images);
    const result = await prisma.post.create({
      data: {
        type: "BLOG",
        titleVi: data.title,
        titleEn: data.titleEn ?? "",
        slug: data.slug || generateSlug(data.title, true),
        summaryVi: data.summary ?? null,
        summaryEn: data.summaryEn ?? null,
        contentVi: data.content,
        contentEn: data.contentEn ?? "",
        sourceLanguage: data.sourceLanguage ?? "VI",
        thumbnail: data.thumbnail ?? null,
        categoryId: data.categoryId ?? null,
        activityId: data.activityId ?? null,
        status: isAutoPublish ? "PUBLISHED" : ((data.status as "DRAFT" | "PENDING_REVIEW") ?? "DRAFT"),
        publishedAt: isAutoPublish ? new Date() : null,
        authorId: admin.id,
        images: normalizedImages.map((x) => x.url)
      }
    });

    await syncPostImages(result.id, result.titleVi, result.contentVi, result.thumbnail, normalizedImages, []);

    invalidate("BLOG");
    return result;
  });

export const adminCreateEvent = async (data: {
  title: string;
  titleEn?: string;
  slug?: string;
  description?: string;
  descriptionEn?: string;
  content?: string;
  contentEn?: string;
  sourceLanguage?: "VI" | "EN";
  thumbnail?: string | null;
  locationVi?: string | null;
  locationEn?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  startAt: string;
  endAt?: string;
  status?: string;
  type?: string;
  images?: (string | { url: string; title?: string; caption?: string })[];
  postStatus?: string;
}) =>
  withAdmin(async (admin) => {
    const isAutoPublish = admin.webRole === "ADMIN" || admin.webRole === "COLLABORATOR";
    const finalPostStatus = (data.postStatus || (isAutoPublish ? "PUBLISHED" : "DRAFT")) as PostStatus;
    const normalizedImages = normalizeAdditionalPhotos(data.images);
    const result = await prisma.post.create({
      data: {
        type: "EVENT",
        titleVi: data.title,
        titleEn: data.titleEn ?? "",
        slug: data.slug || generateSlug(data.title, true),
        summaryVi: data.description ?? null,
        summaryEn: data.descriptionEn ?? null,
        contentVi: data.content ?? "",
        contentEn: data.contentEn ?? "",
        sourceLanguage: data.sourceLanguage ?? "VI",
        thumbnail: data.thumbnail ?? null,
        locationVi: data.locationVi ?? null,
        locationEn: data.locationEn ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        startAt: new Date(data.startAt),
        endAt: data.endAt ? new Date(data.endAt) : null,
        eventStatus: (data.status as "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED") ?? "UPCOMING",
        eventType: (data.type as "ACADEMIC" | "MEMBER_ACTIVITY" | "VOLUNTEER" | "SEMINAR" | "OTHER") ?? "OTHER",
        authorId: admin.id,
        images: normalizedImages.map((x) => x.url),
        status: finalPostStatus,
        publishedAt: finalPostStatus === "PUBLISHED" ? new Date() : null
      }
    });

    await syncPostImages(result.id, result.titleVi, result.contentVi, result.thumbnail, normalizedImages, []);

    invalidate("EVENT");
    return result;
  });

export const adminCreateAchievement = async (data: {
  title: string;
  titleEn?: string;
  slug?: string;
  summary?: string;
  summaryEn?: string;
  content?: string;
  contentEn?: string;
  sourceLanguage?: "VI" | "EN";
  thumbnail?: string;
  date: string;
  type?: string;
  isHighlight?: boolean;
  relatedUrl?: string;
  locationVi?: string | null;
  locationEn?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  images?: (string | { url: string; title?: string; caption?: string })[];
  postStatus?: string;
}) =>
  withAdmin(async (admin) => {
    const isAutoPublish = admin.webRole === "ADMIN" || admin.webRole === "COLLABORATOR";
    const finalPostStatus = (data.postStatus || (isAutoPublish ? "PUBLISHED" : "DRAFT")) as PostStatus;
    const slug = data.slug || generateSlug(data.title, true);
    const normalizedImages = normalizeAdditionalPhotos(data.images);
    const result = await prisma.post.create({
      data: {
        type: "ACHIEVEMENT",
        titleVi: data.title,
        titleEn: data.titleEn ?? "",
        slug,
        summaryVi: data.summary ?? null,
        summaryEn: data.summaryEn ?? null,
        contentVi: data.content ?? "",
        contentEn: data.contentEn ?? "",
        sourceLanguage: data.sourceLanguage ?? "VI",
        thumbnail: data.thumbnail ?? null,
        achievementDate: new Date(data.date),
        achievementType: (data.type as "INDIVIDUAL" | "TEAM" | "CLUB") ?? "TEAM",
        isHighlight: data.isHighlight ?? false,
        relatedUrl: data.relatedUrl ?? null,
        locationVi: data.locationVi ?? null,
        locationEn: data.locationEn ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        authorId: admin.id,
        images: normalizedImages.map((x) => x.url),
        status: finalPostStatus,
        publishedAt: finalPostStatus === "PUBLISHED" ? new Date() : null
      }
    });

    await syncPostImages(result.id, result.titleVi, result.contentVi, result.thumbnail, normalizedImages, []);

    invalidate("ACHIEVEMENT");
    return result;
  });

// ════════════════════════════════════════════════════════════════
// Update
// ════════════════════════════════════════════════════════════════

export const adminUpdatePost = async (
  id: string,
  data: {
    title?: string;
    titleEn?: string;
    summary?: string;
    summaryEn?: string;
    content?: string;
    contentEn?: string;
    sourceLanguage?: "VI" | "EN";
    thumbnail?: string | null;
    status?: string;
    categoryId?: string | null;
    activityId?: string | null;
    images?: (string | { url: string; title?: string; caption?: string })[];
  }
) =>
  withAdmin(async (admin) => {
    const update: Record<string, unknown> = {};
    if (data.title !== undefined) {
      update.titleVi = data.title;
    }
    if (data.titleEn !== undefined) {
      update.titleEn = data.titleEn;
    }
    if (data.summary !== undefined) {
      update.summaryVi = data.summary || null;
    }
    if (data.summaryEn !== undefined) {
      update.summaryEn = data.summaryEn ?? null;
    }
    if (data.content !== undefined) {
      update.contentVi = data.content;
    }
    if (data.contentEn !== undefined) {
      update.contentEn = data.contentEn;
    }
    if (data.sourceLanguage !== undefined) {
      update.sourceLanguage = data.sourceLanguage;
    }
    if (data.thumbnail !== undefined) {
      update.thumbnail = data.thumbnail;
    }
    if (data.categoryId !== undefined) {
      update.categoryId = data.categoryId;
    }
    if (data.activityId !== undefined) {
      update.activityId = data.activityId;
    }
    if (data.images !== undefined) {
      update.images = normalizeAdditionalPhotos(data.images).map((x) => x.url);
    }
    if (data.status) {
      update.status = data.status;
      if (data.status === "PUBLISHED") {
        update.publishedAt = new Date();
        update.reviewerId = admin.id;
      }
    }
    const result = await prisma.post.update({
      where: { id, type: "BLOG" },
      data: update
    });

    const normalizedImages = normalizeAdditionalPhotos(
      data.images !== undefined ? data.images : (result.images as string[])
    );
    await syncPostImages(result.id, result.titleVi, result.contentVi, result.thumbnail, normalizedImages, []);

    invalidate("BLOG");
    return result;
  });

export const adminUpdateEvent = async (
  id: string,
  data: {
    title?: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    content?: string;
    contentEn?: string;
    sourceLanguage?: "VI" | "EN";
    thumbnail?: string | null;
    locationVi?: string | null;
    locationEn?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    status?: string;
    type?: string;
    startAt?: string;
    endAt?: string | null;
    images?: (string | { url: string; title?: string; caption?: string })[];
    postStatus?: string;
  }
) =>
  withAdmin(async (admin) => {
    const update: Record<string, unknown> = {};
    if (data.title !== undefined) {
      update.titleVi = data.title;
    }
    if (data.titleEn !== undefined) {
      update.titleEn = data.titleEn;
    }
    if (data.description !== undefined) {
      update.summaryVi = data.description;
    }
    if (data.descriptionEn !== undefined) {
      update.summaryEn = data.descriptionEn;
    }
    if (data.content !== undefined) {
      update.contentVi = data.content;
    }
    if (data.contentEn !== undefined) {
      update.contentEn = data.contentEn;
    }
    if (data.sourceLanguage !== undefined) {
      update.sourceLanguage = data.sourceLanguage;
    }
    if (data.thumbnail !== undefined) {
      update.thumbnail = data.thumbnail;
    }
    if (data.locationVi !== undefined) {
      update.locationVi = data.locationVi;
    }
    if (data.locationEn !== undefined) {
      update.locationEn = data.locationEn;
    }
    if (data.latitude !== undefined) {
      update.latitude = data.latitude;
    }
    if (data.longitude !== undefined) {
      update.longitude = data.longitude;
    }
    if (data.status) {
      update.eventStatus = data.status;
    }
    if (data.type) {
      update.eventType = data.type;
    }
    if (data.startAt) {
      update.startAt = new Date(data.startAt);
    }
    if (data.endAt !== undefined) {
      update.endAt = data.endAt ? new Date(data.endAt) : null;
    }
    if (data.images !== undefined) {
      update.images = normalizeAdditionalPhotos(data.images).map((x) => x.url);
    }
    if (data.postStatus !== undefined) {
      update.status = data.postStatus;
      if (data.postStatus === "PUBLISHED") {
        update.publishedAt = new Date();
        update.reviewerId = admin.id;
      }
    }
    const result = await prisma.post.update({
      where: { id, type: "EVENT" },
      data: update
    });

    const normalizedImages = normalizeAdditionalPhotos(
      data.images !== undefined ? data.images : (result.images as string[])
    );
    await syncPostImages(result.id, result.titleVi, result.contentVi, result.thumbnail, normalizedImages, []);

    invalidate("EVENT");
    return result;
  });

export const adminUpdateAchievement = async (
  id: string,
  data: {
    title?: string;
    titleEn?: string;
    summary?: string;
    summaryEn?: string;
    content?: string;
    contentEn?: string;
    sourceLanguage?: "VI" | "EN";
    thumbnail?: string;
    date?: string;
    type?: string;
    isHighlight?: boolean;
    relatedUrl?: string | null;
    locationVi?: string | null;
    locationEn?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    images?: (string | { url: string; title?: string; caption?: string })[];
    postStatus?: string;
  }
) =>
  withAdmin(async (admin) => {
    const update: Record<string, unknown> = {};
    if (data.title !== undefined) {
      update.titleVi = data.title;
    }
    if (data.titleEn !== undefined) {
      update.titleEn = data.titleEn;
    }
    if (data.summary !== undefined) {
      update.summaryVi = data.summary;
    }
    if (data.summaryEn !== undefined) {
      update.summaryEn = data.summaryEn;
    }
    if (data.content !== undefined) {
      update.contentVi = data.content;
    }
    if (data.contentEn !== undefined) {
      update.contentEn = data.contentEn;
    }
    if (data.sourceLanguage !== undefined) {
      update.sourceLanguage = data.sourceLanguage;
    }
    if (data.thumbnail !== undefined) {
      update.thumbnail = data.thumbnail;
    }
    if (data.date) {
      update.achievementDate = new Date(data.date);
    }
    if (data.type) {
      update.achievementType = data.type;
    }
    if (data.isHighlight !== undefined) {
      update.isHighlight = data.isHighlight;
    }
    if (data.relatedUrl !== undefined) {
      update.relatedUrl = data.relatedUrl;
    }
    if (data.locationVi !== undefined) {
      update.locationVi = data.locationVi;
    }
    if (data.locationEn !== undefined) {
      update.locationEn = data.locationEn;
    }
    if (data.latitude !== undefined) {
      update.latitude = data.latitude;
    }
    if (data.longitude !== undefined) {
      update.longitude = data.longitude;
    }
    if (data.images !== undefined) {
      update.images = normalizeAdditionalPhotos(data.images).map((x) => x.url);
    }
    if (data.postStatus !== undefined) {
      update.status = data.postStatus;
      if (data.postStatus === "PUBLISHED") {
        update.publishedAt = new Date();
        update.reviewerId = admin.id;
      }
    }
    const result = await prisma.post.update({
      where: { id, type: "ACHIEVEMENT" },
      data: update,
      include: { achievementMembers: { include: { member: true } } }
    });

    const normalizedImages = normalizeAdditionalPhotos(
      data.images !== undefined ? data.images : (result.images as string[])
    );
    const memberPhotos = result.achievementMembers.map((m) => ({
      url: m.imageUrl || "",
      memberName: `${m.member.firstName} ${m.member.lastName}`.trim(),
      role: m.role || ""
    }));

    await syncPostImages(result.id, result.titleVi, result.contentVi, result.thumbnail, normalizedImages, memberPhotos);

    invalidate("ACHIEVEMENT");
    return result;
  });

// ════════════════════════════════════════════════════════════════
// Status toggle (common for all types)
// ════════════════════════════════════════════════════════════════

export const adminUpdatePostStatus = async (
  id: string,
  status: string,
  type: "BLOG" | "EVENT" | "ACHIEVEMENT" = "BLOG"
) =>
  withAdmin(async (admin) => {
    const update: Record<string, unknown> = {};
    if (status === "UPCOMING" || status === "ONGOING" || status === "COMPLETED" || status === "CANCELLED") {
      update.eventStatus = status;
    } else {
      update.status = status;
    }
    if (status === "PUBLISHED") {
      update.publishedAt = new Date();
      update.reviewerId = admin.id;
    }
    const result = await prisma.post.update({
      where: { id, type },
      data: update
    });
    invalidate(type);
    return result;
  });

// ════════════════════════════════════════════════════════════════
// Achievement members (link / unlink / update)
// ════════════════════════════════════════════════════════════════

export const adminLinkAchievementMember = async (
  postId: string,
  memberId: string,
  role?: string,
  prize?: string,
  imageUrl?: string | null
) =>
  withAdmin(async () => {
    const result = await prisma.postAchievementMember.create({
      data: {
        postId,
        memberId,
        role: role ?? null,
        prize: prize ?? null,
        imageUrl: imageUrl ?? null
      }
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        achievementMembers: { include: { member: true } },
        gallery: true
      }
    });
    if (post) {
      const additionalPhotos = post.gallery
        .filter((g) => g.type === "ADDITIONAL")
        .map((g) => ({
          url: g.url,
          title: g.title ?? undefined,
          caption: g.caption ?? undefined
        }));
      const memberPhotos = post.achievementMembers.map((m) => ({
        url: m.imageUrl || "",
        memberName: `${m.member.firstName} ${m.member.lastName}`.trim(),
        role: m.role || ""
      }));
      await syncPostImages(postId, post.titleVi, post.contentVi, post.thumbnail, additionalPhotos, memberPhotos);
    }

    invalidate("ACHIEVEMENT");
    return result;
  });

export const adminUpdateAchievementMember = async (
  postId: string,
  memberId: string,
  updates: {
    role?: string | null;
    prize?: string | null;
    imageUrl?: string | null;
  }
) =>
  withAdmin(async () => {
    const result = await prisma.postAchievementMember.update({
      where: { postId_memberId: { postId, memberId } },
      data: updates
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        achievementMembers: { include: { member: true } },
        gallery: true
      }
    });
    if (post) {
      const additionalPhotos = post.gallery
        .filter((g) => g.type === "ADDITIONAL")
        .map((g) => ({
          url: g.url,
          title: g.title ?? undefined,
          caption: g.caption ?? undefined
        }));
      const memberPhotos = post.achievementMembers.map((m) => ({
        url: m.imageUrl || "",
        memberName: `${m.member.firstName} ${m.member.lastName}`.trim(),
        role: m.role || ""
      }));
      await syncPostImages(postId, post.titleVi, post.contentVi, post.thumbnail, additionalPhotos, memberPhotos);
    }

    invalidate("ACHIEVEMENT");
    return result;
  });

export const adminUnlinkAchievementMember = async (postId: string, memberId: string) =>
  withAdmin(async () => {
    await prisma.postAchievementMember.delete({
      where: { postId_memberId: { postId, memberId } }
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        achievementMembers: { include: { member: true } },
        gallery: true
      }
    });
    if (post) {
      const additionalPhotos = post.gallery
        .filter((g) => g.type === "ADDITIONAL")
        .map((g) => ({
          url: g.url,
          title: g.title ?? undefined,
          caption: g.caption ?? undefined
        }));
      const memberPhotos = post.achievementMembers.map((m) => ({
        url: m.imageUrl || "",
        memberName: `${m.member.firstName} ${m.member.lastName}`.trim(),
        role: m.role || ""
      }));
      await syncPostImages(postId, post.titleVi, post.contentVi, post.thumbnail, additionalPhotos, memberPhotos);
    }

    invalidate("ACHIEVEMENT");
    return { success: true };
  });

export const adminGetPostsStats = async () =>
  withAdmin(async () => {
    const [total, blog, event, achievement] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { type: "BLOG" } }),
      prisma.post.count({ where: { type: "EVENT" } }),
      prisma.post.count({ where: { type: "ACHIEVEMENT" } })
    ]);
    return { total, blog, event, achievement };
  });

// ════════════════════════════════════════════════════════════════
// Tags (list all + set tags for a post)
// ════════════════════════════════════════════════════════════════

export const adminGetTags = async () =>
  withAdmin(async () => {
    const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
    return tags;
  });

export const adminSetPostTags = async (postId: string, tagNames: string[]) =>
  withAdmin(async () => {
    const tagOps = tagNames.map((name) => {
      const slug = generateSlug(name);
      return prisma.tag.upsert({
        where: { slug },
        create: { name, slug },
        update: {}
      });
    });
    const tags = await Promise.all(tagOps);

    await prisma.postTag.deleteMany({ where: { postId } });

    if (tags.length > 0) {
      await prisma.postTag.createMany({
        data: tags.map((t) => ({ postId, tagId: t.id })),
        skipDuplicates: true
      });
    }

    return { success: true };
  });

export const adminSetPostImages = async (postId: string, images: string[]) =>
  withAdmin(async () => {
    await prisma.post.update({ where: { id: postId }, data: { images } });
    return { success: true };
  });

export const adminRegisterTempImage = async (url: string) =>
  withAdmin(async () => {
    const existing = await prisma.image.findUnique({ where: { url } });
    if (!existing) {
      await prisma.image.create({
        data: {
          url,
          isTemp: true,
          type: "ADDITIONAL"
        }
      });
    }
    return { success: true };
  });

export const syncPostImages = async (
  postId: string,
  postTitle: string,
  contentVi: string,
  thumbnailUrl: string | null,
  additionalPhotos: { url: string; title?: string; caption?: string }[],
  memberPhotos: { url: string; memberName: string; role?: string }[]
) => {
  const targetImages: {
    url: string;
    type: "THUMBNAIL" | "CONTENT" | "MEMBER" | "ADDITIONAL";
    title?: string;
    caption?: string;
    order: number;
  }[] = [];

  let orderCounter = 0;

  // A. Thumbnail
  if (thumbnailUrl) {
    targetImages.push({
      url: thumbnailUrl,
      type: "THUMBNAIL",
      title: postTitle,
      caption: "",
      order: orderCounter++
    });
  }

  // B. Content Images (Markdown)
  const mdImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match = mdImageRegex.exec(contentVi);
  while (match !== null) {
    const caption = match[1] || "";
    const url = match[2];
    if (url?.startsWith("http")) {
      targetImages.push({
        url,
        type: "CONTENT",
        title: caption,
        caption,
        order: orderCounter++
      });
    }
    match = mdImageRegex.exec(contentVi);
  }

  // C. Honored Member Images
  for (const mPhoto of memberPhotos) {
    if (mPhoto.url) {
      targetImages.push({
        url: mPhoto.url,
        type: "MEMBER",
        title: mPhoto.memberName,
        caption: mPhoto.role || "",
        order: orderCounter++
      });
    }
  }

  // D. Additional Photos
  for (const photo of additionalPhotos) {
    if (photo.url) {
      targetImages.push({
        url: photo.url,
        type: "ADDITIONAL",
        title: photo.title || "",
        caption: photo.caption || "",
        order: orderCounter++
      });
    }
  }

  // Deduplicate by URL
  const uniqueUrls = new Set<string>();
  const filteredTargetImages = targetImages.filter((img) => {
    if (uniqueUrls.has(img.url)) {
      return false;
    }
    uniqueUrls.add(img.url);
    return true;
  });

  const targetUrls = filteredTargetImages.map((img) => img.url);

  // Delete existing images that are no longer referenced
  await prisma.image.deleteMany({
    where: {
      postId,
      url: { notIn: targetUrls }
    }
  });

  // Upsert targets
  for (const img of filteredTargetImages) {
    await prisma.image.upsert({
      where: { url: img.url },
      update: {
        postId,
        type: img.type,
        title: img.title ?? null,
        caption: img.caption ?? null,
        isTemp: false,
        order: img.order
      },
      create: {
        url: img.url,
        postId,
        type: img.type,
        title: img.title ?? null,
        caption: img.caption ?? null,
        isTemp: false,
        order: img.order
      }
    });
  }
};
