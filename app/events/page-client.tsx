"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { HeroSection } from "@/components/hero-section";
import { motion } from "framer-motion";
import { PAGES, EVENTS } from "@/lib/constants";
import { LAYOUT_CONFIG } from "@/lib/config";

export default function EventsPageClient() {
  const featuredEvent = {
    title: "Cuộc thi Web Design 2024",
    description:
      "Cuộc thi thiết kế website dành cho sinh viên với nhiều giải thưởng hấp dẫn",
    date: "15/03/2024",
    location: "Trường Đại học XYZ",
    slug: "webdesign",
  };

  const events = [
    {
      title: "Hackathon MPC 2024",
      description: "Cuộc thi lập trình Hackathon 24 giờ",
      date: "20/04/2024",
      location: "Online",
      slug: "hackathon-2024",
    },
    {
      title: "Workshop AI & Machine Learning",
      description: "Workshop về trí tuệ nhân tạo và học máy",
      date: "10/05/2024",
      location: "Phòng A101",
      slug: "workshop-ai",
    },
    {
      title: "Competition App Development",
      description: "Cuộc thi phát triển ứng dụng di động",
      date: "25/06/2024",
      location: "Trường Đại học XYZ",
      slug: "app-competition",
    },
  ];

  return (
    <>
      <HeroSection
        title={PAGES.events.title}
        subtitle={PAGES.events.subtitle}
        image={PAGES.events.heroImage}
      />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-primary)]">
            {PAGES.events.title}
          </h1>
          <p className="text-xl text-[var(--text-secondary)]">
            {PAGES.events.description}
          </p>
        </div>

        {/* Featured Event - Introduction */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-2 border-[var(--primary)]">
            <CardHeader>
              <CardTitle className="text-2xl mb-2">{EVENTS.intro.title}</CardTitle>
              <CardDescription className="text-base">
                {EVENTS.intro.description}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Separator */}
        <div className="w-full border-t border-[var(--border)] my-16" />

        {/* Featured Event */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="mb-4">
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
              {EVENTS.featured.title}
            </span>
          </div>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">
                {featuredEvent.title}
              </CardTitle>
              <CardDescription className="text-lg mb-4">
                {featuredEvent.description}
              </CardDescription>
              <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{featuredEvent.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{featuredEvent.location}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/events/${featuredEvent.slug}`}>
                  Xem chi tiết <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Other Events */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-[var(--text-primary)]">
            {EVENTS.other.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card
                key={event.slug}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/events/${event.slug}`}>
                        Xem chi tiết <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

