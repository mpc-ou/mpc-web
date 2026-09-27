import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/app/_actions/main";
import { parseWebDesignConfig, WEBDESIGN_CONFIG_KEY } from "@/types/webdesign";
import { getWebDesignSeoInfo } from "@/utils/webdesign-seo";

const WIDTH = 1200;
const HEIGHT = 630;
const ACCENT = "#f97316";
const FONT_FAMILY = "Be Vietnam Pro";
const BACKGROUND_PHOTO = "web-design/2025_5.jpg";
const CACHE_CONTROL = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";

const readPublic = async (path: string): Promise<Buffer | null> => {
  try {
    return await readFile(join(process.cwd(), "public", path));
  } catch {
    return null;
  }
};

export async function GET() {
  const [{ data: settingsRes }, photo, fontExtraBold] = await Promise.all([
    getSiteSettings([WEBDESIGN_CONFIG_KEY]),
    readPublic(`images/${BACKGROUND_PHOTO}`),
    readPublic("fonts/BeVietnamPro-ExtraBold.ttf")
  ]);

  const settings = (settingsRes?.payload ?? {}) as Record<string, string>;
  const { year } = getWebDesignSeoInfo(parseWebDesignConfig(settings[WEBDESIGN_CONFIG_KEY]), "vi", Date.now());
  const photoUri = photo ? `data:image/jpeg;base64,${photo.toString("base64")}` : "";
  const fonts = fontExtraBold
    ? [{ name: FONT_FAMILY, data: fontExtraBold, weight: 800 as const, style: "normal" as const }]
    : [];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#0b0c0f",
        fontFamily: FONT_FAMILY
      }}
    >
      {photoUri ? (
        // biome-ignore lint/performance/noImgElement: satori (ImageResponse) only supports <img>
        <img
          alt=''
          height={HEIGHT}
          src={photoUri}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
          width={WIDTH}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: WIDTH,
          height: HEIGHT,
          background: "linear-gradient(180deg, rgba(11,12,15,0) 45%, rgba(11,12,15,0.85) 100%)"
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: 56,
          display: "flex",
          alignItems: "baseline",
          gap: 24,
          fontSize: 104,
          fontWeight: 800,
          letterSpacing: -4,
          lineHeight: 1,
          color: "#f8fafc"
        }}
      >
        <span>WEB DESIGN</span>
        {year ? <span style={{ color: ACCENT }}>{year}</span> : null}
      </div>
    </div>,
    { width: WIDTH, height: HEIGHT, fonts, headers: { "Cache-Control": CACHE_CONTROL } }
  );
}
