import { Trophy } from "lucide-react";
import type { RecapData } from "@/lib/recap-data";
import { getFullName } from "@/lib/utils";
import { GlowingOrbs } from "./animations";

export function SlideExecutiveBoard({
  members,
}: {
  members: RecapData["executiveBoard"];
}) {
  return (
    <div className="custom-scrollbar relative flex h-full w-full flex-col overflow-y-auto bg-slate-950 pt-16">
      <GlowingOrbs />
      <div className="absolute inset-0 min-h-full bg-gradient-to-br from-orange-500/10 via-transparent to-black/30" />

      <div className="relative z-10 mx-auto flex h-full min-h-max w-full max-w-[1400px] flex-col px-8 pb-20">
        <div className="mb-10 shrink-0 animate-fade-in-up text-center">
          <div className="mb-3 inline-flex items-center justify-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/20 px-4 py-1.5 text-orange-300 shadow-lg shadow-orange-500/10">
            <Trophy className="h-4 w-4" />
            <span className="font-semibold text-sm uppercase tracking-wide">
              Ban Điều Hành
            </span>
          </div>
          <h2 className="font-black text-4xl text-white tracking-tight drop-shadow-xl [text-shadow:0_2px_12px_rgba(0,0,0,0.8)] sm:text-6xl">
            Đội ngũ dẫn dắt
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-medium text-amber-100/60 text-lg">
            Những cá nhân nòng cốt đã điều hành và phát triển CLB trong nhiệm
            kỳ.
          </p>
        </div>

        <div className="flex flex-1 items-start justify-center">
          <div className="flex flex-wrap justify-center gap-6 pb-16">
            {members.map((m, i) => (
              <div
                className="group flex w-48 animate-fade-in-up flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-amber-500/30 hover:bg-white/10 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] sm:w-56"
                key={m.id}
                style={{ animationDelay: `${Math.min(i * 0.05, 1)}s` }}
              >
                {m.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={getFullName(m.firstName, m.lastName, "vi")}
                    className="h-32 w-32 rounded-full object-cover shadow-xl ring-2 ring-white/10 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:ring-amber-400"
                    src={m.avatar}
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-800 font-black text-4xl text-white/50 ring-2 ring-white/10 transition-all duration-300 group-hover:bg-amber-900/50 group-hover:text-amber-300 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:ring-amber-400">
                    {m.firstName[0]}
                  </div>
                )}
                <div className="mt-3 w-full overflow-hidden text-center">
                  <div
                    className="w-full truncate font-bold text-lg text-white/95 transition-colors group-hover:text-white"
                    title={getFullName(m.firstName, m.lastName, "vi")}
                  >
                    {getFullName(m.firstName, m.lastName, "vi")}
                  </div>
                  <div
                    className="mt-1.5 w-full truncate font-black text-amber-400/80 text-xs uppercase tracking-widest transition-colors group-hover:text-amber-300"
                    title={m.position}
                  >
                    {m.position}
                  </div>
                  {m.department && (
                    <div
                      className="mt-1 w-full truncate font-bold text-[11px] text-white/40 uppercase"
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
