"use server";

import { revalidateTag } from "next/cache";
import { _CACHE_SPONSORS } from "@/constants/cache";
import { generateSlug, handleErrorServerWithAuth, prisma, requireAdmin } from "./_helpers";

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
  slug?: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  description?: string;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const slug = data.slug || generateSlug(data.name);
      const created = await prisma.sponsor.create({
        data: {
          name: data.name,
          slug,
          logo: data.logo || null,
          website: data.website || null,
          email: data.email || null,
          phone: data.phone || null,
          description: data.description || null
        }
      });
      revalidateTag(_CACHE_SPONSORS, "default");
      return created;
    }
  });

export const adminUpdateSponsor = async (
  id: string,
  data: { name?: string; website?: string; email?: string; phone?: string; description?: string; logo?: string; isActive?: boolean }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const updated = await prisma.sponsor.update({ where: { id }, data });
      revalidateTag(_CACHE_SPONSORS, "default");
      return updated;
    }
  });
