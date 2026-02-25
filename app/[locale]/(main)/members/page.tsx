import { Users } from "lucide-react";
import type { Metadata } from "next";
import { getMembersGroupedByYear } from "@/app/[locale]/actions";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { generatePageSeo } from "@/utils/seo";
import { MembersClient } from "./client";
import { MembersHeroClient } from "./hero.client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "members",
    locale,
    pathname: "/members"
  });
}

export default async function MembersPage() {
  const { data } = await getMembersGroupedByYear();
  const payload = data?.payload as { sortedYears: number[]; groupedByYear: Record<number, any[]> } | undefined;
  const sortedYears = payload?.sortedYears ?? [];
  const groupedByYear = payload?.groupedByYear ?? {};

  return (
    <div className='min-h-screen bg-background pb-20'>
      <MembersHeroClient />

      <div className='container mx-auto mt-20 max-w-5xl px-4'>
        {/* Members List */}
        <div className='space-y-16'>
          {sortedYears.map((year: number, idx: number) => (
            <ScrollReveal delay={idx * 100} key={year} variant='fade-up'>
              <div>
                <div className='mb-6 flex items-center gap-4'>
                  <h2 className='font-bold text-3xl'>{year}</h2>
                  <div className='h-[1px] flex-1 bg-border' />
                  <span className='text-muted-foreground text-sm'>{groupedByYear[year].length} thành viên</span>
                </div>
                <MembersClient groupMembers={groupedByYear[year]} />
              </div>
            </ScrollReveal>
          ))}
          {sortedYears.length === 0 && (
            <div className='py-20 text-center text-muted-foreground'>Chưa có dữ liệu thành viên.</div>
          )}
        </div>
      </div>
    </div>
  );
}
