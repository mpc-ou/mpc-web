"use client";

import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageLightbox } from "@/components/image-lightbox.client";
import { cn } from "@/lib/utils";

type GalleryImage = {
  id: string;
  url: string;
  caption: string | null;
  order: number;
};

// ── Layout ──────────────────────────────────────────────────────────────────
const GAP = 10;
/** Auto-scroll speed per column, in plane px per second (≈0.5px per 60Hz frame). Odd columns run upwards. */
const COL_SPEEDS = [30, -30, 28, -26, 32, -28, 30, -27];
const DEFAULT_COL_SPEED = 30;
const CARD_SIZES = [
  { w: 640, h: 480 },
  { w: 640, h: 800 },
  { w: 640, h: 640 },
  { w: 640, h: 360 },
  { w: 480, h: 640 }
];
const BREAKPOINT_SM = 640;
const BREAKPOINT_XL = 1280;
const COLS_MOBILE = 2;
const COLS_TABLET = 3;
const COLS_DESKTOP = 4;
const EAGER_COPIES = 2;

// ── Tilt ────────────────────────────────────────────────────────────────────
const PERSPECTIVE_PX = 1400;
/** When tilted, the plane overflows the viewport by this ratio on every side (inset: -35%). */
const PLANE_OVERSCAN = 0.35;
/** Extra scale so the far (receding) edge still covers the viewport while tilted. */
const PLANE_SCALE = 1.25;
const PARALLAX_MAX_DEG = 5;
const PARALLAX_EASE_RATE = 6;
const TILT_EPSILON_DEG = 0.01;

// ── Motion ──────────────────────────────────────────────────────────────────
const AUTO_EASE_RATE = 3;
const AUTO_EPSILON = 0.001;
const RESUME_DELAY_MS = 1200;
/** Inertia friction per 60Hz frame; scaled by dt so it is refresh-rate independent. */
const FRICTION = 0.94;
const FRAMES_PER_SECOND = 60;
const MIN_VELOCITY = 2;
const MAX_VELOCITY = 4000;
const MAX_DT_S = 0.05;
const MS_PER_S = 1000;
const DRAG_THRESHOLD_PX = 5;
const AXIS_LOCK_PX = 8;
/** Releasing after holding still this long means "no fling". */
const FLING_STALE_MS = 80;
const DRAG_VELOCITY_SMOOTHING = 0.6;
const WHEEL_VELOCITY_GAIN = 1.2;
const WHEEL_LINE_PX = 16;
const KEY_VELOCITY_IMPULSE = 600;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const NO_HOVER_QUERY = "(hover: none)";
const DEG_TO_RAD = Math.PI / 180;

const MASK_VERTICAL = "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)";
const MASK_HORIZONTAL = "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)";

const getBaseColCount = (): number => {
  if (typeof window === "undefined") {
    return COLS_TABLET;
  }
  if (window.innerWidth < BREAKPOINT_SM) {
    return COLS_MOBILE;
  }
  if (window.innerWidth < BREAKPOINT_XL) {
    return COLS_TABLET;
  }
  return COLS_DESKTOP;
};

/** A tilted plane is wider than the viewport, so it needs more columns to keep card size similar. */
const getColCount = (tilted: boolean): number => {
  const base = getBaseColCount();
  return tilted ? Math.round(base * (1 + 2 * PLANE_OVERSCAN)) : base;
};

const hashHeight = (id: string, colW: number): number => {
  const idx = [...id].reduce((a, c) => a + c.charCodeAt(0), 0) % CARD_SIZES.length;
  const size = CARD_SIZES[idx] ?? CARD_SIZES[0];
  return Math.round((colW * size.h) / size.w);
};

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

/** Frame-rate independent exponential approach of `current` towards `target`. */
const approach = (current: number, target: number, rate: number, dt: number): number =>
  current + (target - current) * (1 - Math.exp(-rate * dt));

const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

