import { Users } from "lucide-react";
import type { RecapData } from "@/lib/recap-data";
import { getFullName } from "@/lib/utils";
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

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1400px] flex-col px-8 pb-12">
        <div className="mb-8 shrink-0 animate-fade-in-up text-center">
          <div className="mb-3 inline-flex items-center justify-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/20 px-4 py-1.5 text-orange-300">
            <Users className="h-4 w-4" />
            <span className="font-semibold text-sm uppercase tracking-wide">
              Thế hệ tiếp nối
            </span>
          </div>
          <h2 className="font-black text-4xl text-white tracking-tight drop-shadow-xl [text-shadow:0_2px_12px_rgba(0,0,0,0.8)] sm:text-6xl">
            Chào mừng thành viên mới
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-medium text-lg text-orange-100/70">
            Những gương mặt mới đã gia nhập và mang đến làn gió mới cho đại gia
            đình MPC trong năm nay.
          </p>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4 pb-20 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {members.map((m, i) => (
              <div
                className="group flex animate-fade-in-up flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/30 hover:bg-white/10 hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)]"
                key={m.id}
                style={{ animationDelay: `${Math.min(i * 0.05, 1)}s` }}
              >
                {m.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={getFullName(m.firstName, m.lastName, "vi")}
                    className="h-20 w-20 rounded-full object-cover shadow-lg ring-2 ring-white/10 transition-all duration-300 group-hover:ring-blue-400"
                    src={m.avatar}
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 font-black text-2xl text-white/50 ring-2 ring-white/10 transition-all duration-300 group-hover:bg-blue-900/50 group-hover:text-blue-300 group-hover:ring-blue-400">
                    {m.firstName[0]}
                  </div>
                )}
                <div className="mt-1 w-full overflow-hidden text-center">
                  <div className="truncate font-bold text-[15px] text-white/95 transition-colors group-hover:text-white">
                    {getFullName(m.firstName, m.lastName, "vi")}
                  </div>
                  <div className="mt-0.5 truncate font-bold text-[11px] text-white/40 uppercase tracking-wide transition-colors group-hover:text-blue-300">
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
