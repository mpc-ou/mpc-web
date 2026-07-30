"use client";

import { type ReactNode, useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type TabItem = {
  name: string;
  content: ReactNode;
  lineCount?: number;
};

type EditorWindowProps = {
  title?: string;
  showLineNumbers?: boolean;
  showStatusBar?: boolean;
  lineCount?: number;
  className?: string;
  children?: ReactNode;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tabName: string) => void;
};

const EditorWindow = ({
  title = "editor.tsx",
  showLineNumbers = true,
  showStatusBar = true,
  lineCount = 20,
  className,
  children,
  tabs,
  activeTab,
  onTabChange
}: EditorWindowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [localActiveTab, setLocalActiveTab] = useState(tabs && tabs.length > 0 ? tabs[0].name : "");

  const currentActiveTab = activeTab !== undefined ? activeTab : localActiveTab;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    setTilt({ rx, ry });
  }, []);

  const handleMouseLeave = useCallback(() => setTilt({ rx: 0, ry: 0 }), []);

  const handleTabClick = (tabName: string) => {
    if (onTabChange) {
      onTabChange(tabName);
    } else {
      setLocalActiveTab(tabName);
    }
  };

  const activeTabItem = tabs?.find((tab) => tab.name === currentActiveTab);
  const activeContent = activeTabItem ? activeTabItem.content : children;
  const activeLineCount = activeTabItem?.lineCount !== undefined ? activeTabItem.lineCount : lineCount;

  // For image tabs, we might want to hide line numbers
  const displayLineNumbers = showLineNumbers && (activeTabItem?.lineCount !== undefined || !tabs || tabs.length === 0);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: decorative mouse-tracking tilt effect
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative mouse-tracking tilt effect
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border shadow-lg transition-transform duration-200 ease-out",
        className
      )}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      ref={ref}
      style={{
        transform: `perspective(800px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
      }}
    >
      <div className='flex shrink-0 items-center gap-1.5 border-border border-b bg-muted/50 px-3 pt-2'>
        <div className='flex shrink-0 items-center gap-1.5 pb-2'>
          <div className='h-2.5 w-2.5 rounded-full bg-red-400/70' />
          <div className='h-2.5 w-2.5 rounded-full bg-yellow-400/70' />
          <div className='h-2.5 w-2.5 rounded-full bg-green-400/70' />
        </div>

        {tabs && tabs.length > 0 ? (
          <div className='mb-[-1px] ml-3 flex select-none items-center gap-1 overflow-x-auto'>
            {tabs.map((tab) => {
              const isActive = tab.name === currentActiveTab;
              return (
                <button
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-t-md border-x border-t px-3 py-1.5 font-mono text-xs outline-hidden transition-colors",
                    isActive
                      ? "border-border bg-slate-950/90 text-foreground"
                      : "border-transparent bg-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  )}
                  key={tab.name}
                  onClick={() => handleTabClick(tab.name)}
                  type='button'
                >
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className='mb-[-1px] ml-3 flex items-center gap-0.5 rounded-t-md border-border border-t border-r border-b-0 border-l bg-background px-3 py-1.5'>
            <span className='font-mono text-muted-foreground text-xs'>{title}</span>
          </div>
        )}
        <div className='flex-1 self-stretch border-border border-b' />
      </div>

      <div className='flex min-h-0 flex-grow bg-slate-950/40'>
        {displayLineNumbers && activeLineCount > 0 && (
          <div className='hidden shrink-0 select-none overflow-y-hidden border-border border-r bg-muted/30 px-2 py-3 font-mono text-muted-foreground/40 text-xs leading-6 sm:block'>
            {Array.from({ length: activeLineCount }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: line numbers are a fixed-order sequence where the index *is* the displayed value
              <div className='text-right tabular-nums' key={i}>
                {i + 1}
              </div>
            ))}
          </div>
        )}
        <div className='relative flex h-full min-h-0 flex-grow flex-col'>{activeContent}</div>
      </div>

      {showStatusBar && (
        <div className='flex shrink-0 items-center justify-between border-border border-t bg-muted/50 px-3 py-1.5 font-mono text-muted-foreground/50 text-xs'>
          <span>UTF-8</span>
          <span>MPC &copy; 2015–{new Date().getFullYear()}</span>
          <span>
            {currentActiveTab.endsWith(".jpg") || currentActiveTab.endsWith(".png") ? "Image Viewer" : "Ln 1, Col 1"}
          </span>
        </div>
      )}
    </div>
  );
};

export { EditorWindow };
