export type LocalizedText = {
  vi: string;
  en: string;
};

export type WebDesignPrize = {
  id: string;
  tier: "gold" | "silver" | "bronze";
  title: LocalizedText;
  description: LocalizedText;
};

export type WebDesignBenefit = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
};

/** A dated phase of the contest (registration, qualifiers, finals…). Dates are ISO strings. */
export type WebDesignMilestone = {
  id: string;
  start: string;
  end: string;
  title: LocalizedText;
  description: LocalizedText;
};

/** One article of the contest regulations; each bullet is bilingual. */
export type WebDesignRegulation = {
  id: string;
  title: LocalizedText;
  items: LocalizedText[];
};

export type WebDesignConfig = {
  contestDate: string;
  registerUrl: string;
  sponsorUrl: string;
  proposalUrl: string;
  /** Full official rules document (PDF). Empty = "coming soon". */
  rulesPdfUrl: string;
  milestones: WebDesignMilestone[];
  regulations: WebDesignRegulation[];
  prizes: WebDesignPrize[];
  benefits: WebDesignBenefit[];
};

export type WebDesignExhibitionItem = {
  teamName: string;
  teamMembers: string[];
  year: number;
  subjects: string;
  projectName: LocalizedText;
  description: LocalizedText;
  testimonial: LocalizedText;
  github: string;
  live: string;
  thumbnail: string;
  techStack: string[];
};

const YEAR_MATCH_RE = /\b(20\d{2})\b/;
const DEFAULT_EXHIBITION_YEAR = 2025;

export function inferExhibitionYear(item: {
  year?: unknown;
  subjects?: string;
  live?: string;
  github?: string;
}): number {
  const num = typeof item.year === "number" ? item.year : Number.parseInt(String(item.year ?? ""), 10);
  if (Number.isInteger(num) && num >= 2015 && num <= 2100) {
    return num;
  }
  const combined = `${item.subjects ?? ""} ${item.live ?? ""} ${item.github ?? ""}`;
  const match = YEAR_MATCH_RE.exec(combined);
  if (match?.[1]) {
    const parsed = Number.parseInt(match[1], 10);
    if (parsed >= 2015 && parsed <= 2100) {
      return parsed;
    }
  }
  return DEFAULT_EXHIBITION_YEAR;
}

export function normalizeLocalizedText(value: LocalizedText | string | undefined): LocalizedText {
  if (!value) {
    return { vi: "", en: "" };
  }
  if (typeof value === "string") {
    return { vi: value, en: value };
  }
  return {
    vi: value.vi ?? "",
    en: value.en ?? ""
  };
}

/** WebDesign FAQ entry — stored as `FaqItem` rows with `target = WEBDESIGN_FAQ_TARGET`, ordered by position. */
export type WebDesignFaq = {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
  isActive: boolean;
};

export const WEBDESIGN_FAQ_TARGET = "WEBDESIGN";
export const WEBDESIGN_CONFIG_KEY = "webdesign_config";
export const WEBDESIGN_EXHIBITIONS_KEY = "webdesign_exhibitions";

export const DEFAULT_WEBDESIGN_CONFIG: WebDesignConfig = {
  contestDate: "",
  registerUrl: "",
  sponsorUrl: "",
  proposalUrl: "",
  rulesPdfUrl: "",
  milestones: [],
  regulations: [],
  prizes: [],
  benefits: []
};

export function localizedText(locale: string, text: LocalizedText | undefined): string {
  if (!text) {
    return "";
  }
  return (locale === "en" ? text.en : text.vi) || text.vi || text.en || "";
}

export function parseWebDesignConfig(raw: string | undefined): WebDesignConfig {
  if (!raw) {
    return DEFAULT_WEBDESIGN_CONFIG;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<WebDesignConfig>;
    const config = { ...DEFAULT_WEBDESIGN_CONFIG, ...parsed };
    // Older saved configs predate these arrays; never hand `undefined` to the page.
    return {
      ...config,
      milestones: config.milestones ?? [],
      regulations: config.regulations ?? [],
      prizes: config.prizes ?? [],
      benefits: config.benefits ?? []
    };
  } catch {
    return DEFAULT_WEBDESIGN_CONFIG;
  }
}

export function normalizeExhibitionItem(rawItem: Partial<WebDesignExhibitionItem>): WebDesignExhibitionItem {
  return {
    teamName: rawItem.teamName ?? "",
    teamMembers: Array.isArray(rawItem.teamMembers) ? rawItem.teamMembers : [],
    year: inferExhibitionYear(rawItem),
    subjects: rawItem.subjects ?? "",
    projectName: normalizeLocalizedText(rawItem.projectName),
    description: normalizeLocalizedText(rawItem.description),
    testimonial: normalizeLocalizedText(rawItem.testimonial),
    github: rawItem.github ?? "",
    live: rawItem.live ?? "",
    thumbnail: rawItem.thumbnail ?? "",
    techStack: Array.isArray(rawItem.techStack) ? rawItem.techStack : []
  };
}

export function parseWebDesignExhibitions(raw: string | undefined): WebDesignExhibitionItem[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as Partial<WebDesignExhibitionItem>[];
    return Array.isArray(parsed) ? parsed.map(normalizeExhibitionItem) : [];
  } catch {
    return [];
  }
}

export type BundledExhibitionTeam = {
  teamName: string;
  teamMembers: string[];
  year?: number;
  subjects: string;
  projectName: LocalizedText | string;
  description: LocalizedText | string;
  testimonial?: LocalizedText | string;
  github: string;
  live: string;
  thumbnail: string;
  techStack: string[];
};

export function mapBundledExhibitionTeams(teams: BundledExhibitionTeam[] | undefined): WebDesignExhibitionItem[] {
  if (!Array.isArray(teams)) {
    return [];
  }
  return teams.map((team) =>
    normalizeExhibitionItem({
      teamName: team.teamName,
      teamMembers: team.teamMembers,
      year: team.year,
      subjects: team.subjects,
      projectName: normalizeLocalizedText(team.projectName),
      description: normalizeLocalizedText(team.description),
      testimonial: normalizeLocalizedText(team.testimonial),
      github: team.github,
      live: team.live,
      thumbnail: team.thumbnail,
      techStack: team.techStack
    })
  );
}
