"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

/**
 * Options that each page can customise when requesting a transparent header.
 */
type TransparentHeaderOptions = {
  /** Hide action buttons (locale, theme, profile, mobile menu) while transparent. @default true */
  hideActions?: boolean;
  /** CSS color for nav link text while transparent (any valid CSS value). @default "rgba(255,255,255,0.82)" */
  textColor?: string;
  /** CSS color for the logo text while transparent. @default "rgba(255,255,255,0.9)" */
  logoColor?: string;
  /** CSS background for the header bar itself while transparent. @default "transparent" */
  bgColor?: string;
  /** Scroll distance (px) before the header becomes solid. @default 300 */
  scrollThreshold?: number;
  /** Hide announcement bar while transparent. @default false */
  hideAnnouncement?: boolean;
};

const DEFAULT_OPTIONS: Required<TransparentHeaderOptions> = {
  hideActions: true,
  textColor: "rgba(255,255,255,0.82)",
  logoColor: "rgba(255,255,255,0.9)",
  bgColor: "transparent",
  scrollThreshold: 300,
  hideAnnouncement: false
};

type TransparentHeaderState = {
  enabled: boolean;
  options: Required<TransparentHeaderOptions>;
};

type TransparentHeaderCtx = TransparentHeaderState & {
  enable: (opts?: TransparentHeaderOptions) => void;
  disable: () => void;
};

const TransparentHeaderContext = createContext<TransparentHeaderCtx>({
  enabled: false,
  options: DEFAULT_OPTIONS,
  enable: () => {},
  disable: () => {}
});

/**
 * Provider — place once near the root (e.g. BaseLayout).
 */
function TransparentHeaderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TransparentHeaderState>({
    enabled: false,
    options: DEFAULT_OPTIONS
  });

  const value = useMemo<TransparentHeaderCtx>(
    () => ({
      ...state,
      enable: (opts?: TransparentHeaderOptions) =>
        setState({
          enabled: true,
          options: { ...DEFAULT_OPTIONS, ...opts }
        }),
      disable: () => setState({ enabled: false, options: DEFAULT_OPTIONS })
    }),
    [state]
  );

  return <TransparentHeaderContext.Provider value={value}>{children}</TransparentHeaderContext.Provider>;
}

/**
 * Call this hook inside any **client component** on a page that needs
 * the header to start transparent.
 *
 * Automatically disables when the component unmounts (navigation).
 *
 * @example
 * ```tsx
 * "use client";
 * // Dark hero — default white/gray text, hide buttons
 * useTransparentHeader();
 *
 * // Light hero — dark text, keep buttons visible, custom bg
 * useTransparentHeader({
 *   textColor: "rgba(0,0,0,0.7)",
 *   logoColor: "#111",
 *   hideActions: false,
 *   bgColor: "rgba(255,255,255,0.3)",
 *   scrollThreshold: 200,
 * });
 * ```
 */
function useTransparentHeader(opts?: TransparentHeaderOptions) {
  const ctx = useContext(TransparentHeaderContext);

  useEffect(() => {
    ctx.enable(opts);
    return () => ctx.disable();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [ctx.disable, ctx.enable, opts]);
}

/**
 * Read-only hook used by the Header to read the full transparent state.
 */
function useTransparentHeaderState() {
  const { enabled, options } = useContext(TransparentHeaderContext);
  return { enabled, options };
}

export type { TransparentHeaderOptions };
export { TransparentHeaderProvider, useTransparentHeader, useTransparentHeaderState };
