"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/configs/i18n/routing";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Camera, Users, Settings } from "lucide-react";

const TIME_INTERVAL = 8000;

type Department = {
  id: string;
  name: string;
  icon: string;
  bgImage: string;
  description: string;
  missions: string[];
  link?: string;
  linkLabel?: string;
};

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "Code":
      return <Code className="w-6 h-6" />;
    case "Camera":
      return <Camera className="w-6 h-6" />;
    case "Settings":
      return <Settings className="w-6 h-6" />;
    case "Users":
      return <Users className="w-6 h-6" />;
    default:
      return <Code className="w-6 h-6" />;
  }
};

export function DepartmentsCarouselClient({
  departments,
}: {
  departments: Department[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % departments.length);
    }, TIME_INTERVAL);
    return () => clearInterval(interval);
  }, [departments.length]);

  if (!departments || departments.length === 0) return null;

  const currentDept = departments[activeIndex];

  return (
    <section className="relative w-full overflow-hidden min-h-[90vh] bg-black border-y border-border flex items-center">
      {/* Background Images */}
      {departments.map((dept, index) => (
        <div
          key={dept.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === activeIndex ? "opacity-100 z-0" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={dept.bgImage}
            alt={dept.name}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/60 to-transparent" />
        </div>
      ))}

      <div className="container relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-16 items-center lg:items-center py-12 lg:py-24">
        <div className="flex flex-row md:flex-col gap-4 items-center shrink-0 order-2 md:order-1 mt-8 md:mt-0 z-20">
          {departments.map((dept, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={dept.id}
                onClick={() => setActiveIndex(idx)}
                className={`relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-colors duration-300 border-2 ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-black/50 text-white/70 border-white/20 hover:bg-white/20 hover:text-white"
                }`}
                aria-label={`Select ${dept.name}`}
              >
                <div>{getIcon(dept.icon)}</div>
              </button>
            );
          })}
        </div>

        <div className="flex-1 w-full flex flex-col gap-6 order-1 md:order-2">
          <div
            key={`content-${currentDept.id}`}
            className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-3xl"
          >
            <div className="mb-4">
              <h2
                className="font-bold text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight text-balance"
                style={{ textShadow: "0px 2px 6px rgba(0,0,0,0.8)" }}
              >
                {currentDept.name}
              </h2>
            </div>

            <p
              className="text-base sm:text-lg text-zinc-100 leading-relaxed font-medium mb-6 border-l-4 border-primary pl-4"
              style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}
            >
              {currentDept.description}
            </p>

            <div className="mb-6">
              <h4
                className="text-primary font-bold text-base sm:text-lg mb-3 uppercase tracking-wider"
                style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}
              >
                Nhiệm vụ chính
              </h4>
              <ul className="space-y-3">
                {currentDept.missions.map((mission, idx) => (
                  <li
                    key={idx}
                    className="flex items-start text-zinc-100 text-sm sm:text-base"
                  >
                    <span className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0 shadow-sm" />
                    <span
                      className="leading-relaxed"
                      style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}
                    >
                      {mission}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {currentDept.link && (
              <div>
                <Button
                  asChild
                  variant="default"
                  size="lg"
                  className="rounded-full shadow-xl group h-12 px-8 text-base font-bold transition-transform hover:scale-105"
                >
                  <Link href={currentDept.link as any}>
                    {currentDept.linkLabel}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
        <div
          key={`progress-${activeIndex}`}
          className="h-full bg-primary origin-left animate-[progress_8s_linear]"
        />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `,
        }}
      />
    </section>
  );
}
