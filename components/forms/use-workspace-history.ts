"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_HISTORY = 100;

export function useWorkspaceHistory<T>(currentState: T, onRestoreState: (state: T) => void, debounceMs = 350) {
  const serializedInitial = JSON.stringify(currentState);
  const historyRef = useRef<string[]>([serializedInitial]);
  const indexRef = useRef<number>(0);
  const isRestoringRef = useRef<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRestoreRef = useRef(onRestoreState);
  latestRestoreRef.current = onRestoreState;

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncFlags = useCallback(() => {
    setCanUndo(indexRef.current > 0);
    setCanRedo(indexRef.current < historyRef.current.length - 1);
  }, []);

  const pushSerialized = useCallback(
    (serialized: string) => {
      const currentEntry = historyRef.current[indexRef.current];
      if (currentEntry === serialized) {
        return;
      }
      const nextHistory = historyRef.current.slice(0, indexRef.current + 1);
      nextHistory.push(serialized);
      if (nextHistory.length > MAX_HISTORY) {
        nextHistory.shift();
      }
      historyRef.current = nextHistory;
      indexRef.current = nextHistory.length - 1;
      syncFlags();
    },
    [syncFlags]
  );

  // Automatically record state changes with debounce
  useEffect(() => {
    if (isRestoringRef.current) {
      isRestoringRef.current = false;
      return;
    }

    const serialized = JSON.stringify(currentState);
    if (serialized === historyRef.current[indexRef.current]) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      pushSerialized(serialized);
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentState, debounceMs, pushSerialized]);

  const undo = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (indexRef.current <= 0) {
      return;
    }
    indexRef.current -= 1;
    const prevSerialized = historyRef.current[indexRef.current];
    if (prevSerialized) {
      isRestoringRef.current = true;
      latestRestoreRef.current(JSON.parse(prevSerialized) as T);
      syncFlags();
    }
  }, [syncFlags]);

  const redo = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (indexRef.current >= historyRef.current.length - 1) {
      return;
    }
    indexRef.current += 1;
    const nextSerialized = historyRef.current[indexRef.current];
    if (nextSerialized) {
      isRestoringRef.current = true;
      latestRestoreRef.current(JSON.parse(nextSerialized) as T);
      syncFlags();
    }
  }, [syncFlags]);

  // Global keyboard listener for Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) {
        return;
      }
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (key === "y" || (key === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return {
    canUndo,
    canRedo,
    undo,
    redo
  };
}
