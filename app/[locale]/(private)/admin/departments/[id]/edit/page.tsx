import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { adminGetDepartments } from "@/app/_actions/admin";
import { generatePageSeo } from "@/utils/seo";
import DeptForm from "../../dept-form";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "departments-edit",
    locale,
    pathname: "/admin/departments/edit"
  });
}

export default async function EditDeptPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const res = await adminGetDepartments();
  const departments = (res.data?.payload as any[]) ?? [];
  const dept = departments.find((d: any) => d.id === id);
  if (!dept) {
    notFound();
  }
  return <DeptForm dept={dept} />;
}
