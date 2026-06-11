import {
  BadgeCheck,
  Building2,
  DoorOpen,
  GraduationCap,
  PenLine,
  Shield,
  ShieldHalf,
  Trophy,
  UserCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BadgeData, BadgeDef } from "@/configs/badges";
import { BADGE_DEFINITIONS, BADGE_TIERS } from "@/configs/badges";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "user-check": UserCheck,
  "graduation-cap": GraduationCap,
  "door-open": DoorOpen,
  shield: Shield,
  "shield-half": ShieldHalf,
  "pen-line": PenLine,
  trophy: Trophy,
  "building-2": Building2,
  "badge-check": BadgeCheck,
};

function getTierColor(tierKey: string): string {
  switch (tierKey) {
    case "bronze":
      return "text-amber-700";
    case "silver":
      return "text-slate-400";
    case "gold":
      return "text-yellow-500";
    case "diamond":
      return "text-cyan-400";
    case "member":
      return "text-orange-500";
    case "alumni":
      return "text-amber-500";
    case "left":
      return "text-muted-foreground";
    case "admin":
      return "text-red-500";
    case "mod":
      return "text-blue-500";
    case "cadre":
      return "text-green-500";
    default:
      return "text-muted-foreground";
  }
}

function getTierBg(tierKey: string): string {
  switch (tierKey) {
    case "bronze":
      return "bg-amber-700/10";
    case "silver":
      return "bg-slate-400/10";
    case "gold":
      return "bg-yellow-500/10";
    case "diamond":
      return "bg-cyan-400/10";
    default:
      return "bg-primary/5";
  }
}

export function getActiveBadges(data: BadgeData) {
  return BADGE_DEFINITIONS.filter((def) => def.condition(data) !== null).map(
    (def) => ({
      def,
      result: def.condition(data)!,
    }),
  );
}

export function BadgeIcon({
  def,
  result,
}: {
  def: BadgeDef;
  result: { tier: string; value?: number; suffix?: string };
}) {
  const t = useTranslations("badges");
  const Icon = ICON_MAP[def.icon];
  const tierColor = getTierColor(result.tier);
  const bgColor = getTierBg(result.tier);
  const tierInfo = BADGE_TIERS.find((tier) => tier.key === result.tier);

  const label = t(def.id as any) || def.label;
  const tierLabel = tierInfo?.label
    ? t(`tier.${tierInfo.key}` as any) || tierInfo.label
    : "";

  // Map raw badge-config suffixes to i18n keys
  const SUFFIX_KEY_MAP: Record<string, string> = {
    năm: "years",
    "bài viết": "posts",
    "thành tựu": "achievements",
    "dự án": "projects",
  };
  const suffixKey = result.suffix
    ? (SUFFIX_KEY_MAP[result.suffix] ?? result.suffix)
    : null;
  const suffixLabel = suffixKey
    ? t(`suffix.${suffixKey}` as any) || result.suffix
    : "";

  const tooltipText = result.value
    ? `${label} • ${result.value} ${suffixLabel}${tierLabel ? ` (${tierLabel})` : ""}`
    : label;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full ${bgColor} transition-all hover:scale-110`}
          >
            {Icon && <Icon className={`h-3.5 w-3.5 ${tierColor}`} />}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
