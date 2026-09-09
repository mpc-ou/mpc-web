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
      description='An unexpected error occurred. Please try again.'
      reset={reset}
      title='Something went wrong'
    />
  );
}
