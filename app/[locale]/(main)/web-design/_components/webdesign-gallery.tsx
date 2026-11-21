import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/custom/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { GalleryMasonry } from "../../_components/gallery-masonry.client";
import { WD_SECTION_IDS, WdSection } from "./wd-primitives";

export function WebDesignGallery({
  images
}: {
  images: Array<{ id: string; url: string; caption: string | null; order: number }>;
}) {
  const t = useTranslations("webdesign");

  return (
    <WdSection id={WD_SECTION_IDS.gallery}>
      <ScrollReveal>
        <SectionHeading index='08' tag='gallery' title={t("galleryTitle")} />
      </ScrollReveal>
      <GalleryMasonry className='h-auto min-h-[60vh]' images={images} tiltXDeg={10} tiltZDeg={10} />
    </WdSection>
  );
}
