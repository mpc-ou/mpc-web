"use client";

import { useState } from "react";
import type { ViewLanguage } from "@/components/custom/language-toggle";

type BilingualFields = {
  titleVi: string;
  titleEn: string;
  summaryVi: string | null;
  summaryEn: string | null;
  contentVi: string;
  contentEn: string;
  sourceLanguage: "VI" | "EN";
};

type LegacyBilingualFields = {
  title?: string;
  summary?: string | null;
  content?: string;
};

/**
 * Derive initial bilingual state from a PostRow-like object.
 * Falls back gracefully when rows lack bilingual fields (old data).
 */
export function useBilingualForm(initial?: (Partial<BilingualFields> & LegacyBilingualFields) | null) {
  const [titleVi, setTitleVi] = useState(initial?.titleVi ?? initial?.title ?? "");
  const [titleEn, setTitleEn] = useState(initial?.titleEn ?? "");
  const [summaryVi, setSummaryVi] = useState<string | null>(initial?.summaryVi ?? initial?.summary ?? null);
  const [summaryEn, setSummaryEn] = useState<string | null>(initial?.summaryEn ?? null);
  const [contentVi, setContentVi] = useState(initial?.contentVi ?? initial?.content ?? "");
  const [contentEn, setContentEn] = useState(initial?.contentEn ?? "");
  const [sourceLanguage, setSourceLanguage] = useState<"VI" | "EN">(initial?.sourceLanguage ?? "VI");
  const [viewLang, setViewLang] = useState<ViewLanguage>("vi");

  return {
    viewLang,
    setViewLang,
    titleVi,
    setTitleVi,
    titleEn,
    setTitleEn,
    summaryVi,
    setSummaryVi,
    summaryEn,
    setSummaryEn,
    contentVi,
    setContentVi,
    contentEn,
    setContentEn,
    sourceLanguage,
    setSourceLanguage
  } as const;
}

export type BilingualFormState = ReturnType<typeof useBilingualForm>;

export type TranslateEngine = "deepseek" | "bing";

/**
 * Translate a batch of fields via the /api/translate endpoint.
 * Returns an object with the translated values (or original on error).
 */
export async function translateFields(
  fields: { title?: string; summary?: string | null; content?: string },
  from: "vi" | "en",
  to: "vi" | "en",
  engine: TranslateEngine = "deepseek"
): Promise<{ title?: string; summary?: string; content?: string }> {
  const toTranslate: { key: string; text: string }[] = [];
  if (fields.title) {
    toTranslate.push({ key: "title", text: fields.title });
  }
  if (fields.summary) {
    toTranslate.push({ key: "summary", text: fields.summary });
  }
  if (fields.content) {
    toTranslate.push({ key: "content", text: fields.content });
  }

  if (toTranslate.length === 0) {
    return {};
  }

  const results = await Promise.all(
    toTranslate.map(async ({ key, text }) => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, from, to, engine })
        });
        if (!res.ok) {
          return { key, text };
        }
        const data = (await res.json()) as { translated: string };
        return { key, text: data.translated };
      } catch {
        return { key, text };
      }
    })
  );

  const out: Record<string, string> = {};
  for (const r of results) {
    out[r.key] = r.text;
  }
  return out;
}

export type { BilingualFields };
