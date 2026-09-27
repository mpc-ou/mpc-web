export const FREQ_OPTIONS = [
  { value: "weekly", vi: "Hằng tuần", en: "Weekly" },
  { value: "monthly", vi: "Hằng tháng", en: "Monthly" },
  { value: "yearly", vi: "Hằng năm", en: "Annually" },
  { value: "semester", vi: "Hằng kỳ", en: "Every Semester" },
  { value: "none", vi: "Không cố định", en: "Irregular" }
] as const;

export type FrequencyKey = (typeof FREQ_OPTIONS)[number]["value"];

const matchOption = (raw: string | null | undefined) => {
  const value = raw?.trim().toLowerCase();
  if (!value) {
    return undefined;
  }
  return FREQ_OPTIONS.find((o) => o.value === value || o.vi.toLowerCase() === value || o.en.toLowerCase() === value);
};

export const frequencyKey = (vi: string | null | undefined, en?: string | null): FrequencyKey | null =>
  (matchOption(vi) ?? matchOption(en))?.value ?? null;

export const frequencyLabel = (vi: string | null, en: string | null, locale: string) => {
  const isEn = locale === "en";
  const option = matchOption(vi) ?? matchOption(en);
  if (option) {
    return option.value === "none" ? "" : option[isEn ? "en" : "vi"];
  }
  return (isEn ? en || vi : vi || en) ?? "";
};
