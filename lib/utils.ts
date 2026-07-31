import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const WHITESPACE_RE = /\s+/g;
// Combining diacritical marks left behind after Unicode NFD normalization.
const DIACRITIC_MARKS_RE = /[̀-ͯ]/g;

/** Transliterate a Vietnamese string to plain Latin (e.g. "Nguyễn Văn An" -> "Nguyen Van An"). */
export function stripVietnameseDiacritics(text: string): string {
  return text.normalize("NFD").replace(DIACRITIC_MARKS_RE, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

export function getFullName(
  firstName?: string | null,
  middleName?: string | null,
  lastName?: string | null,
  locale?: string | null
) {
  const f = firstName?.trim() || "";
  const m = middleName?.trim() || "";
  const l = lastName?.trim() || "";

  if (!(f || m || l)) {
    return "—";
  }

  if (locale === "vi") {
    return `${l} ${m} ${f}`.replace(WHITESPACE_RE, " ").trim();
  }

  const name = `${f} ${m} ${l}`.replace(WHITESPACE_RE, " ").trim();
  // English-locale readers generally can't pronounce Vietnamese diacritics,
  // so transliterate to plain Latin for the English UI.
  return locale === "en" ? stripVietnameseDiacritics(name) : name;
}

export function pickLang<T>(lang: "vi" | "en", vi: T, en: T): T {
  if (lang === "vi") {
    return vi || en;
  }
  return en || vi;
}

/** Resolve a social entry's raw value into a clickable href, given its platform's URL prefix (if any). */
export function buildSocialHref(rawUrl: string, prefix?: string): string {
  if (rawUrl.startsWith("http") || rawUrl.startsWith("mailto:")) {
    return rawUrl;
  }
  if (prefix) {
    return `${prefix}${rawUrl}`;
  }
  return `https://${rawUrl}`;
}
