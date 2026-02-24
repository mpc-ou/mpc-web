"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTransparentHeader } from "@/hooks/use-transparent-header";

const PARALLAX_FACTOR_BG = 20;
const PARALLAX_FACTOR_CONTENT = 10;
const PARALLAX_FACTOR_LOGO = 15;
const PARALLAX_FACTOR_SCROLL_INDICATOR = 8;

import Image from "next/image";

const HeroSection = () => {
  useTransparentHeader({
    hideActions: false,
    textColor: "rgba(255,255,255,0.7)",
    logoColor: "#fff"
  });
  const t = useTranslations("home.hero");
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!(sectionRef.current && isHovering)) {
        return;
      }

      const rect = sectionRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        setOffset({
          x: Math.max(-1, Math.min(1, x)),
          y: Math.max(-1, Math.min(1, y))
        });
      });
    },
    [isHovering]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    section.addEventListener("mousemove", handleMouseMove, { passive: true });
    section.addEventListener("mouseenter", handleMouseEnter);
    section.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseenter", handleMouseEnter);
      section.removeEventListener("mouseleave", handleMouseLeave);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) {
        return;
      }

      const x = Math.max(-1, Math.min(1, e.gamma / 30));
      const y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        setOffset({ x, y });
      });
    };

    const requestPermission = async () => {
      const doe = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };

      if (typeof doe.requestPermission === "function") {
        try {
          const permission = await doe.requestPermission();
          if (permission === "granted") {
            window.addEventListener("deviceorientation", handleOrientation, {
              passive: true
            });
          }
        } catch {
          // ignore error if device doesn't support requestPermission
        }
      } else {
        window.addEventListener("deviceorientation", handleOrientation, {
          passive: true
        });
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  const bgTransform = `translate(${offset.x * -PARALLAX_FACTOR_BG}px, ${offset.y * -PARALLAX_FACTOR_BG}px) scale(1.1)`;
  const contentTransform = `translate(${offset.x * PARALLAX_FACTOR_CONTENT}px, ${offset.y * PARALLAX_FACTOR_CONTENT}px)`;
  const logoTransform = `translate(${offset.x * PARALLAX_FACTOR_LOGO}px, ${offset.y * PARALLAX_FACTOR_LOGO}px)`;
  const scrollTransform = `translateX(-50%) translate(${offset.x * PARALLAX_FACTOR_SCROLL_INDICATOR}px, ${offset.y * PARALLAX_FACTOR_SCROLL_INDICATOR}px)`;

  return (
    <section
      className='relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 text-white'
      ref={sectionRef}
    >
      {}
      <div
        className='absolute -inset-10 bg-center bg-cover bg-no-repeat transition-transform duration-300 ease-out will-change-transform'
        style={{
          backgroundImage: "url('/images/bg/hero-bg.jpg')",
          transform: bgTransform
        }}
      />

      {}
      <div className='absolute inset-0 bg-black/50' />

      {}
      <div
        className='absolute inset-0'
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(249, 115, 22, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(29, 78, 216, 0.15) 0%, transparent 50%)
          `
        }}
      />

      {}
      <div
        className='absolute inset-0 opacity-5'
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }}
      />

      {}
      <div
        className='relative z-10 flex flex-col items-center gap-6 text-center transition-transform duration-300 ease-out will-change-transform'
        style={{ transform: contentTransform }}
      >
        {}
        <div
          className='transition-transform duration-300 ease-out will-change-transform'
          style={{ transform: logoTransform }}
        >
          <Image alt='MPC Logo' className='h-20 w-20 rounded-lg' height={80} src='/images/logo.png' width={80} />
        </div>

        <div className='flex flex-col gap-3'>
          <h1 className='max-w-3xl font-black text-3xl leading-tight tracking-tight sm:text-5xl lg:text-6xl'>
            {t("title")}
          </h1>
          <p className='text-lg text-white/70 sm:text-xl'>{t("subtitle")}</p>
        </div>

        <div className='flex flex-wrap items-center justify-center gap-4 pt-2' />
      </div>

      {}
      <div
        className='absolute bottom-8 left-1/2 animate-bounce transition-transform duration-300 ease-out will-change-transform'
        style={{ transform: scrollTransform }}
      >
        <div className='flex h-6 w-4 items-start justify-center rounded-full border-2 border-white/40 pt-1'>
          <div className='h-1.5 w-0.5 rounded-full bg-white/60' />
        </div>
      </div>
    </section>
  );
};

export { HeroSection };
