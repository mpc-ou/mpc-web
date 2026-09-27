import { getTranslations } from "next-intl/server";
import { getGalleryImages } from "@/app/_actions/main";
import { SectionHeading } from "@/components/custom/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { GalleryMasonry } from "./gallery-masonry.client";

const GALLERY_TILT_X_DEG = 0;
const GALLERY_TILT_Z_DEG = -10;

const GallerySection = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: "home.gallery" });

  const { data } = await getGalleryImages();
  const images = (data?.payload ?? []) as Array<{
    id: string;
    url: string;
    caption: string | null;
    order: number;
  }>;

  if (images.length === 0) {
    return null;
  }

  return (
    <section className='w-full bg-background py-20 sm:py-24'>
      <div className='container mx-auto px-4'>
        <ScrollReveal>
          <SectionHeading description={t("subtitle")} tag='gallery' title={t("title")} />
        </ScrollReveal>
        <ScrollReveal delay={200} variant='zoom-in'>
          <GalleryMasonry images={images} tiltXDeg={GALLERY_TILT_X_DEG} tiltZDeg={GALLERY_TILT_Z_DEG} />
        </ScrollReveal>
      </div>
    </section>
  );
};

export { GallerySection };
