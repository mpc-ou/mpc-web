"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Terminal, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AUTO_SEQUENCE,
  CYCLE_PAUSE_MS,
  LINE_PAUSE_MS,
  MPC_BANNER,
  type StatsData,
  type TerminalLine,
  TYPING_SPEED_MS
} from "@/constants/terminal";
import { COMMANDS, type CommandContext, getSuggestions } from "@/lib/terminal-commands";

const WHITESPACE_RE = /\s+/;

let _id = 0;
function nextId() {
  return ++_id;
}

const CLICK_RUNNABLE = new Set(["help", "whoami", "clear", "ls", "stats", "banner", "date"]);

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

function ShutdownOverlay() {
  return createPortal(
    <motion.div
      animate={{ opacity: 1 }}
      className='fixed inset-0 flex flex-col items-center justify-center bg-black font-mono text-green-500 text-sm'
      initial={{ opacity: 0 }}
      style={{ zIndex: 2_147_483_647 }}
      transition={{ duration: 0.4 }}
    >
      <div className='animate-pulse'>Shutting down MPC systems...</div>
      <div className='mt-2 h-2 w-2 animate-ping rounded-full bg-green-500' />
    </motion.div>,
    document.body
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
  const [mode, setMode] = useState<"auto" | "interactive">("auto");
  const [shuttingDown, setShuttingDown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const [autoLines, setAutoLines] = useState<TerminalLine[]>([]);
  const seqIdxRef = useRef(0);
  const charIdxRef = useRef(0);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: history is read via the ref, but its identity is the intended re-scroll trigger
  useEffect(() => {
    if (interactiveScrollRef.current) {
      interactiveScrollRef.current.scrollTop = interactiveScrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (mode === "interactive" && !isProcessing) {
      inputRef.current?.focus();
    }
  }, [mode, isProcessing]);

  // ── Update suggestions as user types ──
  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    setSuggestions(getSuggestions(value));
  }, []);

  // ═══════════════════════════════════════════
  //  Command processor
  // ═══════════════════════════════════════════

  const addLine = useCallback((text: string, color = "text-slate-300") => {
    setHistory((prev) => [...prev, { id: nextId(), text, color }]);
  }, []);

  const executeCommand = useCallback(
    async (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) {
        return;
      }

      addLine(`$ ${cmd}`, "text-cyan-400");

      const parts = cmd.split(WHITESPACE_RE);
      const base = (parts[0] ?? "").toLowerCase();
      const args = parts.slice(1);

      setIsProcessing(true);

      await new Promise((r) => setTimeout(r, 100));

      const command = COMMANDS[base];
      if (command) {
        const ctx: CommandContext = {
          args,
          stats,
          print: addLine,
          clear: () => setHistory([]),
          exit: () => setMode("auto"),
          reboot: () => setTimeout(() => window.location.reload(), 900),
          shutdown: () => setTimeout(() => setShuttingDown(true), 600)
        };
        command.run(ctx);
      } else {
        addLine(`bash: ${base}: command not found`, "text-red-400");
        addLine("Type 'help' to see available commands.", "text-slate-500");
      }

      setIsProcessing(false);
    },
    [addLine, stats]
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
      // Auto-execute simple, side-effect-free commands on click
      if (CLICK_RUNNABLE.has(cmd)) {
        executeCommand(cmd);
        setInput("");
      }
    },
    [executeCommand]
  );

  // ── Handle Tab autocomplete ──
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Tab") {
        return;
      }
      e.preventDefault();
      if (suggestions.length === 1) {
        setInput(suggestions[0] ?? "");
        setSuggestions([]);
      } else if (suggestions.length > 0) {
        // Reduce to the common prefix of all suggestions
        const prefix = suggestions.reduce((acc, s) => {
          let i = 0;
          while (i < acc.length && i < s.length && acc[i] === s[i]) {
            i++;
          }
          return acc.slice(0, i);
        });
        setInput(prefix);
      }
    },
    [suggestions]
  );

  const openInteractive = useCallback(() => setMode("interactive"), []);

  // ═══════════════════════════════════════════
  //  Render
  // ═══════════════════════════════════════════

  if (shuttingDown) {
    return mounted ? <ShutdownOverlay /> : null;
  }

  const overlay = mode === "interactive" && (
    <motion.div
      animate={{ opacity: 1 }}
      className='fixed inset-0 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md'
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onClick={(e) => {
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

        <div
          className='flex-1 overflow-y-auto scroll-smooth whitespace-pre p-5 font-mono text-sm leading-relaxed'
          ref={interactiveScrollRef}
        >
          {history.length === 0 && (
            <div className='mb-4'>
              <div className='text-orange-400'>{MPC_BANNER}</div>
              <div className='mt-3 text-slate-500'>
                Type <span className='text-cyan-400'>help</span> to see available commands. Type{" "}
                <span className='text-cyan-400'>exit</span> or click the red button to close.
              </div>
              <div className='h-4' />
            </div>
          )}

          {history.map((line) => (
            <div className={line.color} key={line.id}>
              {line.text}
            </div>
          ))}
        </div>

        <SuggestionBar onSelect={handleSuggestionClick} suggestions={suggestions} />
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
  );

  return (
    <>
      <button
        className='group w-full max-w-lg animate-fade-in-up cursor-pointer text-left opacity-0 [animation-delay:300ms]'
        onClick={openInteractive}
        type='button'
      >
        <div className='overflow-hidden rounded-xl border border-border-subtle bg-card shadow-xl transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-glow-primary'>
          <div className='flex items-center gap-2 border-slate-700/50 border-b bg-slate-900/80 px-4 py-3'>
            <div className='h-3 w-3 rounded-full bg-red-500/80' />
            <div className='h-3 w-3 rounded-full bg-yellow-500/80' />
            <div className='h-3 w-3 rounded-full bg-green-500/80' />
            <span className='ml-3 font-mono text-slate-400 text-xs'>mpc@terminal ~/MPC</span>
            <span className='ml-auto font-mono text-[10px] text-slate-600'>click to interact</span>
          </div>
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

        {tags.length > 0 && (
          <div className='mt-4 flex flex-wrap justify-center gap-2'>
            {tags.map((tag) => (
              <span
                className='rounded-full border border-border bg-muted/50 px-3 py-1 font-mono text-muted-foreground text-xs transition-colors hover:border-orange-500/40 hover:text-orange-600 dark:border-slate-700/60 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:text-orange-400'
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </button>

      {mounted && createPortal(<AnimatePresence>{overlay}</AnimatePresence>, document.body)}
    </>
  );
}
