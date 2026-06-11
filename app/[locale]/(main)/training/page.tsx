import {
  ArrowUpRight,
  Calendar,
  Code2,
  FileText,
  Globe2,
  Laptop,
  Layers,
  Mail,
  Rocket,
  Sparkles,
  Users
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getTrainingPageData } from "@/app/_actions/main";
import { PageHero } from "@/components/custom/page-hero.client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { ABOUT_CLUB } from "@/configs/data/about";
import { generatePageSeo } from "@/utils/seo";
import { FeaturedProjectsClient } from "./_components/featured-projects.client";
import { TrainingImage } from "./_components/training-image.client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "training",
    locale,
    pathname: "/training"
  });
}

type PhaseType = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  techs: string[];
  icon: React.ComponentType<{ className?: string }>;
};

const PhaseCard = ({ phase }: { phase: PhaseType }) => {
  return (
    <div className='group/card relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-left transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5'>
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100' />

      <div className='relative z-10 space-y-3'>
        <div className='flex items-center justify-between gap-4'>
          <span className='inline-block rounded-full border border-orange-500/20 bg-orange-500/5 px-2.5 py-0.5 font-bold text-[10px] text-orange-500 uppercase tracking-wide'>
            {phase.subtitle}
          </span>
        </div>
        <h3 className='font-bold text-foreground text-lg transition-colors group-hover/card:text-primary sm:text-xl'>
          {phase.title}
        </h3>
        <p className='text-muted-foreground text-sm leading-relaxed'>{phase.description}</p>
        <div className='flex flex-wrap gap-1.5 pt-2'>
          {phase.techs.map((t) => (
            <Badge
              className='bg-muted/60 px-2 py-0.5 font-medium text-[10px] text-muted-foreground group-hover/card:bg-muted'
              key={t}
              variant='secondary'
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default async function TrainingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactNode> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "trainingPage" });

  const { data } = await getTrainingPageData();
  const latestProjects = (data?.payload as any)?.latestProjects ?? [];
  const trainingFormUrl = (data?.payload as any)?.trainingFormUrl ?? null;

  const phases: PhaseType[] = [
    {
      id: 1,
      title: t("phases.phase1.title"),
      subtitle: t("phases.phase1.subtitle"),
      description: t("phases.phase1.description"),
      techs: ["C / C++", "Tư duy thuật toán", "Git cơ bản"],
      icon: Code2
    },
    {
      id: 2,
      title: t("phases.phase2.title"),
      subtitle: t("phases.phase2.subtitle"),
      description: t("phases.phase2.description"),
      techs: ["HTML5 / CSS3 / JS", "React / Next.js", "Responsive Design"],
      icon: Globe2
    },
    {
      id: 3,
      title: t("phases.phase3.title"),
      subtitle: t("phases.phase3.subtitle"),
      description: t("phases.phase3.description"),
      techs: ["OOP Concepts", "Java / C#", "Design Patterns"],
      icon: Layers
    },
    {
      id: 4,
      title: t("phases.phase4.title"),
      subtitle: t("phases.phase4.subtitle"),
      description: t("phases.phase4.description"),
      techs: ["RESTful API", "DevOps / Docker", "Teamwork / Agile"],
      icon: Rocket
    }
  ];

  const pillars = [
    {
      id: "peer",
      title: t("pillars.peer.title"),
      description: t("pillars.peer.description"),
      icon: Users,
      image: "/images/training/methodology-peer.jpg"
    },
    {
      id: "project",
      title: t("pillars.project.title"),
      description: t("pillars.project.description"),
      icon: Laptop,
      image: "/images/training/methodology-project.jpg"
    },
    {
      id: "seminar",
      title: t("pillars.seminar.title"),
      description: t("pillars.seminar.description"),
      icon: Calendar,
      image: "/images/training/methodology-seminar.jpg"
    }
  ];

  return (
    <div className='min-h-screen bg-background pb-20'>
      <PageHero
        badge={t("hero.badge")}
        codeTitle='curriculum.ts'
        description={t("hero.description")}
        imageUrl='/images/bg/training.jpg'
        title={t("hero.title")}
      />

      <div className='container mx-auto mt-20 max-w-7xl space-y-28 px-4'>
        {/* ── SECTION 1: LEARNING ROADMAP (TIMELINE) ────────────────── */}
        <section className='space-y-16'>
          <div className='text-center'>
            <ScrollReveal>
              <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm'>
                &gt; curriculum
              </span>
              <h2 className='mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl'>
                {t("roadmapTitle")}
              </h2>
              <p className='mx-auto mt-3 max-w-2xl text-muted-foreground text-sm sm:text-base'>{t("roadmapDesc")}</p>
            </ScrollReveal>
          </div>

          {/* Desktop Timeline */}
          <div className='relative mx-auto hidden max-w-3xl md:block'>
            {/* Vertical Connecting Line */}
            <div className='absolute top-6 left-1/2 -ml-[1px] h-[calc(100%-48px)] w-[2px] bg-border' />

            <div className='space-y-12'>
              {phases.map((phase, index) => {
                const Icon = phase.icon;
                const isEven = index % 2 === 0;

                return (
                  <ScrollReveal delay={index * 100} key={phase.id} variant={isEven ? "fade-right" : "fade-left"}>
                    <div className='group relative flex items-center justify-between'>
                      {/* Left Side */}
                      <div className='w-5/12 text-right'>
                        {isEven ? <PhaseCard phase={phase} /> : <div className='pointer-events-none invisible' />}
                      </div>

                      {/* Center Node */}
                      <div className='z-10 flex w-2/12 justify-center'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-full border-4 border-background bg-slate-100 transition-all duration-300 group-hover:border-primary/20 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/10 dark:bg-[#0b1324]'>
                          <Icon className='h-5 w-5 text-muted-foreground group-hover:text-primary-foreground' />
                        </div>
                      </div>

                      {/* Right Side */}
                      <div className='w-5/12 text-left'>
                        {isEven ? <div className='pointer-events-none invisible' /> : <PhaseCard phase={phase} />}
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className='relative mx-auto max-w-lg space-y-8 pl-8 md:hidden'>
            {/* Line on left */}
            <div className='absolute top-4 left-[15px] h-[calc(100%-32px)] w-[2px] bg-border' />

            {phases.map((phase, index) => {
              const Icon = phase.icon;
              return (
                <ScrollReveal delay={index * 100} key={phase.id} variant='fade-up'>
                  <div className='group relative'>
                    {/* Node indicator */}
                    <div className='absolute top-1 -left-[31px] z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-slate-100 group-hover:bg-primary group-hover:shadow-md dark:bg-[#0b1324]'>
                      <Icon className='h-4 w-4 text-muted-foreground group-hover:text-primary-foreground' />
                    </div>
                    <PhaseCard phase={phase} />
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 2: METHODOLOGY PILLARS ──────────────────────── */}
        <section className='space-y-12'>
          <div className='text-center'>
            <ScrollReveal>
              <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm'>
                &gt; methodology
              </span>
              <h2 className='mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl'>
                {t("methodologyTitle")}
              </h2>
              <p className='mx-auto mt-3 max-w-2xl text-muted-foreground text-sm sm:text-base'>
                {t("methodologyDesc")}
              </p>
            </ScrollReveal>
          </div>

          <div className='grid gap-6 md:grid-cols-3'>
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <ScrollReveal delay={idx * 100} key={pillar.id} variant='fade-up'>
                  <div className='group relative flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5'>
                    <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

                    <div className='relative z-10 space-y-4'>
                      <div className='relative flex aspect-video w-full select-none items-center justify-center overflow-hidden rounded-xl border border-border bg-slate-150 dark:bg-slate-900'>
                        <TrainingImage
                          alt={pillar.title}
                          className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                          fallback={
                            <div className='p-3 text-center font-mono text-[10px] text-muted-foreground'>
                              [Ảnh: {pillar.title}]
                            </div>
                          }
                          src={pillar.image}
                        />
                        {/* Floating Icon badge */}
                        <div className='absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/90 text-orange-500 shadow-sm backdrop-blur-xs'>
                          <Icon className='h-4 w-4' />
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <h3 className='font-bold text-foreground text-lg transition-colors group-hover:text-primary'>
                          {pillar.title}
                        </h3>
                        <p className='text-muted-foreground text-xs leading-relaxed'>{pillar.description}</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 3: FEATURED PROJECTS ────────────────────────── */}
        <FeaturedProjectsClient projects={latestProjects} />

        {/* ── SECTION 4: MENTORS & ADVISORS ───────────────────────── */}
        <section className='space-y-12'>
          <div className='text-center'>
            <ScrollReveal>
              <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm'>
                &gt; mentors
              </span>
              <h2 className='mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl'>
                {t("mentorsTitle")}
              </h2>
              <p className='mx-auto mt-3 max-w-2xl text-muted-foreground text-sm sm:text-base'>{t("mentorsDesc")}</p>
            </ScrollReveal>
          </div>

          <div className='group relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-card p-8 text-center transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5 sm:p-12'>
            {/* Hover Gradient Accent */}
            <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

            <div className='relative z-10 mx-auto flex max-w-md flex-col items-center justify-center space-y-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 transition-colors group-hover:bg-orange-500/20'>
                <Sparkles className='h-6 w-6 animate-pulse' />
              </div>
              <h3 className='font-bold text-foreground text-xl transition-colors group-hover:text-primary'>
                {t("mentorsPlaceholderTitle")}
              </h3>
              <p className='text-muted-foreground text-sm leading-relaxed'>{t("mentorsPlaceholderDesc")}</p>
            </div>
          </div>
        </section>

        {/* ── SECTION 5: LEARNING RESOURCES ───────────────────────── */}
        <section className='hidden space-y-12'>
          <div className='text-center'>
            <ScrollReveal>
              <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm'>
                &gt; resources
              </span>
              <h2 className='mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl'>
                {t("resourcesTitle")}
              </h2>
            </ScrollReveal>
          </div>

          <div className='group relative mx-auto flex max-w-4xl flex-col gap-8 overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5 md:flex-row'>
            {/* Hover Gradient Accent */}
            <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

            {/* Left Column: Visual Browser Mockup Placeholder */}
            <div className='relative z-10 flex min-h-[160px] select-none flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-slate-100 transition-colors group-hover:border-orange-500/20 md:w-1/3 dark:bg-slate-900/40'>
              {/* Browser bar top */}
              <div className='absolute inset-x-0 top-0 flex h-6 items-center gap-1.5 border-border border-b bg-slate-200 px-3 dark:bg-slate-950'>
                <div className='h-1.5 w-1.5 rounded-full bg-red-400/80' />
                <div className='h-1.5 w-1.5 rounded-full bg-yellow-400/80' />
                <div className='h-1.5 w-1.5 rounded-full bg-green-400/80' />
                <div className='ml-2 select-none truncate font-mono text-[8px] text-muted-foreground'>
                  docs.mpclub.org
                </div>
              </div>

              <TrainingImage
                alt='Docs Screenshot'
                className='absolute inset-x-0 top-6 bottom-0 h-[calc(100%-24px)] w-full object-cover transition-transform duration-500 group-hover:scale-102'
                fallback={
                  /* Center fallback container */
                  <div className='absolute inset-x-0 top-6 bottom-0 flex flex-col items-center justify-center p-4 text-center'>
                    <div className='mb-2 select-none font-mono text-[9px] text-muted-foreground'>
                      [Screenshot: docs.mpclub.org]
                    </div>
                    <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500'>
                      <FileText className='h-4 w-4' />
                    </div>
                  </div>
                }
                src='/images/training/docs-screenshot.png'
              />
            </div>

            {/* Right Column: Descriptions & Action */}
            <div className='relative z-10 flex flex-col justify-between py-2 text-center md:w-2/3 md:text-left'>
              <div className='space-y-4'>
                <h3 className='flex items-center justify-center gap-2 font-black text-2xl text-foreground tracking-tight transition-colors group-hover:text-primary md:justify-start'>
                  {t("resourcesCardTitle")}
                </h3>
                <p className='text-muted-foreground text-sm leading-relaxed sm:text-base'>{t("resourcesCardDesc")}</p>
              </div>
              <div className='pt-6'>
                <Button
                  asChild
                  className='h-12 w-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-8 font-semibold transition-all hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-500/10 active:scale-[0.98] sm:w-auto'
                >
                  <a
                    className='flex items-center justify-center gap-2'
                    href='https://docs.mpclub.org'
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {t("resourcesBtn")}
                    <ArrowUpRight className='h-4 w-4' />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 6: CALL TO ACTION (CTA) ─────────────────────── */}
        <section className='relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-card p-8 sm:p-12'>
          {/* Subtle Glow overlay */}
          <div className='at 50% 50%, rgba(249,115,22,0.05), transparent 60%) pointer-events-none absolute inset-0 bg-radial-gradient(circle' />

          <div className='relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row'>
            {/* Left Column: Content */}
            <div className='max-w-lg space-y-4 text-center md:text-left'>
              <Badge
                className='border-orange-500/20 bg-orange-500/5 px-3 py-1 font-semibold text-orange-500 text-xs uppercase tracking-wider'
                variant='outline'
              >
                {t("ctaTitle")}
              </Badge>
              <h2 className='font-black text-3xl text-foreground leading-tight tracking-tight'>{t("ctaHeading")}</h2>
              <p className='text-muted-foreground text-sm leading-relaxed'>{t("ctaDesc")}</p>
            </div>

            {/* Right Column: CTA buttons */}
            <div className='flex w-full shrink-0 flex-col items-center gap-4 md:w-auto md:items-end'>
              <div className='flex w-full flex-col items-center justify-end gap-3 sm:flex-row'>
                {trainingFormUrl ? (
                  <>
                    <Button
                      asChild
                      className='h-12 w-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-8 font-semibold transition-all hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-500/10 active:scale-[0.98] sm:w-auto'
                    >
                      <a
                        className='flex items-center justify-center gap-2'
                        href={trainingFormUrl}
                        rel='noopener noreferrer'
                        target='_blank'
                      >
                        {t("ctaRegNow")}
                        <ArrowUpRight className='h-4 w-4' />
                      </a>
                    </Button>
                    <Button
                      asChild
                      className='h-12 w-full rounded-full border-slate-300 px-8 font-semibold text-slate-800 hover:bg-slate-100 sm:w-auto dark:border-white/10 dark:text-slate-200 dark:hover:bg-slate-800'
                      variant='outline'
                    >
                      <a href={`mailto:${ABOUT_CLUB.contact.email}`}>
                        <Mail className='mr-2 h-4 w-4' />
                        {t("ctaContactEmail")}
                      </a>
                    </Button>
                  </>
                ) : (
                  <div className='flex w-full flex-col items-center gap-3 md:items-end'>
                    <p className='max-w-[280px] text-center text-[11px] text-muted-foreground italic md:text-right'>
                      {t("ctaClosedMsg")}
                    </p>
                    <Button
                      asChild
                      className='h-12 w-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-8 font-semibold transition-all hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-500/10 active:scale-[0.98] sm:w-auto'
                    >
                      <a className='flex items-center justify-center gap-2' href={`mailto:${ABOUT_CLUB.contact.email}`}>
                        <Mail className='h-4 w-4' />
                        {t("ctaContactEmailBtn")}
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
