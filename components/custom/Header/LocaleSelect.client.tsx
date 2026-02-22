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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname, useRouter } from "@/configs/i18n/routing";
import type { locale } from "@/types/global";

const LOCALES = [
  { value: "en", flag: "/images/flags/en.svg" },
  { value: "vi", flag: "/images/flags/vi.svg" },
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
    return <Skeleton className="h-10 w-10 rounded-md border-2" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" type="button">
          {currentLocale ? (
            <Image
              src={currentLocale.flag}
              alt={t(currentLocale.value)}
              width={20}
              height={20}
              className="rounded-sm"
            />
          ) : (
            <Globe className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">{t("select")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l.value}
            onClick={() => handleChangeLocale(l.value)}
            className={locale === l.value ? "bg-accent" : ""}
          >
            <Image
              src={l.flag}
              alt={t(l.value)}
              width={20}
              height={20}
              className="mr-2 rounded-sm"
            />
            {t(l.value)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { LocaleSelect };
