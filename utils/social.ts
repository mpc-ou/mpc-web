import { SOCIAL_COLLECTION } from "@/constants/common";

export type SocialEntry = { id?: string; platform: string; url: string };

export const getSocialMeta = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes("facebook") || p === "fb") {
    return SOCIAL_COLLECTION.FACEBOOK;
  }
  if (p.includes("twitter") || p === "x") {
    return SOCIAL_COLLECTION.TWITTER;
  }
  if (p.includes("linkedin")) {
    return SOCIAL_COLLECTION.LINKEDIN;
  }
  if (p.includes("github")) {
    return SOCIAL_COLLECTION.GITHUB;
  }
  if (p.includes("instagram") || p === "ig") {
    return SOCIAL_COLLECTION.INSTAGRAM;
  }
  if (p.includes("tiktok")) {
    return SOCIAL_COLLECTION.TIKTOK;
  }
  if (p.includes("youtube") || p === "yt") {
    return SOCIAL_COLLECTION.YOUTUBE;
  }
  if (p.includes("discord")) {
    return SOCIAL_COLLECTION.DISCORD;
  }
  if (p.includes("email") || p.includes("mail")) {
    return SOCIAL_COLLECTION.EMAIL;
  }
  return SOCIAL_COLLECTION.WEBSITE;
};

export const parseSocials = (socials: unknown): SocialEntry[] =>
  (Array.isArray(socials) ? socials : []).filter(
    (s): s is SocialEntry =>
      typeof s === "object" && s !== null && typeof (s as SocialEntry).url === "string" && !!(s as SocialEntry).url
  );
