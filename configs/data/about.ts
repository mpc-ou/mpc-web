export const ABOUT_FIELDS = [
  { key: "web", image: "/images/bg/web.png" },
  { key: "dsa", image: "/images/bg/algo.jpg" },
  { key: "ai", image: "/images/bg/ai.jpg" },
  { key: "android", image: "/images/bg/mobile.jpg" }
] as const;

export type AboutFieldKey = (typeof ABOUT_FIELDS)[number]["key"];

export const ABOUT_CLUB = {
  fullName: {
    en: "Mobile Programming Club",
    vi: "Câu lạc bộ lập trình trên thiết bị di động"
  },
  shortName: { en: "MPC", vi: "MPC" },
  logo: "/images/logo.png",
  description: {
    en: "A club for computer science students to explore and learn about the latest technologies.",
    vi: "Một câu lạc bộ cho sinh viên khoa học máy tính để khám phá và học hỏi về các công nghệ mới nhất."
  },
  slogan: {
    en: "Where there is a bug, there is MPC!",
    vi: "Ở đâu có bug, ở đó có MPC!"
  },
  contact: {
    email: "it.mpclub@ou.edu.vn",
    facebook: "https://www.facebook.com/CLBLapTrinhTrenThietBiDiDong",
    github: "https://github.com/mpc-ou",
    facultyWebsite: "https://it.ou.edu.vn",
    universityWebsite: "https://www.ou.edu.vn",
    linkedin: "https://www.linkedin.com/company/123374029"
  }
} as const;
