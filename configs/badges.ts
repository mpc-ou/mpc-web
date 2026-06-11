export const BADGE_TIERS = [
  { min: 0, key: "none", label: "", className: "" },
  { min: 3, key: "bronze", label: "Đồng", className: "text-amber-700" },
  { min: 10, key: "silver", label: "Bạc", className: "text-slate-400" },
  { min: 20, key: "gold", label: "Vàng", className: "text-yellow-500" },
  { min: 50, key: "diamond", label: "Kim cương", className: "text-cyan-400" }
] as const;

export function getBadgeTier(count: number): (typeof BADGE_TIERS)[number] {
  let tier: (typeof BADGE_TIERS)[number] = BADGE_TIERS[0];
  for (const t of BADGE_TIERS) {
    if (count >= t.min) {
      tier = t;
    }
  }
  return tier;
}

export type BadgeDef = {
  id: string;
  icon: string;
  label: string;
  condition: (data: BadgeData) => BadgeResult | null;
};

export type BadgeResult = {
  tier: string;
  value?: number;
  suffix?: string;
};

export type BadgeData = {
  webRole: string;
  hasLeftClub: boolean;
  joinedClubAt: string | null;
  clubRoleStartYears: number[];
  blogPostCount: number;
  achievementCount: number;
  projectCount: number;
  /** Whether member ever held PRESIDENT, VICE_PRESIDENT, or DEPARTMENT_LEADER */
  hasBeenLeader: boolean;
};

export const BADGE_DEFINITIONS: BadgeDef[] = [
  {
    id: "member",
    icon: "user-check",
    label: "Thành viên CLB",
    condition: (d) => {
      if (d.webRole === "GUEST") {
        return null;
      }
      const years = calcYears(d.clubRoleStartYears, d.joinedClubAt);
      return { tier: "member", value: years, suffix: "năm" };
    }
  },
  {
    id: "alumni",
    icon: "graduation-cap",
    label: "Cựu thành viên",
    condition: (d) => {
      if (d.webRole === "GUEST") {
        return null;
      }
      const years = calcYears(d.clubRoleStartYears, d.joinedClubAt);
      if (years >= 4) {
        return { tier: "alumni", value: years, suffix: "năm" };
      }
      return null;
    }
  },
  {
    id: "left",
    icon: "door-open",
    label: "Đã rời CLB",
    condition: (d) => (d.hasLeftClub ? { tier: "left" } : null)
  },
  {
    id: "admin",
    icon: "shield",
    label: "Quản trị viên",
    condition: (d) => (d.webRole === "ADMIN" ? { tier: "admin" } : null)
  },
  {
    id: "mod",
    icon: "shield-half",
    label: "Cộng tác viên",
    condition: (d) => (d.webRole === "COLLABORATOR" ? { tier: "mod" } : null)
  },
  {
    id: "writer",
    icon: "pen-line",
    label: "Người sôi nổi",
    condition: (d) => {
      if (d.blogPostCount < 1) {
        return null;
      }
      const tier = getBadgeTier(d.blogPostCount);
      return { tier: tier.key, value: d.blogPostCount, suffix: "bài viết" };
    }
  },
  {
    id: "talented",
    icon: "trophy",
    label: "Người tài ba",
    condition: (d) => {
      if (d.achievementCount < 1) {
        return null;
      }
      const tier = getBadgeTier(d.achievementCount);
      return { tier: tier.key, value: d.achievementCount, suffix: "thành tựu" };
    }
  },
  {
    id: "builder",
    icon: "building-2",
    label: "Người xây dựng",
    condition: (d) => {
      if (d.projectCount < 1) {
        return null;
      }
      const tier = getBadgeTier(d.projectCount);
      return { tier: tier.key, value: d.projectCount, suffix: "dự án" };
    }
  },
  {
    id: "cadre",
    icon: "badge-check",
    label: "Cán bộ CLB",
    condition: (d) => (d.hasBeenLeader ? { tier: "cadre" } : null)
  }
];

function calcYears(roleYears: number[], joinedAt: string | null): number {
  const oldest =
    roleYears.length > 0
      ? Math.min(...roleYears)
      : joinedAt
        ? new Date(joinedAt).getFullYear()
        : new Date().getFullYear();
  return Math.max(1, new Date().getFullYear() - oldest);
}
