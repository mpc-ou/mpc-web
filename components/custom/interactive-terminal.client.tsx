"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Terminal, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Data types                                                         */
/* ------------------------------------------------------------------ */

type TerminalLine = {
  id: number;
  text: string;
  color: string;
  isCommand?: boolean;
};

type StatsData = {
  members: number;
  posts: number;
  projects: number;
  events: number;
  achievements: number;
  github: string;
  fanpage: string;
};

/* ------------------------------------------------------------------ */
/*  Auto-typing sequence (English only, no i18n)                       */
/* ------------------------------------------------------------------ */

const AUTO_SEQUENCE: { text: string; color: string }[] = [
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

const TYPING_SPEED_MS = 25;
const LINE_PAUSE_MS = 400;
const CYCLE_PAUSE_MS = 2000;

/* ------------------------------------------------------------------ */
/*  Terminal commands & suggestions                                    */
/* ------------------------------------------------------------------ */

const COMMANDS: Record<string, { desc: string; handler: string }> = {
  whoami: { desc: "Who is MPC?", handler: "whoami" },
  help: { desc: "Show available commands", handler: "help" },
  clear: { desc: "Clear the terminal screen", handler: "clear" },
  exit: { desc: "Return to auto-typing mode", handler: "exit" },
  ls: { desc: "List available info files", handler: "ls" },
  stats: { desc: "Show real-time club statistics", handler: "stats" },
  github: { desc: "Open MPC GitHub organization", handler: "github" },
  fanpage: { desc: "Open MPC Facebook fanpage", handler: "fanpage" },
  echo: { desc: "Print a line of text", handler: "echo" },
  cat: { desc: "Concatenate and display file content", handler: "cat" },
  date: { desc: "Display current date and time", handler: "date" },
  banner: { desc: "Show the MPC ASCII banner", handler: "banner" },
  join: { desc: "How to join MPC", handler: "join" }
} as const;

const ALL_COMMANDS = Object.keys(COMMANDS);

function getSuggestions(input: string): string[] {
  if (!input) {
    return [];
  }
  const lower = input.toLowerCase();
  return ALL_COMMANDS.filter((cmd) => cmd.startsWith(lower)).slice(0, 5);
}

/* ------------------------------------------------------------------ */
/*  MPC ASCII Banner                                                   */
/* ------------------------------------------------------------------ */

const MPC_BANNER = [
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
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let _id = 0;
function nextId() {
  return ++_id;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SuggestionBar({ suggestions, onSelect }: { suggestions: string[]; onSelect: (cmd: string) => void }) {
  if (suggestions.length === 0) {
    return null;
  }
  return (
    <div className='flex gap-2 px-4 py-1.5 font-mono text-[11px]'>
      <span className='shrink-0 text-slate-500'>suggestions:</span>
      {suggestions.map((s) => (
        <button
          className='cursor-pointer rounded border border-slate-700/60 bg-slate-800/60 px-2 py-0.5 text-slate-400 transition-colors hover:border-orange-500/50 hover:text-orange-400'
          key={s}
          onClick={() => onSelect(s)}
          type='button'
        >
          {s}
        </button>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

type Props = {
  stats: StatsData | null;
  tags?: readonly string[];
};

export function InteractiveTerminal({ stats, tags = [] }: Props) {
  // ── mode: "auto" | "interactive" ──
  const [mode, setMode] = useState<"auto" | "interactive">("auto");
  const [statsData, setStatsData] = useState<StatsData | null>(stats);

  // ── auto-typing state ──
  const [autoLines, setAutoLines] = useState<TerminalLine[]>([]);
  const seqIdxRef = useRef(0);
  const charIdxRef = useRef(0);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── interactive state ──
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const interactiveScrollRef = useRef<HTMLDivElement>(null);

  // ═══════════════════════════════════════════
  //  Auto-typing engine
  // ═══════════════════════════════════════════

  useEffect(() => {
    if (mode !== "auto") {
      return;
    }

    const run = () => {
      const seq = AUTO_SEQUENCE[seqIdxRef.current];
      if (!seq) {
        autoTimerRef.current = setTimeout(() => {
          seqIdxRef.current = 0;
          charIdxRef.current = 0;
          setAutoLines([]);
          run();
        }, CYCLE_PAUSE_MS);
        return;
      }

      if (charIdxRef.current === 0) {
        setAutoLines((prev) => [...prev, { id: nextId(), text: "", color: seq.color }]);
      }

      if (charIdxRef.current < seq.text.length) {
        const char = seq.text[charIdxRef.current] ?? "";
        setAutoLines((prev) => {
          const next = [...prev];
          const last = next.at(-1);
          if (last) {
            next[next.length - 1] = { ...last, text: last.text + char };
          }
          return next;
        });
        charIdxRef.current += 1;
        autoTimerRef.current = setTimeout(run, TYPING_SPEED_MS);
      } else {
        charIdxRef.current = 0;
        seqIdxRef.current += 1;
        autoTimerRef.current = setTimeout(run, LINE_PAUSE_MS);
      }
    };

    autoTimerRef.current = setTimeout(run, 600);
    return () => {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
      }
    };
  }, [mode]);

  // Auto-scroll for auto mode
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Auto-scroll for interactive mode
  useEffect(() => {
    if (interactiveScrollRef.current) {
      interactiveScrollRef.current.scrollTop = interactiveScrollRef.current.scrollHeight;
    }
  }, []);

  // ── Focus input when entering interactive mode ──
  useEffect(() => {
    if (mode === "interactive") {
      // Small delay for the overlay to render
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [mode]);

  // ── Update suggestions as user types ──
  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    setSuggestions(getSuggestions(value));
  }, []);

  // ═══════════════════════════════════════════
  //  Command processor
  // ═══════════════════════════════════════════

  const addLine = useCallback((text: string, color = "text-slate-300", isCommand = false) => {
    setHistory((prev) => [...prev, { id: nextId(), text, color, isCommand }]);
  }, []);

  const executeCommand = useCallback(
    async (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) {
        return;
      }

      addLine(`$ ${cmd}`, "text-cyan-400", true);

      const parts = cmd.split(/\s+/);
      const base = (parts[0] ?? "").toLowerCase();
      const args = parts.slice(1);

      setIsProcessing(true);

      // Small delay for realism
      await new Promise((r) => setTimeout(r, 100));

      switch (base) {
        case "help": {
          addLine("", "text-slate-500");
          addLine("Available commands:", "text-yellow-400");
          for (const [name, info] of Object.entries(COMMANDS)) {
            addLine(`  ${name.padEnd(12)} — ${info.desc}`, "text-slate-400");
          }
          addLine("", "text-slate-500");
          addLine("Tip: start typing to see suggestions, press Tab to autocomplete.", "text-slate-500");
          break;
        }

        case "whoami": {
          addLine("Mobile Programming Club (MPC)", "text-orange-400");
          addLine("Faculty of Information Technology", "text-orange-400");
          addLine("Ho Chi Minh City Open University", "text-orange-400");
          addLine("Est. 2015", "text-orange-400");
          break;
        }

        case "clear": {
          setHistory([]);
          break;
        }

        case "exit": {
          setMode("auto");
          break;
        }

        case "ls": {
          addLine("", "text-slate-500");
          addLine("about.txt        members.json      projects.yaml", "text-blue-300");
          addLine("events.log       achievements.md   stats.db", "text-blue-300");
          addLine("github.url       fanpage.url", "text-blue-300");
          addLine("", "text-slate-500");
          addLine("Use 'cat <file>' to view content.", "text-slate-500");
          break;
        }

        case "cat": {
          const file = args[0];
          if (!file) {
            addLine("Usage: cat <filename>", "text-red-400");
            addLine("Try: cat about.txt | cat members.json | cat stats.db", "text-slate-500");
            break;
          }

          switch (file) {
            case "about.txt":
              addLine("", "text-slate-500");
              addLine("Mobile Programming Club (MPC) is one of the most dynamic", "text-green-400");
              addLine("and creative clubs at the Faculty of IT — HCM City Open", "text-green-400");
              addLine("University. MPC creates an environment for learning,", "text-green-400");
              addLine("researching and developing IT skills across web, mobile,", "text-green-400");
              addLine("AI, and more.", "text-green-400");
              break;
            case "members.json":
              addLine(`{ "count": ${statsData?.members ?? "?"}, "status": "active" }`, "text-yellow-400");
              break;
            case "projects.yaml":
              addLine(`projects: ${statsData?.projects ?? "?"}`, "text-yellow-400");
              addLine("status: shipped", "text-green-400");
              break;
            case "events.log":
              addLine(`[LOG] ${statsData?.events ?? "?"} events recorded`, "text-purple-300");
              break;
            case "achievements.md":
              addLine(`# Achievements: ${statsData?.achievements ?? "?"}`, "text-yellow-400");
              break;
            case "stats.db":
              addLine("", "text-slate-500");
              addLine(`Members:      ${statsData?.members ?? "..."}`, "text-orange-400");
              addLine(`Blog Posts:   ${statsData?.posts ?? "..."}`, "text-green-400");
              addLine(`Projects:     ${statsData?.projects ?? "..."}`, "text-blue-300");
              addLine(`Events:       ${statsData?.events ?? "..."}`, "text-purple-300");
              addLine(`Achievements: ${statsData?.achievements ?? "..."}`, "text-yellow-400");
              break;
            case "github.url":
              addLine(statsData?.github ?? "https://github.com/Mobile-Programming-Club-MPC", "text-blue-300");
              break;
            case "fanpage.url":
              addLine(statsData?.fanpage ?? "https://www.facebook.com/CLBLapTrinhTrenThietBiDiDong", "text-blue-300");
              break;
            default:
              addLine(`cat: ${file}: No such file`, "text-red-400");
              addLine("Use 'ls' to see available files.", "text-slate-500");
          }
          break;
        }

        case "stats": {
          addLine("", "text-slate-500");
          addLine("╔════════════════════════════╗", "text-orange-400");
          addLine("║     MPC LIVE STATISTICS    ║", "text-orange-400");
          addLine("╚════════════════════════════╝", "text-orange-400");
          addLine("", "text-slate-500");
          addLine(`  👥 Active Members:  ${statsData?.members ?? "..."}`, "text-yellow-400");
          addLine(`  📝 Blog Posts:      ${statsData?.posts ?? "..."}`, "text-green-400");
          addLine(`  🚀 Projects:        ${statsData?.projects ?? "..."}`, "text-blue-300");
          addLine(`  📅 Events:          ${statsData?.events ?? "..."}`, "text-purple-300");
          addLine(`  🏆 Achievements:    ${statsData?.achievements ?? "..."}`, "text-yellow-400");
          addLine("", "text-slate-500");
          break;
        }

        case "github": {
          const gh = statsData?.github ?? "https://github.com/Mobile-Programming-Club-MPC";
          addLine(`Opening ${gh} ...`, "text-green-400");
          window.open(gh, "_blank", "noopener");
          break;
        }

        case "fanpage": {
          const fp = statsData?.fanpage ?? "https://www.facebook.com/CLBLapTrinhTrenThietBiDiDong";
          addLine(`Opening ${fp} ...`, "text-green-400");
          window.open(fp, "_blank", "noopener");
          break;
        }

        case "echo": {
          addLine(args.join(" ") || "", "text-slate-300");
          break;
        }

        case "date": {
          addLine(new Date().toString(), "text-green-400");
          break;
        }

        case "banner": {
          for (const line of MPC_BANNER) {
            addLine(line, "text-orange-400");
          }
          break;
        }

        case "join": {
          addLine("", "text-slate-500");
          addLine("🎉  How to join MPC:", "text-orange-400");
          addLine("  1. Follow our Facebook fanpage for recruitment news", "text-slate-300");
          addLine("  2. Fill out the online registration form", "text-slate-300");
          addLine("  3. Participate in the interview round", "text-slate-300");
          addLine("  4. Welcome aboard! 🚀", "text-slate-300");
          addLine("", "text-slate-500");
          addLine("Type 'fanpage' to open our Facebook page.", "text-slate-500");
          break;
        }

        default: {
          addLine(`bash: ${base}: command not found`, "text-red-400");
          addLine("Type 'help' to see available commands.", "text-slate-500");
        }
      }

      setIsProcessing(false);
      // Refocus input after command execution
      inputRef.current?.focus();
    },
    [addLine, statsData]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isProcessing) {
        return;
      }
      const cmd = input;
      setInput("");
      setSuggestions([]);
      executeCommand(cmd);
    },
    [input, isProcessing, executeCommand]
  );

  const handleSuggestionClick = useCallback(
    (cmd: string) => {
      setInput(cmd);
      setSuggestions([]);
      inputRef.current?.focus();
      // Auto-execute simple commands on click
      if (["help", "whoami", "clear", "ls", "stats", "banner", "date"].includes(cmd)) {
        executeCommand(cmd);
        setInput("");
      }
    },
    [executeCommand]
  );

  // ── Handle Tab autocomplete ──
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        if (suggestions.length === 1) {
          setInput(suggestions[0] ?? "");
          setSuggestions([]);
        } else if (suggestions.length > 0) {
          // Find common prefix
          const prefix = suggestions.reduce((acc, s) => {
            let i = 0;
            while (i < acc.length && i < s.length && acc[i] === s[i]) {
              i++;
            }
            return acc.slice(0, i);
          });
          setInput(prefix);
        }
      }
    },
    [suggestions]
  );

  // ═══════════════════════════════════════════
  //  Render
  // ═══════════════════════════════════════════

  return (
    <>
      {/* ── Auto-typing mini terminal (always visible in hero) ── */}
      <div
        className='group w-full max-w-lg animate-fade-in-up cursor-pointer opacity-0 [animation-delay:300ms]'
        onClick={() => setMode("interactive")}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setMode("interactive");
          }
        }}
        role='button'
        tabIndex={0}
      >
        <div className='overflow-hidden rounded-xl border border-slate-700/50 bg-[#0D1117] shadow-xl transition-shadow duration-300 group-hover:border-orange-500/40 group-hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]'>
          {/* Title bar */}
          <div className='flex items-center gap-2 border-slate-700/50 border-b bg-slate-900/80 px-4 py-3'>
            <div className='h-3 w-3 rounded-full bg-red-500/80' />
            <div className='h-3 w-3 rounded-full bg-yellow-500/80' />
            <div className='h-3 w-3 rounded-full bg-green-500/80' />
            <span className='ml-3 font-mono text-slate-400 text-xs'>mpc@terminal ~/MPC</span>
            <span className='ml-auto font-mono text-[10px] text-slate-600'>click to interact</span>
          </div>
          {/* Terminal body */}
          <div className='h-64 overflow-y-auto scroll-smooth p-5 font-mono text-sm leading-relaxed' ref={scrollRef}>
            {autoLines.map((line) => (
              <div className={line.color} key={line.id}>
                {line.text}
                {line === autoLines.at(-1) && mode === "auto" && (
                  <span className='ml-0.5 inline-block h-4 w-2 animate-pulse bg-cyan-400 align-middle' />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tags below terminal */}
        {tags.length > 0 && (
          <div className='mt-4 flex flex-wrap justify-center gap-2'>
            {tags.map((tag) => (
              <span
                className='cursor-pointer rounded-full border border-border bg-muted/50 px-3 py-1 font-mono text-muted-foreground text-xs transition-colors hover:border-orange-500/40 hover:text-orange-600 dark:border-slate-700/60 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:text-orange-400'
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Full-screen interactive overlay ── */}
      <AnimatePresence>
        {mode === "interactive" && (
          <motion.div
            animate={{ opacity: 1 }}
            className='fixed inset-0 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md'
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={(e) => {
              // Close overlay when clicking backdrop
              if (e.target === e.currentTarget) {
                setMode("auto");
              }
            }}
            style={{ zIndex: 9999 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{ scale: 1, y: 0 }}
              className='flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-700/60 bg-[#0D1117] shadow-2xl'
              exit={{ scale: 0.9, y: 20 }}
              initial={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {/* Title bar */}
              <div className='flex shrink-0 items-center gap-2 border-slate-700/50 border-b bg-slate-900/90 px-4 py-3'>
                <button
                  aria-label='Close terminal'
                  className='h-3 w-3 cursor-pointer rounded-full bg-red-500/80 transition-colors hover:bg-red-500'
                  onClick={() => setMode("auto")}
                  type='button'
                />
                <div className='h-3 w-3 rounded-full bg-yellow-500/80' />
                <div className='h-3 w-3 rounded-full bg-green-500/80' />
                <Terminal className='ml-3 h-3.5 w-3.5 text-orange-400' />
                <span className='font-mono text-slate-400 text-xs'>mpc@terminal ~/MPC</span>
                <button
                  aria-label='Minimize terminal'
                  className='ml-auto cursor-pointer rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300'
                  onClick={() => setMode("auto")}
                  type='button'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              </div>

              {/* Terminal body */}
              <div
                className='flex-1 overflow-y-auto scroll-smooth whitespace-pre p-5 font-mono text-sm leading-relaxed'
                ref={interactiveScrollRef}
              >
                {/* Welcome banner */}
                {history.length === 0 && (
                  <div className='mb-4'>
                    {MPC_BANNER.map((line, i) => (
                      <div className='text-orange-400' key={i}>
                        {line}
                      </div>
                    ))}
                    <div className='mt-3 text-slate-500'>
                      Type <span className='text-cyan-400'>help</span> to see available commands. Type{" "}
                      <span className='text-cyan-400'>exit</span> or click the red button to close.
                    </div>
                    <div className='h-4' />
                  </div>
                )}

                {/* Command history */}
                {history.map((line) => (
                  <div className={line.color} key={line.id}>
                    {line.text}
                  </div>
                ))}
              </div>

              {/* Suggestion bar */}
              <SuggestionBar onSelect={handleSuggestionClick} suggestions={suggestions} />

              {/* Input line */}
              <form
                className='flex shrink-0 items-center border-slate-700/50 border-t bg-slate-900/80 px-4 py-3'
                onSubmit={handleSubmit}
              >
                <span className='shrink-0 font-mono text-cyan-400 text-sm'>$</span>
                <input
                  aria-label='Terminal command input'
                  autoComplete='off'
                  className='ml-2 flex-1 bg-transparent font-mono text-slate-200 text-sm outline-none placeholder:text-slate-600'
                  disabled={isProcessing}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isProcessing ? "Processing..." : "Type a command..."}
                  ref={inputRef}
                  spellCheck={false}
                  type='text'
                  value={input}
                />
                {isProcessing && <span className='ml-1 inline-block h-4 w-2 animate-pulse bg-cyan-400' />}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
