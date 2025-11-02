import type { Metadata } from "next";
import { SITE, PAGES } from "@/lib/constants";
import ProjectsPageClient from "./page-client";

export const metadata: Metadata = {
  title: PAGES.projects.title + " | " + SITE.name,
  description: PAGES.projects.description,
};

export default function ProjectsPage() {
  return <ProjectsPageClient />;
}
