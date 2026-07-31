import { Skeleton } from "@/components/ui/skeleton";

export default function EditMemberLoading() {
  return (
    <div className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-8 w-72' />
        <Skeleton className='h-4 w-96 max-w-full' />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <div className='flex flex-col gap-5 rounded-xl border bg-background p-6 shadow-sm'>
          <Skeleton className='h-5 w-36' />

          <Skeleton className='h-40 w-full rounded-xl' />
          <div className='mt-2 flex items-center gap-4'>
            <Skeleton className='h-24 w-24 shrink-0 rounded-full' />
            <div className='flex flex-1 flex-col gap-2'>
              <Skeleton className='h-8 w-32' />
              <Skeleton className='h-3 w-44' />
            </div>
          </div>

          <div className='flex flex-col gap-4 pt-2'>
            <div className='grid grid-cols-2 gap-3'>
              <Skeleton className='h-9 rounded-md' />
              <Skeleton className='h-9 rounded-md' />
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <Skeleton className='h-9 rounded-md' />
              <Skeleton className='h-9 rounded-md' />
            </div>
            <Skeleton className='h-9 rounded-md' />
            <Skeleton className='h-9 rounded-md' />
            <Skeleton className='h-20 rounded-md' />
            <Skeleton className='h-9 rounded-md' />
            <Skeleton className='ml-auto h-9 w-28 rounded-md' />
          </div>
        </div>

        <div className='flex flex-col gap-6'>
          <div className='flex flex-col gap-4 rounded-xl border bg-background p-6 shadow-sm'>
            <Skeleton className='h-5 w-28' />
            {[1, 2].map((i) => (
              <div className='flex items-center gap-2' key={i}>
                <Skeleton className='h-9 w-40 shrink-0 rounded-md' />
                <Skeleton className='h-9 flex-1 rounded-md' />
                <Skeleton className='h-9 w-9 shrink-0 rounded-md' />
              </div>
            ))}
            <Skeleton className='h-9 w-full rounded-md border-dashed' />
          </div>

          <div className='flex flex-col gap-4 rounded-xl border bg-background p-6 shadow-sm'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-5 w-36' />
              <Skeleton className='h-8 w-28 rounded-md' />
            </div>
            {[1, 2, 3].map((i) => (
              <div className='flex items-start gap-3 pl-4' key={i}>
                <Skeleton className='mt-1.5 h-3 w-3 shrink-0 rounded-full' />
                <div className='flex flex-1 flex-col gap-1.5'>
                  <Skeleton className='h-4 w-36' />
                  <Skeleton className='h-3 w-24' />
                  <Skeleton className='h-3 w-20' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
