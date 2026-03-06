"use client";

import { Film, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { adminDeleteRecap, adminGetRecaps, adminUpdateRecap } from "../actions";
import { createColumns, type RecapRow } from "./columns";
import { RecapTable } from "./table";

export default function RecapsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [recaps, setRecaps] = useState<RecapRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await adminGetRecaps();
    if (res.data?.payload) {
      setRecaps(
        (res.data.payload as any[]).map((r) => ({
          ...r,
          createdAt: new Date(r.createdAt).toISOString()
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (year: number) => {
    if (!confirm(`Xóa recap năm ${year}?`)) {
      return;
    }
    const res = await adminDeleteRecap(year);
    if (res.error) {
      toast({ variant: "destructive", description: res.error.message });
      return;
    }
    toast({ variant: "success", description: `Đã xóa recap ${year}` });
    load();
  };

  const handleTogglePublish = async (year: number, isPublished: boolean) => {
    const res = await adminUpdateRecap(year, { isPublished });
    if (res.error) {
      toast({ variant: "destructive", description: res.error.message });
      return;
    }
    toast({
      variant: "success",
      description: isPublished ? `Đã xuất bản recap ${year}` : `Đã hủy xuất bản recap ${year}`
    });
    load();
  };

  const columns = createColumns(
    (year) => router.push(`/admin/recaps/${year}/edit`),
    handleDelete,
    (year) => window.open(`/recap/${year}`, "_blank"),
    handleTogglePublish
  );

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
            <Film className='h-5 w-5 text-primary' />
          </div>
          <div>
            <h1 className='font-bold text-2xl'>Year Recaps</h1>
            <p className='text-muted-foreground text-sm'>Quản lý tổng kết hoạt động theo năm</p>
          </div>
        </div>
        <Button onClick={() => router.push("/admin/recaps/create")}>
          <Plus className='mr-2 h-4 w-4' />
          Tạo Recap mới
        </Button>
      </div>

      {loading ? (
        <div className='py-12 text-center text-muted-foreground'>Đang tải...</div>
      ) : (
        <RecapTable columns={columns} data={recaps} />
      )}
    </div>
  );
}
