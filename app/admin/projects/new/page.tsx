import { adminGetMembers } from "@/app/_actions/admin";
import type { MemberOption } from "@/components/member-selector";
import ProjectForm from "../project-form";

export default async function NewProjectPage(): Promise<React.ReactNode> {
  const membersRes = await adminGetMembers();
  const allMembers = (membersRes.data?.payload ?? []) as MemberOption[];

  return <ProjectForm allMembers={allMembers} />;
}
