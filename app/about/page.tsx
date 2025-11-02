import type { Metadata } from "next";
import { SITE, PAGES } from "@/lib/constants";
import AboutPageClient from "./page-client";

export const metadata: Metadata = {
  title: PAGES.about.title + " | " + SITE.name,
  description: PAGES.about.description,
};

export default function AboutPage() {
  return <AboutPageClient />;
}
