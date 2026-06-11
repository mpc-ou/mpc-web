"use client";

import { useState } from "react";

type TrainingImageProps = {
  src: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
};

export function TrainingImage({ src, alt, className, fallback }: TrainingImageProps) {
  const [hasError, setHasError] = useState(!src);

  if (hasError) {
    return <>{fallback}</>;
  }

  return <img alt={alt} className={className} onError={() => setHasError(true)} src={src} />;
}
