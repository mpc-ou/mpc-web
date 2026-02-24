import { CalendarDays } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getEventsPageData } from "@/app/[locale]/actions/events";
import { DynamicEventsClient } from "./client";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function EventsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;
  const validPage = isNaN(page) || page < 1 ? 1 : page;

  const take = 9;

  const { data } = await getEventsPageData(validPage, take);
  const payload = data?.payload as { events: any[]; totalPages: number } | undefined;

  const dbEvents = payload?.events ?? [];
  const totalPages = payload?.totalPages ?? 0;

  return (
    <div className='min-h-screen bg-background pt-10 pb-20 sm:pt-20'>
      <div className='container mx-auto max-w-6xl px-4'>
        {/* Header */}
        <div className='mb-16 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
            <CalendarDays className='h-8 w-8' />
          </div>
          <h1 className='mb-4 font-black text-4xl tracking-tight sm:text-5xl'>Sự kiện của MPC</h1>
          <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
            Tham gia các hoạt động, giao lưu học hỏi và phát triển kỹ năng cùng câu lạc bộ.
          </p>
        </div>

        {/* Content */}
        <DynamicEventsClient currentPage={validPage} events={dbEvents} totalPages={totalPages} />
      </div>
    </div>
  );
}
