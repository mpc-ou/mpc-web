"use client";

import { Close, Content, Description, Portal, Root, Title } from "@radix-ui/react-dialog";
import { Calendar, Eye, MapPin, Star, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { LanguageToggle, type ViewLanguage } from "@/components/custom/language-toggle";
import { ImageLightbox } from "@/components/image-lightbox.client";
import { MarkdownContent } from "@/components/markdown-content";
import { MarkdownInline } from "@/components/markdown-inline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { resolvePostSummary } from "@/utils/markdown-summary";

export type PreviewDrawerBadge = {
  label: string;
  variant?: "default" | "secondary" | "outline";
  className?: string;
  isHighlight?: boolean;
};

export type PreviewDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewLang: ViewLanguage;
  onViewLangChange: (lang: ViewLanguage) => void;
  sourceLanguage?: "VI" | "EN";
  bannerUrl?: string | null;
  title: string;
  titlePlaceholder?: string;
  summary?: string | null;
  content: string;
  badges?: PreviewDrawerBadge[];
  tags?: string[];
  tagPrefix?: string;
  dateLabel?: string | null;
  locationLabel?: string | null;
  membersList?: Array<{ id: string; label: string }>;
  galleryUrls?: string[];
};

export function PreviewDrawer({
  open,
  onOpenChange,
  viewLang,
  onViewLangChange,
  sourceLanguage,
  bannerUrl,
  title,
  titlePlaceholder = "Tiêu đề hiển thị ở đây",
  summary,
  content,
  badges = [],
  tags = [],
  tagPrefix = "#",
  dateLabel,
  locationLabel,
  membersList = [],
  galleryUrls = []
}: PreviewDrawerProps) {
  const effectiveSummary = resolvePostSummary(summary, content, 280);
  const [bannerLightboxOpen, setBannerLightboxOpen] = useState(false);
  const [galleryLightboxIndex, setGalleryLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <Root modal={false} onOpenChange={onOpenChange} open={open}>
        <Portal>
          <div
            aria-hidden='true'
            className='fade-in-0 fixed inset-0 z-50 animate-in bg-black/75 backdrop-blur-xs duration-200'
            onClick={() => onOpenChange(false)}
          />
          <Content
            className='data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-4xl flex-col border-border border-l bg-background shadow-2xl duration-250 data-[state=closed]:animate-out data-[state=open]:animate-in'
            onInteractOutside={(e) => {
              const target = e.target as HTMLElement | null;
              if (target?.closest('[data-lightbox-portal="true"]')) {
                e.preventDefault();
              }
            }}
          >
            {/* Sticky Drawer Header */}
            <div className='flex flex-wrap items-center justify-between gap-3 border-border border-b bg-card/80 px-6 py-4 backdrop-blur-md'>
              <div className='flex items-center gap-2.5'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                  <Eye className='h-4 w-4' />
                </div>
                <div>
                  <Title className='font-bold text-foreground text-sm uppercase tracking-wider'>
                    Xem trước bài xuất bản
                  </Title>
                  <Description className='text-muted-foreground text-xs'>
                    Giao diện hiển thị thực tế tới người đọc
                  </Description>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <LanguageToggle onChange={onViewLangChange} sourceLanguage={sourceLanguage} value={viewLang} />
                <Close asChild>
                  <Button className='h-8 w-8 rounded-full' size='icon' type='button' variant='ghost'>
                    <X className='h-4 w-4' />
                    <span className='sr-only'>Đóng</span>
                  </Button>
                </Close>
              </div>
            </div>

            {/* Scrollable Preview Body */}
            <div className='flex-1 overflow-y-auto px-6 py-8 sm:px-10'>
              <div className='mx-auto max-w-3xl space-y-6'>
                {bannerUrl && (
                  <button
                    className='relative aspect-video w-full cursor-zoom-in overflow-hidden rounded-2xl border bg-muted shadow-sm transition-opacity hover:opacity-95'
                    onClick={() => setBannerLightboxOpen(true)}
                    title='Nhấp để phóng to ảnh bìa'
                    type='button'
                  >
                    <Image
                      alt={title || "Preview banner"}
                      className='object-cover'
                      fill
                      sizes='800px'
                      src={bannerUrl}
                    />
                  </button>
                )}

                {(badges.length > 0 || tags.length > 0) && (
                  <div className='flex flex-wrap items-center gap-2'>
                    {badges.map((b, idx) => (
                      <Badge
                        className={b.className}
                        key={`${b.label}-${idx.toString()}`}
                        variant={b.variant ?? "outline"}
                      >
                        {b.isHighlight && <Star className='mr-1 h-3 w-3 fill-current' />}
                        {b.label}
                      </Badge>
                    ))}
                    {tags.map((t) => (
                      <Badge
                        className='border-none bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs'
                        key={t}
                        variant='outline'
                      >
                        {tagPrefix}
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}

                <h1 className='font-black text-3xl text-foreground leading-tight tracking-tight sm:text-4xl'>
                  {title || titlePlaceholder}
                </h1>

                {(dateLabel || locationLabel || membersList.length > 0) && (
                  <div className='flex flex-wrap items-center gap-x-5 gap-y-2 border-border/60 border-y py-3 text-muted-foreground text-xs'>
                    {dateLabel && (
                      <span className='flex items-center gap-1.5 font-medium text-foreground'>
                        <Calendar className='h-3.5 w-3.5 text-primary' />
                        {dateLabel}
                      </span>
                    )}
                    {locationLabel && (
                      <span className='flex items-center gap-1.5 font-medium text-foreground'>
                        <MapPin className='h-3.5 w-3.5 text-primary' />
                        {locationLabel}
                      </span>
                    )}
                    {membersList.length > 0 && (
                      <div className='flex flex-wrap gap-1.5'>
                        {membersList.map((m) => (
                          <Badge className='text-[11px]' key={m.id} variant='secondary'>
                            {m.label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {summary?.trim() ? (
                  <div className='border-primary border-l-4 pl-4 font-medium text-foreground/85 text-lg leading-relaxed'>
                    <MarkdownInline content={summary} />
                  </div>
                ) : (
                  effectiveSummary && (
                    <div className='rounded-xl border border-dashed bg-muted/20 p-3 text-muted-foreground text-xs'>
                      <span className='mb-1 block font-mono text-[10px] text-primary uppercase tracking-wider'>
                        Tóm tắt tự động trên Card (do bỏ trống mô tả):
                      </span>
                      <MarkdownInline content={effectiveSummary} disableLinks />
                    </div>
                  )
                )}

                <Separator />

                {content.trim() ? (
                  <div className='pt-2'>
                    <MarkdownContent content={content} />
                  </div>
                ) : (
                  <div className='py-12 text-center text-muted-foreground text-sm italic'>
                    Nội dung chi tiết (Markdown) sẽ được hiển thị tại đây...
                  </div>
                )}

                {galleryUrls.length > 0 && (
                  <div className='space-y-3 border-t pt-6'>
                    <h3 className='font-bold text-muted-foreground text-xs uppercase tracking-wider'>
                      Thư viện ảnh bổ sung ({galleryUrls.length})
                    </h3>
                    <div className='grid grid-cols-3 gap-3 sm:grid-cols-4'>
                      {galleryUrls.map((url, i) => (
                        <button
                          className='relative aspect-square cursor-zoom-in overflow-hidden rounded-xl border bg-muted transition-transform hover:scale-[1.02]'
                          key={`${url}-${i.toString()}`}
                          onClick={() => setGalleryLightboxIndex(i)}
                          title='Nhấp để phóng to ảnh'
                          type='button'
                        >
                          <Image alt={`Gallery ${i + 1}`} className='object-cover' fill sizes='180px' src={url} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Content>
        </Portal>
      </Root>

      {bannerUrl && (
        <ImageLightbox
          images={[bannerUrl]}
          initialIndex={0}
          onClose={() => setBannerLightboxOpen(false)}
          open={bannerLightboxOpen}
          title={title || "Ảnh bìa"}
        />
      )}

      <ImageLightbox
        images={galleryUrls}
        initialIndex={galleryLightboxIndex ?? 0}
        onClose={() => setGalleryLightboxIndex(null)}
        open={galleryLightboxIndex !== null}
        title='Thư viện ảnh bổ sung'
      />
    </>
  );
}
