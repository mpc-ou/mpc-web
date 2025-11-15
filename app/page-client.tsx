"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  Code,
  Award,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { HeroSection } from "@/components/hero-section";
import { ImageCarousel } from "@/components/image-carousel";
import { OrganizationSection } from "@/components/organization-section";
import { FAQSection } from "@/components/faq-section";
import { motion } from "framer-motion";
import {
  PAGES,
  HOME_SECTIONS,
  BUTTONS,
  PLACEHOLDERS,
  SITE,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  CAROUSEL_CONFIG,
  LAYOUT_CONFIG,
  SPACING_CONFIG,
  CONTENT_CONFIG,
} from "@/lib/config";

// Helper để generate grid classes (vì Tailwind cần static classes)
function getGridClasses(
  mobile: number,
  tablet: number,
  desktop: number,
  gap: number
): string {
  const cols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };
  const gaps = {
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
  };
  return `${cols[mobile as keyof typeof cols] || `grid-cols-${mobile}`} md:${
    cols[tablet as keyof typeof cols] || `grid-cols-${tablet}`
  } lg:${cols[desktop as keyof typeof cols] || `grid-cols-${desktop}`} ${
    gaps[gap as keyof typeof gaps] || `gap-${gap}`
  }`;
}

export default function HomePageClient() {
  const galleryImages = Array.from({ length: 16 }, (_, i) => ({
    src: `https://oumpc.github.io/src/asset/image/common/slide_${i + 1}.jpg`,
    alt: `Hoạt động CLB ${i + 1}`,
  }));

  console.log(galleryImages);

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        title={PAGES.home.title}
        subtitle={PAGES.home.subtitle}
        image={PAGES.home.heroImage}
        color="light"
      />
      {/* <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] to-transparent opacity-50 " /> */}
      <div className="container mx-auto px-4 py-16 relative z-10 min-h-[500px] flex items-center justify-center space-y-8">
        <div className="w-full max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--text-primary)]  pb-2 inline-block">
            {PAGES.home.title}
          </h2>
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-8">
            {PAGES.home.description}
          </p>
          {PAGES.home.iframeYoutube && (
            <div className="w-full  mb-8 rounded-lg overflow-hidden aspect-video">
              <iframe
                src={PAGES.home.iframeYoutube}
                title="MPClub 2024"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          )}
          {PAGES.home.iframeGoogleMap && (
            <div className="w-full h-96">
              <iframe
                src={PAGES.home.iframeGoogleMap}
                title="Google Map"
                allowFullScreen
              ></iframe>
            </div>
          )}
          
        </div>
      </div>
      {/* Separator */}

      {/* Giới thiệu ngắn */}
      <section className="py-20 bg-[var(--bg-primary)] ">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-[var(--text-primary)] border-b-2 border-[var(--primary)] pb-2 inline-block">
              Giới thiệu
            </h2>
            <div className="flex justify-center items-start gap-4">
              <img
                src={HOME_SECTIONS.intro.image}
                alt={SITE.fullName}
                className="w-1/2 object-cover rounded-lg my-4"
              />
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed w-1/2 text-left py-4">
                {HOME_SECTIONS.intro.description}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/about">{BUTTONS.learnMore}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/members">{BUTTONS.viewMembers}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Lợi ích */}
      <section className="py-20 bg-[var(--bg-secondary)]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[var(--text-primary)] border-b-2 border-[var(--primary)] pb-2 inline-block">
            {HOME_SECTIONS.benefits.title}
          </h2>
          <div
            className={cn(
              "grid",
              getGridClasses(
                LAYOUT_CONFIG.articles.mobile,
                LAYOUT_CONFIG.articles.tablet,
                LAYOUT_CONFIG.articles.desktop,
                LAYOUT_CONFIG.articles.gap
              )
            )}
          >
            {HOME_SECTIONS.benefits.items.map((item, idx) => {
              const Icon = idx === 0 ? Code : idx === 1 ? Users : Award;
              return (
                <Card key={idx}>
                  <CardHeader>
                    <Icon
                      className={`h-10 w-10 ${
                        idx === 0
                          ? "text-[var(--primary)]"
                          : idx === 1
                          ? "text-[var(--accent)]"
                          : "text-[var(--warning)]"
                      } mb-2`}
                    />
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tổ chức CLB */}
      <OrganizationSection />

      {/* Hình ảnh */}
      <section className="py-20 bg-[var(--bg-primary)]">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-[var(--text-primary)] border-b-2 border-[var(--primary)] pb-2 inline-block"
          >
            {HOME_SECTIONS.gallery.title}
          </motion.h2>
          <div className="mt-12">
            <ImageCarousel
              images={galleryImages}
              autoPlay={CAROUSEL_CONFIG.autoPlay}
            />
          </div>
        </div>
      </section>

      {/* Bài viết */}
      <section className="py-20 bg-[var(--bg-primary)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[var(--text-primary)] border-b-2 border-[var(--primary)] pb-2 inline-block">
              {HOME_SECTIONS.articles.title}
            </h2>
            <div className="mt-4">
              <Button variant="outline" asChild>
                <Link href="/articles">
                  {HOME_SECTIONS.articles.viewAll}{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div
            className={cn(
              "grid",
              getGridClasses(
                LAYOUT_CONFIG.articles.mobile,
                LAYOUT_CONFIG.articles.tablet,
                LAYOUT_CONFIG.articles.desktop,
                LAYOUT_CONFIG.articles.gap
              )
            )}
          >
            {Array.from(
              { length: CONTENT_CONFIG.featuredArticles },
              (_, i) => i + 1
            ).map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-full h-48 rounded-lg bg-[var(--muted)] mb-4" />
                  <CardTitle>
                    {PLACEHOLDERS.articleTitle} {i}
                  </CardTitle>
                  <CardDescription>
                    {PLACEHOLDERS.articleDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="link" asChild>
                    <Link href={`/articles/${i}`}>
                      {HOME_SECTIONS.articles.viewMore}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Giải đáp thắc mắc */}
      <FAQSection />
    </>
  );
}
