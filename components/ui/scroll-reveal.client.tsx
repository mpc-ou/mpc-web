"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type AnimationVariant =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom-in"
  | "blur-in";

type ScrollRevealProps = {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
  once?: boolean;
  threshold?: number;
};

const hiddenStyles: Record<AnimationVariant, string> = {
  "fade-up": "opacity-0 translate-y-8",
  "fade-down": "opacity-0 -translate-y-8",
  "fade-left": "opacity-0 -translate-x-8",
  "fade-right": "opacity-0 translate-x-8",
  "zoom-in": "opacity-0 scale-[0.92]",
  "blur-in": "opacity-0 blur-[6px]",
};

const visibleStyles: Record<AnimationVariant, string> = {
  "fade-up": "opacity-100 translate-y-0",
  "fade-down": "opacity-100 translate-y-0",
  "fade-left": "opacity-100 translate-x-0",
  "fade-right": "opacity-100 translate-x-0",
  "zoom-in": "opacity-100 scale-100",
  "blur-in": "opacity-100 blur-0",
};

function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 600,
  className,
  as: Tag = "div",
  once = true,
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  return (
    <Tag
      className={cn(
        "transition-all ease-out will-change-[opacity,transform,filter]",
        isVisible ? visibleStyles[variant] : hiddenStyles[variant],
        className,
      )}
      ref={ref as never}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

export { ScrollReveal };
