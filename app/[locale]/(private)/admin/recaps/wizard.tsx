"use client";

import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  adminBuildRecapData,
  adminCreateRecap,
  adminUpdateRecap,
  adminGetRecapCandidates,
} from "../actions";
import { useEffect } from "react";
import { PhaseInfo, type PhaseInfoData } from "./phase-info";
import { PhaseEvents } from "./phase-events";
import { PhaseAchievements } from "./phase-achievements";
import { PhaseProjects } from "./phase-projects";
import { PhaseReview } from "./phase-review";

const STEPS = [
  { label: "Thông tin", icon: "1" },
  { label: "Sự kiện", icon: "2" },
  { label: "Thành tựu", icon: "3" },
  { label: "Dự án", icon: "4" },
  { label: "Review", icon: "5" },
];

type Candidates = {
  events: any[];
  achievements: any[];
  projects: any[];
};

type Props = {
  mode: "create" | "edit";
  initialData?: {
    year: number;
    name: string;
    description?: string | null;
    coverImage?: string | null;
    coverImage2?: string | null;
    coverImage3?: string | null;
    endImage?: string | null;
    musicUrl?: string | null;
    isPublished?: boolean;
    data?: any;
  };
};

export function RecapWizard({ mode, initialData }: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Phase 1 — Info
  const [info, setInfo] = useState<PhaseInfoData>({
    year: initialData?.year ?? new Date().getFullYear(),
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    coverImage: initialData?.coverImage ?? null,
    coverImage2: initialData?.coverImage2 ?? null,
    coverImage3: initialData?.coverImage3 ?? null,
    endImage: initialData?.endImage ?? null,
    musicUrl: initialData?.musicUrl ?? null,
  });

  const [candidates, setCandidates] = useState<Candidates>({
    events: [],
    achievements: [],
    projects: [],
  });

  useEffect(() => {
    const loadCands = async () => {
      const res = await adminGetRecapCandidates(info.year);
      if (res.data?.payload) {
        setCandidates(res.data.payload as any);
      }
    };
    if (info.year > 0) loadCands();
  }, [info.year]);

  // Phase 2-4 — Selected IDs
  const existingData = initialData?.data;
  const existingEventIds =
    existingData?.timeline
      ?.filter((t: any) => t.type === "event")
      .map((t: any) => t.id) ?? [];
  const existingAchievementIds =
    existingData?.timeline
      ?.filter((t: any) => t.type === "achievement")
      .map((t: any) => t.id) ?? [];
  const existingProjectIds =
    existingData?.timeline
      ?.filter((t: any) => t.type === "project")
      .map((t: any) => t.id) ?? [];

  const [selectedEventIds, setSelectedEventIds] =
    useState<string[]>(existingEventIds);
  const [selectedAchievementIds, setSelectedAchievementIds] = useState<
    string[]
  >(existingAchievementIds);
  const [selectedProjectIds, setSelectedProjectIds] =
    useState<string[]>(existingProjectIds);

  const canNext = () => {
    if (step === 0) return info.year > 0 && info.name?.trim();
    return true;
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (mode === "create") {
        const res = await adminCreateRecap({
          year: info.year,
          name: info.name,
          description: info.description || undefined,
          coverImage: info.coverImage,
          coverImage2: info.coverImage2,
          coverImage3: info.coverImage3,
          endImage: info.endImage,
          musicUrl: info.musicUrl,
        });
        if (res.error) throw new Error(res.error.message);
      } else {
        const res = await adminUpdateRecap(info.year, {
          name: info.name,
          description: info.description || undefined,
          coverImage: info.coverImage,
          coverImage2: info.coverImage2,
          coverImage3: info.coverImage3,
          endImage: info.endImage,
          musicUrl: info.musicUrl,
        });
        if (res.error) throw new Error(res.error.message);
      }

      // Build JSON data
      const buildRes = await adminBuildRecapData(
        info.year,
        selectedEventIds,
        selectedAchievementIds,
        selectedProjectIds,
      );
      if (buildRes.error) throw new Error(buildRes.error.message);

      toast({
        variant: "success",
        description: `Recap ${info.year} đã được lưu!`,
      });
      window.location.href = `/admin/recaps`;
    } catch (err: any) {
      toast({
        variant: "destructive",
        description: err.message || "Lỗi không xác định",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center">
            <button
              className={`flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all ${
                i === step
                  ? "bg-primary text-primary-foreground shadow-md"
                  : i < step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
              onClick={() => i < step && setStep(i)}
              type="button"
            >
              {i < step ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/30 text-xs">
                  {s.icon}
                </span>
              )}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-1 h-0.5 w-6 rounded-full transition-colors ${
                  i < step ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Phase Content */}
      <div className="min-h-[400px]">
        {step === 0 && <PhaseInfo data={info} onChange={setInfo} mode={mode} />}
        {step === 1 && (
          <PhaseEvents
            events={candidates?.events ?? []}
            selectedIds={selectedEventIds}
            onChange={setSelectedEventIds}
          />
        )}
        {step === 2 && (
          <PhaseAchievements
            achievements={candidates?.achievements ?? []}
            selectedIds={selectedAchievementIds}
            onChange={setSelectedAchievementIds}
          />
        )}
        {step === 3 && (
          <PhaseProjects
            projects={candidates?.projects ?? []}
            selectedIds={selectedProjectIds}
            onChange={setSelectedProjectIds}
          />
        )}
        {step === 4 && (
          <PhaseReview
            info={info}
            selectedEvents={selectedEventIds.length}
            selectedAchievements={selectedAchievementIds.length}
            selectedProjects={selectedProjectIds.length}
            totalEvents={candidates?.events?.length ?? 0}
            totalAchievements={candidates?.achievements?.length ?? 0}
            totalProjects={candidates?.projects?.length ?? 0}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-6">
        <Button
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        {step < STEPS.length - 1 ? (
          <Button disabled={!canNext()} onClick={() => setStep(step + 1)}>
            Tiếp theo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button disabled={loading} onClick={handleFinish}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Hoàn tất & Lưu
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
