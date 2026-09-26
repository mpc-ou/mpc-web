import type {
  LocalizedText,
  WebDesignBenefit,
  WebDesignConfig,
  WebDesignExhibitionItem,
  WebDesignFaq,
  WebDesignMilestone,
  WebDesignPrize,
  WebDesignRegulation
} from "@/types/webdesign";

/**
 * Hand-rolled validation for the WebDesign JSON documents (admin form + raw JSON dev editor).
 * Collects every error with its JSON path instead of stopping at the first one, and returns a
 * normalized copy (trimmed strings, generated ids) that is safe to persist.
 */

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; errors: string[] };

const PRIZE_TIERS: WebDesignPrize["tier"][] = ["gold", "silver", "bronze"];
const URL_RE = /^https?:\/\/\S+$/i;

export const generateId = () => Math.random().toString(36).slice(2, 10);

type Obj = Record<string, unknown>;

const isObject = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

class Ctx {
  readonly errors: string[] = [];

  fail(path: string, message: string) {
    this.errors.push(`${path || "(root)"}: ${message}`);
  }

  string(obj: Obj, key: string, path: string, { required = false } = {}): string {
    const v = obj[key];
    if (v === undefined || v === null) {
      if (required) {
        this.fail(`${path}.${key}`, "bắt buộc");
      }
      return "";
    }
    if (typeof v !== "string") {
      this.fail(`${path}.${key}`, "phải là chuỗi");
      return "";
    }
    const trimmed = v.trim();
    if (required && !trimmed) {
      this.fail(`${path}.${key}`, "không được để trống");
    }
    return trimmed;
  }

  url(obj: Obj, key: string, path: string): string {
    const v = this.string(obj, key, path);
    if (v && !URL_RE.test(v)) {
      this.fail(`${path}.${key}`, `URL không hợp lệ ("${v}"), cần bắt đầu bằng http(s)://`);
    }
    return v;
  }

  date(obj: Obj, key: string, path: string, { required = false } = {}): string {
    const v = this.string(obj, key, path, { required });
    if (v && Number.isNaN(new Date(v).getTime())) {
      this.fail(`${path}.${key}`, `ngày không hợp lệ ("${v}"), dùng dạng 2026-11-21T08:00`);
    }
    return v;
  }

  localized(v: unknown, path: string, { required = true } = {}): LocalizedText {
    if (typeof v === "string") {
      // Shorthand: a plain string means the same text in both languages.
      return { vi: v.trim(), en: v.trim() };
    }
    if ((v === undefined || v === null) && !required) {
      return { vi: "", en: "" };
    }
    if (!isObject(v)) {
      this.fail(path, 'phải là { "vi": "...", "en": "..." }');
      return { vi: "", en: "" };
    }
    const text = { vi: this.string(v, "vi", path), en: this.string(v, "en", path) };
    if (required && !text.vi && !text.en) {
      this.fail(path, "cần ít nhất bản vi hoặc en");
    }
    return text;
  }

  array(obj: Obj, key: string, path: string): unknown[] {
    const v = obj[key];
    if (v === undefined || v === null) {
      return [];
    }
    if (!Array.isArray(v)) {
      this.fail(`${path}.${key}`, "phải là mảng");
      return [];
    }
    return v;
  }

  id(obj: Obj, path: string, seen: Set<string>): string {
    const raw = this.string(obj, "id", path);
    const id = raw || generateId();
    if (seen.has(id)) {
      this.fail(`${path}.id`, `trùng id "${id}"`);
    }
    seen.add(id);
    return id;
  }

  list<T>(obj: Obj, key: string, path: string, parse: (item: Obj, itemPath: string, seen: Set<string>) => T): T[] {
    const seen = new Set<string>();
    return this.array(obj, key, path).flatMap((item, idx) => {
      const itemPath = `${path}.${key}[${idx}]`;
      if (!isObject(item)) {
        this.fail(itemPath, "phải là object");
        return [];
      }
      return [parse(item, itemPath, seen)];
    });
  }
}

function parseMilestone(ctx: Ctx, item: Obj, path: string, seen: Set<string>): WebDesignMilestone {
  const start = ctx.date(item, "start", path, { required: true });
  const end = ctx.date(item, "end", path) || start;
  if (start && end && new Date(end).getTime() < new Date(start).getTime()) {
    ctx.fail(`${path}.end`, "phải sau hoặc bằng start");
  }
  return {
    id: ctx.id(item, path, seen),
    start,
    end,
    title: ctx.localized(item.title, `${path}.title`),
    description: ctx.localized(item.description, `${path}.description`, { required: false })
  };
}

function parseRegulation(ctx: Ctx, item: Obj, path: string, seen: Set<string>): WebDesignRegulation {
  const items = ctx.array(item, "items", path).map((text, idx) => ctx.localized(text, `${path}.items[${idx}]`));
  if (items.length === 0) {
    ctx.fail(`${path}.items`, "cần ít nhất 1 mục");
  }
  return { id: ctx.id(item, path, seen), title: ctx.localized(item.title, `${path}.title`), items };
}

