"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-[var(--error)]" />
        <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
          Đã xảy ra lỗi!
        </h2>
        <p className="text-[var(--text-secondary)] mb-8">
          {error.message || "Có lỗi xảy ra khi tải trang. Vui lòng thử lại."}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>Thử lại</Button>
        </div>
      </div>
    </div>
  );
}
