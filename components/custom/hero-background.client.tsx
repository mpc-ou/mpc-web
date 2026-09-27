const MARQUEE_ROWS = [
  { className: "animate-[marquee_120s_linear_infinite]", indent: "" },
  { className: "animate-[marquee-reverse_100s_linear_infinite]", indent: "pl-32" },
  { className: "animate-[marquee_80s_linear_infinite]", indent: "pl-64" }
] as const;

const MARQUEE_TEXT = Array.from({ length: 4 }, (_, i) => i);

function MarqueeGroup({ className, hidden }: { className: string; hidden?: boolean }) {
  return (
    <div aria-hidden={hidden} className={`flex shrink-0 gap-24 md:gap-36 ${className}`}>
      {MARQUEE_TEXT.map((i) => (
        <span className='flex gap-24 md:gap-36' key={i}>
          <span>MOBILE PROGRAMMING CLUB</span>
          <span>•</span>
        </span>
      ))}
    </div>
  );
}

export function HeroBackground() {
  return (
    <div className='pointer-events-none absolute inset-0 z-0 select-none overflow-hidden'>
      <style>{`
        @keyframes hero-grid-move { to { background-position: 32px 32px; } }
        @keyframes marquee { to { transform: translateX(-50%); } }
        @keyframes marquee-reverse { from { transform: translateX(-50%); } to { transform: translateX(0%); } }
      `}</style>

      <div
        className='absolute inset-0 animate-[hero-grid-move_1s_linear_infinite] opacity-[0.2] motion-reduce:animate-none dark:opacity-[0.2]'
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      <div className='absolute inset-[-50%] flex -rotate-45 scale-110 flex-col justify-center gap-24 overflow-hidden opacity-[0.012] md:gap-36 dark:opacity-[0.02]'>
        {MARQUEE_ROWS.map((row) => (
          <div
            className={`flex whitespace-nowrap font-black text-7xl text-foreground uppercase tracking-widest md:text-9xl dark:text-white motion-reduce:[&>div]:animate-none ${row.indent}`}
            key={row.className}
          >
            <MarqueeGroup className={row.className} />
            <MarqueeGroup className={row.className} hidden />
          </div>
        ))}
      </div>
    </div>
  );
}
