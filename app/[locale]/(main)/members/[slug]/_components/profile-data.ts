export type Member = {
  id: string;
  slug: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  avatar: string | null;
  coverImage: string | null;
  bio: string | null;
  phone: string | null;
  email: string;
  studentId: string | null;
  dob: string | null;
  showDob: boolean;
  showPhone: boolean;
  showStudentId: boolean;
  socials: { id?: string; platform: string; url: string }[] | null;
  webRole: string;
  joinedClubAt: string | null;
  spotifyUri: string | null;
  clubRoles: {
    id: string;
    position: string;
    term: number | null;
    startAt: string;
    endAt: string | null;
    note: string | null;
    department: { nameVi: string; nameEn: string | null } | null;
  }[];
  achievements: {
    role: string | null;
    prize: string | null;
    achievement: {
      id: string;
      title: string;
      titleEn: string | null;
      date: string | null;
      type: string | null;
      isHighlight: boolean;
      slug: string;
      thumbnail: string | null;
    };
  }[];
  projects: {
    role: string | null;
    joinedAt: string | null;
    project: {
      id: string;
      slug: string;
      title: string;
      titleEn: string | null;
      thumbnail: string | null;
      technologies: unknown;
      startDate: string | null;
      createdAt: string;
    };
  }[];
  authoredPosts: {
    id: string;
    titleVi: string;
    titleEn: string | null;
    thumbnail: string | null;
    publishedAt: string | null;
    slug: string;
    readMinutes: number;
  }[];
};

export type TimelineKind = "award" | "project" | "post" | "role";

export type TimelineItem = {
  id: string;
  kind: TimelineKind;
  date: number;
  title: string;
  href: string | null;
  thumbnail: string | null;
  meta: string | null;
  aside: string | null;
  highlight: boolean;
};

export const TAG_LABEL: Record<TimelineKind, string> = {
  award: "AWARD",
  project: "PROJECT",
  post: "POST",
  role: "ROLE"
};

export const MAX_FEATURED = 3;
const FEATURED_AWARDS_WITH_PROJECT = 2;

type Labels = {
  position: (position: string) => string;
  term: (term: number) => string;
  readMinutes: (count: number) => string;
  joinedClub: string;
};

const toTime = (value: string | null | undefined) => (value ? new Date(value).getTime() : Number.NaN);

const technologiesOf = (value: unknown) =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

const pick = (vi: string, en: string | null, locale: string) => (locale === "en" && en ? en : vi);

export const departmentName = (department: { nameVi: string; nameEn: string | null }, locale: string) =>
  pick(department.nameVi, department.nameEn, locale);

const clubJoinTime = (member: Member) => {
  const candidates = [member.joinedClubAt, ...member.clubRoles.map((r) => r.startAt)]
    .map(toTime)
    .filter((t) => !Number.isNaN(t));
  return candidates.length > 0 ? Math.min(...candidates) : Number.NaN;
};

const projectTime = (joinedAt: string | null, project: Member["projects"][number]["project"], clubJoin: number) => {
  if (joinedAt) {
    return toTime(joinedAt);
  }
  const start = toTime(project.startDate ?? project.createdAt);
  return Number.isNaN(clubJoin) ? start : Math.max(start, clubJoin);
};

export function buildTimeline(member: Member, locale: string, labels: Labels): TimelineItem[] {
  const items: TimelineItem[] = [];
  const clubJoin = clubJoinTime(member);

  for (const { achievement, role, prize } of member.achievements) {
    items.push({
      id: `award-${achievement.id}`,
      kind: "award",
      date: toTime(achievement.date),
      title: pick(achievement.title, achievement.titleEn, locale),
      href: `/achievements/${achievement.slug}`,
      thumbnail: achievement.thumbnail,
      meta: role,
      aside: prize,
      highlight: achievement.isHighlight
    });
  }

  for (const { project, role, joinedAt } of member.projects) {
    const tech = technologiesOf(project.technologies);
    items.push({
      id: `project-${project.id}`,
      kind: "project",
      date: projectTime(joinedAt, project, clubJoin),
      title: pick(project.title, project.titleEn, locale),
      href: `/projects/${project.slug}`,
      thumbnail: project.thumbnail,
      meta: [role, ...tech.slice(0, 3)].filter(Boolean).join(" · ") || null,
      aside: null,
      highlight: false
    });
  }

  for (const post of member.authoredPosts) {
    items.push({
      id: `post-${post.id}`,
      kind: "post",
      date: toTime(post.publishedAt),
      title: pick(post.titleVi, post.titleEn, locale),
      href: `/blogs/${post.slug}`,
      thumbnail: post.thumbnail,
      meta: null,
      aside: labels.readMinutes(post.readMinutes),
      highlight: false
    });
  }

  for (const role of member.clubRoles) {
    const label = labels.position(role.position);
    items.push({
      id: `role-${role.id}`,
      kind: "role",
      date: toTime(role.startAt),
      title: role.department ? `${label} ${departmentName(role.department, locale)}` : label,
      href: null,
      thumbnail: null,
      meta: null,
      aside: role.term ? labels.term(role.term) : null,
      highlight: !role.endAt
    });
  }

  if (member.joinedClubAt) {
    items.push({
      id: "joined",
      kind: "role",
      date: toTime(member.joinedClubAt),
      title: labels.joinedClub,
      href: null,
      thumbnail: null,
      meta: null,
      aside: "init",
      highlight: false
    });
  }

  return items.filter((i) => !Number.isNaN(i.date)).sort((a, b) => b.date - a.date);
}

export function pickFeatured(items: TimelineItem[]): TimelineItem[] {
  const awards = items.filter((i) => i.kind === "award");
  const projects = items.filter((i) => i.kind === "project");
  if (awards.length === 0 || projects.length === 0) {
    return [...awards, ...projects].slice(0, MAX_FEATURED);
  }
  const picks = [...awards.slice(0, FEATURED_AWARDS_WITH_PROJECT), ...projects.slice(0, 1)];
  const rest = [...awards.slice(FEATURED_AWARDS_WITH_PROJECT), ...projects.slice(1)];
  return [...picks, ...rest].slice(0, MAX_FEATURED).sort((a, b) => b.date - a.date);
}

export function groupByYear(items: TimelineItem[]) {
  const groups = new Map<number, TimelineItem[]>();
  for (const item of items) {
    const year = new Date(item.date).getFullYear();
    const list = groups.get(year) ?? [];
    list.push(item);
    groups.set(year, list);
  }
  return [...groups.entries()].map(([year, list]) => ({ year, items: list }));
}
