import { adminGetHomepageSections } from "../actions";
import type { SectionRow } from "./columns";
import { HomepageDataTable } from "./manager";

export default async function AdminHomepagePage(): Promise<React.ReactNode> {
  const { data } = await adminGetHomepageSections();
  const sections = (data?.payload ?? []) as SectionRow[];

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='font-bold text-2xl text-foreground'>🏠 Quản lý Trang chủ</h1>
        <p className='text-muted-foreground text-sm'>Cấu hình nội dung các section trang chủ</p>
      </div>
      <HomepageDataTable data={sections} />
    </div>
  );
}
