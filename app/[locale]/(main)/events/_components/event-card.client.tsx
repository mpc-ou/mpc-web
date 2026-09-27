"use client";

import { useTranslations } from "next-intl";
import { PostCard } from "@/components/post-card";
import type { EventListItem } from "../client";

const STATUS_MAP: Record<string, { labelKey: string; variant: "default" | "secondary" | "outline" }> = {
  UPCOMING: { labelKey: "status.upcoming", variant: "default" },
  ONGOING: { labelKey: "status.ongoing", variant: "secondary" },
  COMPLETED: { labelKey: "status.completed", variant: "outline" }
};

export function EventCard({ event }: { event: EventListItem }) {
  const t = useTranslations("events");

  const statusInfo = STATUS_MAP[event.status ?? ""] || { labelKey: "", variant: "outline" as const };
  const statusLabel = statusInfo.labelKey ? t(statusInfo.labelKey as Parameters<typeof t>[0]) : (event.status ?? "");
  const displayType = (event.type === "EVENT" ? event.eventType : event.type) || event.eventType;
  const eventTypeLabel =
    displayType && displayType !== "OTHER" ? t(`types.${displayType}` as Parameters<typeof t>[0]) || displayType : null;

  return (
    <PostCard
      data={{
        id: event.id,
        slug: event.slug,
        variant: "event",
        titleVi: event.title,
        summaryVi: event.description,
        thumbnail: event.thumbnail,
        date: event.startAt,
        statusBadge: { label: statusLabel, variant: statusInfo.variant },
        eventTypeBadge: eventTypeLabel,
        readMoreLabel: t("viewDetails")
      }}
    />
  );
}
