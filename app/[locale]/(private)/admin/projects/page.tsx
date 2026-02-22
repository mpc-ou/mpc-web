import type { MemberOption } from "@/components/member-selector";
import { adminGetMembers, adminGetProjects } from "../actions";
import type { ProjectRow } from "./columns";
import { ProjectsDataTable } from "./manager";

export default async function AdminProjectsPage() {
  const [projectsRes, membersRes] = await Promise.all([adminGetProjects(), adminGetMembers()]);
  const projects = (projectsRes.data?.payload ?? []) as ProjectRow[];
  const allMembers = (membersRes.data?.payload ?? []) as MemberOption[];

  return (
    <div className='flex flex-col gap-6'>
      <h1 className='font-bold text-2xl text-foreground'>📁 Quản lý Dự án</h1>
      <ProjectsDataTable allMembers={allMembers} data={projects} />
    </div>
  );
}
