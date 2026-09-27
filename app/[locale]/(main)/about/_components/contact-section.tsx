import { ArrowUpRight, Facebook, Mail } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/custom/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { ABOUT_CLUB } from "@/configs/data/about";

type Props = {
  locale: string;
  fanpageUrl: string;
  email: string;
};

const ContactSection = async ({ locale, fanpageUrl, email }: Props) => {
  const t = await getTranslations({ locale, namespace: "aboutPage.contact" });

  const channels = [
    {
      key: "email",
      icon: Mail,
      label: t("email.label"),
      value: email,
      desc: t("email.desc"),
      href: `mailto:${email}`,
      external: false
    },
    {
      key: "fanpage",
      icon: Facebook,
      label: t("fanpage.label"),
      value: ABOUT_CLUB.contact.facebookName,
      desc: t("fanpage.desc"),
      href: fanpageUrl,
      external: true
    }
  ];

  return (
    <section className='w-full border-border border-t bg-background py-20 sm:py-24' id='contact'>
      <div className='container mx-auto px-4'>
        <div className='grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16'>
          <ScrollReveal className='order-2 lg:order-1' variant='fade-right'>
            <div className='relative mx-auto aspect-27/32 w-full max-w-72 sm:max-w-sm'>
              <div
                aria-hidden
                className='absolute inset-x-[10%] top-[15%] bottom-[20%] rounded-full bg-primary/20 blur-3xl'
              />
              <Image
                alt={t("mascotAlt")}
                className='object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.25)] transition-transform duration-500 hover:-rotate-3 hover:scale-105'
                fill
                sizes='(min-width: 1024px) 384px, 288px'
                src='/images/hi-foxy.png'
              />
            </div>
          </ScrollReveal>

          <div className='order-1 min-w-0 lg:order-2'>
            <ScrollReveal>
              <SectionHeading description={t("description")} layout='stack' tag='contact' title={t("title")} />
            </ScrollReveal>

            <ScrollReveal delay={100} variant='fade-up'>
              <ul className='mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border'>
                {channels.map(({ key, icon: Icon, label, value, desc, href, external }) => (
                  <li key={key}>
                    <a
                      className='group flex items-start gap-5 p-6 transition-colors hover:bg-primary/5 sm:p-7'
                      href={href}
                      {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
                    >
                      <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground'>
                        <Icon className='h-5 w-5' />
                      </span>
                      <span className='flex min-w-0 flex-1 flex-col gap-1.5'>
                        <span className='font-mono text-muted-foreground text-xs'>{label}</span>
                        <span className='break-words font-bold text-foreground text-lg transition-colors group-hover:text-primary sm:text-xl'>
                          {value}
                        </span>
                        <span className='text-muted-foreground text-sm leading-relaxed'>{desc}</span>
                      </span>
                      <ArrowUpRight className='h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary' />
                    </a>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export { ContactSection };
