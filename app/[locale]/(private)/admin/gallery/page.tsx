import { Images } from "lucide-react";
import { adminGetGalleryImages } from "@/app/_actions/admin";
import type { GalleryImage } from "@/configs/prisma/generated/prisma/client";
import { AdminPageHeader } from "../_components/admin-page-header";
import { GalleryManager } from "./manager";

export default async function AdminGalleryPage(): Promise<React.ReactNode> {
  const { data } = await adminGetGalleryImages();
  const images = (data?.payload ?? []) as GalleryImage[];

  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        description='Hình ảnh hiển thị trong phần gallery trên trang chủ'
        icon={Images}
        title='Quản lý Gallery'
      />
      <GalleryManager images={images} />
    </div>
  );
}
