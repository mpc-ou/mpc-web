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

export type WebDesignConfig = {
  contestDate: string;
  registerUrl: string;
  sponsorUrl: string;
  proposalUrl: string;
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

export const WEBDESIGN_CONFIG_KEY = "webdesign_config";
export const WEBDESIGN_EXHIBITIONS_KEY = "webdesign_exhibitions";

export const DEFAULT_WEBDESIGN_CONFIG: WebDesignConfig = {
  contestDate: "",
  registerUrl: "",
  sponsorUrl: "",
  proposalUrl: "",
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
    return { ...DEFAULT_WEBDESIGN_CONFIG, ...parsed };
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