function parsePrize(ctx: Ctx, item: Obj, path: string, seen: Set<string>): WebDesignPrize {
  const tier = item.tier as WebDesignPrize["tier"];
  if (!PRIZE_TIERS.includes(tier)) {
    ctx.fail(`${path}.tier`, `phải là một trong ${PRIZE_TIERS.join(" | ")}`);
  }
  return {
    id: ctx.id(item, path, seen),
    tier: PRIZE_TIERS.includes(tier) ? tier : "gold",
    title: ctx.localized(item.title, `${path}.title`),
    description: ctx.localized(item.description, `${path}.description`, { required: false })
  };
}

function parseBenefit(ctx: Ctx, item: Obj, path: string, seen: Set<string>): WebDesignBenefit {
  return {
    id: ctx.id(item, path, seen),
    title: ctx.localized(item.title, `${path}.title`),
    description: ctx.localized(item.description, `${path}.description`, { required: false })
  };
}

export function validateWebDesignConfig(input: unknown): ValidationResult<WebDesignConfig> {
  const ctx = new Ctx();
  if (!isObject(input)) {
    return { ok: false, errors: ["(root): phải là object {...}"] };
  }

  const data: WebDesignConfig = {
    contestDate: ctx.date(input, "contestDate", "$"),
    registerUrl: ctx.url(input, "registerUrl", "$"),
    sponsorUrl: ctx.url(input, "sponsorUrl", "$"),
    proposalUrl: ctx.url(input, "proposalUrl", "$"),
    rulesPdfUrl: ctx.url(input, "rulesPdfUrl", "$"),
    milestones: ctx
      .list(input, "milestones", "$", (item, path, seen) => parseMilestone(ctx, item, path, seen))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    regulations: ctx.list(input, "regulations", "$", (item, path, seen) => parseRegulation(ctx, item, path, seen)),
    prizes: ctx.list(input, "prizes", "$", (item, path, seen) => parsePrize(ctx, item, path, seen)),
    benefits: ctx.list(input, "benefits", "$", (item, path, seen) => parseBenefit(ctx, item, path, seen))
  };

  return ctx.errors.length > 0 ? { ok: false, errors: ctx.errors } : { ok: true, data };
}

export function validateWebDesignExhibitions(input: unknown): ValidationResult<WebDesignExhibitionItem[]> {
  const ctx = new Ctx();
  if (!Array.isArray(input)) {
    return { ok: false, errors: ["(root): phải là mảng [...]"] };
  }

  const stringList = (item: Obj, key: string, path: string) =>
    ctx.array(item, key, path).flatMap((v, idx) => {
      if (typeof v !== "string") {
        ctx.fail(`${path}.${key}[${idx}]`, "phải là chuỗi");
        return [];
      }
      return v.trim() ? [v.trim()] : [];
    });

  const data = input.flatMap((item, idx) => {
    const path = `$[${idx}]`;
    if (!isObject(item)) {
      ctx.fail(path, "phải là object");
      return [];
    }
    return [parseExhibition(item, path)];
  });

  function parseExhibition(item: Obj, path: string): WebDesignExhibitionItem {
    return {
      teamName: ctx.string(item, "teamName", path, { required: true }),
      teamMembers: stringList(item, "teamMembers", path),
      subjects: ctx.string(item, "subjects", path),
      projectName: ctx.localized(item.projectName, `${path}.projectName`),
      description: ctx.localized(item.description, `${path}.description`, { required: false }),
      github: ctx.url(item, "github", path),
      live: ctx.url(item, "live", path),
      thumbnail: ctx.string(item, "thumbnail", path),
      techStack: stringList(item, "techStack", path)
    };
  }

  return ctx.errors.length > 0 ? { ok: false, errors: ctx.errors } : { ok: true, data };
}

export function validateWebDesignFaqs(input: unknown): ValidationResult<WebDesignFaq[]> {
  const ctx = new Ctx();
  if (!Array.isArray(input)) {
    return { ok: false, errors: ["(root): phải là mảng [...]"] };
  }
  const seen = new Set<string>();
  const data = input.flatMap((item, idx): WebDesignFaq[] => {
    const path = `$[${idx}]`;
    if (!isObject(item)) {
      ctx.fail(path, "phải là object");
      return [];
    }
    if (item.isActive !== undefined && typeof item.isActive !== "boolean") {
      ctx.fail(`${path}.isActive`, "phải là true/false");
    }
    const question = ctx.localized(item.question, `${path}.question`);
    const answer = ctx.localized(item.answer, `${path}.answer`);
    // The DB requires the Vietnamese text; English falls back to it on the site.
    if (!question.vi) {
      ctx.fail(`${path}.question.vi`, "bắt buộc (bản tiếng Việt)");
    }
    if (!answer.vi) {
      ctx.fail(`${path}.answer.vi`, "bắt buộc (bản tiếng Việt)");
    }
    return [{ id: ctx.id(item, path, seen), question, answer, isActive: item.isActive !== false }];
  });

  return ctx.errors.length > 0 ? { ok: false, errors: ctx.errors } : { ok: true, data };
}

/** Parses JSON text first so syntax errors are reported the same way as schema errors. */
export function parseJsonText(text: string): ValidationResult<unknown> {
  try {
    return { ok: true, data: JSON.parse(text) as unknown };
  } catch (err) {
    return { ok: false, errors: [`JSON sai cú pháp: ${err instanceof Error ? err.message : String(err)}`] };
  }
}
