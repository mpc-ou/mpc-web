import Image from "next/image";

const TECHS = [
  { name: "HTML5", icon: "/icons/tech/html5.svg" },
  { name: "CSS3", icon: "/icons/tech/css3.svg" },
  { name: "JavaScript", icon: "/icons/tech/javascript.svg" },
  { name: "TypeScript", icon: "/icons/tech/typescript.svg" },
  { name: "React", icon: "/icons/tech/react.svg" },
  { name: "Figma", icon: "/icons/tech/figma.svg" },
  { name: "UI/UX" },
  { name: "Responsive" },
  { name: "Git & GitHub" }
];

export function TechMarquee() {
  return (
    <div className='mask-[linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] relative mx-auto max-w-320 overflow-hidden py-6.5'>
      {/* Track holds the list twice; the keyframe shifts by -50% for a seamless loop. */}
      <div className='flex w-max animate-[activities-marquee_34s_linear_infinite] motion-reduce:animate-none'>
        {[0, 1].map((copy) => (
          <ul aria-hidden={copy === 1} className='flex' key={copy}>
            {TECHS.map((tech) => (
              <li
                className='flex items-center gap-2.5 whitespace-nowrap pr-14 font-medium font-mono text-muted-foreground text-sm'
                key={tech.name}
              >
                {tech.icon ? (
                  <Image alt='' height={22} src={tech.icon} width={22} />
                ) : (
                  <span className='h-1.5 w-1.5 rounded-[2px] bg-[#ff5e00]' />
                )}
                {tech.name}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
