import type { Metadata } from "next";
import { SITE, PAGES } from "@/lib/constants";
import AchievementsPageClient from "./page-client";

export const metadata: Metadata = {
  title: PAGES.achievements.title + " | " + SITE.name,
  description: PAGES.achievements.description,
};

export default function AchievementsPage() {
  return <AchievementsPageClient />;
}
