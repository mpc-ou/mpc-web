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
  ADVISOR: "Cố vấn",
};

export const PLATFORMS = [
  { value: "Facebook", label: "Facebook", icon: "📘" },
  { value: "GitHub", label: "GitHub", icon: "🐙" },
  { value: "LinkedIn", label: "LinkedIn", icon: "💼" },
  { value: "X (Twitter)", label: "X (Twitter)", icon: "𝕏" },
  { value: "Instagram", label: "Instagram", icon: "📸" },
  { value: "TikTok", label: "TikTok", icon: "🎵" },
  { value: "YouTube", label: "YouTube", icon: "▶️" },
  { value: "Discord", label: "Discord", icon: "👾" },
  { value: "Pixiv", label: "Pixiv", icon: "🎨" },
  { value: "Zalo", label: "Zalo", icon: "💬" },
  { value: "Email", label: "Email", icon: "✉️" },
  { value: "Website", label: "Website / Khác", icon: "🌐" },
];
