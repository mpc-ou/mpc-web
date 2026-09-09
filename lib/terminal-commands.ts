import { CLUB_LINKS, MPC_BANNER, RICKROLL_URL, type StatsData } from "@/constants/terminal";

/* ------------------------------------------------------------------ */
/*  Command context & definition                                       */
/* ------------------------------------------------------------------ */

/** Everything a command handler is allowed to do, injected by the component. */
export type CommandContext = {
  args: string[];
  stats: StatsData | null;
  /** Append a line to the terminal output. */
  print: (text: string, color?: string) => void;
  /** Wipe the screen. */
  clear: () => void;
  /** Leave interactive mode (back to auto-typing). */
  exit: () => void;
  /** Reload the page. */
  reboot: () => void;
  /** "Power off" the site (renders the shutdown overlay). */
  shutdown: () => void;
};

export type CommandCategory = "info" | "link" | "fun";

export type CommandDef = {
  desc: string;
  category: CommandCategory;
  run: (ctx: CommandContext) => void;
};

export const CATEGORY_LABEL: Record<CommandCategory, string> = {
  info: "Info",
  link: "Links",
  fun: "Just for fun"
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const openExternal = (url: string) => window.open(url, "_blank", "noopener");

const CAT_FILES: Record<string, (ctx: CommandContext) => void> = {
  "about.txt": ({ print }) => {
    print("", "text-slate-500");
    print("Mobile Programming Club (MPC) is one of the most dynamic", "text-green-400");
    print("and creative clubs at the Faculty of IT — HCM City Open", "text-green-400");
    print("University. MPC creates an environment for learning,", "text-green-400");
    print("researching and developing IT skills across web, mobile,", "text-green-400");
    print("AI, and more.", "text-green-400");
  },
  "members.json": ({ print, stats }) =>
    print(`{ "count": ${stats?.members ?? "?"}, "status": "active" }`, "text-yellow-400"),
  "projects.yaml": ({ print, stats }) => {
    print(`projects: ${stats?.projects ?? "?"}`, "text-yellow-400");
    print("status: shipped", "text-green-400");
  },
  "events.log": ({ print, stats }) => print(`[LOG] ${stats?.events ?? "?"} events recorded`, "text-purple-300"),
  "achievements.md": ({ print, stats }) => print(`# Achievements: ${stats?.achievements ?? "?"}`, "text-yellow-400"),
  "stats.db": ({ print, stats }) => {
    print("", "text-slate-500");
    print(`Members:      ${stats?.members ?? "..."}`, "text-orange-400");
    print(`Blog Posts:   ${stats?.posts ?? "..."}`, "text-green-400");
    print(`Projects:     ${stats?.projects ?? "..."}`, "text-blue-300");
    print(`Events:       ${stats?.events ?? "..."}`, "text-purple-300");
    print(`Achievements: ${stats?.achievements ?? "..."}`, "text-yellow-400");
  },
  "github.url": ({ print }) => print(CLUB_LINKS.github, "text-blue-300"),
  "fanpage.url": ({ print }) => print(CLUB_LINKS.fanpage, "text-blue-300")
};

/* ------------------------------------------------------------------ */
/*  Command registry                                                   */
/* ------------------------------------------------------------------ */

export const COMMANDS: Record<string, CommandDef> = {
  // ── info ──
  help: {
    desc: "Show available commands",
    category: "info",
    run: ({ print }) => {
      print("", "text-slate-500");
      print("Available commands:", "text-yellow-400");
      for (const category of ["info", "link", "fun"] as const) {
        print("", "text-slate-500");
        print(`  # ${CATEGORY_LABEL[category]}`, "text-purple-300");
        for (const [name, info] of Object.entries(COMMANDS)) {
          if (info.category === category) {
            print(`  ${name.padEnd(12)} — ${info.desc}`, "text-slate-400");
          }
        }
      }
      print("", "text-slate-500");
      print("Tip: start typing to see suggestions, press Tab to autocomplete.", "text-slate-500");
    }
  },
  whoami: {
    desc: "Who is MPC?",
    category: "info",
    run: ({ print }) => {
      print("Mobile Programming Club (MPC)", "text-orange-400");
      print("Faculty of Information Technology", "text-orange-400");
      print("Ho Chi Minh City Open University", "text-orange-400");
      print("Est. 2015", "text-orange-400");
    }
  },
  clear: { desc: "Clear the terminal screen", category: "info", run: ({ clear }) => clear() },
  exit: { desc: "Return to auto-typing mode", category: "info", run: ({ exit }) => exit() },
  ls: {
    desc: "List available info files",
    category: "info",
    run: ({ print }) => {
      print("", "text-slate-500");
      print("about.txt        members.json      projects.yaml", "text-blue-300");
      print("events.log       achievements.md   stats.db", "text-blue-300");
      print("github.url       fanpage.url", "text-blue-300");
      print("", "text-slate-500");
      print("Use 'cat <file>' to view content.", "text-slate-500");
    }
  },
  cat: {
    desc: "Concatenate and display file content",
    category: "info",
    run: (ctx) => {
      const file = ctx.args[0];
      if (!file) {
        ctx.print("Usage: cat <filename>", "text-red-400");
        ctx.print("Try: cat about.txt | cat members.json | cat stats.db", "text-slate-500");
        return;
      }
      const handler = CAT_FILES[file];
      if (handler) {
        handler(ctx);
        return;
      }
      ctx.print(`cat: ${file}: No such file`, "text-red-400");
      ctx.print("Use 'ls' to see available files.", "text-slate-500");
    }
  },
  stats: {
    desc: "Show real-time club statistics",
    category: "info",
    run: ({ print, stats }) => {
      print("", "text-slate-500");
      print("╔════════════════════════════╗", "text-orange-400");
      print("║     MPC LIVE STATISTICS    ║", "text-orange-400");
      print("╚════════════════════════════╝", "text-orange-400");
      print("", "text-slate-500");
      print(`  👥 Active Members:  ${stats?.members ?? "..."}`, "text-yellow-400");
      print(`  📝 Blog Posts:      ${stats?.posts ?? "..."}`, "text-green-400");
      print(`  🚀 Projects:        ${stats?.projects ?? "..."}`, "text-blue-300");
      print(`  📅 Events:          ${stats?.events ?? "..."}`, "text-purple-300");
      print(`  🏆 Achievements:    ${stats?.achievements ?? "..."}`, "text-yellow-400");
      print("", "text-slate-500");
    }
  },
  echo: { desc: "Print a line of text", category: "info", run: ({ print, args }) => print(args.join(" ") || "") },
  date: {
    desc: "Display current date and time",
    category: "info",
    run: ({ print }) => print(new Date().toString(), "text-green-400")
  },
  banner: {
    desc: "Show the MPC ASCII banner",
    category: "info",
    run: ({ print }) => print(MPC_BANNER, "text-orange-400")
  },
  join: {
    desc: "How to join MPC",
    category: "info",
    run: ({ print }) => {
      print("", "text-slate-500");
      print("🎉  How to join MPC:", "text-orange-400");
      print("  1. Follow our Facebook fanpage for recruitment news", "text-slate-300");
      print("  2. Fill out the online registration form", "text-slate-300");
      print("  3. Participate in the interview round", "text-slate-300");
      print("  4. Welcome aboard! 🚀", "text-slate-300");
      print("", "text-slate-500");
      print("Type 'fanpage' to open our Facebook page.", "text-slate-500");
    }
  },

  // ── links (use real data from configs/data/about.ts) ──
  github: {
    desc: "Open MPC GitHub organization",
    category: "link",
    run: ({ print }) => {
      print(`Opening ${CLUB_LINKS.github} ...`, "text-green-400");
      openExternal(CLUB_LINKS.github);
    }
  },
  fanpage: {
    desc: "Open MPC Facebook fanpage",
    category: "link",
    run: ({ print }) => {
      print(`Opening ${CLUB_LINKS.fanpage} ...`, "text-green-400");
      openExternal(CLUB_LINKS.fanpage);
    }
  },
  email: {
    desc: "Show MPC contact email",
    category: "link",
    run: ({ print }) => print(CLUB_LINKS.email, "text-blue-300")
  },

  // ── just for fun ──
  restart: {
    desc: "Reboot this website",
    category: "fun",
    run: ({ print, reboot }) => {
      print("Rebooting MPC website...", "text-yellow-400");
      print("[####################] 100%", "text-green-400");
      reboot();
    }
  },
  shutdown: {
    desc: "Power off this website",
    category: "fun",
    run: ({ print, shutdown }) => {
      print("Initiating shutdown sequence...", "text-red-400");
      print("Goodbye! 👋", "text-slate-400");
      shutdown();
    }
  },
  rickroll: {
    desc: "???",
    category: "fun",
    run: ({ print }) => {
      print("Never gonna give you up, never gonna let you down... 🎵", "text-pink-400");
      openExternal(RICKROLL_URL);
    }
  },
  sudo: {
    desc: "Try to gain root access",
    category: "fun",
    run: ({ print, args }) => {
      print(`${args.join(" ") || "su"}: Permission denied`, "text-red-400");
      print("User 'guest' is not in the sudoers file.", "text-red-400");
      print("This incident will be reported. 📸", "text-slate-500");
    }
  },
  matrix: {
    desc: "Wake up...",
    category: "fun",
    run: ({ print }) => {
      print("Wake up, Neo...", "text-green-400");
      print("The Matrix has you 🐇", "text-green-400");
      print(Array.from({ length: 40 }, () => (Math.random() > 0.5 ? "1" : "0")).join(""), "text-green-500");
    }
  },
  coffee: {
    desc: "Brew a cup of coffee",
    category: "fun",
    run: ({ print }) => {
      print("Brewing coffee ☕ ...", "text-yellow-600");
      print("Error 418: I'm a teapot.", "text-red-400");
    }
  },
  konami: {
    desc: "↑↑↓↓←→←→BA",
    category: "fun",
    run: ({ print }) => {
      print("↑ ↑ ↓ ↓ ← → ← → B A", "text-yellow-400");
      print("30 extra lives granted. Use them wisely. 🕹️", "text-green-400");
    }
  }
};

export const ALL_COMMANDS = Object.keys(COMMANDS);

export function getSuggestions(input: string): string[] {
  if (!input) {
    return [];
  }
  const lower = input.toLowerCase();
  return ALL_COMMANDS.filter((cmd) => cmd.startsWith(lower)).slice(0, 5);
}
