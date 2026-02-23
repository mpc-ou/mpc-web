export const SOCIAL_COLLECTION = {
  FACEBOOK: {
    icon: "/images/icons/facebook-icon.svg",
    platform: "Facebook",
    url: "https://www.facebook.com/",
    prefix: "https://www.facebook.com/",
    label: "Facebook",
  },
  TWITTER: {
    icon: "/images/icons/x-icon.svg",
    platform: "Twitter",
    url: "https://twitter.com/",
    prefix: "https://twitter.com/",
    label: "Twitter",
  },
  LINKEDIN: {
    icon: "/images/icons/linkedin-icon.svg",
    platform: "LinkedIn",
    url: "https://www.linkedin.com/in/",
    prefix: "https://www.linkedin.com/in/",
    label: "LinkedIn",
  },
  GITHUB: {
    icon: "/images/icons/github-icon.svg",
    platform: "GitHub",
    url: "https://github.com/",
    prefix: "https://github.com/",
    label: "GitHub",
  },
  INSTAGRAM: {
    icon: "/images/icons/instagram-icon.svg",
    platform: "Instagram",
    url: "https://www.instagram.com/",
    prefix: "https://www.instagram.com/",
    label: "Instagram",
  },
  TIKTOK: {
    icon: "/images/icons/tiktok-icon.svg",
    platform: "TikTok",
    url: "https://www.tiktok.com/",
    prefix: "https://www.tiktok.com/",
    label: "TikTok",
  },
  YOUTUBE: {
    icon: "/images/icons/youtube-icon.svg",
    platform: "YouTube",
    url: "https://www.youtube.com/",
    prefix: "https://www.youtube.com/",
    label: "YouTube",
  },
  DISCORD: {
    icon: "/images/icons/discord-icon.svg",
    platform: "Discord",
    url: "https://discord.gg/",
    prefix: "https://discord.gg/",
    label: "Discord",
  },
  EMAIL: {
    icon: "/images/icons/email-icon.svg",
    platform: "Email",
    url: "",
    prefix: "mailto:",
    label: "Email",
  },
  WEBSITE: {
    icon: "/images/icons/website-icon.svg",
    platform: "Website",
    url: "",
    prefix: "",
    label: "Website",
  },
} as const;

export type SocialCollection = (typeof SOCIAL_COLLECTION)[keyof typeof SOCIAL_COLLECTION];