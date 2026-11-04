const CODE_BLOCK_RE = /```[\s\S]*?```/g;
const HTML_TAG_RE = /<[^>]+>/g;
const IMAGE_MD_RE = /!\[[^\]]*\]\([^)]+\)/g;
const HEADING_MARKER_RE = /^#{1,6}\s+/;
const BLOCKQUOTE_MARKER_RE = /^>\s*/;
const LIST_MARKER_RE = /^[-*+]\s+(\[[ xX]\]\s+)?|^\d+\.\s+/;
const TABLE_LINE_RE = /^\|.*\|$/;
const HR_LINE_RE = /^(-{3,}|\*{3,}|_{3,})$/;
const MARKDOWN_SYNTAX_RE = /(\*\*|__|~~|`)/g;
const LINK_MD_RE = /\[([^\]]+)\]\([^)]+\)/g;
const MULTI_SPACE_RE = /\s+/g;

/**
 * Extracts the first meaningful paragraph of markdown content (retaining inline markdown
 * like **bold**, _italic_, `code`, [link](url)) when an explicit summary/description is empty.
 */
export function extractFirstParagraphMarkdown(content?: string | null, maxLength = 220): string {
  if (!content?.trim()) {
    return "";
  }

  const withoutCode = content.replace(CODE_BLOCK_RE, "\n");
  const lines = withoutCode.replace(/\r\n/g, "\n").split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }
    if (TABLE_LINE_RE.test(line) || HR_LINE_RE.test(line)) {
      continue;
    }

    // Strip images and HTML tags from the candidate line
    const cleaned = line
      .replace(IMAGE_MD_RE, "")
      .replace(HTML_TAG_RE, "")
      .replace(HEADING_MARKER_RE, "")
      .replace(BLOCKQUOTE_MARKER_RE, "")
      .replace(LIST_MARKER_RE, "")
      .trim();

    // Skip lines that were only images, headings with <3 chars, or pure symbols
    if (cleaned.length < 12) {
      continue;
    }

    if (cleaned.length <= maxLength) {
      return cleaned;
    }
    return `${cleaned.slice(0, maxLength).trimEnd()}…`;
  }

  return "";
}

/**
 * Resolves the display summary/description for a post or project:
 * - If explicit `summary` is non-empty, returns it.
 * - Otherwise falls back to the first meaningful paragraph of `content`.
 */
export function resolvePostSummary(summary?: string | null, content?: string | null, maxLength = 220): string {
  if (summary?.trim()) {
    return summary.trim();
  }
  return extractFirstParagraphMarkdown(content, maxLength);
}

/**
 * Strips markdown formatting into plain text (useful for SEO meta description).
 */
export function stripMarkdownToPlainText(markdown?: string | null, maxLength = 200): string {
  if (!markdown?.trim()) {
    return "";
  }
  const plain = markdown
    .replace(CODE_BLOCK_RE, " ")
    .replace(IMAGE_MD_RE, " ")
    .replace(LINK_MD_RE, "$1")
    .replace(HTML_TAG_RE, " ")
    .replace(HEADING_MARKER_RE, "")
    .replace(MARKDOWN_SYNTAX_RE, "")
    .replace(MULTI_SPACE_RE, " ")
    .trim();

  if (plain.length <= maxLength) {
    return plain;
  }
  return `${plain.slice(0, maxLength).trimEnd()}…`;
}
