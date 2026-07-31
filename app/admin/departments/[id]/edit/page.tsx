import { notFound } from "next/navigation";
import { adminGetDepartments } from "@/app/_actions/admin";
import type { DeptRow } from "../../columns";
import DeptForm from "../../dept-form";

export default async function EditDeptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await adminGetDepartments();
  const departments = (res.data?.payload as DeptRow[] | undefined) ?? [];
  const dept = departments.find((d) => d.id === id);
  if (!dept) {
    notFound();
  }
  return <DeptForm dept={dept} />;
}
