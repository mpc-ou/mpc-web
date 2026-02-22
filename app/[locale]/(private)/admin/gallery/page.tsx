import { adminGetGalleryImages } from "../actions";
import { GalleryManager } from "./manager";

type GalleryImage = {
  id: string;
  url: string;
  caption: string | null;
  order: number;
  isActive: boolean;
};

export default async function AdminGalleryPage() {
  const { data } = await adminGetGalleryImages();
  const images = (data?.payload ?? []) as GalleryImage[];

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='font-bold text-2xl text-foreground'>🖼️ Quản lý Gallery</h1>
        <p className='text-muted-foreground text-sm'>{images.length} ảnh</p>
      </div>
      <GalleryManager images={images} />
    </div>
  );
}
