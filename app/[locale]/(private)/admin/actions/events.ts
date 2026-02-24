"use server";

import { revalidateTag } from "next/cache";
import { _CACHE_EVENTS } from "@/constants/cache";
import { generateSlug, handleErrorServerWithAuth, prisma, requireAdmin } from "./_helpers";

export const adminGetEvents = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const events = await prisma.event.findMany({
        orderBy: { startAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          thumbnail: true,
          location: true,
          startAt: true,
          endAt: true,
          status: true,
          creator: { select: { firstName: true, lastName: true } }
        }
      });
      return events.map((e) => ({
        ...e,
        startAt: e.startAt.toISOString(),
        endAt: e.endAt ? e.endAt.toISOString() : null
      }));
    }
  });

export const adminDeleteEvent = async (id: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      await prisma.event.delete({ where: { id } });
      revalidateTag(_CACHE_EVENTS, "default");
      return { success: true };
    }
  });

export const adminCreateEvent = async (data: {
  title: string;
  slug?: string;
  description?: string;
  content?: string;
  thumbnail?: string | null;
  location?: string;
  startAt: string;
  endAt?: string;
  status?: string;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const admin = await requireAdmin(user);
      const slug = data.slug || generateSlug(data.title);
      const created = await prisma.event.create({
        data: {
          title: data.title,
          slug,
          description: data.description || null,
          content: data.content || null,
          thumbnail: data.thumbnail ?? null,
          location: data.location || null,
          startAt: new Date(data.startAt),
          endAt: data.endAt ? new Date(data.endAt) : null,
          status: (data.status as "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED") ?? "UPCOMING",
          creatorId: admin.id
        }
      });
      revalidateTag(_CACHE_EVENTS, "default");
      return created;
    }
  });

export const adminUpdateEvent = async (
  id: string,
  data: {
    title?: string;
    description?: string;
    content?: string;
    thumbnail?: string | null;
    location?: string;
    status?: string;
    startAt?: string;
    endAt?: string | null;
  }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const updated = await prisma.event.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
          ...(data.location !== undefined && { location: data.location }),
          ...(data.status && { status: data.status as "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED" }),
          ...(data.startAt && { startAt: new Date(data.startAt) }),
          ...(data.endAt !== undefined && { endAt: data.endAt ? new Date(data.endAt) : null })
        }
      });
      revalidateTag(_CACHE_EVENTS, "default");
      return updated;
    }
  });
