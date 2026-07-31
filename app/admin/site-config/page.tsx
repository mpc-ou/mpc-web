import { Sliders } from "lucide-react";
import { adminGetWebDesignConfig, adminGetWebDesignExhibitions } from "@/app/_actions/admin";
import { DEFAULT_WEBDESIGN_CONFIG, type WebDesignConfig, type WebDesignExhibitionItem } from "@/types/webdesign";
import { AdminPageHeader } from "../_components/admin-page-header";
import { SiteConfigManager } from "./manager";

export default async function AdminSiteConfigPage(): Promise<React.ReactNode> {
  const [{ data: configData }, { data: exhibitionsData }] = await Promise.all([
    adminGetWebDesignConfig(),
    adminGetWebDesignExhibitions()
  ]);

  const webDesignConfig = (configData?.payload as WebDesignConfig | undefined) ?? DEFAULT_WEBDESIGN_CONFIG;
  const webDesignExhibitions = (exhibitionsData?.payload as WebDesignExhibitionItem[] | undefined) ?? [];

  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        description='Cấu hình nội dung cho các trang sự kiện tuỳ chỉnh (hiện có: WebDesign Contest)'
        icon={Sliders}
        title='Cài đặt trang tùy chỉnh'
      />
      <SiteConfigManager webDesignConfig={webDesignConfig} webDesignExhibitions={webDesignExhibitions} />
    </div>
  );
}