/** Keeps the offset inside one cycle, [0, cycleH). */
const wrapOffset = (offset: number, cycleH: number): number => (cycleH > 0 ? ((offset % cycleH) + cycleH) % cycleH : 0);

const planeTransform = (tiltX: number, tiltY: number, tiltZ: number, scale: number): string =>
  `rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${tiltZ}deg) scale(${scale})`;

const columnTransform = (offset: number): string => `translate3d(0, ${-offset}px, 0)`;

type GalleryItem = {
  key: string;
  image: GalleryImage;
  index: number;
  height: number;
  eager: boolean;
};

type ColumnLayout = {
  left: number;
  width: number;
  cycleH: number;
  items: GalleryItem[];
};

type PlaneSize = { width: number; height: number; cols: number };

type ColumnState = {
  el: HTMLDivElement | null;
  offset: number;
  cycleH: number;
  speed: number;
};

type DragState = {
  pointerId: number;
  isTouch: boolean;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastT: number;
  engaged: boolean;
};

const buildLayout = (images: GalleryImage[], { width, height, cols }: PlaneSize): ColumnLayout[] => {
  const n = images.length;
  const first = images[0];
  if (!first || width === 0 || height === 0) {
    return [];
  }

  const colW = (width - GAP * (cols - 1)) / cols;
  const cycleRows = lcm(n, cols) / cols;
  const indexById = new Map(images.map((img, i) => [img.id, i]));

  return Array.from({ length: cols }, (_, c) => {
    const seq = Array.from({ length: cycleRows }, (__, r) => images[(r * cols + c) % n] ?? first);
    const heights = seq.map((img) => hashHeight(img.id, colW));
    const cycleH = heights.reduce((s, h) => s + h + GAP, 0);
    // Offset stays in [0, cycleH), so one cycle plus enough to cover the plane is enough.
    const copies = Math.max(2, Math.ceil(height / cycleH) + 1);

    const items: GalleryItem[] = [];
    for (let k = 0; k < copies; k++) {
      for (const [r, image] of seq.entries()) {
        items.push({
          key: `${image.id}-${r}-${k}`,
          image,
          index: indexById.get(image.id) ?? 0,
          height: heights[r] ?? 0,
          eager: k < EAGER_COPIES
        });
      }
    }
    return { left: c * (colW + GAP), width: colW, cycleH, items };
  });
};

const GalleryCard = ({ item, onSelect }: { item: GalleryItem; onSelect: (index: number) => void }) => {
  const { image, index, height, eager } = item;
  return (
    <button
      aria-label={image.caption ?? `Image ${index + 1}`}
      className='group/card relative block w-full cursor-[inherit] overflow-hidden rounded-[10px] bg-[#111] p-0'
      onClick={() => onSelect(index)}
      style={{ height, marginBottom: GAP }}
      tabIndex={-1}
      type='button'
    >
      {/* biome-ignore lint/performance/noImgElement: hundreds of duplicated, constantly moving tiles; next/image adds per-tile overhead */}
      {/* biome-ignore lint/correctness/useImageSize: size comes from the card box */}
      <img
        alt={image.caption ?? ""}
        className='block h-full w-full object-cover transition-transform duration-400 ease-out group-hover/card:scale-[1.06]'
        decoding='async'
        draggable={false}
        loading={eager ? "eager" : "lazy"}
        src={image.url}
      />
      {image.caption && (
        <span className='pointer-events-none absolute inset-0 flex items-end bg-linear-to-t from-black/65 to-60% to-transparent p-2.5 opacity-0 transition-opacity duration-250 group-hover/card:opacity-100'>
          <span className='w-full truncate text-left font-medium text-white text-xs'>{image.caption}</span>
        </span>
      )}
    </button>
  );
};

