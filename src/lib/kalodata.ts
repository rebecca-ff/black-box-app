// Kalodata integration.
//
// Open API (/video/rank, secret-key) isn't on this account's plan (returns
// 501 "key not allowed") — see probeVideoRank. So hooks come from KALOPILOT,
// Kalodata's hosted AI agent (Bearer auth, natural language). Kalopilot is
// slow (30s–minutes), so we NEVER call it during a brief: a daily job caches
// each category's hooks in Supabase and getTopHooks() reads that cache.

import { supabaseAdmin } from "@/lib/supabase-server";

const BASE = process.env.KALODATA_BASE_URL ?? "https://staging.kalodata.com";

// Categories we refresh hooks for (match the brands' category field).
const CATEGORIES = ["Wellness", "Beauty", "Pet", "Apparel", "Garden"];

/* eslint-disable @typescript-eslint/no-explicit-any */
type Json = any;

// ── read path (fast — used during brief generation) ──────────────────────────
// Returns the cached top hooks for a category, or [] if none cached yet.
export async function getTopHooks(category?: string): Promise<string[]> {
  if (!category) return [];
  const db = supabaseAdmin();
  if (!db) return [];
  const { data } = await db
    .from("hooks_cache")
    .select("hooks")
    .eq("category", category)
    .maybeSingle();
  const hooks = data?.hooks;
  if (!Array.isArray(hooks)) return [];
  return hooks.filter((h: unknown): h is string => typeof h === "string").slice(0, 12);
}

// ── refresh path (slow — used by the daily cron / manual trigger) ─────────────
function parseHookList(text: string): string[] {
  if (!text) return [];
  // Prefer a JSON array if Kalopilot returned one.
  const m = text.match(/\[[\s\S]*\]/);
  if (m) {
    try {
      const arr = JSON.parse(m[0]);
      if (Array.isArray(arr)) {
        return arr.map((x) => String(x).trim()).filter(Boolean).slice(0, 12);
      }
    } catch { /* fall through to line parsing */ }
  }
  // Fallback: strip bullets/numbering from each line.
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s\-*\d.)"']+/, "").trim())
    .filter((l) => l.length > 3)
    .slice(0, 12);
}

// Brand category -> the TikTok Shop / Kalodata category term Kalopilot expects.
// (A brand's "Wellness" maps to TikTok Shop's "Health", etc.)
const CATEGORY_MAP: Record<string, string> = {
  wellness: "Health",
  health: "Health",
  beauty: "Beauty & Personal Care",
  pet: "Pet Supplies",
  apparel: "Womenswear & Underwear",
  garden: "Home Supplies",
};
function kaloCategoryTerm(category: string): string {
  return CATEGORY_MAP[category.toLowerCase()] ?? category;
}
function hooksQuery(term: string): string {
  return `From TikTok Shop US in the "${term}" category over the last 7 days, give me the 12 highest-performing video HOOKS — the opening line (spoken or on-screen text) that starts each top-revenue video. Return ONLY a JSON array of 12 short strings, each under 20 words. No prose, no markdown.`;
}

async function callKalopilot(category: string, timeoutMs: number): Promise<{ ok: boolean; status: number; text: string; raw: string; json: Json }> {
  const key = process.env.KALODATA_API_KEY;
  if (!key) return { ok: false, status: 0, text: "", raw: "", json: null };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}/api/pilot/skill/ext/v1/chat/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ query: hooksQuery(kaloCategoryTerm(category)) }),
      signal: controller.signal,
    });
    const raw = await res.text();
    let json: Json = null;
    try { json = JSON.parse(raw); } catch { /* keep raw */ }
    const text: string = json?.data?.text ?? json?.data?.answer ?? json?.text ?? json?.message ?? "";
    return { ok: res.ok, status: res.status, text, raw, json };
  } catch {
    return { ok: false, status: 0, text: "", raw: "", json: null };
  } finally {
    clearTimeout(timer);
  }
}

export async function kalopilotTopHooks(category: string, timeoutMs = 280_000): Promise<string[]> {
  const { text } = await callKalopilot(category, timeoutMs);
  return parseHookList(text);
}

// Debug: surface the raw Kalopilot response so we can match the parser to it.
export async function kalopilotRaw(category: string, timeoutMs = 280_000) {
  if (!process.env.KALODATA_API_KEY) return { configured: false };
  const { ok, status, text, raw, json } = await callKalopilot(category, timeoutMs);
  return {
    configured: true,
    term: kaloCategoryTerm(category),
    ok,
    status,
    topKeys: json && typeof json === "object" ? Object.keys(json) : null,
    dataKeys: json?.data && typeof json.data === "object" ? Object.keys(json.data) : null,
    pilotText: text || null,
    parsedCount: parseHookList(text).length,
    sample: raw.slice(0, 1500),
  };
}

// Refresh one category's hooks via Kalopilot and cache them in Supabase.
export async function refreshHooks(category: string): Promise<{ category: string; count: number; hooks: string[]; error?: string }> {
  const db = supabaseAdmin();
  if (!db) return { category, count: 0, hooks: [], error: "supabase not configured" };

  const hooks = await kalopilotTopHooks(category);
  if (hooks.length) {
    await db.from("hooks_cache").upsert(
      { category, hooks, source: "kalopilot", fetched_at: new Date().toISOString() },
      { onConflict: "category" },
    );
  }
  return { category, count: hooks.length, hooks };
}

export { CATEGORIES };

// ── diagnostics ──────────────────────────────────────────────────────────────
// Confirmed via probe that the Open API SKU isn't on this plan. Kept so we can
// re-check if the plan changes. Only Health/Wellness id is known.
const CATEGORY_IDS: Record<string, string> = { wellness: "924552", health: "924552" };

export async function probeVideoRank(category?: string, dateRange = "last7Day") {
  const key = process.env.KALODATA_API_KEY;
  if (!key) return { configured: false };

  const category_id = category ? CATEGORY_IDS[category.toLowerCase()] : undefined;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(`${BASE}/openapi/v1/video/rank`, {
      method: "POST",
      headers: { "secret-key": key, "content-type": "application/json;charset=utf-8" },
      body: JSON.stringify({
        region: "US", language: "en-US", currency: "USD",
        date_range: dateRange, category_id,
        sort: { field: "revenue", type: "DESC" }, page_number: 1,
      }),
      signal: controller.signal,
    });
    const raw = await res.text();
    let json: Json = null;
    try { json = JSON.parse(raw); } catch { /* keep raw */ }
    return {
      configured: true,
      category_id: category_id ?? null,
      httpStatus: res.status,
      ok: res.ok,
      success: json ? json.success : undefined,
      code: json ? (json.code ?? null) : null,
      message: json ? (json.message ?? null) : null,
      sample: raw.slice(0, 800),
    };
  } catch (e) {
    return { configured: true, error: String(e) };
  } finally {
    clearTimeout(timer);
  }
}
