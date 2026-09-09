import { redirect } from "next/navigation";
import { adminGetMembers, adminGetProjectById } from "@/app/_actions/admin";
import type { MemberOption } from "@/components/member-selector";
import type { ProjectRow } from "../../columns";
import ProjectForm from "../../project-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({ params }: Props): Promise<React.ReactNode> {
  const { id } = await params;
  const [projectRes, membersRes] = await Promise.all([adminGetProjectById(id), adminGetMembers()]);

  const payload = projectRes.data?.payload as (ProjectRow & { notFound?: boolean }) | undefined;
  if (!projectRes || projectRes.error || !payload || payload.notFound) {
    redirect("/admin/projects");
  }

  const project = payload as ProjectRow;
  const allMembers = (membersRes.data?.payload ?? []) as MemberOption[];

  return <ProjectForm allMembers={allMembers} project={project} />;
}
