import { format } from "date-fns";
import { enUS, vi } from "date-fns/locale";

const handleDatetime = (datetime: Date) =>
  datetime.toLocaleString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

function formatLocalDate(
  date: Date | string | number | null | undefined,
  locale: string | undefined | null,
  customPattern?: string
): string {
  if (!date) {
    return "";
  }
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    return "";
  }

  const safeLocale = locale ?? "vi";
  const localeObj = safeLocale.startsWith("en") ? enUS : vi;
  const pattern = customPattern || (safeLocale.startsWith("en") ? "MM/dd/yyyy" : "dd/MM/yyyy");

  return format(d, pattern, { locale: localeObj });
}

export { handleDatetime, formatLocalDate };
