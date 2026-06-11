"use client";

import { Code, Cpu, Facebook, Github, Mail, Monitor, Smartphone, Target } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditorWindow } from "@/components/custom/editor-window.client";
import { HeroBackground } from "@/components/custom/hero-background.client";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { ABOUT_CLUB } from "@/configs/data/about";
import { useTransparentHeader } from "@/hooks/use-transparent-header";
import { cn } from "@/lib/utils";
import { ClubShirtModelClient } from "./_components/club-shirt-model.client";
import { DepartmentsCarouselClient } from "./_components/departments-carousel.client";
import { TopMembersCarouselClient } from "./_components/top-members.client";

type AboutClientProps = {
  locale: string;
  serializedTopMembers: any[];
  localizedDepartments: any[];
  statsSection: React.ReactNode;
  benefitsSection: React.ReactNode;
  faqSection: React.ReactNode;
  recentEventsSection: React.ReactNode;
  managementSection: React.ReactNode;
};

function BadgeLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className='inline-flex items-center rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm'>
      &gt; {children}
    </span>
  );
}

function CapabilityCard({
  icon: Icon,
  title,
  desc,
  image
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  image: string;
}) {
  return (
    <div className='group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur-xs transition-all duration-300 hover:-translate-y-2 hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] dark:hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]'>
      <div className='pointer-events-none absolute -inset-px bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-20' />

      <div className='relative aspect-video w-full overflow-hidden bg-muted'>
        <Image
          alt={title}
          className='object-cover transition-transform duration-700 ease-out group-hover:scale-110'
          fill
          sizes='(max-width: 640px) 100vw, 33vw'
          src={image}
        />
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:16px_16px]' />
        <div className='absolute inset-0 bg-gradient-to-t from-[#0B1121]/90 via-[#0B1121]/40 to-transparent dark:from-[#0B1121]/95 dark:via-transparent' />

        <div className='absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-orange-500/25 text-white shadow-inner backdrop-blur-md transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110'>
          <Icon className='h-6 w-6 text-orange-400 group-hover:text-orange-300' />
        </div>
      </div>

      <div className='relative z-10 flex flex-grow flex-col p-6 text-left'>
        <h3 className='mb-3 flex items-center gap-2 font-bold text-foreground text-xl transition-colors duration-300 group-hover:text-orange-500'>
          {title}
          <span className='inline-block font-mono text-orange-500 text-sm opacity-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:opacity-100'>
            -&gt;
          </span>
        </h3>
        <p className='flex-grow text-muted-foreground text-sm leading-relaxed'>{desc}</p>
      </div>
    </div>
  );
}

