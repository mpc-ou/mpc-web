/** WEBDESIGN is intentionally absent: its FAQ is managed in Site Config → WebDesign. */
export const FAQ_TARGETS = [
  { value: "GENERAL", label: "Chung" },
  { value: "ABOUT", label: "Giới thiệu (About)" },
  { value: "SPONSOR", label: "Nhà tài trợ" },
  { value: "TRAINING", label: "Training" },
  { value: "ACTIVITIES", label: "Hoạt động" },
  { value: "PROJECTS", label: "Dự án" }
] as const;

export type FaqTarget = (typeof FAQ_TARGETS)[number]["value"];
