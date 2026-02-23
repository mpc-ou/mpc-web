import { Code2 } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProjectsPageData } from "@/app/[locale]/actions";
import { ProjectsClient } from "./client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: `Dự án | ${t("metadata.siteName")}`,
    description: "Nhưng dự án thực tế do chính sinh viên thực hiện",
  };
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;
  const validPage = isNaN(page) || page < 1 ? 1 : page;

  const take = 12;

  const { data } = await getProjectsPageData(validPage, take);
  const payload = data?.payload as
    | { total: number; projects: any[]; totalPages: number }
    | undefined;

  const projects = payload?.projects ?? [];
  const totalPages = payload?.totalPages ?? 0;

  return (
    <div className="min-h-screen bg-background pt-10 pb-20 sm:pt-20">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Code2 className="h-8 w-8" />
          </div>
          <h1 className="mb-4 font-black text-4xl tracking-tight sm:text-5xl">
            Dự án của chúng tôi
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Tuyển tập các sản phẩm, ứng dụng thực tế do chính các thành viên Câu
            lạc bộ nghiên cứu và phát triển.
          </p>
        </div>

        {/* Content */}
        <ProjectsClient
          currentPage={validPage}
          projects={projects}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
