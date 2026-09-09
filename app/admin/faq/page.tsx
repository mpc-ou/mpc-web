import { HelpCircle } from "lucide-react";
import { adminGetFaqItems } from "@/app/_actions/admin";
import { AdminPageHeader } from "../_components/admin-page-header";
import type { FaqRow } from "./columns";
import { FaqDataTable } from "./manager";

export default async function AdminFaqPage(): Promise<React.ReactNode> {
  const { data } = await adminGetFaqItems();
  const items = (data?.payload ?? []) as FaqRow[];

  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader description='Câu hỏi thường gặp hiển thị trên website' icon={HelpCircle} title='Quản lý FAQ' />
      <FaqDataTable data={items} />
    </div>
  );
}
