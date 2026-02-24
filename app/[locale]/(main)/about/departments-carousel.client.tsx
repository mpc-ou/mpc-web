"use client";

import { ArrowRight, Camera, Code, Settings, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";

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
      return <Code className='h-6 w-6' />;
    case "Camera":
      return <Camera className='h-6 w-6' />;
    case "Settings":
      return <Settings className='h-6 w-6' />;
    case "Users":
      return <Users className='h-6 w-6' />;
    default:
      return <Code className='h-6 w-6' />;
  }
};

export function DepartmentsCarouselClient({ departments }: { departments: Department[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % departments.length);
    }, TIME_INTERVAL);
    return () => clearInterval(interval);
  }, [departments.length]);

  if (!departments || departments.length === 0) {
    return null;
  }

  const currentDept = departments[activeIndex];

  return (
    <section className='relative flex min-h-[90vh] w-full items-center overflow-hidden border-border border-y bg-black'>
      {/* Background Images */}
      {departments.map((dept, index) => (
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === activeIndex ? "z-0 opacity-100" : "z-0 opacity-0"
          }`}
          key={dept.id}
        >
          <Image alt={dept.name} className='object-cover' fill priority={index === 0} src={dept.bgImage} />
          <div className='absolute inset-0 bg-black/40' />
          <div className='absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent' />
          <div className='absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/60 to-transparent' />
        </div>
      ))}

      <div className='container relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-8 py-12 md:flex-row lg:items-center lg:gap-16 lg:py-24'>
        <div className='z-20 order-2 mt-8 flex shrink-0 flex-row items-center gap-4 md:order-1 md:mt-0 md:flex-col'>
          {departments.map((dept, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                aria-label={`Select ${dept.name}`}
                className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-300 sm:h-14 sm:w-14 ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-white/20 bg-black/50 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
                key={dept.id}
                onClick={() => setActiveIndex(idx)}
              >
                <div>{getIcon(dept.icon)}</div>
              </button>
            );
          })}
        </div>

        <div className='order-1 flex w-full flex-1 flex-col gap-6 md:order-2'>
          <div
            className='fade-in slide-in-from-bottom-8 w-full max-w-3xl animate-in duration-700'
            key={`content-${currentDept.id}`}
          >
            <div className='mb-4'>
              <h2
                className='text-balance font-bold text-3xl text-white uppercase tracking-tight sm:text-4xl lg:text-5xl'
                style={{ textShadow: "0px 2px 6px rgba(0,0,0,0.8)" }}
              >
                {currentDept.name}
              </h2>
            </div>

            <p
              className='mb-6 border-primary border-l-4 pl-4 font-medium text-base text-zinc-100 leading-relaxed sm:text-lg'
              style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}
            >
              {currentDept.description}
            </p>

            <div className='mb-6'>
              <h4
                className='mb-3 font-bold text-base text-primary uppercase tracking-wider sm:text-lg'
                style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}
              >
                Nhiệm vụ chính
              </h4>
              <ul className='space-y-3'>
                {currentDept.missions.map((mission, idx) => (
                  <li className='flex items-start text-sm text-zinc-100 sm:text-base' key={idx}>
                    <span className='mt-1.5 mr-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-sm' />
                    <span className='leading-relaxed' style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}>
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
                  className='group h-12 rounded-full px-8 font-bold text-base shadow-xl transition-transform hover:scale-105'
                  size='lg'
                  variant='default'
                >
                  <Link href={currentDept.link as any}>
                    {currentDept.linkLabel}
                    <ArrowRight className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='absolute bottom-0 left-0 z-20 h-1 w-full bg-white/20'>
        <div className='h-full origin-left animate-[progress_8s_linear] bg-primary' key={`progress-${activeIndex}`} />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `
        }}
      />
    </section>
  );
}
