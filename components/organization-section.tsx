"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Facebook, Github } from "lucide-react";
import { HOME_SECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SocialLinks {
  email?: string;
  facebook?: string;
  github?: string;
}

interface Member {
  name: string;
  role: string;
  period: string;
  avatar?: string | null;
  social?: SocialLinks;
}

interface OrganizationSectionProps {
  className?: string;
}

export function OrganizationSection({ className }: OrganizationSectionProps) {
  const presidentsData = HOME_SECTIONS.organization.presidents as any;
  const officersData = HOME_SECTIONS.organization.officers as any;
  const presidents = presidentsData.items || [];
  const officers = officersData.items || [];

  return (
    <section className={cn("py-20 bg-[var(--bg-primary)]", className)}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[var(--text-primary)] border-b-2 border-[var(--primary)] pb-2 inline-block">
          {HOME_SECTIONS.organization.title}
        </h2>

        {/* Chủ nhiệm CLB */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-center mb-8 text-[var(--text-primary)]">
            Ban Chủ nhiệm
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {presidents.map((president: any, idx: number) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden bg-[var(--muted)] flex items-center justify-center">
                      {president.avatar ? (
                        <Image
                          src={president.avatar}
                          alt={president.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[var(--muted)] flex items-center justify-center">
                          <span className="text-2xl text-[var(--text-tertiary)]">
                            {president?.name?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <CardTitle className="text-xl mb-1">{president.name}</CardTitle>
                      <p className="text-sm text-[var(--text-secondary)] mb-2">
                        {president.role}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {president.period}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {president.social && (
                    <div className="flex justify-center gap-3 mt-4">
                      {president.social.email && (
                        <a
                          href={`mailto:${president.social.email}`}
                          className="p-2 rounded-full bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                          aria-label="Email"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                      {president.social.facebook && (
                        <a
                          href={president.social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                          aria-label="Facebook"
                        >
                          <Facebook className="h-4 w-4" />
                        </a>
                      )}
                      {president.social.github && (
                        <a
                          href={president.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                          aria-label="GitHub"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Ban Cán sự */}
        <div>
          <h3 className="text-2xl font-semibold text-center mb-8 text-[var(--text-primary)]">
            {officersData.title}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 max-w-7xl mx-auto">
            {officers.map((officer: any, idx: number) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[var(--muted)] flex items-center justify-center">
                      {officer.avatar ? (
                        <Image
                          src={officer.avatar}
                          alt={officer.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[var(--muted)] flex items-center justify-center">
                          <span className="text-lg text-[var(--text-tertiary)]">
                            {officer.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <CardTitle className="text-sm mb-1">{officer.name}</CardTitle>
                      <p className="text-xs text-[var(--text-secondary)] mb-1">
                        {officer.role}
                      </p>
                      <p className="text-[10px] text-[var(--text-tertiary)] leading-tight">
                        {officer.period}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {officer.social && (
                    <div className="flex justify-center gap-2 mt-2">
                      {officer.social.email && (
                        <a
                          href={`mailto:${officer.social.email}`}
                          className="p-1.5 rounded-full bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                          aria-label="Email"
                        >
                          <Mail className="h-3 w-3" />
                        </a>
                      )}
                      {officer.social.facebook && (
                        <a
                          href={officer.social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-full bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                          aria-label="Facebook"
                        >
                          <Facebook className="h-3 w-3" />
                        </a>
                      )}
                      {officer.social.github && (
                        <a
                          href={officer.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-full bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                          aria-label="GitHub"
                        >
                          <Github className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

