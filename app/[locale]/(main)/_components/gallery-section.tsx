import { getTranslations } from "next-intl/server";
import { getGalleryImages } from "@/app/_actions/main";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { GalleryMasonry } from "./gallery-masonry.client";

/** Diagonal, tilted-plane look for the home gallery. */
const GALLERY_TILT_X_DEG = 22;
const GALLERY_TILT_Z_DEG = -30;

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
    <section className='w-full bg-muted/30 py-20'>
      <div className='container mx-auto px-4'>
        <ScrollReveal className='mb-12 text-center'>
          <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm'>
            &gt; gallery
          </span>
          <h2 className='mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl'>{t("title")}</h2>
          <p className='mt-3 text-muted-foreground'>{t("subtitle")}</p>
        </ScrollReveal>
        <ScrollReveal delay={200} variant='zoom-in'>
          <GalleryMasonry images={images} tiltXDeg={GALLERY_TILT_X_DEG} tiltZDeg={GALLERY_TILT_Z_DEG} />
        </ScrollReveal>
      </div>
    </section>
  );
};

export { GallerySection };
