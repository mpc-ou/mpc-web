"use client";

import { marked } from "marked";
import { sanitizeHtml } from "@/utils/sanitize-html";

marked.setOptions({ gfm: true, breaks: true });

export function ProjectContentClient({ content }: { content: string }) {
  const getHtml = (md: string) => {
    try {
      const parsed = marked.parse(md);
      return typeof parsed === "string" ? parsed : "";
    } catch {
      return "";
    }
  };

  return (
    <div
      className='prose prose-slate md:prose-lg dark:prose-invert max-w-none prose-img:rounded-xl prose-img:border prose-img:border-border prose-headings:font-bold'
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via DOMPurify
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(getHtml(content)) }}
    />
  );
}
