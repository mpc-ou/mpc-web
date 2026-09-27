import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/configs/i18n/routing";
import { SITE_NAME } from "@/constants/seo";

export function ClubByline() {
  const t = useTranslations("common");

  return (
    <Link className='group flex items-center gap-3' href='/about'>
      <Image
        alt={SITE_NAME}
        className='shrink-0 rounded-full bg-background object-contain p-1 ring-1 ring-border'
        height={40}
        src='/images/logo.png'
        width={40}
      />
      <div className='min-w-0'>
        <span className='block font-semibold text-foreground text-sm leading-none group-hover:text-primary'>
          {SITE_NAME}
        </span>
        <span className='mt-1 block text-muted-foreground text-xs'>{t("clubFullName")}</span>
      </div>
    </Link>
  );
}
