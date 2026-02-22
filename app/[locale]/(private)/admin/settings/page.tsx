import { adminGetSettings } from "../actions";
import { SettingsManager } from "./manager";

export default async function AdminSettingsPage() {
  const { data } = await adminGetSettings();
  const settings = (data?.payload ?? []) as Array<{
    id: string;
    key: string;
    value: string;
    description: string | null;
  }>;

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='font-bold text-2xl text-foreground'>Cài đặt Website</h1>
        <p className='text-muted-foreground text-sm'>Cấu hình key-value cho toàn bộ trang web</p>
      </div>
      <SettingsManager settings={settings} />
    </div>
  );
}
