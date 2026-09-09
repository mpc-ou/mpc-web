import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Dynamic 1200x630 Open Graph banner. Referenced by OG_IMAGE so every page's
// social preview uses a proper branded card instead of the bare square logo.
const WIDTH = 1200;
const HEIGHT = 630;

export async function GET() {
  let logoDataUri = "";
  try {
    const logo = await readFile(join(process.cwd(), "public", "images", "logo.png"));
    logoDataUri = `data:image/png;base64,${logo.toString("base64")}`;
  } catch {
    /* logo is optional — banner still renders without it */
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "linear-gradient(135deg, #0f1013 0%, #17181c 55%, #1c1408 100%)",
        color: "#f8fafc",
        fontFamily: "sans-serif",
        position: "relative"
      }}
    >
      {/* glow accent */}
      <div
        style={{
          position: "absolute",
          top: -160,
          right: -120,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "rgba(249, 115, 22, 0.22)",
          filter: "blur(40px)"
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {logoDataUri ? (
          // biome-ignore lint/performance/noImgElement: satori (ImageResponse) only supports <img>
          <img alt='MPClub' height={104} src={logoDataUri} width={104} />
        ) : null}
        <span style={{ fontSize: 88, fontWeight: 800, letterSpacing: -2, color: "#f97316" }}>MPClub</span>
      </div>

      <div style={{ marginTop: 36, fontSize: 46, fontWeight: 700, lineHeight: 1.15, maxWidth: 900 }}>
        Where there&rsquo;s a bug, there&rsquo;s MPC!
      </div>

      <div style={{ marginTop: 24, fontSize: 28, color: "#94a3b8", maxWidth: 900 }}>
        Mobile Programming Club — Faculty of Information Technology, Ho Chi Minh City Open University
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: 80,
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 24,
          color: "#64748b"
        }}
      >
        <div style={{ width: 40, height: 4, background: "#f97316", borderRadius: 4 }} />
        mpclub.dev
      </div>
    </div>,
    { width: WIDTH, height: HEIGHT }
  );
}
