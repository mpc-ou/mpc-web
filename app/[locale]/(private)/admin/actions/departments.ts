"use server";

import { revalidateTag } from "next/cache";
import { _CACHE_DEPARTMENTS } from "@/constants/cache";
import { handleErrorServerWithAuth, prisma, requireAdmin } from "./_helpers";

export const adminGetDepartments = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      return prisma.department.findMany({
        orderBy: { order: "asc" },
        include: { _count: { select: { clubRoles: true } } }
      });
    }
  });

export const adminCreateDepartment = async (data: {
  nameVi: string;
  nameEn?: string;
  slug: string;
  descriptionVi?: string;
  descriptionEn?: string;
  icon?: string;
  bgImage?: string;
  order?: number;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const created = await prisma.department.create({ data: { ...data, order: data.order ?? 0 } });
      revalidateTag(_CACHE_DEPARTMENTS, "default");
      return created;
    }
  });

export const adminUpdateDepartment = async (
  id: string,
  data: {
    nameVi?: string;
    nameEn?: string;
    slug?: string;
    descriptionVi?: string;
    descriptionEn?: string;
    icon?: string;
    bgImage?: string;
    order?: number;
    isActive?: boolean;
  }
) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const updated = await prisma.department.update({ where: { id }, data });
      revalidateTag(_CACHE_DEPARTMENTS, "default");
      return updated;
    }
  });

export const adminDeleteDepartment = async (id: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      await prisma.department.delete({ where: { id } });
      revalidateTag(_CACHE_DEPARTMENTS, "default");
      return { success: true };
    }
  });
