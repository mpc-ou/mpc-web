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
  name: string;
  slug: string;
  description?: string;
  order?: number;
}) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const created = await prisma.department.create({ data });
      revalidateTag(_CACHE_DEPARTMENTS, "default");
      return created;
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
