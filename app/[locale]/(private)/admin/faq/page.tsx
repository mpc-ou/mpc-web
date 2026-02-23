import { adminGetFaqItems, adminGetSettings } from "../actions";
import type { FaqRow } from "./columns";
import { FaqDataTable } from "./manager";

export default async function AdminFaqPage() {
  const [{ data: faqData }, { data: settingsData }] = await Promise.all([adminGetFaqItems(), adminGetSettings()]);

  const items = (faqData?.payload ?? []) as FaqRow[];
  const settings = (settingsData?.payload ?? []) as Array<{
    key: string;
    value: string;
  }>;
  const useTemplate = settings.find((s) => s.key === "faq_use_template")?.value === "true";

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='font-bold text-2xl text-foreground'>❓ Quản lý FAQ</h1>
        <p className='text-muted-foreground text-sm'>{items.length} câu hỏi</p>
      </div>
      <FaqDataTable data={items} useTemplate={useTemplate} />
    </div>
  );
}
