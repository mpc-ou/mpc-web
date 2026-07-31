import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getRequestConfig } from "next-intl/server";
import type { locale } from "@/types/global";
import { routing } from "./routing";

// Turbopack caches dynamic import() of JSON modules aggressively.
// Use readFileSync + JSON.parse to bypass the module cache.
function loadMessages(locale: string, ns: string): Record<string, unknown> {
  const filePath = join(process.cwd(), "configs", "messages", `${ns}.${locale}.json`);
  return JSON.parse(readFileSync(filePath, "utf-8")) as Record<string, unknown>;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!(locale && routing.locales.includes(locale as locale))) {
    locale = routing.defaultLocale;
  }

  const [common, main, events, admin, auth] = await Promise.all([
    loadMessages(locale, "common"),
    loadMessages(locale, "main"),
    loadMessages(locale, "events"),
    loadMessages(locale, "admin"),
    loadMessages(locale, "auth")
  ]);

  const messages = {
    ...common,
    ...main,
    ...events,
    ...admin,
    ...auth
  } as Record<string, unknown>;

  return {
    locale,
    timeZone: "Asia/Ho_Chi_Minh",
    messages
  };
});
