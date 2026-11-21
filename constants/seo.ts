/**
 * SEO constants used across the application for metadata generation.
 */
export const SITE_NAME = "MPClub";

const TRAILING_SLASH_RE = /\/$/;

function resolveSiteUrl(): string {
  const fallback = "https://mpclub.dev";
  const seoOverride = process.env.NEXT_PUBLIC_SEO_SITE_URL;
  if (seoOverride) {
    return seoOverride.replace(TRAILING_SLASH_RE, "");
  }
  const publicUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (publicUrl?.startsWith("https://") && !publicUrl.includes("localhost")) {
    return publicUrl.replace(TRAILING_SLASH_RE, "");
  }
  return fallback;
}

export const SITE_URL = resolveSiteUrl();
export const SITE_DESCRIPTION_VI =
  "Câu lạc bộ Lập trình trên Thiết bị Di động (MPC) - Khoa Công nghệ Thông tin, Trường Đại học Mở TP.HCM.";
export const SITE_DESCRIPTION_EN =
  "Mobile Programming Club (MPC) - Faculty of Information Technology, Ho Chi Minh City Open University.";
export const OG_IMAGE = `${SITE_URL}/images/og/mpclub.jpg`;
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export const SEO_SETTING_KEYS = {
  keywords: "seo_keywords",
  ogImage: "seo_og_image",
  descriptionVi: "seo_description_vi",
  descriptionEn: "seo_description_en"
} as const;

export const BASE_KEYWORDS = [
  "MPC",
  "MPClub",
  "Mobile Programming Club",
  "Câu lạc bộ Lập trình trên thiết bị di động",
  "CLB Lập trình trên thiết bị di động",
  "CLB MPC",
  "CLB lập trình",
  "Câu lạc bộ lập trình",
  "HCMOU",
  "OU",
  "Trường Đại học Mở TP.HCM",
  "Trường Đại học Mở Thành phố Hồ Chí Minh",
  "Ho Chi Minh City Open University",
  "Khoa Công nghệ Thông tin",
  "Faculty of Information Technology",
  "lập trình di động",
  "mobile programming",
  "web development"
] as const;

const KEYWORD_SPLIT_RE = /[,\n]/;

export const parseKeywords = (raw: string | null | undefined) =>
  (raw ?? "")
    .split(KEYWORD_SPLIT_RE)
    .map((k) => k.trim())
    .filter(Boolean);
