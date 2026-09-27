import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getMembersGroupedByYear } from "@/app/_actions/main";
import { generatePageSeo } from "@/utils/seo";
import { JoinCtaSection } from "../_components/join-cta-section";
import { type DirectoryMember, type DirectoryYear, MembersDirectory } from "./_components/members-directory.client";
import { MembersHeroClient } from "./_components/members-hero.client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "members",
    locale,
    pathname: "/members"
  });
}

export default async function MembersPage({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactNode> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "membersPage" });
  const { data } = await getMembersGroupedByYear();
  const payload = data?.payload as
    | { sortedYears: number[]; groupedByYear: Record<number, DirectoryMember[]> }
    | undefined;
  const years: DirectoryYear[] = (payload?.sortedYears ?? []).map((year) => ({
    year,
    members: payload?.groupedByYear[year] ?? []
  }));

  return (
    <div className='min-h-screen bg-background pb-8'>
      <MembersHeroClient />
      {years.length === 0 ? (
        <div className='py-20 text-center text-muted-foreground'>{t("empty")}</div>
      ) : (
        <MembersDirectory years={years} />
      )}
      <JoinCtaSection locale={locale} />
    </div>
  );
}