export function AboutClient({
  locale,
  serializedTopMembers,
  localizedDepartments,
  statsSection,
  benefitsSection,
  faqSection,
  recentEventsSection,
  managementSection
}: AboutClientProps) {
  const t = useTranslations("aboutPage");
  useTransparentHeader();

  const [activeHover, setActiveHover] = useState<"image" | "readme" | null>(null);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);
  const mpcLogoRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!sectionRef.current) {
      return;
    }
    const rect = sectionRef.current.getBoundingClientRect();
    const gx = (e.clientX - rect.left) / rect.width - 0.5;
    const gy = (e.clientY - rect.top) / rect.height - 0.5;

    const logo = mpcLogoRef.current;
    let tx = 0;
    let ty = 0;
    const TILT_STRENGTH = 10;
    if (logo) {
      const logoRect = logo.getBoundingClientRect();
      tx = ((e.clientY - logoRect.top) / logoRect.height - 0.5) * -TILT_STRENGTH;
      ty = ((e.clientX - logoRect.left) / logoRect.width - 0.5) * TILT_STRENGTH;
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      setOffset({ x: gx, y: gy });
      setTilt({ rx: tx, ry: ty });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0 });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }
    section.addEventListener("mousemove", handleMouseMove, { passive: true });
    section.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleMouseLeave);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMouseMove, handleMouseLeave]);

  const contentTransform = `translate(${offset.x * 10}px, ${offset.y * 10}px)`;
  const logoTilt = `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`;

  return (
    <div className='flex flex-col bg-background'>
      {/* Cinematic Hero Section */}
      <section
        className='relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 pt-24 pb-16 text-foreground lg:pt-32 lg:pb-32 dark:bg-[#0B1121] dark:text-white'
        ref={sectionRef}
      >
        <style>{`
          @keyframes float-logo {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-float-logo {
            animation: float-logo 5s ease-in-out infinite;
          }
        `}</style>

        <HeroBackground />

        <div className='container relative z-10 mx-auto px-4'>
          <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16'>
            {/* Left Content Column */}
            <div
              className='flex flex-col justify-center text-center transition-transform duration-200 ease-out will-change-transform lg:text-left'
              style={{ transform: contentTransform }}
            >
              <div className='mb-6 flex justify-center lg:justify-start'>
                <BadgeLabel>{t("hero.badge")}</BadgeLabel>
              </div>
              <h1 className='text-balance font-black text-4xl tracking-tight sm:text-5xl lg:text-6xl'>
                {t("hero.title")}
              </h1>
              <p className='mt-6 text-balance text-lg text-muted-foreground leading-relaxed sm:text-xl'>
                {t("hero.subtitle")}{" "}
                <strong className='ml-1.5 font-bold text-foreground dark:text-white'>{t("hero.facultyName")}</strong>
              </p>
            </div>

            {/* Right Interactive Logo Column */}
            <div
              className='relative mx-auto w-[18rem] max-w-lg cursor-pointer transition-transform duration-200 ease-out will-change-transform lg:max-w-none'
              ref={mpcLogoRef}
              style={{ transform: logoTilt }}
            >
              <div className='absolute -inset-6 rounded-full bg-linear-to-tr from-orange-500/20 to-amber-500/5 opacity-60 blur-3xl dark:opacity-80' />
              <div className='relative aspect-square w-full animate-float-logo select-none transition-all duration-300 [filter:drop-shadow(0_10px_20px_rgba(249,115,22,0.15))] hover:[filter:drop-shadow(0_15px_35px_rgba(249,115,22,0.45))]'>
                <Image
                  alt='MPC Logo'
                  className='object-contain'
                  fill
                  priority
                  sizes='(max-width: 1024px) 100vw, 50vw'
                  src='/images/logo.png'
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Refactored Mission / Purpose Section (Split Layout) */}
      <section className='relative overflow-hidden border-border border-t bg-muted/10 py-20 lg:py-32'>
        {/* Subtle grid pattern background */}
        <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]' />

        <div className='container relative z-10 mx-auto px-4'>
          <div className='grid items-start gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16'>
            {/* Left Column: EditorWindow Image & Club Metadata JSON (Overlapping stacked layout) */}
            <div className='relative order-2 mx-auto h-[480px] w-full max-w-xl sm:h-[600px] md:h-[650px] lg:order-1 lg:h-[520px] xl:h-[620px]'>
              {/* Window A (Image): Behind initially */}
              {/* biome-ignore lint/a11y/noStaticElementInteractions: Overlapping cards depth preview trigger */}
              {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Overlapping cards depth preview trigger */}
              <div
                className={cn(
                  "absolute top-0 left-0 w-[85%] select-none transition-all duration-500 ease-out",
                  activeHover === "image" && "z-30 scale-[1.02] opacity-100 shadow-[0_20px_50px_rgba(249,115,22,0.15)]",
                  activeHover === "readme" && "z-10 scale-[0.98] opacity-40",
                  activeHover === null && "z-10 opacity-75"
                )}
                onMouseEnter={() => setActiveHover("image")}
                onMouseLeave={() => setActiveHover(null)}
              >
                <ScrollReveal className='w-full' variant='fade-left'>
                  <EditorWindow
                    className='w-full border-border/80 bg-card/75 shadow-2xl backdrop-blur-md'
                    showLineNumbers={false}
                    showStatusBar={true}
                    title='toc2025.jpg'
                  >
                    <div className='relative aspect-video w-full overflow-hidden bg-muted sm:aspect-4/3 lg:aspect-video xl:aspect-4/3'>
                      <Image
                        alt='MPC Club Activities'
                        className='object-cover'
                        fill
                        sizes='(max-width: 1024px) 100vw, 50vw'
                        src='/images/bg/toc2025.jpg'
                      />
                    </div>
                  </EditorWindow>
                </ScrollReveal>
              </div>

              {/* biome-ignore lint/a11y/noStaticElementInteractions: Overlapping cards depth preview trigger */}
              {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Overlapping cards depth preview trigger */}
              <div
                className={cn(
                  "absolute right-0 bottom-0 w-[85%] select-none transition-all duration-500 ease-out",
                  activeHover === "readme" &&
                    "z-30 scale-[1.02] opacity-100 shadow-[0_20px_50px_rgba(249,115,22,0.15)]",
                  activeHover === "image" && "z-10 scale-[0.98] opacity-40",
                  activeHover === null && "z-20 opacity-100"
                )}
                onMouseEnter={() => setActiveHover("readme")}
                onMouseLeave={() => setActiveHover(null)}
              >
                <ScrollReveal className='w-full' delay={150} variant='fade-left'>
                  <EditorWindow
                    className='w-full border-border/80 bg-card/90 shadow-2xl backdrop-blur-md'
                    lineCount={14}
                    showLineNumbers={true}
                    showStatusBar={true}
                    title='club-profile.json'
                  >
                    <div className='overflow-x-auto whitespace-pre p-4 text-left font-mono text-xs text-zinc-300 leading-relaxed sm:p-6'>
                      <span className='text-zinc-500'>{"// club-profile.json"}</span>
                      {"\n{\n"}
                      <span className='pl-4 text-sky-400'>"name"</span>:{" "}
                      <span className='text-emerald-400'>"Mobile Programming Club"</span>,{"\n"}
                      <span className='pl-4 text-sky-400'>"abbreviation"</span>:{" "}
                      <span className='text-emerald-400'>"MPC"</span>,{"\n\n"}
                      <span className='pl-4 text-sky-400'>"established"</span>:{" "}
                      <span className='text-amber-400'>2015</span>,{"\n"}
                      <span className='pl-4 text-sky-400'>"level"</span>:{" "}
                      <span className='text-emerald-400'>"Faculty"</span>,{"\n"}
                      <span className='pl-4 text-sky-400'>"faculty"</span>:{" "}
                      <span className='text-emerald-400'>"Information Technology"</span>,{"\n"}
                      <span className='pl-4 text-sky-400'>"advisor"</span>:{" "}
                      <span className='text-emerald-400'>"Anonymous"</span>,{"\n\n"}
                      <span className='pl-4 text-sky-400'>"fields"</span>: [{"\n"}
                      <span className='pl-8 text-emerald-400'>"Web Development"</span>,{"\n"}
                      <span className='pl-8 text-emerald-400'>"Web App"</span>,{"\n"}
                      <span className='pl-8 text-emerald-400'>"DevOps"</span>,{"\n"}
                      <span className='pl-8 text-emerald-400'>"AI"</span>,{"\n"}
                      <span className='pl-8 text-emerald-400'>"Mobile Programming"</span>
                      {"\n"}
                      <span className='pl-4'>]</span>
                      {"\n}"}
                    </div>
                  </EditorWindow>
                </ScrollReveal>
              </div>
            </div>

            <ScrollReveal className='order-1 flex flex-col justify-center lg:order-2' delay={200} variant='fade-right'>
              <h2 className='mb-4 flex items-center gap-3 text-balance font-bold text-3xl text-foreground sm:text-4xl'>
                <Target className='h-8 w-8 shrink-0 text-orange-500' /> {t("mission.title")}
              </h2>
              <p className='mb-8 text-muted-foreground text-sm leading-relaxed'>{t("mission.description")}</p>

              <div className='grid gap-4 text-left sm:grid-cols-2'>
                {(t.raw("mission.cards") as { title: string; desc: string }[]).map((item, idx) => (
                  <div
                    className='group relative rounded-2xl border border-border bg-muted/20 p-5 transition-all duration-300 hover:border-orange-500/20 hover:bg-card/50'
                    key={item.title}
                  >
                    <div className='absolute top-4 right-4 font-bold font-mono text-orange-500/40 text-xs transition-colors group-hover:text-orange-500'>
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <h4 className='mb-1.5 font-bold text-base text-foreground transition-colors group-hover:text-orange-500'>
                      {item.title}
                    </h4>
                    <p className='text-muted-foreground text-xs leading-relaxed'>{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Social and Contact Links */}
              <div className='mt-8 flex flex-wrap items-center justify-start gap-3 border-border/40 border-t pt-6'>
                <a
                  className='flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 font-medium text-blue-400 text-xs transition-all hover:scale-105 hover:bg-blue-500/20 active:scale-95'
                  href={ABOUT_CLUB.contact.facebook}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  <Facebook className='h-3.5 w-3.5' />
                  {t("mission.fanpage")}
                </a>
                <a
                  className='flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 font-medium text-orange-400 text-xs transition-all hover:scale-105 hover:bg-orange-500/20 active:scale-95'
                  href={`mailto:${ABOUT_CLUB.contact.email}`}
                >
                  <Mail className='h-3.5 w-3.5' />
                  {t("mission.email")}
                </a>
                <a
                  className='flex items-center gap-2 rounded-full border border-zinc-500/30 bg-zinc-500/10 px-4 py-2 font-medium text-xs text-zinc-400 transition-all hover:scale-105 hover:bg-zinc-500/20 active:scale-95'
                  href={ABOUT_CLUB.contact.github}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  <Github className='h-3.5 w-3.5' />
                  {t("mission.github")}
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <div className='w-full'>{statsSection}</div>
      <div className='w-full'>{benefitsSection}</div>

      <DepartmentsCarouselClient departments={localizedDepartments} />

      <ClubShirtModelClient />

      {/* Capability Cards Section */}
      <section className='bg-muted/5 py-20 lg:py-32'>
        <div className='container mx-auto px-4'>
          <ScrollReveal className='mb-16 text-center'>
            <BadgeLabel>{t("fields.badge")}</BadgeLabel>
            <h2 className='mt-4 font-bold text-3xl text-foreground sm:text-4xl'>{t("fields.title")}</h2>
            <p className='mx-auto mt-4 max-w-2xl text-muted-foreground text-sm leading-relaxed'>
              {t("fields.description")}
            </p>
          </ScrollReveal>

          <div className='mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4'>
            <CapabilityCard
              desc={t("fields.web.desc")}
              icon={Monitor}
              image='/images/bg/web.png'
              title={t("fields.web.title")}
            />
            <CapabilityCard
              desc={t("fields.dsa.desc")}
              icon={Code}
              image='/images/bg/algo.jpg'
              title={t("fields.dsa.title")}
            />
            <CapabilityCard
              desc={t("fields.ai.desc")}
              icon={Cpu}
              image='/images/bg/mobile.png'
              title={t("fields.ai.title")}
            />
            <CapabilityCard
              desc={t("fields.android.desc")}
              icon={Smartphone}
              image='/images/bg/mobile.png'
              title={t("fields.android.title")}
            />
          </div>
        </div>
      </section>

      <section className='overflow-hidden border-border border-t bg-muted/10 py-20 lg:py-32'>
        <div className='container mx-auto px-4'>
          <ScrollReveal className='mb-12 text-center md:text-left'>
            <BadgeLabel>{t("topMembers.badge")}</BadgeLabel>
            <h2 className='mt-4 font-bold text-3xl sm:text-4xl'>{t("topMembers.title")}</h2>
          </ScrollReveal>
          <TopMembersCarouselClient locale={locale} members={serializedTopMembers} />
        </div>
      </section>

      <div className='w-full'>{managementSection}</div>
      <div className='w-full'>{recentEventsSection}</div>
      <div className='w-full'>{faqSection}</div>
    </div>
  );
}
