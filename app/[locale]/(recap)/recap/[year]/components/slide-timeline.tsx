import { Calendar, FolderGit2, Trophy } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";
import type { RecapTimelineItem } from "@/lib/recap-data";
import { getFullName } from "@/lib/utils";
import { FloatingShapes, GlowingOrbs } from "./animations";

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
            className="h-full w-full scale-105 object-cover opacity-20 transition-opacity"
            src={item.thumbnail}
          />
          <div className="absolute inset-0 bg-orange-600/10 mix-blend-overlay" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/70" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col gap-8 px-8 pb-10 lg:flex-row">
        {/* Left/Right — Content */}
        <div className="flex w-full animate-fade-in-up flex-col overflow-hidden lg:w-[55%] xl:w-[60%]">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold text-sm ${typeColor[item.type]}`}
            >
              {typeIcon[item.type]}
              {typeLabel[item.type]}
            </span>
            <span className="font-medium text-sm text-white/50">{date}</span>
          </div>

          <h2 className="mb-4 max-w-3xl font-black text-2xl text-white leading-tight tracking-tight drop-shadow-2xl [text-shadow:0_2px_10px_rgba(0,0,0,0.8)] sm:text-4xl lg:text-5xl">
            {item.title}
          </h2>

          {item.location && (
            <div className="mb-6 flex w-fit items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 font-medium text-sm text-white/80 shadow-sm backdrop-blur-sm">
              <span className="text-red-400">📍</span> {item.location}
            </div>
          )}

          {item.description && (
            <div className="custom-scrollbar mb-6 max-h-[45vh] overflow-y-auto rounded-2xl border border-white/5 bg-black/20 p-4 pr-4 shadow-inner backdrop-blur-[2px] lg:max-h-[50vh]">
              <MarkdownContent
                className="!prose-invert prose-base !max-w-none prose-p:font-medium prose-a:text-orange-400 prose-headings:text-white prose-p:text-white prose-strong:text-orange-200 prose-p:[text-shadow:0_1px_4px_rgba(0,0,0,0.5)] [&_img]:max-w-full [&_img]:rounded-xl"
                content={item.description}
              />
            </div>
          )}

          {/* Members Prominently Displayed */}
          {members.length > 0 && (
            <div className="mt-auto border-white/10 border-t pt-6">
              <p className="mb-4 flex items-center gap-2 font-bold text-[13px] text-white/40 uppercase tracking-widest">
                {item.type === "achievement"
                  ? "🏆 Thành viên tuyên dương"
                  : "👥 Thành viên tham gia"}
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
                  {members.length}
                </span>
              </p>
              <div className="custom-scrollbar flex max-h-[25vh] flex-wrap gap-3 overflow-y-auto pr-2 pb-2">
                {members.map((m, i) => (
                  <div
                    className="group/member flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2 shadow-sm transition-colors hover:bg-white/10"
                    key={i}
                  >
                    {m.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={getFullName(m.firstName, m.lastName, "vi")}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10 transition-all group-hover/member:ring-orange-400"
                        src={m.avatar}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 font-bold text-sm text-white ring-2 ring-white/10 transition-all group-hover/member:ring-orange-400">
                        {m.firstName[0]}
                      </div>
                    )}
                    <div className="flex flex-col justify-center">
                      <span className="font-semibold text-sm text-white/90 leading-tight transition-colors group-hover/member:text-white">
                        {getFullName(m.firstName, m.lastName, "vi")}
                      </span>
                      {m.role && (
                        <span className="mt-0.5 font-medium text-[10px] text-white/40 uppercase tracking-wider">
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
                  className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-400 text-xs shadow-sm"
                  key={t}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right/Left — Thumbnail + Gallery */}
        <div
          className="flex w-full animate-fade-in-up flex-col justify-center gap-6 lg:w-[45%] xl:w-[40%]"
          style={{ animationDelay: "0.15s" }}
        >
          {item.thumbnail ? (
            <div className="group relative aspect-video w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/20 md:aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                src={item.thumbnail}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 md:aspect-[4/3]">
              <FolderGit2 className="h-24 w-24 text-white/10" />
            </div>
          )}
          {images.length > 0 && (
            <div className="custom-scrollbar flex gap-3 overflow-x-auto pt-2 pb-4">
              {images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={`${item.title} ${i + 1}`}
                  className="h-20 w-32 shrink-0 cursor-pointer rounded-2xl border border-white/20 object-cover shadow-md transition-all hover:-translate-y-1 hover:border-orange-400/80 hover:shadow-[0_10px_20px_rgba(249,115,22,0.3)] md:h-24 md:w-36"
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
