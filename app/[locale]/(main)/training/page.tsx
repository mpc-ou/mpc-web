import { BookOpen, Code2, Globe2, Layers, Rocket } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getTrainingPageData } from "@/app/[locale]/actions";
import { FeaturedProjectsClient } from "./featured-projects.client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: `Đào tạo | ${t("metadata.siteName")}`,
    description:
      "Hướng dẫn cơ bản, nhập môn lập trình, ôn tập các kiến thức liên quan đến ngành trong suốt quá trình học tập",
  };
}

const PHASES = [
  {
    id: 1,
    title: "KĨ THUẬT LẬP TRÌNH",
    subtitle: "Kì 1-2",
    description:
      "Ôn tập kiến thức cơ bản, hướng dẫn cách giải quyết vấn đề, cấu trúc dữ liệu và giải thuật",
    icon: Code2,
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "LẬP TRÌNH WEB",
    subtitle: "Kì 3",
    description:
      "Ôn tập, đào tạo các kiến thức liên quan đến lập trình web, xây dựng website cơ bản đến nâng cao",
    icon: Globe2,
    color: "bg-green-500",
  },
  {
    id: 3,
    title: "LẬP TRÌNH OOP",
    subtitle: "Kì 4",
    description:
      "Ôn tập, đào tạo các kiến thức liên quan đến lập trình hướng đối tượng, các tính chất và ứng dụng",
    icon: Layers,
    color: "bg-purple-500",
  },
  {
    id: 4,
    title: "ỨNG DỤNG, DỰ ÁN",
    subtitle: "Kì 5",
    description:
      "Thực hành, xây dựng ứng dụng, dự án thực tế, hướng dẫn cách làm việc nhóm, quản lý dự án",
    icon: Rocket,
    color: "bg-orange-500",
  },
];

export default async function TrainingPage() {
  const { data } = await getTrainingPageData();
  const latestProjects = (data?.payload as any)?.latestProjects ?? [];

  return (
    <div className="min-h-screen bg-background pt-10 pb-20 sm:pt-20">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="mb-4 font-black text-4xl tracking-tight sm:text-5xl">
            TRAINING
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Hướng dẫn cơ bản, nhập môn lập trình, ôn tập các kiến thức liên quan
            đến ngành trong suốt quá trình học tập
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mx-auto my-10 max-w-3xl">
          {/* Vertical Line */}
          <div className="absolute top-6 left-[19px] h-full w-[2px] bg-border md:left-1/2 md:-ml-[1px]" />

          <div className="space-y-12">
            {PHASES.map((phase, index) => {
              const Icon = phase.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  className="group relative flex items-center md:justify-between"
                  key={phase.id}
                >
                  {/* Left Space for Odd / Right Space for Even */}
                  <div
                    className={`hidden md:block md:w-5/12 ${isEven ? "text-right md:order-1" : "text-left md:order-3"}`}
                  >
                    <div className="mb-2">
                      <span
                        className={`inline-block rounded-full px-3 py-1 font-bold text-xs ${phase.color} text-white`}
                      >
                        {phase.subtitle}
                      </span>
                    </div>
                    <h3 className="mb-2 font-bold text-xl leading-tight">
                      {phase.title}
                    </h3>
                    <p className="text-muted-foreground">{phase.description}</p>
                  </div>

                  {/* Mobile Content + Icon */}
                  <div className="flex w-full items-start md:order-2 md:w-auto md:justify-center">
                    {/* Center Icon */}
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-background bg-border transition-colors group-hover:bg-primary">
                      <Icon className="h-4 w-4 text-foreground group-hover:text-primary-foreground" />
                    </div>

                    {/* Mobile Only Content */}
                    <div className="ml-4 flex-1 md:hidden">
                      <div className="mb-1">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 font-bold text-xs ${phase.color} text-white`}
                        >
                          {phase.subtitle}
                        </span>
                      </div>
                      <h3 className="mb-1 font-bold text-lg">{phase.title}</h3>
                      <p className="text-muted-foreground text-sm md:text-base">
                        {phase.description}
                      </p>
                    </div>
                  </div>

                  {/* Empty space filler for layout */}
                  <div
                    className={`hidden md:block md:w-5/12 ${isEven ? "md:order-3" : "md:order-1"}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Featured Projects */}
        <FeaturedProjectsClient projects={latestProjects} />
      </div>
    </div>
  );
}
