const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

export const LEADERSHIP_POSITIONS = [
  "PRESIDENT",
  "VICE_PRESIDENT",
  "DEPARTMENT_LEADER",
  "DEPARTMENT_VICE_LEADER",
  "ADVISOR"
] as const;

export type LeadershipPosition = (typeof LEADERSHIP_POSITIONS)[number];

export type TermRoleInput = {
  memberId: string;
  position: string;
  startAt: Date;
  endAt: Date | null;
  departmentName: string | null;
};

export type TermEntry = {
  memberId: string;
  position: string;
  departmentName: string | null;
};

export type TermGroup = {
  year: number;
  entries: TermEntry[];
};

const positionRank = (position: string) => {
  const i = LEADERSHIP_POSITIONS.indexOf(position as LeadershipPosition);
  return i === -1 ? LEADERSHIP_POSITIONS.length : i;
};

const vnYear = (d: Date) => new Date(d.getTime() + VN_OFFSET_MS).getUTCFullYear();

const midYear = (year: number) => new Date(Date.UTC(year, 6, 1) - VN_OFFSET_MS);

const yearsCovered = (role: TermRoleInput, now: Date): number[] => {
  const startYear = vnYear(role.startAt);
  const endYear = vnYear(role.endAt ?? now);
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    const probe = midYear(y) > now ? now : midYear(y);
    if (role.startAt <= probe && (!role.endAt || role.endAt > probe)) {
      years.push(y);
    }
  }
  return years.length > 0 ? years : [startYear];
};

export const groupRolesByTerm = (roles: TermRoleInput[], now = new Date()): TermGroup[] => {
  const byYear = new Map<number, Map<string, TermEntry>>();

  for (const role of roles) {
    for (const year of yearsCovered(role, now)) {
      const bucket = byYear.get(year) ?? new Map<string, TermEntry>();
      const existing = bucket.get(role.memberId);
      if (!existing || positionRank(role.position) < positionRank(existing.position)) {
        bucket.set(role.memberId, {
          memberId: role.memberId,
          position: role.position,
          departmentName: role.departmentName
        });
      }
      byYear.set(year, bucket);
    }
  }

  return [...byYear.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, bucket]) => ({
      year,
      entries: [...bucket.values()].sort((a, b) => positionRank(a.position) - positionRank(b.position))
    }));
};

export const formatYearSpan = (startAt: string, endAt: string | null, presentLabel: string) => {
  const start = vnYear(new Date(startAt));
  if (!endAt) {
    return `${start} → ${presentLabel}`;
  }
  const end = vnYear(new Date(new Date(endAt).getTime() - 1));
  return end === start ? `${start}` : `${start}–${String(end).slice(-2)}`;
};
