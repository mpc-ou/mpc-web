import type { Metadata } from "next";
import { homeMetadata } from "@/lib/metadata";
"use client";
import HomePageClient from "./home-client";

export const metadata: Metadata = homeMetadata;

export default function HomePage() {
  return <HomePageClient />;
}
