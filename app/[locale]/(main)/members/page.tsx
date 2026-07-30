import { Users } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getMembersGroupedByYear } from "@/app/_actions/main";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { generatePageSeo } from "@/utils/seo";
import { MembersHeroClient } from "./_components/members-hero.client";
import { MembersClient } from "./client";

// Matches the item shape pushed in getMembersGroupedByYear (app/_actions/main/members.ts)
type GroupedMember = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  avatar: string | null;
  slug: string;
  socials: { platform: string; url: string }[] | null;
  currentRole: {
    id: string;
    position: string;
    term: number | null;
    startAt: Date;
    endAt: Date | null;
    note: string | null;
    department: { nameVi?: string | null } | null;
  } | null;
};

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
    | { sortedYears: number[]; groupedByYear: Record<number, GroupedMember[]> }
    | undefined;
  const sortedYears = payload?.sortedYears ?? [];
  const groupedByYear = payload?.groupedByYear ?? {};

  return (
    <div className='min-h-screen bg-background pb-20'>
      <MembersHeroClient />

      <div className='container mx-auto mt-20 max-w-7xl px-4'>
        {/* Members List */}
        <div className='space-y-16'>
          {sortedYears.map((year: number, idx: number) => (
            <ScrollReveal delay={idx * 100} key={year} variant='fade-up'>
              <div>
                <div className='mb-6 flex items-center gap-4'>
                  <h2 className='font-bold text-3xl'>{year}</h2>
                  <div className='h-[1px] flex-1 bg-border' />
                  <span className='text-muted-foreground text-sm'>
                    {t("membersCount", { count: groupedByYear[year].length })}
                  </span>
                </div>
                <MembersClient groupMembers={groupedByYear[year]} />
              </div>
            </ScrollReveal>
          ))}
          {sortedYears.length === 0 && <div className='py-20 text-center text-muted-foreground'>{t("empty")}</div>}
        </div>
      </div>
    </div>
  );
}
