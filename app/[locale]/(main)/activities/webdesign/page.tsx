"use client";

import {
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Github,
  Globe,
  Layout,
  Lightbulb,
  PenTool,
  Trophy,
  Users
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import wdData from "@/configs/data/wd.json";
import { Link } from "@/configs/i18n/routing";
import { GalleryCarousel } from "../../gallery-carousel.client";
import { WebDesignHeroClient } from "./hero.client";

const ITEMS_PER_PAGE = 6;

export default function WebDesignPage() {
  const t = useTranslations("webdesign");

  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = wdData.teams.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTeams = wdData.teams.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className='min-h-screen bg-background pb-20'>
      <WebDesignHeroClient subtitle={t("subtitle")} title={t("title")} />

      <div className='container mx-auto max-w-6xl px-4'>
        {/* Intro Section */}
        <section className='mb-24'>
          <ScrollReveal className='mb-12 text-center'>
            <Badge
              className='mb-4 border-primary/20 bg-primary/10 px-3 py-1 font-bold text-primary uppercase tracking-widest'
              variant='outline'
            >
              {t("tag")}
            </Badge>
            <h2 className='mt-2 font-bold text-3xl text-foreground'>{t("heading")}</h2>
          </ScrollReveal>

          <ScrollReveal delay={100} variant='zoom-in'>
            <Card className='flex flex-col gap-0 overflow-hidden border-border/50 shadow-sm md:flex-row'>
              <div className='relative aspect-video w-full md:w-1/2'>
                <Image
                  alt='Web Design'
                  className='absolute inset-0 h-full w-full object-cover'
                  fill
                  priority
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw'
                  src='/images/wd_logo.jpg'
                />
              </div>
              <div className='flex w-full flex-col justify-center bg-card p-8 md:w-1/2 md:p-12'>
                <h3 className='mb-6 font-bold text-2xl text-primary'>{t("purpose")}</h3>
                <p className='text-muted-foreground leading-relaxed'>{t("purposeDesc")}</p>
              </div>
            </Card>
          </ScrollReveal>
        </section>

        {/* Rules (Thể thức) */}
        <section className='mb-24'>
          <ScrollReveal className='mb-16 text-center'>
            <h2 className='relative inline-block font-bold text-3xl text-foreground'>
              {t("rulesTitle")}
              <div className='absolute -bottom-4 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-primary' />
            </h2>
          </ScrollReveal>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {[
              { icon: Users, title: "rules1", desc: "rules1Desc" },
              { icon: PenTool, title: "rules2", desc: "rules2Desc" },
              { icon: Globe, title: "rules3", desc: "rules3Desc" }
            ].map((item, idx) => (
              <ScrollReveal delay={idx * 100} key={idx} variant='fade-up'>
                <Card
                  className='group relative overflow-hidden border-border/50 text-center shadow-sm transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground'
                  key={idx}
                >
                  <CardContent className='relative z-10 pt-10 pb-8'>
                    <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-white/20 group-hover:text-primary-foreground'>
                      <item.icon className='h-8 w-8' />
                    </div>
                    <h3 className='mb-3 font-bold text-lg'>{t(item.title as any)}</h3>
                    <p className='text-muted-foreground text-sm transition-colors group-hover:text-primary-foreground/90'>
                      {t(item.desc as any)}
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Timeline (Giai đoạn diễn ra) */}
        <section className='mb-24'>
          <ScrollReveal className='mb-16 text-center'>
            <h2 className='relative inline-block font-bold text-3xl text-foreground'>
              {t("timelineTitle")}
              <div className='absolute -bottom-4 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-primary' />
            </h2>
          </ScrollReveal>
          <div className='mx-auto max-w-2xl space-y-6 sm:pl-8'>
            {[1, 2, 3, 4].map((phase, idx) => (
              <div className='group flex items-start gap-6' key={idx}>
                {/* Timeline Line & Dot */}
                <div className='mt-5 flex hidden shrink-0 flex-col items-center sm:flex'>
                  <div className='z-10 h-4 w-4 rounded-full bg-muted-foreground/30 transition-all group-hover:bg-primary group-hover:ring-4 group-hover:ring-primary/20' />
                  {idx !== 3 && (
                    <div className='mt-2 h-full min-h-24 w-0.5 bg-border transition-colors group-hover:bg-primary/30' />
                  )}
                </div>

                {/* Content Card */}
                <Card className='grow border-border/50 shadow-sm transition-all group-hover:border-primary group-hover:bg-primary/5'>
                  <CardContent className='p-6'>
                    <Badge
                      className='mb-3 transition-colors group-hover:bg-primary group-hover:text-primary-foreground'
                      variant='outline'
                    >
                      {t(`phase${phase}Title` as any)}
                    </Badge>
                    <h3 className='mb-2 font-bold text-foreground text-xl transition-colors group-hover:text-primary'>
                      {t(`phase${phase}` as any)}
                    </h3>
                    <p className='text-muted-foreground text-sm transition-colors group-hover:text-foreground/80'>
                      {t(`phase${phase}Desc` as any)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Criteria (Tiêu chí) */}
        <section className='mb-24'>
          <ScrollReveal className='mb-16 text-center'>
            <h2 className='relative inline-block font-bold text-3xl text-foreground'>
              {t("criteriaTitle")}
              <div className='absolute -bottom-4 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-primary' />
            </h2>
          </ScrollReveal>
          <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
            {[
              { icon: Layout, title: "criteria1", desc: "criteria1Desc" },
              { icon: CalendarDays, title: "criteria2", desc: "criteria2Desc" },
              { icon: Lightbulb, title: "criteria3", desc: "criteria3Desc" },
              { icon: CheckSquare, title: "criteria4", desc: "criteria4Desc" }
            ].map((item, idx) => (
              <Card
                className='group border-border/50 pt-8 pb-6 text-center shadow-sm transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground'
                key={idx}
              >
                <item.icon className='mx-auto mb-4 h-8 w-8 text-primary transition-colors group-hover:text-primary-foreground' />
                <h3 className='mb-2 font-bold'>{t(item.title as any)}</h3>
                <p className='px-2 text-muted-foreground text-xs transition-colors group-hover:text-primary-foreground/90'>
                  {t(item.desc as any)}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Exhibition Gallery (Triển lãm dự án) */}
        <section className='mb-24'>
          <ScrollReveal className='mb-16 text-center'>
            <h2 className='relative inline-block font-bold text-3xl text-foreground'>
              {t("exhibitionTitle", { fallback: "Các dự án tiêu biểu" })}
              <div className='absolute -bottom-4 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-primary' />
            </h2>
          </ScrollReveal>

          <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {currentTeams.map((team, idx) => (
              <Card
                className='group flex flex-col overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg'
                key={`${team.teamName}-${idx}`}
              >
                <div className='relative aspect-[16/10] w-full overflow-hidden bg-muted'>
                  <img
                    alt={team.projectName}
                    className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                    src={team.thumbnail}
                  />
                  <div className='absolute inset-0 flex items-center justify-center gap-4 bg-background/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                    <Button
                      asChild
                      className='rounded-full shadow-xl transition-transform hover:scale-110'
                      size='icon'
                      variant='secondary'
                    >
                      <a href={team.live} rel='noopener noreferrer' target='_blank'>
                        <Globe className='h-5 w-5' />
                        <span className='sr-only'>Live Demo</span>
                      </a>
                    </Button>
                    <Button
                      asChild
                      className='rounded-full shadow-xl transition-transform hover:scale-110'
                      size='icon'
                      variant='secondary'
                    >
                      <a href={team.github} rel='noopener noreferrer' target='_blank'>
                        <Github className='h-5 w-5' />
                        <span className='sr-only'>GitHub</span>
                      </a>
                    </Button>
                  </div>
                </div>

                <CardHeader className='border-border/10 border-b pb-3'>
                  <div className='mb-2 flex items-center justify-between'>
                    <Badge className='font-semibold text-xs' variant='secondary'>
                      {team.teamName}
                    </Badge>
                    <span className='ml-2 truncate text-muted-foreground text-xs'>{team.subjects}</span>
                  </div>
                  <CardTitle className='line-clamp-2 text-lg transition-colors group-hover:text-primary'>
                    {team.projectName}
                  </CardTitle>
                </CardHeader>

                <CardContent className='flex flex-grow flex-col justify-between pt-4'>
                  <p className='mb-6 line-clamp-3 text-muted-foreground text-sm leading-relaxed'>{team.description}</p>

                  <div className='mt-auto flex flex-wrap gap-2'>
                    {team.techStack.map((tech) => (
                      <Badge className='bg-muted/30 text-xs' key={tech} variant='outline'>
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className='mt-12 flex items-center justify-center gap-2'>
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                size='icon'
                variant='outline'
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>

              <div className='flex gap-2'>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <Button
                    className='h-10 w-10'
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    variant={currentPage === idx + 1 ? "default" : "outline"}
                  >
                    {idx + 1}
                  </Button>
                ))}
              </div>

              <Button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                size='icon'
                variant='outline'
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          )}
        </section>

        {/* Gallery */}
        <section className='mb-24'>
          <ScrollReveal className='mb-16 text-center'>
            <h2 className='relative inline-block font-bold text-3xl text-foreground'>
              {t("galleryTitle")}
              <div className='absolute -bottom-4 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-primary' />
            </h2>
          </ScrollReveal>
          <div className='mx-auto max-w-6xl'>
            <GalleryCarousel
              images={(wdData.images || []).map((src, idx) => ({
                id: `wd-gallery-${idx}`,
                url: src,
                caption: null,
                order: idx
              }))}
            />
          </div>
        </section>

        {/* Prizes */}
        <section className='mb-32'>
          <ScrollReveal className='mb-16 text-center'>
            <h2 className='relative inline-block font-bold text-3xl text-foreground'>
              {t("prizesTitle")}
              <div className='absolute -bottom-4 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-primary' />
            </h2>
          </ScrollReveal>
          <div className='mx-auto flex max-w-5xl flex-col items-stretch justify-center gap-6 md:flex-row'>
            <Card className='group flex flex-1 flex-col items-center border-border/50 px-4 pt-8 pb-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:bg-primary hover:text-primary-foreground'>
              <Trophy className='mb-4 h-12 w-12 text-zinc-400 transition-colors group-hover:text-primary-foreground' />
              <div className='font-bold text-xl'>{t("prize2")}</div>
              <div className='text-sm'>
                {t.rich("prize2Desc", {
                  b: (chunks) => <b>{chunks}</b>
                })}
              </div>
            </Card>

            <Card className='group flex flex-1 flex-col items-center border-border/50 px-4 pt-10 pb-8 text-center shadow-md transition-all duration-300 hover:-translate-y-8 hover:border-primary hover:bg-primary hover:text-primary-foreground md:-translate-y-6'>
              <Trophy className='mb-4 h-16 w-16 text-yellow-500 transition-colors group-hover:text-primary-foreground' />
              <div className='font-bold text-2xl uppercase tracking-wider'>{t("prize1")}</div>
              <div className='text-sm'>
                {t.rich("prize1Desc", {
                  b: (chunks) => <b>{chunks}</b>
                })}
              </div>
            </Card>

            <Card className='group flex flex-1 flex-col items-center border-border/50 px-4 pt-8 pb-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:bg-primary hover:text-primary-foreground'>
              <Trophy className='mb-4 h-12 w-12 text-amber-600 transition-colors group-hover:text-primary-foreground' />
              <div className='font-bold text-xl'>{t("prize3")}</div>
              <div className='text-sm'>
                {t.rich("prize3Desc", {
                  b: (chunks) => <b>{chunks}</b>
                })}
              </div>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className='mb-20'>
          <Card className='relative overflow-hidden border-border/50 bg-card text-center shadow-sm'>
            <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent' />
            <CardContent className='relative z-10 flex flex-col items-center p-12 md:p-16'>
              <Badge className='mb-4 uppercase tracking-widest' variant='outline'>
                {t("joinTitle")}
              </Badge>
              <h2 className='mb-6 font-bold text-3xl text-foreground'>{t("joinHeading")}</h2>
              <p className='mx-auto mb-10 max-w-2xl text-lg text-muted-foreground'>{t("joinDesc")}</p>
              {/* <Button
                asChild
                size="lg"
                className="h-14 px-8 text-base shadow-lg group"
              >
                <a
                  href="https://wdmpc.is-not-a.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("learnMoreBtn")}
                  <ExternalLink className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button> */}
              <Button asChild className='group h-14 px-8 text-base shadow-lg' size='lg'>
                <a
                  href='https://www.facebook.com/CLBLapTrinhTrenThietBiDiDong?locale=vi_VN'
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  {t("followUpBtn")}
                  <ExternalLink className='ml-2 h-5 w-5 transition-transform group-hover:translate-x-1' />
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
