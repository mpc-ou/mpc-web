import type { Metadata } from "next";
import { SITE, PAGES } from "@/lib/constants";
import EventsPageClient from "./page-client";

export const metadata: Metadata = {
  title: PAGES.events.title + " | " + SITE.name,
  description: PAGES.events.description,
};

export default function EventsPage() {
  return <EventsPageClient />;
}
