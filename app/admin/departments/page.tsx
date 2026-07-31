import { Building2 } from "lucide-react";
import { adminGetDepartments } from "@/app/_actions/admin";
import { AdminPageHeader } from "../_components/admin-page-header";
import type { DeptRow } from "./columns";
import { DepartmentsDataTable } from "./manager";

export default async function AdminDepartmentsPage(): Promise<React.ReactNode> {
  const { data } = await adminGetDepartments();
  const departments = (data?.payload ?? []) as DeptRow[];

  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        description='Cấu trúc tổ chức và các ban trực thuộc câu lạc bộ'
        icon={Building2}
        title='Quản lý Các ban'
      />
      <DepartmentsDataTable data={departments} />
    </div>
  );
}
