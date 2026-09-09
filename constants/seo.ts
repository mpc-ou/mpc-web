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
  "Câu lạc bộ Lập trình trên Thiết bị Di động (MPC) — Khoa Công nghệ Thông tin, Trường Đại học Mở TP.HCM.";
export const SITE_DESCRIPTION_EN =
  "Mobile Programming Club (MPC) — Faculty of Information Technology, Ho Chi Minh City Open University.";
export const OG_IMAGE = `${SITE_URL}/og`;
