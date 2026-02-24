import { getTranslations } from "next-intl/server";
import { getGalleryImages } from "@/app/[locale]/actions";
import { GalleryCarousel } from "./gallery-carousel.client";

const GallerySection = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: "home.gallery" });

  const { data } = await getGalleryImages();
  const images = (data?.payload ?? []) as Array<{
    id: string;
    url: string;
    caption: string | null;
    order: number;
  }>;

  // No gallery images in DB → don't render section
  if (images.length === 0) {
    return null;
  }

  return (
    <section className='w-full bg-muted/30 py-20'>
      <div className='container mx-auto px-4'>
        <div className='mb-12 text-center'>
          <span className='rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm'>Gallery</span>
          <h2 className='mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl'>{t("title")}</h2>
          <p className='mt-3 text-muted-foreground'>{t("subtitle")}</p>
        </div>
        <div className='mx-auto max-w-5xl px-8'>
          <GalleryCarousel images={images} />
        </div>
      </div>
    </section>
  );
};

export { GallerySection };
