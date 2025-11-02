"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { HERO_CONFIG } from "@/lib/config";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  image?: string;
  className?: string;
  color?: "light" | "dark";
}

export function HeroSection({ title, subtitle, image, className, color = "light" }: HeroSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [deviceOrientation, setDeviceOrientation] = useState({ beta: 0, gamma: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Scroll parallax
  const scrollY = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `${HERO_CONFIG.parallax.scrollMax}%`]
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, HERO_CONFIG.parallax.opacityFadePoint],
    [1, 0]
  );
  // Image scale để zoom tỉ lệ, tránh hiện background đen khi parallax
  const imageScale = useTransform(
    scrollYProgress,
    [0, 1],
    HERO_CONFIG.parallax.scaleRange
  );

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, HERO_CONFIG.spring.mouse);
  const smoothY = useSpring(mouseY, HERO_CONFIG.spring.mouse);

  // Device orientation parallax
  const deviceX = useMotionValue(0);
  const deviceY = useMotionValue(0);
  const smoothDeviceX = useSpring(deviceX, HERO_CONFIG.spring.device);
  const smoothDeviceY = useSpring(deviceY, HERO_CONFIG.spring.device);

  // Transform mouse/gyro values for X axis
  const parallaxX = useTransform(
    isMobile ? smoothDeviceX : smoothX,
    HERO_CONFIG.parallax.mouseRange,
    [`-${HERO_CONFIG.parallax.mouseMax}%`, `${HERO_CONFIG.parallax.mouseMax}%`]
  );
  
  // Transform mouse/gyro values for Y axis (separate from scroll)
  const parallaxY = useTransform(
    isMobile ? smoothDeviceY : smoothY,
    HERO_CONFIG.parallax.mouseRange,
    [`-${HERO_CONFIG.parallax.mouseMax}%`, `${HERO_CONFIG.parallax.mouseMax}%`]
  );

  // Combined Y transform (scroll + mouse/gyro)
  const combinedY = useTransform(
    [scrollYProgress, isMobile ? smoothDeviceY : smoothY],
    ([scroll, mouse]) => {
      if (!HERO_CONFIG.parallax.enabled) return "0%";
      const scrollVal = typeof scroll === "number" ? scroll : 0;
      const mouseVal = typeof mouse === "number" ? mouse : 0;
      return `calc(${scrollVal * HERO_CONFIG.parallax.scrollMax}% + ${mouseVal * HERO_CONFIG.parallax.mouseMax}%)`;
    }
  );

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();

    // Mouse move handler for desktop
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = (e.clientX - centerX) / rect.width;
      const y = (e.clientY - centerY) / rect.height;
      
      mouseX.set(x);
      mouseY.set(y);
    };

    // Device orientation handler for mobile
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        // Normalize beta (-90 to 90) and gamma (-180 to 180)
        const beta = Math.max(-90, Math.min(90, e.beta)) / 90;
        const gamma = Math.max(-90, Math.min(90, e.gamma)) / 90;
        
        deviceX.set(gamma);
        deviceY.set(beta);
      }
    };

    // Request permission for device orientation (iOS 13+)
    if (typeof DeviceOrientationEvent !== "undefined" && 
        typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      (DeviceOrientationEvent as any)
        .requestPermission()
        .then((response: string) => {
          if (response === "granted") {
            window.addEventListener("deviceorientation", handleDeviceOrientation);
          }
        })
        .catch(() => {
          // Permission denied or not supported
        });
    } else {
      // Browser supports device orientation without permission
      window.addEventListener("deviceorientation", handleDeviceOrientation);
    }

    // Add mouse move listener for desktop
    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // Mouse leave - reset to center
    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    if (!isMobile && ref.current) {
      ref.current.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
      window.removeEventListener("mousemove", handleMouseMove);
      if (ref.current) {
        ref.current.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [mouseX, mouseY, deviceX, deviceY, isMobile]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full h-screen flex items-center justify-center overflow-hidden",
        className
      )}
    >
      {image && (
        <motion.div
          style={{
            scale: imageScale,
            x: parallaxX,
          }}
          className="absolute inset-0 z-0"
        >
          <motion.div
            style={{
              y: combinedY,
              x: parallaxX,
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
          </motion.div>
        </motion.div>
      )}
      {!image && (
        <motion.div
          style={{
            x: parallaxX,
            y: parallaxY,
          }}
          className="absolute inset-0 bg-gradient-to-br from-[var(--primary-light)] to-[var(--accent-light)] opacity-50"
        />
      )}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-0 left-0 z-10 w-full px-4 pb-16 md:pb-24 lg:pb-32"
      >
        <div className="container mx-auto max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: HERO_CONFIG.animation.initialY }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: HERO_CONFIG.animation.titleDelay }}
          className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-left",
            color === "light" ? "text-[var(--d-text-primary)]" : "text-[var(--l-text-primary)]"
          )}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: HERO_CONFIG.animation.initialY }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: HERO_CONFIG.animation.titleDelay,
              delay: HERO_CONFIG.animation.subtitleDelay,
            }}
            className={cn(
              "text-lg md:text-xl lg:text-2xl max-w-3xl text-left",
              color === "light" ? "text-[var(--d-text-secondary)]" : "text-[var(--l-text-secondary)]"
            )}
          >
            {subtitle}
          </motion.p>
        )}
        </div>
      </motion.div>
    </div>
  );
}