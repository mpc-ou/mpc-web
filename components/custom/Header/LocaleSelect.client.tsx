"use client";

import { Globe } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname, useRouter } from "@/configs/i18n/routing";
import type { locale } from "@/types/global";

const LOCALES = [
  { value: "en", flag: "/images/flags/en.svg" },
  { value: "vi", flag: "/images/flags/vi.svg" }
] as const;

const LocaleSelect = () => {
  const t = useTranslations("common.locale");
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = LOCALES.find((l) => l.value === locale);

  const handleChangeLocale = (newLocale: locale) => {
    startTransition(() => {
      router.replace({ pathname }, { locale: newLocale });
    });
  };

  if (isPending) {
    return <Skeleton className='h-10 w-10 rounded-md border-2' />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size='icon' type='button' variant='outline'>
          {currentLocale ? (
            <Image
              alt={t(currentLocale.value)}
              className='rounded-sm'
              height={20}
              src={currentLocale.flag}
              width={20}
            />
          ) : (
            <Globe className='h-[1.2rem] w-[1.2rem]' />
          )}
          <span className='sr-only'>{t("select")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {LOCALES.map((l) => (
          <DropdownMenuItem
            className={locale === l.value ? "bg-accent" : ""}
            key={l.value}
            onClick={() => handleChangeLocale(l.value)}
          >
            <Image alt={t(l.value)} className='mr-2 rounded-sm' height={20} src={l.flag} width={20} />
            {t(l.value)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { LocaleSelect };
