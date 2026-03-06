"use client";

import { MarkdownContent } from "@/components/markdown-content";

export function ProjectContentClient({ content }: { content: string }) {
  return (
    <MarkdownContent
      className='prose-slate md:prose-lg prose-img:border prose-img:border-border prose-headings:font-bold'
      content={content}
    />
  );
}
