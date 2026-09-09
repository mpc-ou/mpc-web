"use client";

import { useEffect } from "react";
import { ErrorContent } from "@/components/custom/error-content.client";

type ErrorType = { error: Error & { digest?: string }; reset: () => void };

export default function ErrorGlobal({ error, reset }: ErrorType) {
  useEffect(() => {
    if (error.name === "AbortError" || ("code" in error && (error as unknown as { code: number }).code === 20)) {
      reset();
    }
  }, [error, reset]);

  if (error.name === "AbortError" || ("code" in error && (error as unknown as { code: number }).code === 20)) {
    return null;
  }

  return (
    <ErrorContent
      description='Thật không may, chúng tôi đã gặp sự cố không mong muốn trong khi xử lý yêu cầu của bạn.'
      redirect='Về trang chủ'
      reminder='Nếu sự cố vẫn tiếp diễn, vui lòng liên hệ với bộ phận hỗ trợ kỹ thuật.'
      reset={reset}
      statusCode={500}
      title='Đã xảy ra lỗi hệ thống'
      tryAgain='Thử lại'
    />
  );
}
