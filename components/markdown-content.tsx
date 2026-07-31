/**
 * Backward-compatible wrapper around MarkdownBlock.
 * All new code should import MarkdownBlock or MarkdownInline directly.
 */
"use client";

import { MarkdownBlock } from "./markdown-block";

type MarkdownContentProps = {
  content: string;
  className?: string;
};

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return <MarkdownBlock className={className} content={content} />;
}
