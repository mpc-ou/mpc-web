"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminGetRecap, adminGetRecapCandidates } from "../../../actions";
import { RecapWizard } from "../../wizard";

export default function EditRecapPage() {
  const router = useRouter();
  const params = useParams();
  const year = Number(params.year);

  const [recap, setRecap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const recapRes = await adminGetRecap(year);
      if (recapRes.data?.payload && !(recapRes.data.payload as any).notFound) {
        setRecap(recapRes.data.payload);
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
