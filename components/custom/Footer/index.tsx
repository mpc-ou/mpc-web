import { Facebook, Github, Mail, Youtube } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/configs/i18n/routing";

type FooterData = {
  settings: Record<string, string>;
  externalLinks: Array<{ id: string; label: string; url: string }>;
} | null;

type Props = {
  footerData?: FooterData;
};

const Footer = ({ footerData }: Props) => {
  const t = useTranslations("footer");

  const fanpage =
    footerData?.settings.footer_fanpage ||
    "https://www.facebook.com/CLBLapTrinhTrenThietBiDiDong";
  const youtube = footerData?.settings.footer_youtube || "https://youtube.com";
  const github =
    footerData?.settings.footer_github || "https://github.com/mpc-ou";
  const mail = footerData?.settings.footer_mail || "it.mpclub@ou.edu.vn";
  const externalLinks = footerData?.externalLinks ?? [];

  return (
    <footer className="border-border border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Left: Logo + Description + Social */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-black text-primary-foreground text-sm">
                M
              </div>
              <span className="font-black text-primary text-xl tracking-tight">
                MPC
              </span>
            </div>
            <p className="max-w-xs text-muted-foreground text-sm leading-relaxed">
              {t("description")}
            </p>
            <div className="flex items-center gap-3">
              <a
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                href={fanpage}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                href={github}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                href={youtube}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                aria-label="Email"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                href={`mailto:${mail}`}
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Center: Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground">{t("quickLinks")}</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  className="text-muted-foreground text-sm transition-colors hover:text-primary"
                  href="/"
                >
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm transition-colors hover:text-primary"
                  href={"/recap" as any}
                >
                  {t("aboutUs")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm transition-colors hover:text-primary"
                  href="/activities"
                >
                  {t("activities")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm transition-colors hover:text-primary"
                  href="/achievements"
                >
                  {t("achievements")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm transition-colors hover:text-primary"
                  href="/sponsors"
                >
                  {t("sponsors")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm transition-colors hover:text-primary"
                  href="/faq"
                >
                  {t("qa")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Right: External Links + Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground">
              {t("externalLinks")}
            </h3>
            <ul className="flex flex-col gap-2">
              {externalLinks.length > 0 ? (
                externalLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      className="text-muted-foreground text-sm transition-colors hover:text-primary"
                      href={link.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <a
                      className="text-muted-foreground text-sm transition-colors hover:text-primary"
                      href="https://it.ou.edu.vn"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {t("facultyLink")}
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-muted-foreground text-sm transition-colors hover:text-primary"
                      href="https://www.ou.edu.vn"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {t("universityLink")}
                    </a>
                  </li>
                </>
              )}
            </ul>
            <div className="mt-2">
              <h3 className="mb-2 font-semibold text-foreground">
                {t("contact")}
              </h3>
              <a
                className="text-muted-foreground text-sm transition-colors hover:text-primary"
                href={`mailto:${mail}`}
              >
                {mail}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-border border-t">
        <div className="container mx-auto flex items-center justify-center px-4 py-4">
          <p className="text-center text-muted-foreground text-sm">
            {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
export type { FooterData };
