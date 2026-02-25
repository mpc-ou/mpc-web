import { Calendar, Trophy, FolderGit2 } from "lucide-react";
import type { RecapTimelineItem } from "@/lib/recap-data";
import { MarkdownContent } from "@/components/markdown-content";
import { GlowingOrbs, FloatingShapes } from "./animations";

export function SlideTimeline({ item }: { item: RecapTimelineItem }) {
  const typeColor = {
    event: "text-orange-400 border-orange-400/30 bg-orange-500/10",
    achievement: "text-amber-400 border-amber-400/30 bg-amber-500/10",
    project: "text-emerald-400 border-emerald-400/30 bg-emerald-500/10",
  };
  const typeLabel = {
    event: "Sự kiện",
    achievement: "Thành tựu",
    project: "Dự án",
  };
  const typeIcon = {
    event: <Calendar className="h-4 w-4" />,
    achievement: <Trophy className="h-4 w-4" />,
    project: <FolderGit2 className="h-4 w-4" />,
  };

  const date = new Date(item.date).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const images = item.images?.filter(Boolean) ?? [];
  const members = item.members ?? item.projectMembers ?? [];

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-slate-950 pt-16">
      <GlowingOrbs />
      <FloatingShapes />
      {item.thumbnail && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="h-full w-full object-cover opacity-20 scale-105 transition-opacity"
            src={item.thumbnail}
          />
          <div className="absolute inset-0 bg-orange-600/10 mix-blend-overlay" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/70" />

      <div className="relative z-10 flex h-full w-full flex-col lg:flex-row gap-8 px-8 pb-10 max-w-[1600px] mx-auto">
        {/* Left/Right — Content */}
        <div className="flex w-full lg:w-[55%] xl:w-[60%] flex-col overflow-hidden animate-fade-in-up">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold border ${typeColor[item.type]}`}
            >
              {typeIcon[item.type]}
              {typeLabel[item.type]}
            </span>
            <span className="text-white/50 text-sm font-medium">{date}</span>
          </div>

          <h2 className="mb-4 font-black text-2xl text-white sm:text-4xl lg:text-5xl leading-tight tracking-tight [text-shadow:0_2px_10px_rgba(0,0,0,0.8)] drop-shadow-2xl max-w-3xl">
            {item.title}
          </h2>

          {item.location && (
            <div className="mb-6 flex items-center gap-2 text-white/80 text-sm font-medium bg-white/10 w-fit px-3 py-1.5 rounded-lg border border-white/20 backdrop-blur-sm shadow-sm">
              <span className="text-red-400">📍</span> {item.location}
            </div>
          )}

          {item.description && (
            <div className="mb-6 max-h-[45vh] lg:max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar bg-black/20 backdrop-blur-[2px] p-4 rounded-2xl border border-white/5 shadow-inner">
              <MarkdownContent
                className="!prose-invert prose-base !max-w-none prose-p:text-white prose-p:font-medium prose-p:[text-shadow:0_1px_4px_rgba(0,0,0,0.5)] prose-headings:text-white prose-a:text-orange-400 prose-strong:text-orange-200 [&_img]:max-w-full [&_img]:rounded-xl"
                content={item.description}
              />
            </div>
          )}

          {/* Members Prominently Displayed */}
          {members.length > 0 && (
            <div className="mt-auto border-t border-white/10 pt-6">
              <p className="mb-4 text-white/40 text-[13px] font-bold uppercase tracking-widest flex items-center gap-2">
                {item.type === "achievement"
                  ? "🏆 Thành viên tuyên dương"
                  : "👥 Thành viên tham gia"}
                <span className="bg-white/10 text-white/60 px-2 py-0.5 rounded-full text-[10px]">
                  {members.length}
                </span>
              </p>
              <div className="flex flex-wrap gap-3 max-h-[25vh] overflow-y-auto custom-scrollbar pr-2 pb-2">
                {members.map((m, i) => (
                  <div
                    className="group/member flex items-center gap-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors px-3 py-2 border border-white/5 shadow-sm"
                    key={i}
                  >
                    {m.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={`${m.firstName} ${m.lastName}`}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10 transition-all group-hover/member:ring-orange-400"
                        src={m.avatar}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm text-white font-bold ring-2 ring-white/10 transition-all group-hover/member:ring-orange-400">
                        {m.firstName[0]}
                      </div>
                    )}
                    <div className="flex flex-col justify-center">
                      <span className="text-white/90 text-sm font-semibold leading-tight group-hover/member:text-white transition-colors">
                        {m.firstName} {m.lastName}
                      </span>
                      {m.role && (
                        <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider mt-0.5">
                          {m.role}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technologies */}
          {item.technologies && item.technologies.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {item.technologies.map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 shadow-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right/Left — Thumbnail + Gallery */}
        <div
          className="flex w-full lg:w-[45%] xl:w-[40%] flex-col justify-center gap-6 animate-fade-in-up"
          style={{ animationDelay: "0.15s" }}
        >
          {item.thumbnail ? (
            <div className="relative w-full aspect-video md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group ring-1 ring-white/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                src={item.thumbnail}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ) : (
            <div className="w-full aspect-video md:aspect-[4/3] rounded-3xl border border-white/10 bg-white/5 flex items-center justify-center">
              <FolderGit2 className="h-24 w-24 text-white/10" />
            </div>
          )}
          {images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-4 pt-2 custom-scrollbar">
              {images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={`${item.title} ${i + 1}`}
                  className="h-20 w-32 md:h-24 md:w-36 shrink-0 rounded-2xl object-cover border border-white/20 hover:border-orange-400/80 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(249,115,22,0.3)] shadow-md"
                  key={i}
                  src={img}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
