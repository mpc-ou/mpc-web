"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Code, Users, Target } from "lucide-react";
import { HeroSection } from "@/components/hero-section";
import { motion } from "framer-motion";
import { PAGES, ABOUT, TRAINING_PATHS } from "@/lib/constants";

export default function AboutPageClient() {
  const trainingPaths = TRAINING_PATHS.map((path) => ({
    ...path,
    topics: path.title === "Web Development"
      ? ["HTML, CSS, JavaScript cơ bản", "React và Next.js", "Backend với Node.js", "Database và API"]
      : path.title === "App Development"
      ? ["React Native hoặc Flutter", "State Management", "API Integration", "Publishing Apps"]
      : ["Python và các thư viện ML", "Machine Learning cơ bản", "Deep Learning với TensorFlow/PyTorch", "NLP và Computer Vision"],
  }));

  return (
    <>
      <HeroSection
        title={PAGES.about.title}
        subtitle={PAGES.about.subtitle}
        image={PAGES.about.heroImage}
      />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-primary)]">
          {PAGES.about.title}
        </h1>
        <p className="text-xl text-[var(--text-secondary)]">
          {PAGES.about.description}
        </p>
      </div>

      {/* Introduction */}
      <section className="max-w-4xl mx-auto mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl mb-4">Giới thiệu</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <p className="text-[var(--text-secondary)]">
              {ABOUT.intro.description}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Mission and Vision */}
      <section className="max-w-4xl mx-auto mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Target className="h-8 w-8 text-[var(--primary)] mb-2" />
              <CardTitle>Mục tiêu</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Xây dựng một cộng đồng lập trình viên năng động, hỗ trợ nhau phát triển và 
                chia sẻ kiến thức, góp phần nâng cao chất lượng đào tạo công nghệ thông tin.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-[var(--accent)] mb-2" />
              <CardTitle>Tầm nhìn</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Trở thành CLB công nghệ hàng đầu, là nơi đào tạo ra những lập trình viên 
                tài năng và góp phần vào sự phát triển của cộng đồng công nghệ Việt Nam.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Training Paths */}
      <section className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="h-8 w-8 text-[var(--primary)]" />
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">
            {ABOUT.training.title}
          </h2>
        </div>
        <div className="space-y-6">
          {trainingPaths.map((path, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl">{path.title}</CardTitle>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {path.duration}
                  </span>
                </div>
                <CardDescription className="text-base mb-4">
                  {path.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                    Nội dung chính:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
                    {path.topics.map((topic, tIdx) => (
                      <li key={tIdx}>{topic}</li>
                    ))}
                  </ul>
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

