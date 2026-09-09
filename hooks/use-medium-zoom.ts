"use client";

import mediumZoom from "medium-zoom";
import { useEffect, useRef } from "react";

/**
 * Attach medium-zoom to a container ref.
 * All <img> elements inside the container will get click-to-zoom behavior.
 */
export function useMediumZoom<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const zoomRef = useRef<ReturnType<typeof mediumZoom> | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const images = ref.current.querySelectorAll("img");
    if (images.length === 0) {
      return;
    }
    zoomRef.current = mediumZoom(images as unknown as HTMLElement[], {
      background: "rgba(10, 10, 15, 0.95)",
      margin: 40
    });
    return () => {
      zoomRef.current?.detach();
      zoomRef.current?.close();
    };
  }, []);

  return ref;
}
