import { adminGetDepartments } from "../actions";
import type { DeptRow } from "./columns";
import { DepartmentsDataTable } from "./manager";

export default async function AdminDepartmentsPage(): Promise<React.ReactNode> {
  const { data } = await adminGetDepartments();
  const departments = (data?.payload ?? []) as DeptRow[];

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='font-bold text-2xl text-foreground'>🏢 Quản lý Các ban</h1>
        <p className='text-muted-foreground text-sm'>{departments.length} ban</p>
      </div>
      <DepartmentsDataTable data={departments} />
    </div>
  );
}
