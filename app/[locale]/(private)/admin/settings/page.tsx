import { adminGetExternalLinks, adminGetSettings } from "../actions";
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
      <div>
        <h1 className='font-bold text-2xl text-foreground'>⚙️ Cài đặt Website</h1>
        <p className='text-muted-foreground text-sm'>Cấu hình footer, liên kết mạng xã hội và liên kết ngoài</p>
      </div>
      <SettingsManager externalLinks={externalLinks} settings={settings} />
    </div>
  );
}
