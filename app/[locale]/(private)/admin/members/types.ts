export type Department = { id: string; name: string };

export type ClubRoleEntry = {
  id: string;
  position: string;
  term: number | null;
  note: string | null;
  startAt: string;
  endAt: string | null;
  department: Department | null;
};

export type SocialEntry = { id?: string; platform: string; url: string };

export const POSITION_LABELS: Record<string, string> = {
  PRESIDENT: "Chủ nhiệm CLB",
  VICE_PRESIDENT: "Phó chủ nhiệm",
  DEPARTMENT_LEADER: "Trưởng ban",
  DEPARTMENT_VICE_LEADER: "Phó ban",
  DEPARTMENT_MEMBER: "Thành viên ban",
  COLLABORATOR: "Cộng tác viên",
  ADVISOR: "Cố vấn"
};

export const PLATFORMS = [
  { value: "Facebook", label: "Facebook", icon: "/images/icons/facebook-icon.svg" },
  { value: "GitHub", label: "GitHub", icon: "/images/icons/github-icon.svg" },
  { value: "LinkedIn", label: "LinkedIn", icon: "/images/icons/linkedin-icon.svg" },
  { value: "X (Twitter)", label: "X (Twitter)", icon: "/images/icons/x-icon.svg" },
  { value: "Instagram", label: "Instagram", icon: "/images/icons/instagram-icon.svg" },
  { value: "TikTok", label: "TikTok", icon: "/images/icons/tiktok-icon.svg" },
  { value: "YouTube", label: "YouTube", icon: "/images/icons/youtube-icon.svg" },
  { value: "Discord", label: "Discord", icon: "/images/icons/discord-icon.svg" },
  { value: "Email", label: "Email", icon: "/images/icons/email-icon.svg" },
  { value: "Website", label: "Website / Khác", icon: "/images/icons/website-icon.svg" }
];
