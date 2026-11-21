"use client";

import { motion } from "framer-motion";
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
const MAX_AUTO_LINES = 14;

let _id = 0;
function nextId() {
  return ++_id;
}

const CLICK_RUNNABLE = new Set(["help", "whoami", "clear", "ls", "stats", "banner", "date"]);

export function useAutoTyping(enabled: boolean) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const seqIdxRef = useRef(0);
  const charIdxRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let timer: ReturnType<typeof setTimeout>;

    const run = () => {
      const seq = AUTO_SEQUENCE[seqIdxRef.current];
      if (!seq) {
        timer = setTimeout(() => {
          seqIdxRef.current = 0;
          charIdxRef.current = 0;
          setLines([]);
          run();
        }, CYCLE_PAUSE_MS);
        return;
      }

      if (charIdxRef.current === 0) {
        setLines((prev) => [...prev, { id: nextId(), text: "", color: seq.color }].slice(-MAX_AUTO_LINES));
      }

      if (charIdxRef.current < seq.text.length) {
        const char = seq.text[charIdxRef.current] ?? "";
        setLines((prev) => {
          const next = [...prev];
          const last = next.at(-1);
          if (last) {
            next[next.length - 1] = { ...last, text: last.text + char };
          }
          return next;
        });
        charIdxRef.current += 1;
        timer = setTimeout(run, TYPING_SPEED_MS);
      } else {
        charIdxRef.current = 0;
        seqIdxRef.current += 1;
        timer = setTimeout(run, LINE_PAUSE_MS);
      }
    };

    timer = setTimeout(run, 600);
    return () => clearTimeout(timer);
  }, [enabled]);

  return lines;
}

function SuggestionBar({ suggestions, onSelect }: { suggestions: string[]; onSelect: (cmd: string) => void }) {
  if (suggestions.length === 0) {
    return null;
  }
  return (
    <div className='flex flex-wrap gap-2 px-4 py-1.5 font-mono text-[11px]'>
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

type SessionProps = {
  stats: StatsData | null;
  onExit: () => void;
};

export function TerminalSession({ stats, onExit }: SessionProps) {
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shuttingDown, setShuttingDown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: history identity is the intended re-scroll trigger
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (!isProcessing) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [isProcessing]);

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
          exit: onExit,
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
    [addLine, stats, onExit]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) {
      return;
    }
    const cmd = input;
    setInput("");
    setSuggestions([]);
    executeCommand(cmd);
  };

  const handleSuggestionClick = (cmd: string) => {
    setInput(cmd);
    setSuggestions([]);
    inputRef.current?.focus();
    if (CLICK_RUNNABLE.has(cmd)) {
      executeCommand(cmd);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") {
      return;
    }
    e.preventDefault();
    if (suggestions.length === 1) {
      setInput(suggestions[0] ?? "");
      setSuggestions([]);
    } else if (suggestions.length > 0) {
      const prefix = suggestions.reduce((acc, s) => {
        let i = 0;
        while (i < acc.length && i < s.length && acc[i] === s[i]) {
          i++;
        }
        return acc.slice(0, i);
      });
      setInput(prefix);
    }
  };

  if (shuttingDown) {
    return <ShutdownOverlay />;
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div
        className='min-h-0 flex-1 overflow-y-auto whitespace-pre p-5 font-mono text-sm leading-relaxed'
        ref={scrollRef}
        role='log'
      >
        {history.length === 0 && (
          <div className='mb-4'>
            <div className='text-orange-400'>{MPC_BANNER}</div>
            <div className='mt-3 text-slate-500'>
              Type <span className='text-cyan-400'>help</span> to see available commands. Type{" "}
              <span className='text-cyan-400'>exit</span>, press <span className='text-cyan-400'>Esc</span> or click ✕
              to close.
            </div>
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
          onChange={(e) => {
            setInput(e.target.value);
            setSuggestions(getSuggestions(e.target.value));
          }}
          onKeyDown={handleKeyDown}
          placeholder={isProcessing ? "Processing..." : "Type a command..."}
          ref={inputRef}
          spellCheck={false}
          type='text'
          value={input}
        />
        {isProcessing && <span className='ml-1 inline-block h-4 w-2 animate-pulse bg-cyan-400' />}
      </form>
    </div>
  );
}
