"use client";

import { marked } from "marked";
import mediumZoom from "medium-zoom";
import { useEffect, useMemo, useRef } from "react";
import { sanitizeHtml } from "@/utils/sanitize-html";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  const htmlContent = useMemo(() => {
    if (!content) {
      return "";
    }
    try {
      const rawHtml = marked.parse(content, { gfm: true, breaks: true });
      const htmlString = typeof rawHtml === "string" ? rawHtml : "";
      return sanitizeHtml(htmlString);
    } catch {
      return "";
    }
  }, [content]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (htmlContent && containerRef.current) {
      const images = containerRef.current.querySelectorAll("img");
      const zoom = mediumZoom(images, {
        margin: 24,
        background: "rgba(0,0,0,0.85)"
      });

      return () => {
        zoom.detach();
      };
    }
  }, [htmlContent]);

  if (!htmlContent) {
    return null;
  }

  return (
    <div
      className={`prose prose-neutral dark:prose-invert prose-li:my-1 prose-ol:my-4 prose-p:my-4 prose-ul:my-4 prose-h2:mt-10 prose-h3:mt-8 prose-h2:mb-4 prose-h3:mb-3 max-w-none prose-code:rounded prose-pre:rounded-xl prose-blockquote:border-l-primary/50 prose-code:bg-muted prose-pre:bg-muted prose-pre:p-4 prose-code:px-1.5 prose-code:py-0.5 prose-a:font-bold prose-headings:font-bold prose-blockquote:text-muted-foreground prose-code:text-sm prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-relaxed prose-headings:tracking-tight prose-a:underline prose-a:underline-offset-4 prose-a:transition-colors hover:prose-a:text-primary [&_iframe]:mx-auto [&_iframe]:my-8 [&_iframe]:block [&_iframe]:max-w-full [&_iframe]:rounded-2xl md:[&_iframe]:max-w-[80%] [&_img]:mx-auto [&_img]:mt-8 [&_img]:mb-12 [&_img]:block [&_img]:max-w-full [&_img]:cursor-zoom-in [&_img]:rounded-[2rem] [&_img]:border [&_img]:border-border [&_img]:shadow-[0_8px_30px_rgb(0,0,0,0.12)] md:[&_img]:max-w-[75%] lg:[&_img]:max-w-[65%] ${className}`}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via DOMPurify
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      ref={containerRef}
    />
  );
}
