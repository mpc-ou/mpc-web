"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageLightbox } from "@/components/image-lightbox.client";
import { cn } from "@/lib/utils";

type GalleryImage = {
  id: string;
  url: string;
  caption: string | null;
  order: number;
};

const GAP = 10;
const COL_SPEEDS = [0.55, 0.42, 0.5, 0.46];
const CARD_SIZES = [
  { w: 640, h: 480 },
  { w: 640, h: 800 },
  { w: 640, h: 640 },
  { w: 640, h: 360 },
  { w: 480, h: 640 }
];

const getColCount = (): number => {
  if (typeof window === "undefined") {
    return 3;
  }
  if (window.innerWidth < 640) {
    return 2;
  }
  if (window.innerWidth < 1280) {
    return 3;
  }
  return 4;
};

const hashHeight = (id: string, colW: number): number => {
  const idx = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % CARD_SIZES.length;
  const size = CARD_SIZES[idx]!;
  return Math.round((colW * size.h) / size.w);
};

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

const GalleryMasonry = ({ images, className }: { images: GalleryImage[]; className?: string }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const outerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const colDataRef = useRef<
    {
      wrapper: HTMLDivElement;
      offset: number;
      cycleH: number;
    }[]
  >([]);
  const isPausedRef = useRef(false);
  const lastWheelRef = useRef(0);
  const rafRef = useRef<number>(0);

  const buildCols = useCallback(() => {
    const container = containerRef.current;
    if (!container || images.length === 0) {
      return;
    }
    cancelAnimationFrame(rafRef.current);

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    colDataRef.current = [];

    const containerW = container.offsetWidth;
    const containerH = container.offsetHeight;
    const cols = getColCount();
    const N = images.length;
    const colW = (containerW - GAP * (cols - 1)) / cols;

    const cycleRows = lcm(N, cols) / cols;

    const colSequences: GalleryImage[][] = Array.from({ length: cols }, (_, c) =>
      Array.from({ length: cycleRows }, (__, r) => images[(r * cols + c) % N]!)
    );

    const heightCache = new Map<string, number>();
    const getH = (img: GalleryImage) => {
      if (!heightCache.has(img.id)) {
        heightCache.set(img.id, hashHeight(img.id, colW));
      }
      return heightCache.get(img.id)!;
    };

    for (let c = 0; c < cols; c++) {
      const seq = colSequences[c]!;
      const cycleH = seq.reduce((s, img) => s + getH(img) + GAP, 0);

      const copies = Math.max(5, Math.ceil((containerH * 3 + 400) / cycleH) + 2);

      const wrapper = document.createElement("div");
      wrapper.style.cssText = `
        position: absolute;
        left: ${c * (colW + GAP)}px;
        top: 0;
        width: ${colW}px;
        will-change: transform;
      `;

      for (let k = 0; k < copies; k++) {
        seq.forEach((img) => {
          const h = getH(img);
          const card = document.createElement("div");
          card.style.cssText = `
            width:100%;height:${h}px;margin-bottom:${GAP}px;
            border-radius:10px;overflow:hidden;
            position:relative;cursor:pointer;background:#111;flex-shrink:0;
          `;

          const im = document.createElement("img");
          im.src = img.url;
          im.alt = img.caption ?? "";
          im.loading = k < 2 ? "eager" : "lazy";
          im.decoding = "async";
          im.style.cssText = `
            width:100%;height:100%;object-fit:cover;display:block;
            transition:transform 0.4s ease;
          `;
          card.addEventListener("mouseenter", () => {
            im.style.transform = "scale(1.06)";
          });
          card.addEventListener("mouseleave", () => {
            im.style.transform = "scale(1)";
          });

          if (img.caption) {
            const cap = document.createElement("div");
            cap.style.cssText = `
              position:absolute;inset:0;display:flex;align-items:flex-end;
              background:linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 60%);
              opacity:0;transition:opacity 0.25s;padding:10px;pointer-events:none;
            `;
            const txt = document.createElement("p");
            txt.textContent = img.caption;
            txt.style.cssText = `
              margin:0;color:#fff;font-size:12px;font-weight:500;
              overflow:hidden;white-space:nowrap;text-overflow:ellipsis;width:100%;
            `;
            cap.appendChild(txt);
            card.appendChild(cap);
            card.addEventListener("mouseenter", () => {
              cap.style.opacity = "1";
            });
            card.addEventListener("mouseleave", () => {
              cap.style.opacity = "0";
            });
          }

          const globalIdx = images.findIndex((x) => x.id === img.id);
          card.addEventListener("click", () => {
            setLightboxIndex(globalIdx);
            setLightboxOpen(true);
          });

          card.appendChild(im);
          wrapper.appendChild(card);
        });
      }

      container.appendChild(wrapper);

      const initOffset = cycleH * Math.floor(copies / 2);
      wrapper.style.transform = `translateY(${-initOffset}px)`;

      colDataRef.current.push({ wrapper, offset: initOffset, cycleH });
    }

    let lastTs = 0;
    const animate = (ts: number) => {
      const dt = lastTs ? Math.min(ts - lastTs, 32) : 16;
      lastTs = ts;

      const now = performance.now();
      const wheelActive = now - lastWheelRef.current < 150;

      for (let c = 0; c < colDataRef.current.length; c++) {
        const col = colDataRef.current[c]!;
        if (!(isPausedRef.current || wheelActive)) {
          col.offset += (COL_SPEEDS[c] ?? 0.5) * (dt / 16);
        }

        const copies = Math.max(5, Math.ceil((containerRef.current?.offsetHeight * 3 + 400) / col.cycleH) + 2);
        const minOffset = col.cycleH;
        const maxOffset = col.cycleH * (copies - 1);

        if (col.offset >= maxOffset) {
          col.offset -= col.cycleH * (copies - 2);
        }
        if (col.offset < minOffset) {
          col.offset += col.cycleH * (copies - 2);
        }

        col.wrapper.style.transform = `translateY(${-col.offset}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
  }, [images]);

  useEffect(() => {
    buildCols();
    return () => cancelAnimationFrame(rafRef.current);
  }, [buildCols]);

  useEffect(() => {
    let prev = getColCount();
    const onResize = () => {
      const next = getColCount();
      if (next !== prev) {
        prev = next;
        buildCols();
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [buildCols]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) {
      return;
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.6;
      for (const col of colDataRef.current) {
        col.offset += delta;
      }
      lastWheelRef.current = performance.now();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <>
      <div
        className='group/gallery relative mx-auto max-w-6xl overflow-hidden'
        onMouseEnter={() => {
          isPausedRef.current = true;
        }}
        onMouseLeave={() => {
          isPausedRef.current = false;
        }}
        ref={outerRef}
      >
        <div className='pointer-events-none absolute inset-x-0 top-0 z-20 h-14 bg-linear-to-b from-background to-transparent' />
        <div className='pointer-events-none absolute inset-x-0 bottom-0 z-20 h-14 bg-linear-to-t from-background to-transparent' />
        <div
          className={cn("relative h-125 w-full overflow-hidden px-3", className)}
          ref={containerRef}
          style={{ cursor: "grab" }}
        />
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          open={lightboxOpen}
        />
      )}
    </>
  );
};

export { GalleryMasonry };
