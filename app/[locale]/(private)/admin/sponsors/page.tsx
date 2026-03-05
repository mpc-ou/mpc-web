import { adminGetSponsors } from "../actions";
import type { SponsorRow } from "./columns";
import { SponsorsDataTable } from "./table";

export default async function AdminSponsorsPage(): Promise<React.ReactNode> {
  const { data } = await adminGetSponsors();
  const sponsors = (data?.payload ?? []) as SponsorRow[];

  return (
    <div className='flex flex-col gap-6'>
      <h1 className='font-bold text-2xl text-foreground'>💝 Quản lý Nhà tài trợ</h1>
      <SponsorsDataTable data={sponsors} />
    </div>
  );
}
