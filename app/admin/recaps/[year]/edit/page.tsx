"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminGetRecap } from "@/app/_actions/admin";
import { Button } from "@/components/ui/button";
import type { RecapData } from "@/lib/recap-data";
import { RecapWizard } from "../../wizard";

type RecapPayload = {
  year: number;
  name: string;
  description?: string | null;
  coverImage?: string | null;
  coverImage2?: string | null;
  coverImage3?: string | null;
  endImage?: string | null;
  musicUrl?: string | null;
  isPublished?: boolean;
  data?: RecapData;
  notFound?: boolean;
};

export default function EditRecapPage() {
  const router = useRouter();
  const params = useParams();
  const year = Number(params.year);

  const [recap, setRecap] = useState<RecapPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const recapRes = await adminGetRecap(year);
      const payload = recapRes.data?.payload as RecapPayload | undefined;
      if (payload && !payload.notFound) {
        setRecap(payload);
      }
      setLoading(false);
    };
    load();
  }, [year]);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-24'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!recap) {
    return (
      <div className='py-24 text-center'>
        <p className='text-muted-foreground'>Không tìm thấy recap năm {year}</p>
        <Button className='mt-4' onClick={() => router.back()} variant='outline'>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <Button onClick={() => router.back()} size='icon' variant='ghost'>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <div>
          <h1 className='font-bold text-2xl'>Chỉnh sửa Recap {year}</h1>
          <p className='text-muted-foreground text-sm'>Cập nhật thông tin recap</p>
        </div>
      </div>

      <RecapWizard initialData={recap} mode='edit' />
    </div>
  );
}
