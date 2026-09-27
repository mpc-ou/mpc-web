import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/app/_actions/main";
import { parseWebDesignConfig, WEBDESIGN_CONFIG_KEY } from "@/types/webdesign";
import { formatVnDate, getWebDesignSeoInfo, type WebDesignSeoInfo } from "@/utils/webdesign-seo";

const WIDTH = 1200;
const HEIGHT = 630;
const ACCENT = "#f97316";
const FONT_FAMILY = "Be Vietnam Pro";
const BACKGROUND_PHOTO = "web-design/2025_5.jpg";
const CACHE_CONTROL = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";

const STATUS_COPY = {
  vi: {
    upcoming: "Sắp diễn ra",
    ongoing: "Đang diễn ra",
    until: "đến",
    ended: (year: number | null) => `Mùa giải ${year ?? ""} đã kết thúc`.replace("  ", " "),
    final: "Chung kết",
    eyebrow: "Cuộc thi học thuật thường niên",
    subtitle: "Thiết kế & lập trình website cho sinh viên"
  },
  en: {
    upcoming: "Coming up",
    ongoing: "Happening now",
    until: "until",
    ended: (year: number | null) => `Season ${year ?? ""} has ended`.replace("  ", " "),
    final: "Final round",
    eyebrow: "Annual academic contest",
    subtitle: "Website design & front-end development for students"
  }
} as const;

type Copy = (typeof STATUS_COPY)[keyof typeof STATUS_COPY];

const readPublic = async (path: string): Promise<Buffer | null> => {
  try {
    return await readFile(join(process.cwd(), "public", path));
  } catch {
    return null;
  }
};

const toDataUri = (buf: Buffer | null, mime: string): string =>
  buf ? `data:${mime};base64,${buf.toString("base64")}` : "";

const statusText = (info: WebDesignSeoInfo, copy: Copy, locale: string): string | null => {
  const { hero } = info;
  if (hero?.kind === "upcoming") {
    return `${copy.upcoming} · ${hero.title} · ${formatVnDate(hero.target, locale)}`;
  }
  if (hero?.kind === "ongoing") {
    return `${copy.ongoing} · ${hero.title} · ${copy.until} ${formatVnDate(hero.target, locale)}`;
  }
  if (hero?.kind === "ended") {
    return copy.ended(info.year);
  }
  return info.contestDateLabel ? `${copy.final} · ${info.contestDateLabel}` : null;
};

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") === "en" ? "en" : "vi";
  const copy = STATUS_COPY[locale];

  const [{ data: settingsRes }, t, logo, photo, fontRegular, fontBold, fontExtraBold] = await Promise.all([
    getSiteSettings([WEBDESIGN_CONFIG_KEY]),
    getTranslations({ locale, namespace: "webdesign" }),
    readPublic("images/logo.png"),
    readPublic(`images/${BACKGROUND_PHOTO}`),
    readPublic("fonts/BeVietnamPro-Regular.ttf"),
    readPublic("fonts/BeVietnamPro-Bold.ttf"),
    readPublic("fonts/BeVietnamPro-ExtraBold.ttf")
  ]);

  const settings = (settingsRes?.payload ?? {}) as Record<string, string>;
  const info = getWebDesignSeoInfo(parseWebDesignConfig(settings[WEBDESIGN_CONFIG_KEY]), locale, Date.now());
  const status = statusText(info, copy, locale);
  const logoUri = toDataUri(logo, "image/png");
  const photoUri = toDataUri(photo, "image/jpeg");

  const facts = [
    { label: t("fact1Label"), value: t("fact1Value") },
    { label: t("fact2Label"), value: t("fact2Value") },
    { label: t("fact4Label"), value: t("fact4Value"), highlight: true }
  ];

  const fonts = [
    { data: fontRegular, weight: 400 as const },
    { data: fontBold, weight: 700 as const },
    { data: fontExtraBold, weight: 800 as const }
  ].flatMap(({ data, weight }) => (data ? [{ name: FONT_FAMILY, data, weight, style: "normal" as const }] : []));

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#0b0c0f",
        color: "#f8fafc",
        fontFamily: FONT_FAMILY
      }}
    >
      {photoUri ? (
        // biome-ignore lint/performance/noImgElement: satori (ImageResponse) only supports <img>
        <img
          alt=''
          height={HEIGHT}
          src={photoUri}
          style={{ position: "absolute", top: 0, right: 0, objectFit: "cover", opacity: 0.55 }}
          width={620}
        />
      ) : null}
      {/* fade the photo into the background so the text side stays clean */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: WIDTH,
          height: HEIGHT,
          background:
            "linear-gradient(90deg, #0b0c0f 0%, #0b0c0f 45%, rgba(11,12,15,0.55) 75%, rgba(11,12,15,0.2) 100%)"
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -180,
          left: -140,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "rgba(249, 115, 22, 0.18)",
          filter: "blur(60px)"
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          padding: "56px 72px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, fontWeight: 700 }}>
          {logoUri ? (
            // biome-ignore lint/performance/noImgElement: satori (ImageResponse) only supports <img>
            <img alt='MPClub' height={52} src={logoUri} width={52} />
          ) : null}
          <span style={{ color: ACCENT }}>MPClub</span>
          <span style={{ color: "#475569" }}>/</span>
          <span style={{ color: "#cbd5e1" }}>web-design</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 24, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 4 }}>
            {copy.eyebrow}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginTop: 8 }}>
            <span style={{ fontSize: 112, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>WEB DESIGN</span>
            <span style={{ fontSize: 112, fontWeight: 800, letterSpacing: -4, lineHeight: 1, color: ACCENT }}>
              {info.year}
            </span>
          </div>
          <div style={{ marginTop: 18, fontSize: 32, color: "#cbd5e1" }}>{copy.subtitle}</div>

          {status ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginTop: 28,
                padding: "12px 22px",
                alignSelf: "flex-start",
                borderRadius: 999,
                border: "2px solid rgba(249, 115, 22, 0.55)",
                background: "rgba(249, 115, 22, 0.12)",
                fontSize: 26,
                fontWeight: 700
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: 999, background: ACCENT }} />
              {status}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 48 }}>
          {facts.map((fact) => (
            <div key={fact.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 18, color: "#64748b", letterSpacing: 2 }}>{fact.label}</span>
              <span style={{ fontSize: 30, fontWeight: 700, color: fact.highlight ? ACCENT : "#f8fafc" }}>
                {fact.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    { width: WIDTH, height: HEIGHT, fonts, headers: { "Cache-Control": CACHE_CONTROL } }
  );
}
