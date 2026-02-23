"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ImageItem = {
  id: string;
  url: string;
  caption?: string | null;
};

type Props = {
  images: ImageItem[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
};

const ImageLightbox = ({ images, initialIndex = 0, open, onClose }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "ArrowRight") {
        goNext();
      }
      if (e.key === "ArrowLeft") {
        goPrev();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, goNext, goPrev, onClose]);

  if (!mounted || !open || images.length === 0) {
    return null;
  }

  const current = images.at(currentIndex);

  const content = (
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      {/* Backdrop */}
      <button
        aria-label="Close lightbox"
        className="absolute inset-0 cursor-default bg-black/90"
        onClick={onClose}
        type="button"
      />

      {/* Close button */}
      <button
        aria-label="Close"
        className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/20"
        onClick={onClose}
        type="button"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Prev button */}
      {images.length > 1 && (
        <button
          aria-label="Previous image"
          className="absolute left-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/20"
          onClick={goPrev}
          type="button"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <div className="relative z-10 flex max-h-[90vh] max-w-[90vw] flex-col items-center">
        <img
          alt={current?.caption ?? "Gallery image"}
          className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain"
          src={current?.url}
        />
        {current?.caption && (
          <p className="mt-3 text-center text-sm text-white/80">
            {current.caption}
          </p>
        )}
        <p className="mt-1 text-xs text-white/50">
          {currentIndex + 1} / {images.length}
        </p>
      </div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          aria-label="Next image"
          className="absolute right-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/20"
          onClick={goNext}
          type="button"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );

  return createPortal(content, document.body);
};

export { ImageLightbox };
