"use client";

import { useState } from "react";
import { useHandleError } from "@/app/admin/_hooks/use-handle-error";
import { uploadToStorage } from "@/services/supabase-upload";

/** Uploads a file to the `media/webdesign` bucket folder and toasts the outcome. */
export function useStorageUpload() {
  const { toast } = useHandleError();
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const url = await uploadToStorage(file, "media", "webdesign");
      toast({ description: "Đã tải lên thành công!" });
      return url;
    } catch (err) {
      toast({
        variant: "destructive",
        description: `Lỗi tải lên: ${err instanceof Error ? err.message : "Thất bại"}`
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading };
}
