import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFullName(firstName?: string | null, lastName?: string | null, locale?: string | null) {
  const f = firstName?.trim() || "";
  const l = lastName?.trim() || "";
  
  if (!f && !l) return "—";

  if (locale === "vi") {
    return `${l} ${f}`.trim();
  }
  return `${f} ${l}`.trim();
}
