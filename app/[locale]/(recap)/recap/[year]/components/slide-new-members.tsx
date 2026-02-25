import { Users } from "lucide-react";
import type { RecapData } from "@/lib/recap-data";
import { GlowingOrbs } from "./animations";

export function SlideNewMembers({
  coverImage3,
  members,
}: {
  coverImage3: string | null;
  members: RecapData["newMembers"];
}) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-slate-950 pt-16">
      <GlowingOrbs />
      {coverImage3 && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20 transition-opacity"
            src={coverImage3}
          />
          <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div className="relative z-10 flex h-full flex-col px-8 pb-12 w-full max-w-[1400px] mx-auto">
        <div className="text-center mb-8 shrink-0 animate-fade-in-up">
          <div className="inline-flex items-center justify-center gap-2 mb-3 rounded-full bg-orange-500/20 px-4 py-1.5 text-orange-300 border border-orange-500/30">
            <Users className="h-4 w-4" />
            <span className="text-sm font-semibold tracking-wide uppercase">
              Thế hệ tiếp nối
            </span>
          </div>
          <h2 className="font-black text-4xl text-white sm:text-6xl tracking-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.8)] drop-shadow-xl">
            Chào mừng thành viên mới
          </h2>
          <p className="mt-4 text-orange-100/70 text-lg font-medium max-w-2xl mx-auto">
            Những gương mặt mới đã gia nhập và mang đến làn gió mới cho đại gia
            đình MPC trong năm nay.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pb-20">
            {members.map((m, i) => (
              <div
                className="group flex flex-col items-center gap-3 rounded-2xl bg-white/5 p-4 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] border border-white/5 hover:border-blue-500/30 animate-fade-in-up"
                key={m.id}
                style={{ animationDelay: `${Math.min(i * 0.05, 1)}s` }}
              >
                {m.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={`${m.firstName} ${m.lastName}`}
                    className="h-20 w-20 rounded-full object-cover shadow-lg ring-2 ring-white/10 transition-all duration-300 group-hover:ring-blue-400"
                    src={m.avatar}
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 font-black text-white/50 text-2xl ring-2 ring-white/10 transition-all duration-300 group-hover:ring-blue-400 group-hover:text-blue-300 group-hover:bg-blue-900/50">
                    {m.firstName[0]}
                  </div>
                )}
                <div className="text-center w-full overflow-hidden mt-1">
                  <div className="font-bold text-white/95 text-[15px] group-hover:text-white transition-colors truncate">
                    {m.firstName} {m.lastName}
                  </div>
                  <div className="text-white/40 text-[11px] font-bold tracking-wide uppercase truncate mt-0.5 group-hover:text-blue-300 transition-colors">
                    Thành viên mới
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
