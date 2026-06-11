import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { ABOUT_CLUB } from "@/configs/data/about";
import { Link } from "@/configs/i18n/routing";
import { IntroImageClient } from "./intro-image.client";

const IntroSection = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: "home.intro" });
  const isEn = locale === "en";

  return (
    <section className="w-full bg-background py-20" id="intro">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-12 lg:flex-row">
          <ScrollReveal className="w-full lg:w-1/2" variant="fade-left">
            <IntroImageClient />
          </ScrollReveal>

          <ScrollReveal
            className="flex w-full flex-col gap-6 lg:w-1/2"
            delay={200}
            variant="fade-right"
          >
            <div className="inline-flex">
              <span className="rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm">
                &gt; about_mpc
              </span>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-muted-foreground/50 text-xs">
                {"/** @club MPC \u2022 @since 2015 */"}
              </span>
              <h2 className="font-bold text-3xl text-foreground leading-snug tracking-tight sm:text-4xl">
                {isEn ? ABOUT_CLUB.fullName.en : ABOUT_CLUB.fullName.vi}
              </h2>
            </div>

            <div className="relative rounded-xl border border-orange-500/10 bg-orange-500/3 px-5 py-4">
              <span className="absolute -top-2.5 left-4 bg-background px-2 font-mono text-orange-500/60 text-xs">
                README.md
              </span>
              <p className="text-muted-foreground leading-relaxed">
                {t("description")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-xl bg-linear-to-r from-orange-500 to-orange-600 shadow-md shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-orange-700"
              >
                <Link href="/about">{t("learnMore")}</Link>
              </Button>
              <Button asChild className="rounded-xl" variant="outline">
                <Link href="/members">{t("viewMembers")}</Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export { IntroSection };
