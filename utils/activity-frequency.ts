export const FREQ_OPTIONS = [
  { value: "weekly", vi: "Hằng tuần", en: "Weekly" },
  { value: "monthly", vi: "Hằng tháng", en: "Monthly" },
  { value: "yearly", vi: "Hằng năm", en: "Annually" },
  { value: "semester", vi: "Hằng kỳ", en: "Every Semester" },
  { value: "none", vi: "Không cố định", en: "Irregular" }
] as const;

/** Resolves a stored frequency (option key or legacy free text) to a display label; "none" yields "". */
export const frequencyLabel = (vi: string | null, en: string | null, locale: string) => {
  const isEn = locale === "en";
  const option = FREQ_OPTIONS.find((o) => o.value === vi || o.value === en);
  if (option) {
    return option.value === "none" ? "" : option[isEn ? "en" : "vi"];
  }
  return (isEn ? en || vi : vi || en) ?? "";
};
