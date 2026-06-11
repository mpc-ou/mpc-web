// ── Recap data types & utilities ──

export type RecapMember = {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
};

export type RecapTimelineItem = {
  type: "event" | "achievement" | "project";
  id: string;
  title: string;
  titleEn?: string | null;
  date: string; // ISO date string
  thumbnail: string | null;
  description: string | null;
  descriptionEn?: string | null;
  // Event-specific
  eventType?: string;
  images?: string[];
  location?: string;
  locationEn?: string | null;
  // Achievement-specific
  achievementType?: string;
  members?: Array<{
    firstName: string;
    lastName: string;
    avatar: string | null;
    role: string | null;
    prize?: string | null;
  }>;
  // Project-specific
  projectMembers?: Array<{
    firstName: string;
    lastName: string;
    avatar: string | null;
    role: string | null;
    prize?: string | null;
  }>;
  technologies?: string[];
};

export type RecapStats = {
  totalEvents: number;
  eventsByType: Record<string, number>;
  totalAchievements: number;
  totalProjects: number;
  totalMembersBefore: number;
  newMembersInYear: number;
};

export type RecapExecutiveMember = {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  position: string;
  positionEn?: string | null;
  department: string | null;
  departmentEn?: string | null;
};

export type RecapData = {
  stats: RecapStats;
  executiveBoard: RecapExecutiveMember[];
  newMembers: RecapMember[];
  timeline: RecapTimelineItem[];
};

// ── Empty defaults ──

export const EMPTY_RECAP_DATA: RecapData = {
  stats: {
    totalEvents: 0,
    eventsByType: {},
    totalAchievements: 0,
    totalProjects: 0,
    totalMembersBefore: 0,
    newMembersInYear: 0
  },
  executiveBoard: [],
  newMembers: [],
  timeline: []
};

/** Parse JSON from DB into typed RecapData (returns empty defaults on failure) */
export function parseRecapData(raw: unknown): RecapData {
  if (!raw || typeof raw !== "object") {
    return EMPTY_RECAP_DATA;
  }

  try {
    const data = raw as RecapData;
    return {
      stats: data.stats ?? EMPTY_RECAP_DATA.stats,
      executiveBoard: Array.isArray(data.executiveBoard) ? data.executiveBoard : [],
      newMembers: Array.isArray(data.newMembers) ? data.newMembers : [],
      timeline: Array.isArray(data.timeline) ? data.timeline : []
    };
  } catch {
    return EMPTY_RECAP_DATA;
  }
}

// ── Locale-aware helpers ──

export type RecapLocale = "vi" | "en";

/** Resolve display title for a timeline item based on locale */
export function resolveTimelineTitle(item: RecapTimelineItem, locale: RecapLocale): string {
  if (locale === "en" && item.titleEn) {
    return item.titleEn;
  }
  return item.title;
}

/** Resolve display description for a timeline item based on locale */
export function resolveTimelineDescription(item: RecapTimelineItem, locale: RecapLocale): string | null {
  if (locale === "en" && item.descriptionEn) {
    return item.descriptionEn;
  }
  return item.description;
}

/** Resolve display location for a timeline item based on locale */
export function resolveTimelineLocation(item: RecapTimelineItem, locale: RecapLocale): string | null {
  if (locale === "en" && item.locationEn) {
    return item.locationEn;
  }
  return item.location ?? null;
}
