import { getTranslations } from "next-intl/server";
import { getGalleryImages } from "./actions";

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
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
          {images.map((img) => (
            <div className='group relative aspect-video overflow-hidden rounded-2xl bg-muted' key={img.id}>
              <img
                alt={img.caption ?? "Gallery"}
                className='h-full w-full object-cover'
                height={300}
                src={img.url}
                width={500}
              />
              <div className='absolute inset-0 flex items-end opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                <div className='w-full bg-gradient-to-t from-black/70 to-transparent px-3 py-3'>
                  <p className='font-medium text-sm text-white'>{img.caption}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { GallerySection };
