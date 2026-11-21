import { Sliders } from "lucide-react";
import { adminGetWebDesignConfig, adminGetWebDesignExhibitions, adminGetWebDesignFaqs } from "@/app/_actions/admin";
import {
  DEFAULT_WEBDESIGN_CONFIG,
  type WebDesignConfig,
  type WebDesignExhibitionItem,
  type WebDesignFaq
} from "@/types/webdesign";
import { AdminPageHeader } from "../_components/admin-page-header";
import { SiteConfigManager } from "./manager";

export default async function AdminSiteConfigPage(): Promise<React.ReactNode> {
  const [{ data: configData }, { data: exhibitionsData }, { data: faqsData }] = await Promise.all([
    adminGetWebDesignConfig(),
    adminGetWebDesignExhibitions(),
    adminGetWebDesignFaqs()
  ]);

  const webDesignConfig = (configData?.payload as WebDesignConfig | undefined) ?? DEFAULT_WEBDESIGN_CONFIG;
  const webDesignExhibitions = (exhibitionsData?.payload as WebDesignExhibitionItem[] | undefined) ?? [];
  const webDesignFaqs = (faqsData?.payload as WebDesignFaq[] | undefined) ?? [];

  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        description='Cấu hình nội dung cho các trang sự kiện tuỳ chỉnh (hiện có: WebDesign Contest)'
        icon={Sliders}
        title='Cài đặt trang tùy chỉnh'
      />
      <SiteConfigManager
        webDesignConfig={webDesignConfig}
        webDesignExhibitions={webDesignExhibitions}
        webDesignFaqs={webDesignFaqs}
      />
    </div>
  );
}
