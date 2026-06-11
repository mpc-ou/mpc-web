"use client";

import { marked } from "marked";
import { useMemo } from "react";
import { sanitizeHtml } from "@/utils/sanitize-html";

type MarkdownInlineProps = {
  content: string;
  className?: string;
};

/**
 * Render a single line of markdown as inline HTML.
 * Strips block-level wrappers (<p>, etc.), keeps only inline formatting
 * like bold, italic, code, links.
 */
export function MarkdownInline({ content, className = "" }: MarkdownInlineProps) {
  const html = useMemo(() => {
    if (!content) {
      return "";
    }
    try {
      const raw = marked.parseInline(content, { gfm: true, breaks: false });
      return sanitizeHtml(typeof raw === "string" ? raw : "");
    } catch {
      return content;
    }
  }, [content]);

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
