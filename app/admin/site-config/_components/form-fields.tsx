"use client";

import { ExternalLink, Upload } from "lucide-react";
import { type ReactNode, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { LocalizedText } from "@/types/webdesign";
import { useStorageUpload } from "./use-storage-upload";

const LANGS = [
  { key: "vi", label: "VI" },
  { key: "en", label: "EN" }
] as const;

/** Label + control + optional hint, stacked. Every dialog field uses this so spacing stays uniform. */
export function Field({
  label,
  hint,
  htmlFor,
  children,
  className
}: {
  label: string;
  hint?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label className='text-xs' htmlFor={htmlFor}>
        {label}
      </Label>
      {children}
      {hint && <p className='text-[11px] text-muted-foreground'>{hint}</p>}
    </div>
  );
}

function LangTag({ label }: { label: string }) {
  return (
    <span className='w-7 shrink-0 rounded bg-muted py-1 text-center font-bold font-mono text-[10px] text-muted-foreground'>
      {label}
    </span>
  );
}

/** VI and EN inputs stacked, each with a language tag. */
export function LocalizedInput({
  value,
  onChange,
  placeholder
}: {
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  placeholder?: string;
}) {
  return (
    <div className='grid gap-2'>
      {LANGS.map((lang) => (
        <div className='flex items-center gap-2' key={lang.key}>
          <LangTag label={lang.label} />
          <Input
            onChange={(e) => onChange({ ...value, [lang.key]: e.target.value })}
            placeholder={placeholder}
            value={value[lang.key]}
          />
        </div>
      ))}
    </div>
  );
}

export function LocalizedTextarea({
  value,
  onChange,
  placeholder
}: {
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  placeholder?: string;
}) {
  return (
    <div className='grid gap-2'>
      {LANGS.map((lang) => (
        <div className='flex items-start gap-2' key={lang.key}>
          <span className='mt-2'>
            <LangTag label={lang.label} />
          </span>
          <textarea
            className='min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm'
            onChange={(e) => onChange({ ...value, [lang.key]: e.target.value })}
            placeholder={placeholder}
            value={value[lang.key]}
          />
        </div>
      ))}
    </div>
  );
}

/** URL input with an upload button (Supabase `media/webdesign`) and a preview link. */
export function UploadUrlInput({
  value,
  onChange,
  accept,
  placeholder
}: {
  value: string;
  onChange: (url: string) => void;
  accept: string;
  placeholder?: string;
}) {
  const inputId = useId();
  const { upload, uploading } = useStorageUpload();

  return (
    <div className='flex items-center gap-2'>
      <Input onChange={(e) => onChange(e.target.value)} placeholder={placeholder} value={value} />
      <Button
        className='shrink-0'
        disabled={uploading}
        onClick={() => document.getElementById(inputId)?.click()}
        type='button'
        variant='outline'
      >
        <Upload className='mr-1.5 h-4 w-4' />
        {uploading ? "Đang tải..." : "Tải lên"}
      </Button>
      {value && (
        <Button asChild className='shrink-0' size='icon' type='button' variant='ghost'>
          <a aria-label='Mở' href={value} rel='noopener noreferrer' target='_blank'>
            <ExternalLink className='h-4 w-4' />
          </a>
        </Button>
      )}
      <input
        accept={accept}
        className='hidden'
        id={inputId}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          const url = file ? await upload(file) : null;
          if (url) {
            onChange(url);
          }
        }}
        type='file'
      />
    </div>
  );
}

/** Immutable list helpers. */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) {
    return list;
  }
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item !== undefined) {
    next.splice(to, 0, item);
  }
  return next;
}

export function upsertAt<T>(list: T[], index: number | null, item: T): T[] {
  return index === null ? [...list, item] : list.map((it, i) => (i === index ? item : it));
}
