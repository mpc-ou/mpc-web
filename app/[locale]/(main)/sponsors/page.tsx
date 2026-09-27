import { GraduationCap, Handshake, Megaphone } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSponsorsPageData, getTerminalStats } from "@/app/_actions/main";
import { PageHero } from "@/components/custom/page-hero.client";
import { SectionHeading } from "@/components/custom/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { ABOUT_CLUB } from "@/configs/data/about";
import type { Prisma } from "@/configs/prisma/generated/prisma/client";
import { MPC_FOUNDED_YEAR } from "@/constants/hero";
import { generatePageSeo } from "@/utils/seo";
import { FaqSection } from "../_components/faq-section";
import { JoinCtaSection } from "../_components/join-cta-section";
import { type SponsorCardData, SponsorsClient } from "./client";

type Props = { params: Promise<{ locale: string }> };

type SponsorWithSponsorships = Prisma.SponsorGetPayload<{ include: { sponsorships: true } }>;

const BENEFIT_ICONS = [GraduationCap, Megaphone, Handshake] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({ page: "sponsors", locale, pathname: "/sponsors" });
}

export default async function SponsorsPage({ params }: Props): Promise<React.ReactNode> {
  const { locale } = await params;
  const isEn = locale === "en";
  const [t, { data }, { data: statsData }] = await Promise.all([
    getTranslations({ locale, namespace: "sponsorsPage" }),
    getSponsorsPageData(),
    getTerminalStats()
  ]);

  const sponsors = (data?.payload as { sponsors: SponsorWithSponsorships[] } | undefined)?.sponsors ?? [];
  const stats = statsData?.payload as { members: number; events: number; currentYear?: number } | undefined;
  const years = Math.max(1, (stats?.currentYear ?? MPC_FOUNDED_YEAR + 10) - MPC_FOUNDED_YEAR);

  const groups = new Map<number, SponsorCardData[]>();
  for (const s of sponsors) {
    const year = (s.startAt ?? s.createdAt).getFullYear();
    const card: SponsorCardData = {
      id: s.id,
      name: isEn ? s.nameEn || s.name : s.name,
      logo: s.logo,
      website: s.website,
      email: s.email,
      phone: s.phone,
      description: isEn ? s.descriptionEn || s.descriptionVi : s.descriptionVi,
      startAt: s.startAt?.toISOString() ?? null,
      endAt: s.endAt?.toISOString() ?? null,
      images: s.images
    };
    groups.set(year, [...(groups.get(year) ?? []), card]);
  }
  const yearGroups = [...groups.entries()].sort(([a], [b]) => b - a).map(([year, items]) => ({ year, items }));

  const benefits = t.raw("benefits") as { title: string; desc: string }[];
  const statItems = [
    { value: `${stats?.members || 50}+`, label: t("statMembers") },
    { value: `${stats?.events || 30}+`, label: t("statEvents") },
    { value: `${years}+`, label: t("statYears") }
  ];

  return (
    <div className='min-h-screen bg-background'>
      <PageHero
        badge={t("badge")}
        description={t("description")}
        imageUrl='/images/bg/toc2025.jpg'
        title={t("title")}
      />

      <section className='container mx-auto px-4 py-20 sm:py-24'>
        <ScrollReveal>
          <SectionHeading description={t("whyDesc")} tag={t("whyTag")} title={t("whyTitle")} />
        </ScrollReveal>
        <div className='grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]'>
          <div className='grid grid-cols-3 gap-3 self-start rounded-2xl border border-border bg-card p-5 lg:grid-cols-1 lg:gap-0 lg:p-0'>
            {statItems.map((s) => (
              <div className='flex flex-col gap-1 lg:border-border lg:border-b lg:p-6 lg:last:border-b-0' key={s.label}>
                <span className='font-black text-3xl text-primary tabular-nums sm:text-5xl'>{s.value}</span>
                <span className='text-muted-foreground text-xs sm:text-sm'>{s.label}</span>
              </div>
            ))}
          </div>
          <div className='grid gap-4 sm:grid-cols-3 lg:grid-cols-1'>
            {benefits.map((b, i) => {
              const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
              return (
                <ScrollReveal delay={i * 100} key={b.title} variant='fade-up'>
                  <div className='group flex h-full gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40'>
                    <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground'>
                      <Icon className='h-5 w-5' />
                    </span>
                    <div className='flex flex-col gap-1'>
                      <h3 className='font-bold text-foreground'>{b.title}</h3>
                      <p className='text-muted-foreground text-sm leading-relaxed'>{b.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className='container mx-auto px-4 pb-8'>
        <ScrollReveal>
          <SectionHeading description={t("listDesc")} tag={t("listTag")} title={t("listTitle")} />
        </ScrollReveal>
        {yearGroups.length === 0 ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-border border-dashed px-6 py-16 text-center'>
            <Handshake className='h-10 w-10 text-primary/60' />
            <h3 className='font-bold text-foreground text-lg'>{t("emptyTitle")}</h3>
            <p className='max-w-md text-muted-foreground text-sm'>{t("emptyDesc")}</p>
          </div>
        ) : (
          <SponsorsClient
            groups={yearGroups}
            labels={{
              active: t("active"),
              present: t("present"),
              website: t("website"),
              email: t("email"),
              gallery: t("gallery"),
              viewDetail: t("viewDetail"),
              year: t("year", { year: "{year}" })
            }}
            locale={locale}
          />
        )}
      </section>

      <FaqSection locale={locale} target='SPONSOR' />

      <JoinCtaSection
        description={t("ctaDesc")}
        eyebrow={t("ctaEyebrow")}
        locale={locale}
        primary={{ label: t("ctaEmail"), href: `mailto:${ABOUT_CLUB.contact.email}` }}
        secondary={{ label: t("ctaFanpage"), href: ABOUT_CLUB.contact.facebook }}
        title={t("ctaTitle")}
      />
    </div>
  );
}
