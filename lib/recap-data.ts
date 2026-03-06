// ╔══════════════════════════════════════════════════════════════╗
// ║              RECAP DATA TYPES & UTILITIES                    ║
// ╚══════════════════════════════════════════════════════════════╝

/**
 * Cấu trúc JSON lưu trong cột `data` của bảng YearRecap.
 * Được build từ server action `adminBuildRecapData`.
 */

// --- Sub-types ---

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
  date: string; // ISO date string
  thumbnail: string | null;
  description: string | null;
  // Event-specific
  eventType?: string;
  images?: string[];
  location?: string;
  // Achievement-specific
  achievementType?: string;
  members?: Array<{ firstName: string; lastName: string; avatar: string | null; role: string | null }>;
  // Project-specific
  projectMembers?: Array<{ firstName: string; lastName: string; avatar: string | null; role: string | null }>;
  technologies?: string[];
};

// --- Main type ---

export type RecapData = {
  stats: {
    totalEvents: number;
    eventsByType: Record<string, number>;
    totalAchievements: number;
    totalProjects: number;
    totalMembersBefore: number;
    newMembersInYear: number;
  };
  executiveBoard: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    position: string;
    department: string | null;
  }>;
  newMembers: RecapMember[];
  timeline: RecapTimelineItem[];
};

// --- Utilities ---

/** Parse JSON from DB into typed RecapData (returns empty defaults on failure) */
export function parseRecapData(raw: unknown): RecapData {
  const empty: RecapData = {
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

  if (!raw || typeof raw !== "object") {
    return empty;
  }

  try {
    const data = raw as RecapData;
    return {
      stats: data.stats ?? empty.stats,
      executiveBoard: Array.isArray(data.executiveBoard) ? data.executiveBoard : [],
      newMembers: Array.isArray(data.newMembers) ? data.newMembers : [],
      timeline: Array.isArray(data.timeline) ? data.timeline : []
    };
  } catch {
    return empty;
  }
}
