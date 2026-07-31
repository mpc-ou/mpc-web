"use client";

import { X } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/configs/i18n/routing";

const ANNOUNCEMENT_KEY = "mpc-announcement-dismissed";

type AnnouncementData = {
  id: string;
  contentVi: string;
  contentEn: string;
  linkUrl: string | null;
  linkLabelVi: string | null;
  linkLabelEn: string | null;
  bgColor: string | null;
};

type Props = {
  announcement?: AnnouncementData | null;
};

const AnnouncementBar = ({ announcement }: Props) => {
  const locale = useLocale();
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

  const hasCustomBg =
    announcement.bgColor &&
    announcement.bgColor.trim() !== "" &&
    !announcement.bgColor.includes("#1D4ED8") &&
    !announcement.bgColor.includes("#1d4ed8");

  const bgStyle =
    hasCustomBg && announcement.bgColor
      ? announcement.bgColor
      : "linear-gradient(135deg, #090d16 0%, #111827 50%, #1e1b4b 100%)";

  return (
    <div
      className='relative flex items-center justify-between gap-3 overflow-hidden border-orange-500/20 border-b px-4 py-1.5 text-white text-xs'
      style={{
        background: bgStyle
      }}
    >
      <style>{`
        @keyframes float-orb-1 {
          0%, 100% { transform: translate(-20%, -30%) scale(1); }
          50% { transform: translate(30%, 10%) scale(1.3); }
        }
        @keyframes float-orb-2 {
          0%, 100% { transform: translate(10%, 20%) scale(1.2); }
          50% { transform: translate(-40%, -20%) scale(0.9); }
        }
        @keyframes float-orb-3 {
          0%, 100% { transform: translate(50%, -10%) scale(0.8); }
          50% { transform: translate(-10%, 30%) scale(1.1); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
        .animate-orb-1 {
          animation: float-orb-1 4s ease-in-out infinite;
        }
        .animate-orb-2 {
          animation: float-orb-2 6s ease-in-out infinite;
        }
        .animate-orb-3 {
          animation: float-orb-3 3s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute -top-12 left-1/4 h-32 w-32 animate-orb-1 rounded-full bg-orange-500/35 blur-2xl' />
        <div className='absolute right-1/4 -bottom-8 h-28 w-28 animate-orb-2 rounded-full bg-indigo-500/30 blur-2xl' />
        <div className='absolute top-0 right-1/3 h-24 w-24 animate-orb-3 rounded-full bg-cyan-500/20 blur-xl' />
      </div>

      <div className='relative z-10 flex flex-1 items-center justify-center gap-3 text-center'>
        <span className='inline-flex shrink-0 animate-pulse-glow items-center rounded-md border border-orange-500/30 bg-orange-500/20 px-1.5 py-0.5 font-bold font-mono text-[9px] text-orange-400 uppercase tracking-wider'>
          Hot
        </span>
        <span className='font-medium leading-snug'>
          {locale === "en" && announcement.contentEn ? announcement.contentEn : announcement.contentVi}
        </span>
        {announcement.linkUrl && (
          <Link
            className='shrink-0 rounded-full bg-white px-2.5 py-0.5 font-bold text-[10px] text-orange-600 shadow-xs transition-all duration-300 hover:scale-105 hover:bg-orange-50 hover:shadow-[0_0_10px_rgba(255,255,255,0.4)]'
            href={announcement.linkUrl as "/"}
          >
            {locale === "en" && announcement.linkLabelEn
              ? announcement.linkLabelEn
              : (announcement.linkLabelVi ?? "Đăng ký ngay")}
          </Link>
        )}
      </div>

      <button
        aria-label='Đóng'
        className='relative z-10 shrink-0 rounded-full p-0.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white'
        onClick={handleDismiss}
        type='button'
      >
        <X className='h-3.5 w-3.5' />
      </button>
    </div>
  );
};

export { AnnouncementBar };
export type { AnnouncementData };
