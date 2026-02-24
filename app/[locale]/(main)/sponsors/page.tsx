import { Handshake } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSponsorsPageData } from "@/app/[locale]/actions";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { SponsorsClient } from "./client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: `Nhà tài trợ | ${t("metadata.siteName")}`,
    description:
      "Những đối tác và nhà tài trợ đồng hành cùng sự phát triển của câu lạc bộ",
  };
}

export default async function SponsorsPage() {
  const { data } = await getSponsorsPageData();
  const payload = data?.payload as { sponsors: any[] } | undefined;
  const sponsors = payload?.sponsors ?? [];

  // Group by the year of their first sponsorship. If none, use createdAt year.
  const groupedByYear = sponsors.reduce(
    (acc, sponsor) => {
      let year = new Date(sponsor.createdAt).getFullYear();
      if (sponsor.sponsorships.length > 0) {
        year = new Date(sponsor.sponsorships[0].startAt).getFullYear();
      }

      if (!acc[year]) {
        acc[year] = [];
      }

      // Serialize data for client
      acc[year].push({
        id: sponsor.id,
        name: sponsor.name,
        slug: sponsor.slug,
        logo: sponsor.logo,
        website: sponsor.website,
        description: sponsor.description,
        sponsorships: sponsor.sponsorships.map((s: any) => ({
          id: s.id,
          title: s.title,
          tier: s.tier,
        })),
      });
      return acc;
    },
    {} as Record<number, any[]>,
  );

  const sortedYears = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-background pt-10 pb-20 sm:pt-20">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <ScrollReveal className="mb-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Handshake className="h-8 w-8" />
          </div>
          <h1 className="mb-4 font-black text-4xl tracking-tight sm:text-5xl">
            Nhà tài trợ & Đối tác
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Xin chân thành cảm ơn các tổ chức, doanh nghiệp và cá nhân đã luôn
            đồng hành cùng câu lạc bộ trên chặng đường phát triển.
          </p>
        </ScrollReveal>

        {/* Content */}
        <div className="space-y-16">
          {sortedYears.map((year, idx) => (
            <ScrollReveal delay={idx * 100} key={year} variant="fade-up">
              <div>
                <div className="mb-8 flex items-center justify-center gap-4 text-center">
                  <div className="h-[1px] w-12 bg-border md:w-24" />
                  <h2 className="font-bold text-3xl text-foreground/80 md:text-4xl">
                    Năm {year}
                  </h2>
                  <div className="h-[1px] w-12 bg-border md:w-24" />
                </div>
                <SponsorsClient sponsors={groupedByYear[year]} />
              </div>
            </ScrollReveal>
          ))}

          {sortedYears.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              Chưa có dữ liệu nhà tài trợ.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
