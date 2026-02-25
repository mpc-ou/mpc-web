"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminGetRecapCandidates } from "../../actions";
import { RecapWizard } from "../wizard";

export default function CreateRecapPage() {
  const router = useRouter();
  const [year, setYear] = useState(new Date().getFullYear());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button onClick={() => router.back()} size="icon" variant="ghost">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-bold text-2xl">Tạo Recap mới</h1>
          <p className="text-muted-foreground text-sm">
            Điền thông tin qua 5 bước
          </p>
        </div>
      </div>

      <RecapWizard mode="create" />
    </div>
  );
}
