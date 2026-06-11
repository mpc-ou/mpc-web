"use server";

import { revalidateTag } from "next/cache";
import { _CACHE_DEPARTMENTS } from "@/constants/cache";
import { handleErrorServerWithAuth, prisma, requireAdmin } from "./helpers";

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
      const created = await prisma.department.create({
        data: { ...data, order: data.order ?? 0 }
      });
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
      const dept = await prisma.department.findUnique({ where: { id } });
      if (!dept) {
        throw new Error("Không tìm thấy ban");
      }
      if (dept.slug === "president") {
        throw new Error("Không thể xóa Ban Chủ nhiệm mặc định");
      }
      await prisma.department.delete({ where: { id } });
      revalidateTag(_CACHE_DEPARTMENTS, "default");
      return { success: true };
    }
  });

export const adminSeedDepartments = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const data = (await import("@/configs/data/departments.json")).default as Array<{
        id: string;
        icon: string;
        bgImage?: string;
        vi: {
          name: string;
          description: string;
          missions: string[];
          linkLabel?: string;
        };
        en: {
          name: string;
          description: string;
          missions: string[];
          linkLabel?: string;
        };
        link?: string;
      }>;

      let count = 0;
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const existing = await prisma.department.findUnique({
          where: { slug: item.id }
        });
        const payload = {
          slug: item.id,
          nameVi: item.vi.name,
          nameEn: item.en.name,
          descriptionVi: item.vi.description,
          descriptionEn: item.en.description,
          missionsVi: item.vi.missions.join("\n\n"),
          missionsEn: item.en.missions.join("\n\n"),
          icon: item.icon,
          bgImage: item.bgImage ?? null,
          linkLabelVi: item.vi.linkLabel ?? null,
          linkLabelEn: item.en.linkLabel ?? null,
          hyperlink: item.link ?? null,
          order: i
        };
        if (existing) {
          await prisma.department.update({
            where: { id: existing.id },
            data: payload
          });
        } else {
          await prisma.department.create({ data: payload });
        }
        count++;
      }
      revalidateTag(_CACHE_DEPARTMENTS, "default");
      return { success: true, count };
    }
  });
