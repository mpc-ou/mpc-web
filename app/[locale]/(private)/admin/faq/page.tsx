import { adminGetFaqItems } from "../actions";
import type { FaqRow } from "./columns";
import { FaqDataTable } from "./manager";

export default async function AdminFaqPage() {
  const { data } = await adminGetFaqItems();
  const items = (data?.payload ?? []) as FaqRow[];

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='font-bold text-2xl text-foreground'>❓ Quản lý FAQ</h1>
        <p className='text-muted-foreground text-sm'>{items.length} câu hỏi</p>
      </div>
      <FaqDataTable data={items} />
    </div>
  );
}
