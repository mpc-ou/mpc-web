"use client";

import { Calendar, Globe, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Sponsor = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  description: string | null;
  startAt: string | null;
  endAt: string | null;
  images: string[];
};

export function SponsorsClient({ sponsors }: { sponsors: Sponsor[] }) {
  const [selected, setSelected] = useState<Sponsor | null>(null);

  const hasActiveSponsorship = (s: Sponsor) => !s.endAt || new Date(s.endAt) > new Date();

  return (
    <>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {sponsors.map((item) => (
          // biome-ignore lint/a11y/useSemanticElements: contains nested <a> children (website/email links); a real <button> can't legally contain interactive content
          <div
            className={cn(
              "group relative flex flex-col items-center rounded-2xl border bg-card p-8 shadow-sm transition-all duration-300",
              "cursor-pointer hover:-translate-y-2 hover:border-primary/30 hover:shadow-lg"
            )}
            key={item.id}
            onClick={() => setSelected(item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelected(item);
              }
            }}
            role='button'
            tabIndex={0}
          >
            {/* Active badge */}
            {hasActiveSponsorship(item) && (
              <span className='absolute top-3 right-3 rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 text-xs dark:bg-emerald-900/30 dark:text-emerald-300'>
                Đang tài trợ
              </span>
            )}

            {/* Logo */}
            <div className='relative mb-5 h-24 w-48 rounded-xl bg-muted/20 p-3 transition-transform duration-300 group-hover:scale-105'>
              {item.logo ? (
                <Image alt={item.name} className='object-contain p-3' fill sizes='192px' src={item.logo} />
              ) : (
                <span className='flex h-full w-full items-center justify-center font-bold text-3xl text-muted-foreground/25'>
                  {item.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            {/* Name */}
            <h3 className='mb-2 text-center font-bold text-foreground text-lg transition-colors group-hover:text-primary'>
              {item.name}
            </h3>

            {/* Period */}
            {item.startAt && (
              <p className='mb-3 flex items-center gap-1.5 text-muted-foreground text-xs'>
                <Calendar className='h-3 w-3' />
                {new Date(item.startAt).getFullYear()}
                {item.endAt ? ` – ${new Date(item.endAt).getFullYear()}` : " – Nay"}
              </p>
            )}

            {/* Quick actions */}
            <div className='mt-1 flex gap-2'>
              {item.website && (
                <a
                  className='inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary text-xs transition-colors hover:bg-primary/20'
                  href={item.website}
                  onClick={(e) => e.stopPropagation()}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  <Globe className='h-3 w-3' />
                  Website
                </a>
              )}
              {item.email && (
                <a
                  className='inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-muted/80 hover:text-foreground'
                  href={`mailto:${item.email}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail className='h-3 w-3' />
                  Email
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <Dialog onOpenChange={(open) => !open && setSelected(null)} open={!!selected}>
        <DialogContent className='max-h-[90vh] max-w-xl overflow-y-auto'>
          <DialogTitle className='sr-only'>{selected?.name}</DialogTitle>

          {selected && (
            <div className='flex flex-col items-center gap-6 py-4'>
              {/* Logo */}
              <div className='relative h-28 w-56 rounded-xl bg-muted/20 p-4'>
                {selected.logo ? (
                  <Image alt={selected.name} className='object-contain p-4' fill sizes='224px' src={selected.logo} />
                ) : (
                  <span className='flex h-full w-full items-center justify-center font-bold text-4xl text-muted-foreground/25'>
                    {selected.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Name */}
              <h2 className='text-center font-bold text-2xl'>{selected.name}</h2>

              {/* Meta info */}
              <div className='flex flex-wrap justify-center gap-3'>
                {selected.website && (
                  <a
                    className='inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 font-medium text-primary text-sm transition-colors hover:bg-primary/20'
                    href={selected.website}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    <Globe className='h-4 w-4' /> Website
                  </a>
                )}
                {selected.email && (
                  <a
                    className='inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted/80'
                    href={`mailto:${selected.email}`}
                  >
                    <Mail className='h-4 w-4' /> {selected.email}
                  </a>
                )}
                {selected.phone && (
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 font-medium text-muted-foreground text-sm'>
                    <Phone className='h-4 w-4' /> {selected.phone}
                  </span>
                )}
              </div>

              {/* Period */}
              {selected.startAt && (
                <p className='flex items-center gap-1.5 text-muted-foreground text-sm'>
                  <Calendar className='h-4 w-4' />
                  {new Date(selected.startAt).toLocaleDateString("vi-VN")}
                  {selected.endAt
                    ? ` – ${new Date(selected.endAt).toLocaleDateString("vi-VN")}`
                    : " – Đang tài trợ vô thời hạn"}
                </p>
              )}

              {/* Description */}
              {selected.description && (
                <div className='w-full rounded-xl border bg-muted/20 p-5'>
                  <p className='whitespace-pre-line text-muted-foreground text-sm leading-relaxed'>
                    {selected.description}
                  </p>
                </div>
              )}

              {/* Gallery */}
              {selected.images && selected.images.length > 0 && (
                <div className='w-full'>
                  <h4 className='mb-3 font-semibold text-muted-foreground text-sm uppercase tracking-wider'>
                    Hình ảnh
                  </h4>
                  <div className='grid grid-cols-2 gap-2'>
                    {selected.images.map((img) => (
                      <div className='relative aspect-video overflow-hidden rounded-lg bg-muted' key={img}>
                        <Image alt='' className='object-cover' fill sizes='(min-width: 640px) 288px, 45vw' src={img} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
