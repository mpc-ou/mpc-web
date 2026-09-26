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
  subjects: string;
  projectName: LocalizedText;
  description: LocalizedText;
  github: string;
  live: string;
  thumbnail: string;
  techStack: string[];
};

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

export function parseWebDesignExhibitions(raw: string | undefined): WebDesignExhibitionItem[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as WebDesignExhibitionItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
