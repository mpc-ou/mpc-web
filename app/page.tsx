import type { Metadata } from "next";
import { SITE, PAGES } from "@/lib/constants";
import HomePageClient from "./page-client";

export const metadata: Metadata = {
  title: PAGES.home.title + " | " + SITE.name,
  description: PAGES.home.description,
};

export default function HomePage() {
  return <HomePageClient />;
}
