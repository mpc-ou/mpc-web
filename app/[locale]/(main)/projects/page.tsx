import { Code2 } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProjectsPageData } from "@/app/_actions/main";
import { PageHero } from "@/components/custom/page-hero.client";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { ABOUT_CLUB } from "@/configs/data/about";
import type { ProjectSummary } from "@/types/common";
import { generatePageSeo } from "@/utils/seo";
import { FaqSection } from "../_components/faq-section";
import { ProjectsClient } from "./client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "projects",
    locale,
    pathname: "/projects"
  });
}

export default async function ProjectsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<React.ReactNode> {
  const { locale } = await params;
  const sp = await searchParams;
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;
  const validPage = Number.isNaN(page) || page < 1 ? 1 : page;

  const take = 12;

  const [{ data }, t] = await Promise.all([
    getProjectsPageData(validPage, take),
    getTranslations({ locale, namespace: "projects" })
  ]);
  const payload = data?.payload as { total: number; projects: ProjectSummary[]; totalPages: number } | undefined;

  const projects = payload?.projects ?? [];
  const totalPages = payload?.totalPages ?? 0;

  return (
    <div className='min-h-screen bg-background pb-20'>
      <PageHero
        badge={t("badge")}
        description={t("description")}
        imageUrl='/images/bg/projects.jpg'
        title={t("title")}
      />
      <div className='container mx-auto mt-16 max-w-6xl px-4'>
        {/* Content */}
        <ProjectsClient currentPage={validPage} projects={projects} totalPages={totalPages} />

        {/* FAQ Section */}
        <div className='mt-12 border-border border-t pt-12'>
          <FaqSection locale={locale} target='PROJECTS' />
        </div>

        {/* Contact Footer */}
        <ScrollReveal className='mt-12 border-border border-t pt-16 text-center'>
          <h2 className='mb-4 font-bold text-3xl text-foreground'>{t("footerTitle")}</h2>
          <p className='mx-auto mb-8 max-w-2xl text-lg text-muted-foreground'>{t("footerDesc")}</p>
          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <a
              className='inline-flex h-11 items-center justify-center whitespace-nowrap rounded-md bg-[#1877F2] px-8 font-medium text-sm text-white shadow-sm hover:bg-[#1877F2]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
              href={ABOUT_CLUB.contact.facebook}
              rel='noopener noreferrer'
              target='_blank'
            >
              {t("contactFacebook")}
            </a>
            <a
              className='inline-flex h-11 items-center justify-center whitespace-nowrap rounded-md bg-foreground px-8 font-medium text-background text-sm shadow-sm hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
              href='https://github.com/mpc-ou'
              rel='noopener noreferrer'
              target='_blank'
            >
              {t("exploreGithub")}
            </a>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
