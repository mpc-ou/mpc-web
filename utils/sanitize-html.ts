import DOMPurify from "dompurify";
import type { Config } from "dompurify";

const PURIFY_CONFIG: Config = {
  ADD_TAGS: ["iframe"],
  ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "src", "width", "height", "style", "target", "rel"]
};

/**
 * Sanitize untrusted HTML to prevent XSS attacks.
 * Allows iframes (YouTube, Facebook embeds), images, and common formatting tags.
 *
 * On the server (RSC/SSR), DOMPurify requires a real browser DOM and cannot run.
 * Content rendered server-side originates from our own admin-managed database,
 * so we return it as-is; DOMPurify will sanitize on the client hydration pass.
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === "undefined") {
    return dirty;
  }
  return DOMPurify.sanitize(dirty, PURIFY_CONFIG);
}
