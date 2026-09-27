import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getFooterData } from "@/app/_actions/main";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { ABOUT_CLUB } from "@/configs/data/about";
import { cn } from "@/lib/utils";

type CtaAction = {
  label: string;
  href: string;
  external?: boolean;
};

type Props = {
  locale: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Defaults to the club fanpage ("Follow the fanpage"). */
  primary?: CtaAction;
  secondary?: CtaAction;
  note?: string;
  /** Render only the banner, without the full-width section and container wrapper. */
  bare?: boolean;
  className?: string;
};

const EXTERNAL_URL_RE = /^https?:\/\//;

const isExternal = (action: CtaAction) => action.external ?? EXTERNAL_URL_RE.test(action.href);

const linkProps = (action: CtaAction) =>
  isExternal(action) ? { href: action.href, rel: "noopener noreferrer", target: "_blank" } : { href: action.href };

const JoinCtaSection = async ({
  locale,
  eyebrow,
  title,
  description,
  primary,
  secondary,
  note,
  bare = false,
  className
}: Props) => {
  const t = await getTranslations({ locale, namespace: "home.cta" });

  let primaryAction = primary;
  if (!primaryAction) {
    const { data } = await getFooterData();
    const settings = (data?.payload as { settings?: Record<string, string> } | undefined)?.settings;
    primaryAction = { label: t("button"), href: settings?.footer_fanpage || ABOUT_CLUB.contact.facebook };
  }

  const banner = (
    <ScrollReveal variant='fade-up'>
      <div className='group relative overflow-hidden rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-14 sm:py-16'>
        <div
          aria-hidden
          className='pointer-events-none absolute top-1/2 -right-24 h-104 w-104 -translate-y-1/2 animate-[spin_60s_linear_infinite] rounded-full border border-primary-foreground/20 border-dashed motion-reduce:animate-none sm:-right-10'
        />
        <div
          aria-hidden
          className='pointer-events-none absolute top-1/2 -right-4 h-64 w-64 -translate-y-1/2 animate-[spin_40s_linear_infinite_reverse] rounded-full border border-primary-foreground/15 border-dashed motion-reduce:animate-none sm:right-16'
        />
        <div
          aria-hidden
          className='pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] bg-linear-to-r from-transparent via-white/25 to-transparent group-hover:animate-ach-sheen'
        />

        <div className='relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between'>
          <div className='flex max-w-2xl flex-col gap-4'>
            <span className='font-medium font-mono text-primary-foreground/80 text-xs sm:text-sm'>
              {eyebrow ?? t("eyebrow")}
            </span>
            <h2
              className={cn(
                "text-balance font-black leading-[1.05] tracking-tight",
                title ? "text-3xl sm:text-4xl" : "max-w-[15ch] text-3xl sm:text-5xl"
              )}
            >
              {title ?? t("title")}
            </h2>
            {description && <p className='text-primary-foreground/85 leading-relaxed sm:text-lg'>{description}</p>}
          </div>

          <div className='flex shrink-0 flex-col items-start gap-3 md:items-end'>
            <div className='flex flex-wrap gap-3'>
              <a
                {...linkProps(primaryAction)}
                className='group/cta inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-primary text-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl sm:text-base'
              >
                {primaryAction.label}
                <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1' />
              </a>
              {secondary && (
                <a
                  {...linkProps(secondary)}
                  className='inline-flex items-center gap-2 rounded-full border border-primary-foreground/40 px-6 py-3.5 font-semibold text-primary-foreground text-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-foreground/10 sm:text-base'
                >
                  {secondary.label}
                </a>
              )}
            </div>
            {note && <p className='max-w-xs text-primary-foreground/75 text-xs italic md:text-right'>{note}</p>}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );

  if (bare) {
    return <div className={className}>{banner}</div>;
  }

  return (
    <section className={cn("w-full bg-background py-20 sm:py-24", className)}>
      <div className='container mx-auto px-4'>{banner}</div>
    </section>
  );
};

export { JoinCtaSection };
