import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
    return `${l} ${m} ${f}`.replace(/\s+/g, " ").trim();
  }
  return `${f} ${m} ${l}`.replace(/\s+/g, " ").trim();
}

export function pickLang<T>(lang: "vi" | "en", vi: T, en: T): T {
  if (lang === "vi") {
    return vi || en;
  }
  return en || vi;
}
