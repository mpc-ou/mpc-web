"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export function CoverParallax({
  coverImage,
  initials,
  children
}: {
  coverImage: string | null;
  initials: string;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(800px) rotateY(${x * 8}deg) rotateX(${y * -6}deg) scale(1.05)`);
  };

  const handleMouseLeave = () => {
    setTransform("");
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: decorative mouse-tracking parallax effect
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative mouse-tracking parallax effect
    <div
      className='relative h-70 w-full overflow-hidden bg-linear-to-br from-primary/20 via-primary/10 to-muted md:h-90'
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      ref={ref}
      style={{ transform, transition: "transform 0.15s ease-out" }}
    >
      {coverImage ? (
        <Image
          alt='Cover'
          className='object-cover'
          fill
          priority
          sizes='100vw'
          src={coverImage}
          style={{
            transform: "scale(1.1)",
            transition: "transform 0.15s ease-out"
          }}
        />
      ) : (
        <div className='flex h-full w-full items-center justify-center'>
          <div className='select-none text-[120px] opacity-10'>{initials}</div>
        </div>
      )}
      <div className='absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background/80 to-transparent' />
      {children}
    </div>
  );
}
