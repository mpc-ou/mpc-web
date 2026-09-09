"use client";

import Image from "next/image";
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

  // `className` positions this wrapper (e.g. `absolute inset-x-0 top-6 bottom-0`);
  // the Image itself just fills whatever box the wrapper ends up with — `fill`
  // sets `inset: 0` via inline style, which would stomp an asymmetric inset
  // passed straight through as the image's own className.
  return (
    <div className={className}>
      <Image
        alt={alt}
        className='object-cover transition-transform duration-500 group-hover:scale-105'
        fill
        onError={() => setHasError(true)}
        sizes='(min-width: 768px) 33vw, 100vw'
        src={src}
      />
    </div>
  );
}
