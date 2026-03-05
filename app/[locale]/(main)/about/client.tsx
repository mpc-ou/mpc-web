"use client";

import { Code, Monitor, Smartphone, Target } from "lucide-react";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { useTransparentHeader } from "@/hooks/use-transparent-header";
import { DepartmentsCarouselClient } from "./departments-carousel.client";
import { TopMembersCarouselClient } from "./top-members.client";
import { ClubShirtModelClient } from "./club-shirt-model.client";

type AboutClientProps = {
  locale: string;
  serializedTopMembers: any[];
  localizedDepartments: any[];
  statsSection: React.ReactNode;
  benefitsSection: React.ReactNode;
  faqSection: React.ReactNode;
  recentEventsSection: React.ReactNode;
};

function BadgeLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm">
      {children}
    </span>
  );
}

function CapabilityCard({
  icon: Icon,
  title,
  desc,
  image,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  image: string;
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          alt={title}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          src={image}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-primary/20 text-white backdrop-blur-md">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="flex flex-col p-6 text-left">
        <h3 className="mb-3 font-bold text-xl transition-colors group-hover:text-primary">
          {title}
        </h3>
        <p className="text-muted-foreground">{desc}</p>
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
}: AboutClientProps) {
  useTransparentHeader();

  return (
    <div className="flex flex-col bg-background">
      <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-muted/20 pt-24 pb-16 lg:pt-32 lg:pb-32">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-primary to-[#ff80b5] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16">
            <div className="flex flex-col justify-center text-center lg:text-left">
              <div className="mb-6 flex justify-center lg:justify-start">
                <BadgeLabel>Giới thiệu</BadgeLabel>
              </div>
              <h1 className="text-balance font-black text-4xl tracking-tight sm:text-5xl lg:text-6xl">
                Câu Lạc Bộ Lập Trình Trên Thiết Bị Di Động
              </h1>
              <p className="mt-6 text-balance text-lg text-muted-foreground sm:text-xl">
                OU Mobile Programming Club (MPC) trực thuộc
                <strong className="text-foreground">
                  {" "}
                  Khoa Công Nghệ Thông Tin - Đại Học Mở TP.HCM
                </strong>
              </p>
            </div>
            <div className="relative mx-auto w-[20rem] max-w-lg lg:max-w-none">
              <div className="absolute -inset-4 rounded-3xl bg-linear-to-tr from-primary/20 to-transparent blur-2xl" />
              <div className="relative aspect-square w-full">
                <Image
                  alt="MPC Hero"
                  className="object-contain"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src="/images/logo.png"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16">
            <ScrollReveal
              className="relative order-2 aspect-square w-full overflow-hidden rounded-3xl border border-border shadow-xl md:aspect-4/3 lg:order-1"
              variant="fade-left"
            >
              <Image
                alt="MPC Activities"
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                src="/images/bg/toc2025.jpg"
              />
            </ScrollReveal>
            <ScrollReveal
              className="order-1 lg:order-2"
              delay={200}
              variant="fade-right"
            >
              <h2 className="mb-8 flex items-center gap-3 text-balance font-bold text-3xl sm:text-4xl">
                <Target className="h-8 w-8 shrink-0 text-primary" /> Mục đích
                thành lập
              </h2>
              <ul className="space-y-6 text-lg text-muted-foreground">
                <li className="flex items-start gap-4">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Tổ chức các buổi Hội thảo chia sẻ tri thức nhằm ôn tập kiến
                    thức các môn Lập trình cơ bản cho sinh viên.
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Thành lập các nhóm học tập dưới dạng mô hình "Sinh viên là
                    cố vấn học tập", thường xuyên tổ chức các buổi họp nhóm,
                    nhằm giúp đỡ các bạn học chưa tốt theo kịp các môn học.
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Tổ chức training cho thành viên về lập trình trên các thiết
                    bị di động, bao gồm lập trình web, web app, lập trình
                    android.
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Tổ chức các Cuộc thi học thuật ứng dụng kiến thức chuyên
                    môn, kết hợp các hoạt động ngoại khóa (ROBOCODE, Web Design,
                    Web Contest...).
                  </span>
                </li>
              </ul>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <div className="w-full">{statsSection}</div>
      <div className="w-full">{benefitsSection}</div>

      <DepartmentsCarouselClient departments={localizedDepartments} />

      <ClubShirtModelClient />

      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <ScrollReveal className="mb-16 text-center">
            <BadgeLabel>Đào tạo</BadgeLabel>
            <h2 className="mt-4 font-bold text-3xl sm:text-4xl">
              Lĩnh vực hoạt động
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Câu lạc bộ thường xuyên tổ chức các buổi đào tạo chuyên sâu về các
              công nghệ hiện đại.
            </p>
          </ScrollReveal>

          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
            <CapabilityCard
              desc="Frontend & Backend development, React, Next.js, Node.js"
              icon={Monitor}
              image="/images/bg/web.png"
              title="Lập trình Web"
            />
            <CapabilityCard
              desc="Phát triển ứng dụng Android native & cross-platform"
              icon={Smartphone}
              image="/images/bg/mobile.png"
              title="Lập trình Android"
            />
            <CapabilityCard
              desc="Cấu trúc dữ liệu, giải thuật, hướng đối tượng (OOP)"
              icon={Code}
              image="/images/bg/algo.jpg"
              title="Thuật toán & Cơ bản"
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-border border-t bg-muted/10 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <ScrollReveal className="mb-12 text-center md:text-left">
            <BadgeLabel>Gương mặt tiêu biểu</BadgeLabel>
            <h2 className="mt-4 font-bold text-3xl sm:text-4xl">
              Những thành viên nhiều thành tựu nhất
            </h2>
          </ScrollReveal>
          <TopMembersCarouselClient
            members={serializedTopMembers}
            locale={locale}
          />
        </div>
      </section>

      <div className="w-full">{faqSection}</div>
      <div className="w-full">{recentEventsSection}</div>
    </div>
  );
}
