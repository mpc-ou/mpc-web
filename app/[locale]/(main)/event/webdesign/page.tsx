"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/configs/i18n/routing";
import {
  Users,
  Globe,
  PenTool,
  Layout,
  Lightbulb,
  CheckSquare,
  Trophy,
  CalendarDays,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WebDesignHeroClient } from "./hero.client";
import { GalleryCarousel } from "../../gallery-carousel.client";
import wdData from "@/configs/data/wd.json";
import Image from "next/image";

const ITEMS_PER_PAGE = 6;

export default function WebDesignPage() {
  const t = useTranslations("webdesign");

  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = wdData.teams.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTeams = wdData.teams.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <div className="min-h-screen pb-20 bg-background">
      <WebDesignHeroClient title={t("title")} subtitle={t("subtitle")} />

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Intro Section */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="mb-4 text-primary bg-primary/10 border-primary/20 px-3 py-1 uppercase font-bold tracking-widest"
            >
              {t("tag")}
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mt-2">
              {t("heading")}
            </h2>
          </div>

          <Card className="flex flex-col md:flex-row gap-0 overflow-hidden border-border/50 shadow-sm">
            <div className="w-full md:w-1/2 aspect-video relative">
              <Image
                src="/images/wd_logo.jpg"
                alt="Web Design"
                className="absolute inset-0 w-full h-full object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
                priority
              />
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-card">
              <h3 className="text-2xl font-bold text-primary mb-6">
                {t("purpose")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t("purposeDesc")}
              </p>
            </div>
          </Card>
        </section>

        {/* Rules (Thể thức) */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground relative inline-block">
              {t("rulesTitle")}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-primary rounded-full"></div>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "rules1", desc: "rules1Desc" },
              { icon: PenTool, title: "rules2", desc: "rules2Desc" },
              { icon: Globe, title: "rules3", desc: "rules3Desc" },
            ].map((item, idx) => (
              <Card
                key={idx}
                className="border-border/50 text-center transition-colors shadow-sm relative overflow-hidden group hover:bg-primary hover:text-primary-foreground hover:border-primary"
              >
                <CardContent className="pt-10 pb-8 relative z-10">
                  <div className="mx-auto w-16 h-16 bg-primary/10 group-hover:bg-white/20 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:text-primary-foreground transition-colors">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold mb-3">
                    {t(item.title as any)}
                  </h3>
                  <p className="text-sm text-muted-foreground group-hover:text-primary-foreground/90 transition-colors">
                    {t(item.desc as any)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Timeline (Giai đoạn diễn ra) */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground relative inline-block">
              {t("timelineTitle")}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-primary rounded-full"></div>
            </h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-6 sm:pl-8">
            {[1, 2, 3, 4].map((phase, idx) => (
              <div key={idx} className="flex gap-6 items-start group">
                {/* Timeline Line & Dot */}
                <div className="flex flex-col items-center mt-5 shrink-0 hidden sm:flex">
                  <div className="w-4 h-4 rounded-full bg-muted-foreground/30 group-hover:bg-primary group-hover:ring-4 group-hover:ring-primary/20 transition-all z-10"></div>
                  {idx !== 3 && (
                    <div className="w-0.5 h-full min-h-24 bg-border group-hover:bg-primary/30 transition-colors mt-2"></div>
                  )}
                </div>

                {/* Content Card */}
                <Card className="grow border-border/50 shadow-sm transition-all group-hover:border-primary group-hover:bg-primary/5">
                  <CardContent className="p-6">
                    <Badge
                      variant="outline"
                      className="mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      {t(`phase${phase}Title` as any)}
                    </Badge>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {t(`phase${phase}` as any)}
                    </h3>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                      {t(`phase${phase}Desc` as any)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Criteria (Tiêu chí) */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground relative inline-block">
              {t("criteriaTitle")}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-primary rounded-full"></div>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Layout, title: "criteria1", desc: "criteria1Desc" },
              { icon: CalendarDays, title: "criteria2", desc: "criteria2Desc" },
              { icon: Lightbulb, title: "criteria3", desc: "criteria3Desc" },
              { icon: CheckSquare, title: "criteria4", desc: "criteria4Desc" },
            ].map((item, idx) => (
              <Card
                key={idx}
                className="border-border/50 shadow-sm text-center pt-8 pb-6 transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary group"
              >
                <item.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground mx-auto mb-4 transition-colors" />
                <h3 className="font-bold mb-2">{t(item.title as any)}</h3>
                <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/90 px-2 transition-colors">
                  {t(item.desc as any)}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Exhibition Gallery (Triển lãm dự án) */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground relative inline-block">
              {t("exhibitionTitle", { fallback: "Các dự án tiêu biểu" })}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-primary rounded-full"></div>
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {currentTeams.map((team, idx) => (
              <Card
                key={`${team.teamName}-${idx}`}
                className="group flex flex-col overflow-hidden border-border/50 bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <img
                    src={team.thumbnail}
                    alt={team.projectName}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <Button
                      asChild
                      size="icon"
                      variant="secondary"
                      className="rounded-full shadow-xl hover:scale-110 transition-transform"
                    >
                      <a
                        href={team.live}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-5 w-5" />
                        <span className="sr-only">Live Demo</span>
                      </a>
                    </Button>
                    <Button
                      asChild
                      size="icon"
                      variant="secondary"
                      className="rounded-full shadow-xl hover:scale-110 transition-transform"
                    >
                      <a
                        href={team.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-5 w-5" />
                        <span className="sr-only">GitHub</span>
                      </a>
                    </Button>
                  </div>
                </div>

                <CardHeader className="pb-3 border-b border-border/10">
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant="secondary"
                      className="font-semibold text-xs"
                    >
                      {team.teamName}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate ml-2">
                      {team.subjects}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
                    {team.projectName}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-4 flex-grow flex flex-col justify-between">
                  <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mb-6">
                    {team.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {team.techStack.map((tech) => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="text-xs bg-muted/30"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <Button
                    key={idx}
                    variant={currentPage === idx + 1 ? "default" : "outline"}
                    onClick={() => setCurrentPage(idx + 1)}
                    className="w-10 h-10"
                  >
                    {idx + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </section>

        {/* Gallery */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground relative inline-block">
              {t("galleryTitle")}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-primary rounded-full"></div>
            </h2>
          </div>
          <div className="max-w-6xl mx-auto">
            <GalleryCarousel
              images={(wdData.images || []).map((src, idx) => ({
                id: `wd-gallery-${idx}`,
                url: src,
                caption: null,
                order: idx,
              }))}
            />
          </div>
        </section>

        {/* Prizes */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground relative inline-block">
              {t("prizesTitle")}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-primary rounded-full"></div>
            </h2>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 max-w-5xl mx-auto">
            <Card className="flex-1 border-border/50 shadow-sm text-center pt-8 pb-6 px-4 flex flex-col items-center group hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:-translate-y-2">
              <Trophy className="w-12 h-12 text-zinc-400 group-hover:text-primary-foreground mb-4 transition-colors" />
              <div className="font-bold text-xl">{t("prize2")}</div>
              <div className="text-sm">
                {t.rich("prize2Desc", {
                  b: (chunks) => <b>{chunks}</b>,
                })}
              </div>
            </Card>

            <Card className="flex-1 border-border/50 shadow-md text-center pt-10 pb-8 px-4 flex flex-col items-center group hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 md:-translate-y-6 hover:-translate-y-8">
              <Trophy className="w-16 h-16 text-yellow-500 group-hover:text-primary-foreground mb-4 transition-colors" />
              <div className="font-bold text-2xl uppercase tracking-wider">
                {t("prize1")}
              </div>
              <div className="text-sm">
                {t.rich("prize1Desc", {
                  b: (chunks) => <b>{chunks}</b>,
                })}
              </div>
            </Card>

            <Card className="flex-1 border-border/50 shadow-sm text-center pt-8 pb-6 px-4 flex flex-col items-center group hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:-translate-y-2">
              <Trophy className="w-12 h-12 text-amber-600 group-hover:text-primary-foreground mb-4 transition-colors" />
              <div className="font-bold text-xl">{t("prize3")}</div>
              <div className="text-sm">
                {t.rich("prize3Desc", {
                  b: (chunks) => <b>{chunks}</b>,
                })}
              </div>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mb-20">
          <Card className="border-border/50 bg-card overflow-hidden text-center relative shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"></div>
            <CardContent className="p-12 md:p-16 relative z-10 flex flex-col items-center">
              <Badge
                variant="outline"
                className="mb-4 uppercase tracking-widest"
              >
                {t("joinTitle")}
              </Badge>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                {t("joinHeading")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-lg">
                {t("joinDesc")}
              </p>
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
              <Button
                asChild
                size="lg"
                className="h-14 px-8 text-base shadow-lg group"
              >
                <a
                  href="https://www.facebook.com/CLBLapTrinhTrenThietBiDiDong?locale=vi_VN"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("followUpBtn")}
                  <ExternalLink className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