const GalleryColumn = ({
  column,
  columnIndex,
  onSelect,
  registerColumn
}: {
  column: ColumnLayout;
  columnIndex: number;
  onSelect: (index: number) => void;
  registerColumn: (index: number, el: HTMLDivElement | null) => void;
}) => (
  <div
    className='backface-hidden absolute top-0 will-change-transform'
    ref={(el) => registerColumn(columnIndex, el)}
    style={{ left: column.left, width: column.width }}
  >
    {column.items.map((item) => (
      <GalleryCard item={item} key={item.key} onSelect={onSelect} />
    ))}
  </div>
);

type EngineOptions = {
  outerRef: RefObject<HTMLElement | null>;
  planeRef: RefObject<HTMLDivElement | null>;
  columnsRef: RefObject<ColumnState[]>;
  suppressClickRef: RefObject<boolean>;
  wakeRef: RefObject<() => void>;
  tiltXDeg: number;
  tiltZDeg: number;
  planeScale: number;
  onOpen: () => void;
};

/**
 * Animation engine: one rAF loop writing transforms directly (no per-frame setState).
 * Runs only while the tab is visible and the gallery is in the viewport, and sleeps
 * once nothing is moving.
 */
const useGalleryEngine = ({
  outerRef,
  planeRef,
  columnsRef,
  suppressClickRef,
  wakeRef,
  tiltXDeg,
  tiltZDeg,
  planeScale,
  onOpen
}: EngineOptions) => {
  useEffect(() => {
    const outer = outerRef.current;
    const plane = planeRef.current;
    if (!(outer && plane)) {
      return;
    }

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    const noHover = window.matchMedia(NO_HOVER_QUERY);
    const tilted = tiltXDeg !== 0 || tiltZDeg !== 0;

    // Unit vector of a column's "down" direction on screen after rotateZ.
    const zRad = tiltZDeg * DEG_TO_RAD;
    const axisX = -Math.sin(zRad);
    const axisY = Math.cos(zRad);
    const touchAxisSign = axisX < 0 ? -1 : 1;
    // Screen px per plane px along a column (scale + rotateX foreshortening).
    const screenPerPlanePx = planeScale * Math.cos(tiltXDeg * DEG_TO_RAD);

    let rafId = 0;
    let lastTs = 0;
    let inView = false;
    let pageVisible = !document.hidden;
    let hovering = false;
    let autoEnabled = true;
    let autoFactor = reducedMotion.matches ? 0 : 1;
    let manualVelocity = 0;
    let pendingDrag = 0;
    let lastInteraction = Number.NEGATIVE_INFINITY;
    let tiltX = 0;
    let tiltY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let drag: DragState | null = null;

    const canRun = () => inView && pageVisible;

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: one frame of the animation loop (auto-scroll, inertia, wrap, parallax, sleep)
    const frame = (ts: number) => {
      rafId = 0;
      const dt = lastTs ? Math.min((ts - lastTs) / MS_PER_S, MAX_DT_S) : 0;
      lastTs = ts;

      const reduced = reducedMotion.matches;
      const idle = performance.now() - lastInteraction > RESUME_DELAY_MS;
      const autoTarget = autoEnabled && !reduced && !hovering && !drag && idle ? 1 : 0;
      autoFactor = approach(autoFactor, autoTarget, AUTO_EASE_RATE, dt);
      if (Math.abs(autoFactor - autoTarget) < AUTO_EPSILON) {
        autoFactor = autoTarget;
      }

      let shift = pendingDrag;
      pendingDrag = 0;
      if (!drag) {
        manualVelocity *= FRICTION ** (dt * FRAMES_PER_SECOND);
        if (Math.abs(manualVelocity) < MIN_VELOCITY) {
          manualVelocity = 0;
        }
        shift += manualVelocity * dt;
      }

      for (const col of columnsRef.current) {
        const next = wrapOffset(col.offset + col.speed * autoFactor * dt + shift, col.cycleH);
        if (next !== col.offset && col.el) {
          col.el.style.transform = columnTransform(next);
        }
        col.offset = next;
      }

      const parallaxOn = tilted && !(reduced || noHover.matches);
      const goalX = parallaxOn ? targetTiltX : 0;
      const goalY = parallaxOn ? targetTiltY : 0;
      const prevTiltX = tiltX;
      const prevTiltY = tiltY;
      tiltX = approach(tiltX, goalX, PARALLAX_EASE_RATE, dt);
      tiltY = approach(tiltY, goalY, PARALLAX_EASE_RATE, dt);
      const tiltSettled = Math.abs(tiltX - goalX) < TILT_EPSILON_DEG && Math.abs(tiltY - goalY) < TILT_EPSILON_DEG;
      if (tiltSettled) {
        tiltX = goalX;
        tiltY = goalY;
      }
      if (tiltX !== prevTiltX || tiltY !== prevTiltY) {
        plane.style.transform = planeTransform(tiltXDeg + tiltX, tiltY, tiltZDeg, planeScale);
      }

      // Nothing left to animate → sleep until the next interaction wakes us.
      const settled = idle && !drag && autoTarget === 0 && autoFactor === 0 && manualVelocity === 0 && tiltSettled;
      if (!settled && canRun()) {
        rafId = requestAnimationFrame(frame);
      }
    };

    const start = () => {
      if (rafId || !canRun()) {
        return;
      }
      lastTs = 0;
      rafId = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(rafId);
      rafId = 0;
    };
    wakeRef.current = start;

    const markInteraction = () => {
      lastInteraction = performance.now();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) {
        return;
      }
      suppressClickRef.current = false;
      drag = {
        pointerId: e.pointerId,
        isTouch: e.pointerType !== "mouse",
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        lastT: e.timeStamp,
        engaged: false
      };
    };

    const updateParallax = (e: PointerEvent) => {
      if (!tilted || e.pointerType !== "mouse" || noHover.matches) {
        return;
      }
      const rect = outer.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetTiltX = -clamp(ny, -1, 1) * PARALLAX_MAX_DEG;
      targetTiltY = clamp(nx, -1, 1) * PARALLAX_MAX_DEG;
      start();
    };

    const engageDrag = (d: DragState, e: PointerEvent): boolean => {
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (Math.hypot(dx, dy) < (d.isTouch ? AXIS_LOCK_PX : DRAG_THRESHOLD_PX)) {
        return false;
      }
      // Touch: vertical intent belongs to the page (touch-action: pan-y), so bail out.
      if (d.isTouch && Math.abs(dy) > Math.abs(dx)) {
        drag = null;
        return false;
      }
      d.engaged = true;
      suppressClickRef.current = true;
      manualVelocity = 0;
      // Capture only once it is a real drag, so a plain click still reaches the card.
      outer.setPointerCapture(d.pointerId);
      outer.dataset.dragging = "true";
      return true;
    };

    const onPointerMove = (e: PointerEvent) => {
      const d = drag;
      if (!d || d.pointerId !== e.pointerId) {
        updateParallax(e);
        return;
      }
      if (!(d.engaged || engageDrag(d, e))) {
        return;
      }
      const mx = e.clientX - d.lastX;
      const my = e.clientY - d.lastY;
      // Mouse projects the drag vector onto the (rotated) column axis so images stick
      // to the cursor; touch is horizontally locked, so map the swipe onto that axis.
      const along = d.isTouch ? mx * touchAxisSign : mx * axisX + my * axisY;
      const delta = -along / screenPerPlanePx;
      const elapsed = Math.max(e.timeStamp - d.lastT, 1) / MS_PER_S;
      manualVelocity = manualVelocity * (1 - DRAG_VELOCITY_SMOOTHING) + (delta / elapsed) * DRAG_VELOCITY_SMOOTHING;
      pendingDrag += delta;
      d.lastX = e.clientX;
      d.lastY = e.clientY;
      d.lastT = e.timeStamp;
      markInteraction();
      start();
    };

    const endDrag = (e: PointerEvent) => {
      const d = drag;
      if (!d || d.pointerId !== e.pointerId) {
        return;
      }
      drag = null;
      if (!d.engaged) {
        return;
      }
      if (outer.hasPointerCapture(e.pointerId)) {
        outer.releasePointerCapture(e.pointerId);
      }
      delete outer.dataset.dragging;
      const stale = e.timeStamp - d.lastT > FLING_STALE_MS;
      manualVelocity = stale || e.type === "pointercancel" ? 0 : clamp(manualVelocity, -MAX_VELOCITY, MAX_VELOCITY);
      markInteraction();
      start();
    };

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        return;
      }
      hovering = true;
      start();
    };
    const onPointerLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        return;
      }
      hovering = false;
      targetTiltX = 0;
      targetTiltY = 0;
      start();
    };

    // Wheel is NOT hijacked: the page must always scroll normally over the gallery
    // (a home section that traps the wheel is a UX bug, and Shift+wheel is
    // undiscoverable). We only add a small nudge to the gallery's velocity.
    const onWheel = (e: WheelEvent) => {
      const px = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY * WHEEL_LINE_PX : e.deltaY;
      manualVelocity = clamp(manualVelocity + px * WHEEL_VELOCITY_GAIN, -MAX_VELOCITY, MAX_VELOCITY);
      markInteraction();
      start();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const dir = e.key === "ArrowDown" ? 1 : -1;
        manualVelocity = clamp(manualVelocity + dir * KEY_VELOCITY_IMPULSE, -MAX_VELOCITY, MAX_VELOCITY);
        markInteraction();
        start();
      } else if (e.key === " ") {
        e.preventDefault();
        autoEnabled = !autoEnabled;
        start();
      } else if (e.key === "Enter" && columnsRef.current.length > 0) {
        e.preventDefault();
        onOpen();
      }
    };

    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) {
        start();
      } else {
        stop();
      }
    };

    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      if (inView) {
        start();
      } else {
        stop();
      }
    });
    intersection.observe(outer);

    outer.addEventListener("pointerdown", onPointerDown);
    outer.addEventListener("pointermove", onPointerMove);
    outer.addEventListener("pointerup", endDrag);
    outer.addEventListener("pointercancel", endDrag);
    outer.addEventListener("pointerenter", onPointerEnter);
    outer.addEventListener("pointerleave", onPointerLeave);
    outer.addEventListener("wheel", onWheel, { passive: true });
    outer.addEventListener("keydown", onKeyDown);
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotion.addEventListener("change", start);

    return () => {
      stop();
      wakeRef.current = () => undefined;
      intersection.disconnect();
      outer.removeEventListener("pointerdown", onPointerDown);
      outer.removeEventListener("pointermove", onPointerMove);
      outer.removeEventListener("pointerup", endDrag);
      outer.removeEventListener("pointercancel", endDrag);
      outer.removeEventListener("pointerenter", onPointerEnter);
      outer.removeEventListener("pointerleave", onPointerLeave);
      outer.removeEventListener("wheel", onWheel);
      outer.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", start);
      delete outer.dataset.dragging;
    };
  }, [outerRef, planeRef, columnsRef, suppressClickRef, wakeRef, tiltXDeg, tiltZDeg, planeScale, onOpen]);
};

