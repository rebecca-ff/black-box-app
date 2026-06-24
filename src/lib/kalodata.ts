// Minimal Kalodata Open API client — "top hooks of the week".
// Ported from the blk-box-portal client (secret-key auth, /video/rank).
// Lights up only when KALODATA_API_KEY is set; otherwise getTopHooks() → []
// so brief generation always works with or without it.

const BASE = process.env.KALODATA_BASE_URL ?? "https://staging.kalodata.com";

// TikTok Shop US category ids. Only Health/Wellness is confirmed (from the
// portal, probed 2026-05). Unknown categories fall back to cross-category
// top videos — still useful signal, just less targeted. Expand as we learn ids.
const CATEGORY_IDS: Record<string, string> = {
  wellness: "924552",
  health: "924552",
};

// Candidate text fields on a Kalodata video object — we don't hard-depend on
// one exact field name, so a schema tweak on their side won't silently break us.
const TEXT_KEYS = [
  "caption", "title", "desc", "description",
  "video_title", "video_desc", "content", "text", "name",
];

/* eslint-disable @typescript-eslint/no-explicit-any */
type Json = any;

// Walk the response for the first array of video-like objects and pull a short
// opener string from each. Defensive: works regardless of the exact wrapper path.
function pluckVideoTexts(json: Json, limit: number): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  const textOf = (it: Json): string => {
    if (!it || typeof it !== "object") return "";
    for (const k of TEXT_KEYS) {
      const v = it[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return "";
  };

  const pushFrom = (arr: Json[]) => {
    for (const it of arr) {
      const text = textOf(it);
      if (!text) continue;
      const short = text.replace(/\s+/g, " ").slice(0, 160);
      const key = short.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(short);
      if (out.length >= limit) return;
    }
  };

  const walk = (node: Json, depth: number) => {
    if (out.length >= limit || depth > 6 || !node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      const looksVideo = node.some(
        (n) => n && typeof n === "object" && TEXT_KEYS.some((k) => typeof n[k] === "string"),
      );
      if (looksVideo) pushFrom(node);
      for (const n of node) walk(n, depth + 1);
    } else {
      for (const v of Object.values(node)) walk(v, depth + 1);
    }
  };

  walk(json, 0);
  return out.slice(0, limit);
}

/**
 * Top-performing video openers in a category over the period, by revenue.
 * Returns short text snippets the brief writer adapts into a fresh hook.
 * Never throws — returns [] on any miss so callers can stay simple.
 */
export async function getTopHooks(
  category?: string,
  dateRange = "last7Day",
  limit = 12,
): Promise<string[]> {
  const key = process.env.KALODATA_API_KEY;
  if (!key) return [];

  const category_id = category ? CATEGORY_IDS[category.toLowerCase()] : undefined;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);

  try {
    const res = await fetch(`${BASE}/openapi/v1/video/rank`, {
      method: "POST",
      headers: {
        "secret-key": key,
        "content-type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        region: "US",
        language: "en-US",
        currency: "USD",
        date_range: dateRange,
        category_id,
        sort: { field: "revenue", type: "DESC" },
        page_number: 1,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const json = (await res.json().catch(() => null)) as Json;
    if (!json || json.success === false) return [];
    return pluckVideoTexts(json, limit);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
