import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProjectsPageData } from "@/app/_actions/main";
import { PageHero } from "@/components/custom/page-hero.client";
import { ABOUT_CLUB } from "@/configs/data/about";
import type { ProjectSummary } from "@/types/common";
import { generatePageSeo } from "@/utils/seo";
import { FaqSection } from "../_components/faq-section";
import { JoinCtaSection } from "../_components/join-cta-section";
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
        <div className='mt-12 border-border pt-12'>
          <FaqSection locale={locale} target='PROJECTS' />
        </div>

        <JoinCtaSection
          bare
          className='mt-12 border-border pt-16'
          description={t("footerDesc")}
          eyebrow={t("footerEyebrow")}
          locale={locale}
          primary={{ label: t("contactFacebook"), href: ABOUT_CLUB.contact.facebook }}
          secondary={{ label: t("exploreGithub"), href: ABOUT_CLUB.contact.github }}
          title={t("footerTitle")}
        />
      </div>
    </div>
  );
}
