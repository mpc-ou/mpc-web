import type common from "@/configs/messages/common.en.json" with { type: "json" };
import type main from "@/configs/messages/main.en.json" with { type: "json" };
import type events from "@/configs/messages/events.en.json" with { type: "json" };
import type admin from "@/configs/messages/admin.en.json" with { type: "json" };
import type auth from "@/configs/messages/auth.en.json" with { type: "json" };

type Messages = typeof common &
  typeof main &
  typeof events &
  typeof admin &
  typeof auth;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends Messages {}
}

export type locale = "en" | "vi";
