import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { adminGetMemberDetailForEdit } from "@/app/_actions/admin";
import { MemberForm } from "../../_components/member-form";
import type { MemberRow } from "../../columns";
import type { Department } from "../../types";

type Params = Promise<{ id: string }>;

export default async function EditMemberPage({ params }: { params: Params }) {
  await cookies();
  const { id } = await params;

  const { data } = await adminGetMemberDetailForEdit(id);
  const payload = data?.payload as { member: unknown; departments: Department[] } | undefined;

  if (!payload) {
    notFound();
  }

  const member = payload.member as unknown as MemberRow;
  const departments = payload.departments;

  return <MemberForm departments={departments} member={member} />;
}
