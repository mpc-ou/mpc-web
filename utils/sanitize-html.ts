import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize untrusted HTML to prevent XSS attacks.
 * Allows iframes (YouTube, Facebook embeds), images, and common formatting tags.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "scrolling",
      "src",
      "width",
      "height",
      "style",
      "target",
      "rel"
    ]
  });
}
