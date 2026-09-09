"use client";

import { Globe } from "lucide-react";
import { FlagEnIcon, FlagViIcon } from "@/components/ui/flag-icon";
import { cn } from "@/lib/utils";

export type ViewLanguage = "vi" | "en";

const FLAG_ICON: Record<ViewLanguage, React.ComponentType<{ className?: string }>> = {
  vi: FlagViIcon,
  en: FlagEnIcon
};

const LABEL: Record<ViewLanguage, string> = {
  vi: "Tiếng Việt",
  en: "English"
};

type Props = {
  value: ViewLanguage;
  onChange: (lang: ViewLanguage) => void;
  /** Show the source language badge alongside the toggle. Accepts "vi"/"en" or "VI"/"EN" */
  sourceLanguage?: ViewLanguage | "VI" | "EN" | null;
};

export function LanguageToggle({ value, onChange, sourceLanguage }: Props) {
  return (
    <div className='flex items-center gap-3'>
      <div className='flex items-center gap-1.5 text-muted-foreground text-xs'>
        <Globe className='h-3.5 w-3.5' />
        <span>Ngôn ngữ hiển thị</span>
      </div>
      <div className='flex gap-0 rounded-lg border bg-muted/40 p-0.5'>
        {(["vi", "en"] as ViewLanguage[]).map((lang) => {
          const Icon = FLAG_ICON[lang];
          return (
            <button
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium text-xs transition-colors",
                value === lang
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              key={lang}
              onClick={() => onChange(lang)}
              type='button'
            >
              <Icon className='h-3.5 w-4' /> {LABEL[lang]}
            </button>
          );
        })}
      </div>
      {sourceLanguage && (
        <span className='rounded-full bg-primary/10 px-2 py-0.5 font-medium text-[10px] text-primary'>
          Gốc: {LABEL[sourceLanguage.toLowerCase() as ViewLanguage]}
        </span>
      )}
    </div>
  );
}
