"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/configs/i18n/routing";

const ANNOUNCEMENT_KEY = "mpc-announcement-dismissed";

type AnnouncementData = {
  id: string;
  content: string;
  linkUrl: string | null;
  linkLabel: string | null;
  bgColor: string | null;
};

type Props = {
  announcement?: AnnouncementData | null;
};

const AnnouncementBar = ({ announcement }: Props) => {
  const t = useTranslations("header");
  const [visible, setVisible] = useState(false);

  // No DB data → don't show anything
  if (!announcement) {
    return null;
  }

  const dismissKey = `${ANNOUNCEMENT_KEY}-${announcement.id}`;

  // biome-ignore lint/correctness/useHookAtTopLevel: conditional return above is based on props, not state
  useEffect(() => {
    const dismissed = sessionStorage.getItem(dismissKey);
    if (!dismissed) {
      setVisible(true);
    }
  }, [dismissKey]);

  const handleDismiss = () => {
    sessionStorage.setItem(dismissKey, "true");
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className='relative flex items-center justify-between gap-3 px-4 py-2 text-sm text-white'
      style={{
        background: announcement.bgColor ?? "linear-gradient(90deg, #1d4ed8 0%, #f97316 100%)"
      }}
    >
      <div className='flex flex-1 items-center justify-center gap-3 text-center'>
        <span className='font-medium leading-snug'>{announcement.content}</span>
        {announcement.linkUrl && (
          <Link
            className='shrink-0 rounded-full bg-white px-3 py-0.5 font-semibold text-orange-600 text-xs transition-opacity hover:opacity-90'
            href={announcement.linkUrl as "/"}
          >
            {announcement.linkLabel ?? t("registerNow")}
          </Link>
        )}
      </div>
      <button
        aria-label={t("dismiss")}
        className='shrink-0 rounded-full p-1 transition-colors hover:bg-white/20'
        onClick={handleDismiss}
        type='button'
      >
        <X className='h-4 w-4' />
      </button>
    </div>
  );
};

export { AnnouncementBar };
export type { AnnouncementData };
