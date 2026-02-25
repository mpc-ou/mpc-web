import { Trophy } from "lucide-react";
import type { RecapData } from "@/lib/recap-data";
import { GlowingOrbs } from "./animations";

export function SlideExecutiveBoard({
  members,
}: {
  members: RecapData["executiveBoard"];
}) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto custom-scrollbar bg-slate-950 pt-16">
      <GlowingOrbs />
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-black/30 min-h-full" />

      <div className="relative z-10 flex h-full flex-col px-8 pb-20 w-full max-w-[1400px] mx-auto min-h-max">
        <div className="text-center mb-10 shrink-0 animate-fade-in-up">
          <div className="inline-flex items-center justify-center gap-2 mb-3 rounded-full bg-orange-500/20 px-4 py-1.5 text-orange-300 border border-orange-500/30 shadow-lg shadow-orange-500/10">
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-semibold tracking-wide uppercase">
              Ban Điều Hành
            </span>
          </div>
          <h2 className="font-black text-4xl text-white sm:text-6xl tracking-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.8)] drop-shadow-xl">
            Đội ngũ dẫn dắt
          </h2>
          <p className="mt-4 text-amber-100/60 text-lg font-medium max-w-2xl mx-auto">
            Những cá nhân nòng cốt đã điều hành và phát triển CLB trong nhiệm
            kỳ.
          </p>
        </div>

        <div className="flex-1 flex items-start justify-center">
          <div className="flex flex-wrap justify-center gap-6 pb-16">
            {members.map((m, i) => (
              <div
                className="group flex flex-col items-center gap-3 rounded-2xl bg-white/5 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] border border-white/5 hover:border-amber-500/30 animate-fade-in-up w-48 sm:w-56"
                key={m.id}
                style={{ animationDelay: `${Math.min(i * 0.05, 1)}s` }}
              >
                {m.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={`${m.firstName} ${m.lastName}`}
                    className="h-32 w-32 rounded-full object-cover shadow-xl ring-2 ring-white/10 transition-all duration-300 group-hover:ring-amber-400 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                    src={m.avatar}
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-800 font-black text-white/50 text-4xl ring-2 ring-white/10 transition-all duration-300 group-hover:ring-amber-400 group-hover:text-amber-300 group-hover:bg-amber-900/50 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    {m.firstName[0]}
                  </div>
                )}
                <div className="text-center w-full overflow-hidden mt-3">
                  <div
                    className="font-bold text-white/95 text-lg group-hover:text-white transition-colors truncate w-full"
                    title={`${m.firstName} ${m.lastName}`}
                  >
                    {m.firstName} {m.lastName}
                  </div>
                  <div
                    className="text-amber-400/80 text-xs font-black tracking-widest uppercase truncate w-full mt-1.5 group-hover:text-amber-300 transition-colors"
                    title={m.position}
                  >
                    {m.position}
                  </div>
                  {m.department && (
                    <div
                      className="text-white/40 text-[11px] font-bold uppercase truncate w-full mt-1"
                      title={m.department}
                    >
                      {m.department}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
