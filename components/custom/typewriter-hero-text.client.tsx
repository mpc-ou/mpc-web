"use client";

import React, { useEffect, useState } from "react";

type TypewriterHeroTextProps = {
  title: string;
  description: string;
  titleClassName?: string;
  descClassName?: string;
};

export const TypewriterHeroText = ({ title, description, titleClassName, descClassName }: TypewriterHeroTextProps) => {
  const [mounted, setMounted] = useState(false);
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [displayedDesc, setDisplayedDesc] = useState("");
  const [phase, setPhase] = useState<"typing-title" | "typing-desc" | "complete">("typing-title");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    let titleIndex = 0;
    let descIndex = 0;
    let timerId: ReturnType<typeof setTimeout>;

    const typeTitle = () => {
      if (titleIndex < title.length) {
        setDisplayedTitle(title.substring(0, titleIndex + 1));
        titleIndex++;
        timerId = setTimeout(typeTitle, 35);
      } else {
        setPhase("typing-desc");
        timerId = setTimeout(typeDesc, 200);
      }
    };

    const typeDesc = () => {
      if (descIndex < description.length) {
        setDisplayedDesc(description.substring(0, descIndex + 1));
        descIndex++;
        timerId = setTimeout(typeDesc, 15);
      } else {
        setPhase("complete");
      }
    };

    typeTitle();

    return () => {
      clearTimeout(timerId);
    };
  }, [mounted, title, description]);

  if (!mounted) {
    return (
      <>
        <h1 className={titleClassName}>{title}</h1>
        <p className={descClassName}>{description}</p>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes blink-caret-component {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .animate-blink-caret {
          animation: blink-caret-component 1s step-end infinite;
        }
      `}</style>

      <h1 className={titleClassName}>
        {displayedTitle}
        {phase === "typing-title" && (
          <span className='ml-1.5 inline-block h-[0.75em] w-2 animate-blink-caret bg-orange-500/80 align-middle dark:bg-orange-400/80' />
        )}
      </h1>

      {(phase === "typing-desc" || phase === "complete" || displayedDesc.length > 0) && (
        <p className={descClassName}>
          {displayedDesc}
          {(phase === "typing-desc" || phase === "complete") && (
            <span className='ml-1.5 inline-block h-[0.75em] w-2 animate-blink-caret bg-orange-500/80 align-middle dark:bg-orange-400/80' />
          )}
        </p>
      )}
    </>
  );
};
