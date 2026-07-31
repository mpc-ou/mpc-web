import { ABOUT_CLUB } from "@/configs/data/about";

export type TerminalLine = {
  id: number;
  text: string;
  color: string;
  isCommand?: boolean;
};

export type StatsData = {
  members: number;
  posts: number;
  projects: number;
  events: number;
  achievements: number;
  github: string;
  fanpage: string;
};

export const CLUB_LINKS = {
  github: ABOUT_CLUB.contact.github,
  fanpage: ABOUT_CLUB.contact.facebook,
  email: ABOUT_CLUB.contact.email,
  faculty: ABOUT_CLUB.contact.facultyWebsite,
  university: ABOUT_CLUB.contact.universityWebsite
} as const;

export const RICKROLL_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

/* ------------------------------------------------------------------ */
/*  Timings                                                            */
/* ------------------------------------------------------------------ */

export const TYPING_SPEED_MS = 25;
export const LINE_PAUSE_MS = 400;
export const CYCLE_PAUSE_MS = 2000;

/* ------------------------------------------------------------------ */
/*  Auto-typing sequence (English only, no i18n)                       */
/* ------------------------------------------------------------------ */

export const AUTO_SEQUENCE: { text: string; color: string }[] = [
  { text: "$ whoami", color: "text-cyan-400" },
  { text: "Mobile Programming Club", color: "text-orange-400" },
  { text: "$ cat /etc/mpc/mission", color: "text-cyan-400" },
  { text: "\"Where there's a bug, there's MPC!\"", color: "text-green-400" },
  { text: "$ ./activities.py --list", color: "text-cyan-400" },
  {
    text: "Workshop  |  Web Design  |  Robocode  |  Teambuilding  |  Seminar",
    color: "text-blue-300"
  },
  { text: "$ cat members.json | jq '.count'", color: "text-cyan-400" },
  { text: "50+ active members", color: "text-yellow-400" },
  { text: "$ cat /var/log/mpc/achievements", color: "text-cyan-400" },
  { text: "[INFO] 10+ years active", color: "text-green-400" },
  { text: "[INFO] 30+ events organized", color: "text-green-400" },
  { text: "[INFO] 10+ projects completed", color: "text-green-400" },
  { text: "$ ls ./departments/", color: "text-cyan-400" },
  { text: "Programming/  Events/  Communications/", color: "text-purple-300" },
  { text: "$ ./join.sh --apply", color: "text-cyan-400" },
  { text: "Now recruiting... visit MPC fanpage", color: "text-orange-400" },
  { text: "$ ", color: "text-cyan-400" }
];

/* ------------------------------------------------------------------ */
/*  MPC ASCII Banner                                                   */
/* ------------------------------------------------------------------ */

export const MPC_BANNER = [
  "╔═══════════════════════════════════════════════╗",
  "║                                               ║",
  "║   ███╗   ███╗ ██████╗   ██████╗               ║",
  "║   ████╗ ████║ ██╔══██╗ ██╔════╝               ║",
  "║   ██╔████╔██║ ██████╔╝ ██║                    ║",
  "║   ██╔╝   ╚██║ ██╔═══╝  ██║                    ║",
  "║   ██║     ██║ ██║      ██████╗                ║",
  "║   ╚═╝     ╚═╝ ╚═╝      ╚═════╝                ║",
  "║                                               ║",
  "║   Mobile Programming Club                     ║",
  "║   Faculty of IT - HCM City Open University    ║",
  "║   Est. 2015  ·  Type 'help' for commands      ║",
  "║                                               ║",
  "╚═══════════════════════════════════════════════╝"
].join("\n");
