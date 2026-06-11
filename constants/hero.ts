export const HERO_BG_SNIPPETS = [
  "const MPC = { mission: 'build' }",
  "async function learn() {",
  "  await explore(['web', 'ai'])",
  "}",
  "git commit -m 'ship it'",
  "while (alive) { code(); }",
  "fn main() { println!('MPC'); }",
  "def hackathon():",
  "    return Victory()",
  "SELECT * FROM dreams",
  "docker run -it mpc/club",
  "use future::*;",
  "console.log('Hello, MPC!')",
  "echo 'Join MPC!' > /dev/club",
  "<h1> Web Design </h1>",
  "0.1 + 0.2 === 0.3 ? 'MPC' : 'Not MPC'",
  "#include <mpc.h>",
  "public class MPC { public static void main(String[] args) { System.out.println('MPC'); } }"
] as const;

export type TerminalLine = { type: "cmd"; text: string } | { type: "output"; i18nKey: string; color: string };

export const TERMINAL_SEQUENCE: TerminalLine[] = [
  { type: "cmd", text: "$ whoami" },
  { type: "output", i18nKey: "whoamiResponse", color: "text-orange-400" },
  { type: "cmd", text: "$ cat /etc/mpc/mission" },
  { type: "output", i18nKey: "missionResponse", color: "text-green-400" },
  { type: "cmd", text: "$ ./activities.py --list" },
  { type: "output", i18nKey: "activitiesResponse", color: "text-blue-300" },
  { type: "cmd", text: "$ cat members.json | jq '.count'" },
  { type: "output", i18nKey: "membersResponse", color: "text-yellow-400" },
  { type: "cmd", text: "$ cat /var/log/mpc/achievements" },
  { type: "output", i18nKey: "achievementsResponse1", color: "text-green-400" },
  { type: "output", i18nKey: "achievementsResponse2", color: "text-green-400" },
  { type: "output", i18nKey: "achievementsResponse3", color: "text-green-400" },
  { type: "cmd", text: "$ ls ./departments/" },
  { type: "output", i18nKey: "departmentsResponse", color: "text-purple-300" },
  { type: "cmd", text: "$ ./join.sh --apply" },
  { type: "output", i18nKey: "joinResponse", color: "text-orange-400" },
  { type: "cmd", text: "$ " }
];

export const CLUB_TAGS = ["Workshop", "Web Design", "Robocode", "Open Source"] as const;

export const PARALLAX_FACTOR = 8;
export const TERMINAL_MAX_LINES = 60;
export const TYPING_SPEED_MS = 25;
export const LINE_PAUSE_MS = 400;
export const CYCLE_PAUSE_MS = 2000;
