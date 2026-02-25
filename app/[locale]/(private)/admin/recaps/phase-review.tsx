"use client";

import {
  Calendar,
  CheckCircle2,
  FolderGit2,
  Image,
  Music,
  Trophy,
} from "lucide-react";
import type { PhaseInfoData } from "./phase-info";

type Props = {
  info: PhaseInfoData;
  selectedEvents: number;
  selectedAchievements: number;
  selectedProjects: number;
  totalEvents: number;
  totalAchievements: number;
  totalProjects: number;
};

export function PhaseReview({
  info,
  selectedEvents,
  selectedAchievements,
  selectedProjects,
  totalEvents,
  totalAchievements,
  totalProjects,
}: Props) {
  const covers = [
    { label: "Ảnh bìa chào", value: info.coverImage },
    { label: "Ảnh bìa thông số", value: info.coverImage2 },
    { label: "Ảnh bìa bể cá", value: info.coverImage3 },
    { label: "Ảnh kết thúc", value: info.endImage },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-xl">Review & Xác nhận</h2>
        <p className="text-muted-foreground text-sm">
          Kiểm tra lại tổng quan trước khi lưu
        </p>
      </div>

      {/* Info summary */}
      <div className="rounded-lg border p-5 space-y-3">
        <h3 className="font-semibold text-lg">{info.name}</h3>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Calendar className="h-4 w-4" />
          Năm {info.year}
        </div>
        {info.description && (
          <p className="text-muted-foreground text-sm">{info.description}</p>
        )}
      </div>

      {/* Covers preview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {covers.map((c) => (
          <div key={c.label} className="space-y-1">
            <span className="text-muted-foreground text-xs">{c.label}</span>
            {c.value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={c.label}
                className="aspect-video w-full rounded-md border object-cover"
                src={c.value}
              />
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-md border border-dashed bg-muted/30">
                <Image className="h-5 w-5 text-muted-foreground/50" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selection summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={<Calendar className="h-5 w-5 text-blue-500" />}
          label="Sự kiện"
          selected={selectedEvents}
          total={totalEvents}
        />
        <SummaryCard
          icon={<Trophy className="h-5 w-5 text-amber-500" />}
          label="Thành tựu"
          selected={selectedAchievements}
          total={totalAchievements}
        />
        <SummaryCard
          icon={<FolderGit2 className="h-5 w-5 text-emerald-500" />}
          label="Dự án"
          selected={selectedProjects}
          total={totalProjects}
        />
      </div>

      {/* Music */}
      {info.musicUrl && (
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Music className="h-5 w-5 text-primary" />
          <span className="text-sm">Có nhạc nền</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
      )}

      <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm text-primary">
        Nhấn <strong>"Hoàn tất & Lưu"</strong> để hệ thống tổng hợp dữ liệu và
        lưu recap.
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  selected,
  total,
}: {
  icon: React.ReactNode;
  label: string;
  selected: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      {icon}
      <div>
        <div className="font-semibold text-lg">
          {selected}{" "}
          <span className="font-normal text-muted-foreground text-sm">
            / {total}
          </span>
        </div>
        <div className="text-muted-foreground text-xs">{label} đã chọn</div>
      </div>
    </div>
  );
}
