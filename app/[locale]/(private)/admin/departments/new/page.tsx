import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { generatePageSeo } from "@/utils/seo";
import DeptForm from "../dept-form";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "departments-new",
    locale,
    pathname: "/admin/departments/new"
  });
}

export default async function NewDeptPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DeptForm />;
}
