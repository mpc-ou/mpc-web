import { cookies } from "next/headers";
import { prisma } from "@/configs/prisma/db";
import { MemberForm } from "../_components/member-form";
import type { Department } from "../types";

export default async function NewMemberPage() {
  await cookies();
  const departmentsData = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { nameVi: "asc" }
  });

  const departments: Department[] = departmentsData.map((d) => ({
    id: d.id,
    nameVi: d.nameVi,
    nameEn: d.nameEn,
    slug: d.slug
  }));

  return <MemberForm departments={departments} />;
}
