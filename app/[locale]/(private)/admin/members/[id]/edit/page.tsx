import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/configs/prisma/db";
import { MemberForm } from "../../_components/member-form";
import type { MemberRow } from "../../columns";
import type { Department } from "../../types";

type Params = Promise<{ id: string }>;

export default async function EditMemberPage({ params }: { params: Params }) {
  await cookies();
  const { id } = await params;

  const memberData = await prisma.member.findUnique({
    where: { id },
    include: {
      clubRoles: {
        include: { department: true }
      }
    }
  });

  if (!memberData) {
    notFound();
  }

  const member = {
    ...memberData,
    createdAt: memberData.createdAt.toISOString(),
    updatedAt: memberData.updatedAt.toISOString(),
    dob: memberData.dob ? memberData.dob.toISOString() : null,
    leftClubAt: memberData.leftClubAt ? memberData.leftClubAt.toISOString() : null,
    joinedClubAt: memberData.joinedClubAt ? memberData.joinedClubAt.toISOString() : null,
    isActive: !memberData.leftClubAt,
    clubRoles: memberData.clubRoles.map((cr) => ({
      ...cr,
      createdAt: cr.createdAt.toISOString(),
      updatedAt: cr.updatedAt.toISOString(),
      startAt: cr.startAt.toISOString(),
      endAt: cr.endAt ? cr.endAt.toISOString() : null
    }))
  } as unknown as MemberRow;

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

  return <MemberForm departments={departments} member={member} />;
}
