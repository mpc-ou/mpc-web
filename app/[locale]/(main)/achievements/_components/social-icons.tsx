import Image from "next/image";
import { buildSocialHref, cn } from "@/lib/utils";
import { getSocialMeta, parseSocials } from "@/utils/social";

type Props = {
  socials: unknown;
  max?: number;
  className?: string;
  itemClassName?: string;
};

export function SocialIcons({ socials, max = 5, className, itemClassName }: Props) {
  const entries = parseSocials(socials).slice(0, max);
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {entries.map((s) => {
        const meta = getSocialMeta(s.platform);
        return (
          <a
            aria-label={meta.label}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 hover:shadow-[0_0_14px_rgba(251,191,36,0.55)]",
              itemClassName
            )}
            href={buildSocialHref(s.url, meta.prefix)}
            key={s.id ?? `${s.platform}-${s.url}`}
            rel='noopener noreferrer'
            target='_blank'
            title={meta.label}
          >
            <Image alt='' className='h-4 w-4 object-contain' height={32} src={meta.icon} width={32} />
          </a>
        );
      })}
    </div>
  );
}
