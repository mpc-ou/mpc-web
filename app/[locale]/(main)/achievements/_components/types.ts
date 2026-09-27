import type { TermGroup } from "@/utils/leadership-terms";

export type HonoreeRole = {
  id: string;
  position: string;
  startAt: string;
  endAt: string | null;
  departmentName: string | null;
};

export type Honoree = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  avatar: string | null;
  coverImage: string | null;
  slug: string | null;
  socials: unknown;
  achievementCount: number;
  projectCount: number;
  roles: HonoreeRole[];
};

export type GoldBoardEntry = { memberId: string; count: number; rank: number };

export type AchievementPost = {
  id: string;
  slug: string;
  title: string;
  thumbnail: string | null;
  date: string | null;
  type: string;
  isHighlight: boolean;
  members: { id: string; firstName: string; lastName: string; avatar: string | null }[];
};

export type AchievementsPagePayload = {
  achievements: AchievementPost[];
  total: number;
  totalPages: number;
  people: Record<string, Honoree>;
  goldBoard: GoldBoardEntry[];
  terms: TermGroup[];
};

export const LEADER_TOP_POSITIONS = new Set(["PRESIDENT"]);

export const POSTS_PER_PAGE = 12;
