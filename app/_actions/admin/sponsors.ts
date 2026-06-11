"use server";

import { revalidateTag } from "next/cache";
import { _CACHE_SPONSORS } from "@/constants/cache";
import { generateSlug, handleErrorServerWithAuth, prisma, requireAdmin } from "./helpers";

export const adminGetSponsors = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.sponsor.findMany({ orderBy: { createdAt: "desc" } });
    }
  });

export const adminDeleteSponsor = async (id: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      await prisma.sponsor.delete({ where: { id } });
      revalidateTag(_CACHE_SPONSORS, "default");
      return { success: true };
    }
  });

export const adminCreateSponsor = async (data: {
  name: string;
  nameEn?: string;
  slug?: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  activityId?: string | null;
  startAt?: string;
  endAt?: string;
  images?: string[];
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const slug = data.slug || generateSlug(data.name);
      const created = await prisma.sponsor.create({
        data: {
          name: data.name,
          nameEn: data.nameEn ?? "",
          slug,
          logo: data.logo || null,
          website: data.website || null,
          email: data.email || null,
          phone: data.phone || null,
          descriptionVi: data.descriptionVi || null,
          descriptionEn: data.descriptionEn || null,
          activityId: data.activityId || null,
          startAt: data.startAt ? new Date(data.startAt) : null,
          endAt: data.endAt ? new Date(data.endAt) : null,
          images: data.images ?? []
        }
      });
      revalidateTag(_CACHE_SPONSORS, "default");
      return created;
    }
  });

export const adminUpdateSponsor = async (
  id: string,
  data: {
    name?: string;
    nameEn?: string;
    website?: string;
    email?: string;
    phone?: string;
    descriptionVi?: string | null;
    descriptionEn?: string | null;
    logo?: string | null;
    activityId?: string | null;
    startAt?: string | null;
    endAt?: string | null;
    images?: string[];
    isActive?: boolean;
  }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const payload: Record<string, unknown> = { ...data };
      if (data.startAt !== undefined) {
        payload.startAt = data.startAt ? new Date(data.startAt) : null;
      }
      if (data.endAt !== undefined) {
        payload.endAt = data.endAt ? new Date(data.endAt) : null;
      }
      const updated = await prisma.sponsor.update({
        where: { id },
        data: payload
      });
      revalidateTag(_CACHE_SPONSORS, "default");
      return updated;
    }
  });
