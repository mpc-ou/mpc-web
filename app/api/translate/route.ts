import { translate } from "bing-translate-api";
import { NextResponse } from "next/server";
import { translateTextWithDeepseek } from "@/services/deepseek";

export async function POST(request: Request) {
  try {
    const { text, from, to, engine } = (await request.json()) as {
      text: string;
      from: "vi" | "en";
      to: "vi" | "en";
      engine?: "deepseek" | "bing";
    };

    if (!(text && from && to)) {
      return NextResponse.json({ error: "Missing required fields: text, from, to" }, { status: 400 });
    }

    if (from === to) {
      return NextResponse.json({ translated: text });
    }

    if (engine === "bing") {
      const res = await translate(text, from, to);
      return NextResponse.json({ translated: res?.translation ?? "" });
    }

    // Default: DeepSeek
    const translated = await translateTextWithDeepseek(text, from, to);
    return NextResponse.json({ translated });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Translation failed" }, { status: 500 });
  }
}
