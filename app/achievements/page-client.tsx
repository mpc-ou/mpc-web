"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, Award, Users } from "lucide-react";
import { HeroSection } from "@/components/hero-section";
import { motion } from "framer-motion";
import { PAGES, ACHIEVEMENTS } from "@/lib/constants";
import { LAYOUT_CONFIG } from "@/lib/config";

export default function AchievementsPageClient() {
  const pastPresidents = [
    {
      name: "Nguyễn Văn A",
      period: "2022-2023",
      image: null,
    },
    {
      name: "Trần Thị B",
      period: "2021-2022",
      image: null,
    },
    {
      name: "Lê Văn C",
      period: "2020-2021",
      image: null,
    },
  ];

  const collectiveAwards = [
    {
      title: "Giải nhất Cuộc thi Hackathon 2023",
      description: "CLB đạt giải nhất trong cuộc thi Hackathon cấp trường",
      year: "2023",
    },
    {
      title: "CLB xuất sắc nhất năm",
      description: "Vinh danh CLB xuất sắc nhất trong hoạt động cộng đồng",
      year: "2022",
    },
  ];

  const individualAwards = [
    {
      name: "Thành viên A",
      award: "Giải nhất Web Design Competition",
      event: "Cuộc thi Web Design 2024",
    },
    {
      name: "Thành viên B",
      award: "Giải nhì App Development",
      event: "Cuộc thi App Development 2023",
    },
    {
      name: "Thành viên C",
      award: "Giải ba AI Challenge",
      event: "Cuộc thi AI Challenge 2023",
    },
  ];

  return (
    <>
      <HeroSection
        title={PAGES.achievements.title}
        subtitle={PAGES.achievements.subtitle}
        image={PAGES.achievements.heroImage}
      />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-primary)]">
            {PAGES.achievements.title}
          </h1>
          <p className="text-xl text-[var(--text-secondary)]">
            {PAGES.achievements.description}
          </p>
        </div>

        {/* Past Presidents */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Users className="h-8 w-8 text-[var(--primary)]" />
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              {ACHIEVEMENTS.presidents.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pastPresidents.map((president, idx) => (
              <Card key={idx} className="text-center">
                <CardHeader>
                  <div className="w-32 h-32 rounded-full bg-[var(--muted)] mx-auto mb-4" />
                  <CardTitle>{president.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Nhiệm kỳ: {president.period}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Collective Awards */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="h-8 w-8 text-[var(--warning)]" />
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              {ACHIEVEMENTS.collective.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collectiveAwards.map((award, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Trophy className="h-6 w-6 text-[var(--warning)]" />
                    <span className="text-sm text-[var(--text-secondary)]">
                      {award.year}
                    </span>
                  </div>
                  <CardTitle>{award.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{award.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Individual Awards */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Award className="h-8 w-8 text-[var(--accent)]" />
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              {ACHIEVEMENTS.individual.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {individualAwards.map((award, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{award.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-[var(--accent)]" />
                      <span className="font-semibold">{award.award}</span>
                    </div>
                    <CardDescription>{award.event}</CardDescription>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

