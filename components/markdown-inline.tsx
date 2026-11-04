"use client";

import { marked } from "marked";
import { useMemo } from "react";
import { sanitizeHtml } from "@/utils/sanitize-html";

type MarkdownInlineProps = {
  content: string;
  className?: string;
  /** When true, strips anchor tags so it can safely render inside an enclosing <Link> without nested <a> hydration errors */
  disableLinks?: boolean;
};

const ANCHOR_OPEN_RE = /<a\b[^>]*>/gi;
const ANCHOR_CLOSE_RE = /<\/a>/gi;

/**
 * Render a single line/excerpt of markdown as inline HTML.
 * Strips block-level wrappers (<p>, etc.), keeps only inline formatting
 * like bold, italic, code, spans, and links.
 */
export function MarkdownInline({ content, className = "", disableLinks = false }: MarkdownInlineProps) {
  const html = useMemo(() => {
    if (!content) {
      return "";
    }
    try {
      const normalized = content.replace(/\r\n/g, "\n").replace(/\n+/g, " ");
      const raw = marked.parseInline(normalized, { gfm: true, breaks: false });
      const rawStr = typeof raw === "string" ? raw : "";
      const safe = sanitizeHtml(rawStr);
      if (disableLinks) {
        return safe
          .replace(ANCHOR_OPEN_RE, '<span class="text-primary underline">')
          .replace(ANCHOR_CLOSE_RE, "</span>");
      }
      return safe;
    } catch {
      return content;
    }
  }, [content, disableLinks]);

  if (!html) {
    return null;
  }

  return (
    <span
      className={`prose prose-sm dark:prose-invert inline max-w-none prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-a:text-primary prose-code:text-xs prose-a:underline ${className}`}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via DOMPurify
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
