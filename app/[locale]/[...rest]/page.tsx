import { notFound } from "next/navigation";

// Catch-all for any path under /[locale] that no other segment matched.
// Without this, next-intl's locale prefix means unknown routes can slip past
// the root not-found handler; this guarantees they render the 404 page.
export default function CatchAllNotFound() {
  notFound();
}
