import { Settings } from "lucide-react";
import { adminGetExternalLinks, adminGetSettings } from "@/app/_actions/admin";
import { AdminPageHeader } from "../_components/admin-page-header";
import { SettingsManager } from "./manager";

export default async function AdminSettingsPage(): Promise<React.ReactNode> {
  const [{ data: settingsData }, { data: linksData }] = await Promise.all([
    adminGetSettings(),
    adminGetExternalLinks()
  ]);

  const settings = (settingsData?.payload ?? []) as Array<{
    id: string;
    key: string;
    value: string;
    description: string | null;
  }>;

  const externalLinks = (linksData?.payload ?? []) as Array<{
    id: string;
    label: string;
    url: string;
    order: number;
    isActive: boolean;
  }>;

  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        description='Cấu hình footer, liên kết mạng xã hội và liên kết ngoài'
        icon={Settings}
        title='Cài đặt Website'
      />
      <SettingsManager externalLinks={externalLinks} settings={settings} />
    </div>
  );
}
