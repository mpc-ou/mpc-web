import { Code2 } from "lucide-react";
import type { Metadata } from "next";
import { getProjectsPageData } from "@/app/[locale]/actions";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { generatePageSeo } from "@/utils/seo";
import { ProjectsClient } from "./client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "projects",
    locale,
    pathname: "/projects",
  });
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<React.ReactNode> {
  const sp = await searchParams;
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;
  const validPage = Number.isNaN(page) || page < 1 ? 1 : page;

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
        <ScrollReveal className="mb-16 text-center">
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
        </ScrollReveal>

        {/* Content */}
        <ProjectsClient
          currentPage={validPage}
          projects={projects}
          totalPages={totalPages}
        />

        {/* Contact Footer */}
        <ScrollReveal className="mt-20 border-border border-t pt-16 text-center">
          <h2 className="mb-4 font-bold text-3xl text-foreground">
            Bạn muốn tham gia dự án cùng chúng tôi?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Chúng tôi luôn chào đón những thành viên đam mê lập trình, thiết kế
            và sáng tạo. Hãy kết nối để cùng nhau xây dựng những sản phẩm tuyệt
            vời!
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-md bg-[#1877F2] px-8 font-medium text-sm text-white shadow-sm hover:bg-[#1877F2]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              href="https://www.facebook.com/CLBLapTrinhTrenThietBiDiDong"
              rel="noopener noreferrer"
              target="_blank"
            >
              Liên hệ qua Facebook
            </a>
            <a
              className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-md bg-foreground px-8 font-medium text-background text-sm shadow-sm hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              href="https://github.com/mpc-ou"
              rel="noopener noreferrer"
              target="_blank"
            >
              Khám phá thêm trên GitHub
            </a>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
