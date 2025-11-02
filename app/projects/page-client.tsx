"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Smartphone, Brain } from "lucide-react";
import { HeroSection } from "@/components/hero-section";
import { motion } from "framer-motion";
import { PAGES, PROJECTS } from "@/lib/constants";
import { LAYOUT_CONFIG } from "@/lib/config";

export default function ProjectsPageClient() {
  const iconMap = {
    "Web Development": Code,
    "App Development": Smartphone,
    "Artificial Intelligence": Brain,
  };

  const specialties = PROJECTS.specialties.map((specialty) => ({
    ...specialty,
    icon: iconMap[specialty.title as keyof typeof iconMap],
    projects: [
      {
        name: `${specialty.title} Project 1`,
        description: `Mô tả về dự án ${specialty.title} đầu tiên của CLB`,
        tech: specialty.title === "Web Development" 
          ? ["React", "Next.js", "TypeScript"]
          : specialty.title === "App Development"
          ? ["React Native", "Firebase"]
          : ["Python", "TensorFlow", "PyTorch"],
      },
      {
        name: `${specialty.title} Project 2`,
        description: `Mô tả về dự án ${specialty.title} thứ hai của CLB`,
        tech: specialty.title === "Web Development"
          ? ["Vue.js", "Node.js"]
          : specialty.title === "App Development"
          ? ["Flutter", "Dart"]
          : ["Python", "Scikit-learn"],
      },
    ],
  }));

  return (
    <>
      <HeroSection
        title={PAGES.projects.title}
        subtitle={PAGES.projects.subtitle}
        image={PAGES.projects.heroImage}
      />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-primary)]">
            {PAGES.projects.title}
          </h1>
          <p className="text-xl text-[var(--text-secondary)]">
            {PAGES.projects.description}
          </p>
        </div>

        <div className="space-y-16">
          {specialties.map((specialty, idx) => {
            const Icon = specialty.icon;
            return (
              <section key={idx} className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-[var(--primary-light)]">
                    <Icon className="h-8 w-8 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)]">
                      {specialty.title}
                    </h2>
                    <p className="text-[var(--text-secondary)] mt-1">
                      {specialty.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {specialty.projects.map((project, pIdx) => (
                    <Card
                      key={pIdx}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {project.tech.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 text-xs rounded-md bg-[var(--muted)] text-[var(--text-secondary)]"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}