type GalleryMasonryProps = {
  images: GalleryImage[];
  className?: string;
  /** Backward tilt of the plane (rotateX), in degrees. 0 = flat. */
  tiltXDeg?: number;
  /** Rotation of the column axis (rotateZ), in degrees; negative leans columns to the left. 0 = vertical. */
  tiltZDeg?: number;
};

const GalleryMasonry = ({ images, className, tiltXDeg = 0, tiltZDeg = 0 }: GalleryMasonryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [planeSize, setPlaneSize] = useState<PlaneSize>({ width: 0, height: 0, cols: COLS_TABLET });

  const tilted = tiltXDeg !== 0 || tiltZDeg !== 0;
  const planeScale = tilted ? PLANE_SCALE : 1;
  const overscan = tilted ? PLANE_OVERSCAN : 0;

  const outerRef = useRef<HTMLElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const columnEls = useRef<Array<HTMLDivElement | null>>([]);
  const columnsRef = useRef<ColumnState[]>([]);
  const suppressClickRef = useRef(false);
  const wakeRef = useRef<() => void>(() => undefined);

  // Track the (untransformed) plane size; re-layout only when it actually changes.
  useEffect(() => {
    const plane = planeRef.current;
    if (!plane) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      const cols = getColCount(tilted);
      setPlaneSize((prev) =>
        prev.width === width && prev.height === height && prev.cols === cols ? prev : { width, height, cols }
      );
    });
    observer.observe(plane);
    return () => observer.disconnect();
  }, [tilted]);

  const layout = useMemo(() => buildLayout(images, planeSize), [images, planeSize]);

  const registerColumn = useCallback((index: number, el: HTMLDivElement | null) => {
    columnEls.current[index] = el;
  }, []);

  const handleSelect = useCallback((index: number) => {
    if (suppressClickRef.current) {
      return;
    }
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const openFirst = useCallback(() => {
    setLightboxIndex(0);
    setLightboxOpen(true);
  }, []);

  // Sync per-column animation state with the rendered layout, keeping the
  // relative scroll position across resizes.
  useEffect(() => {
    const prev = columnsRef.current;
    columnsRef.current = layout.map((col, c) => {
      const old = prev[c];
      const offset = old && old.cycleH > 0 ? wrapOffset((old.offset / old.cycleH) * col.cycleH, col.cycleH) : 0;
      const el = columnEls.current[c] ?? null;
      if (el) {
        el.style.transform = columnTransform(offset);
      }
      return { el, offset, cycleH: col.cycleH, speed: COL_SPEEDS[c] ?? DEFAULT_COL_SPEED };
    });
    wakeRef.current();
  }, [layout]);

  useGalleryEngine({
    outerRef,
    planeRef,
    columnsRef,
    suppressClickRef,
    wakeRef,
    tiltXDeg,
    tiltZDeg,
    planeScale,
    onOpen: openFirst
  });

  const mask = tilted ? `${MASK_VERTICAL}, ${MASK_HORIZONTAL}` : MASK_VERTICAL;

  return (
    <>
      <section
        aria-label='Gallery. Arrow up/down to scroll, Space to toggle auto-scroll, Enter to open.'
        className={cn(
          "relative mx-auto h-125 w-full max-w-6xl cursor-grab touch-pan-y select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 data-[dragging=true]:cursor-grabbing",
          className
        )}
        ref={outerRef}
        style={{
          perspective: tilted ? PERSPECTIVE_PX : undefined,
          maskImage: mask,
          maskComposite: "intersect",
          WebkitMaskImage: mask,
          WebkitMaskComposite: "source-in"
        }}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: focusable region for keyboard scrolling (cards are tabIndex -1)
        tabIndex={0}
      >
        {/* Columns are coplanar with the plane, so it stays transform-style: flat —
            preserve-3d adds 3D sorting cost and makes Chrome hit-test the plane
            instead of the cards. Depth comes from the parent's perspective. */}
        <div
          className='absolute will-change-transform'
          ref={planeRef}
          style={{
            inset: `${-overscan * 100}%`,
            transform: tilted ? planeTransform(tiltXDeg, 0, tiltZDeg, planeScale) : undefined,
            transformOrigin: "center center"
          }}
        >
          {layout.map((column, c) => (
            <GalleryColumn
              column={column}
              columnIndex={c}
              // biome-ignore lint/suspicious/noArrayIndexKey: columns are positional slots
              key={`col-${c}`}
              onSelect={handleSelect}
              registerColumn={registerColumn}
            />
          ))}
        </div>
      </section>

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
