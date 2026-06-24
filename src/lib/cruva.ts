// Cruva creator discovery — the external TikTok Shop creator pool brands
// reach out to. Ported from the portal's client (x-api-key + x-shop-id).
// Marketplace search returns creators by query; we extract them defensively
// because the exact field names need a live call to confirm.

const BASE = "https://api.cruva.com/v1";

function headers() {
  return {
    "x-api-key": process.env.CRUVA_API_KEY ?? "",
    "x-shop-id": process.env.CRUVA_SHOP_ID ?? "",
    "Content-Type": "application/json",
  };
}

export function cruvaConfigured(): boolean {
  return !!(process.env.CRUVA_API_KEY && process.env.CRUVA_SHOP_ID);
}

export async function marketplaceSearch(query: string, pageSize = 30) {
  const res = await fetch(`${BASE}/affiliate/marketplace/search`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ page_size: pageSize, page_number: 1, ...(query ? { query } : {}) }),
  });
  const raw = await res.text();
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let json: any = null;
  try { json = JSON.parse(raw); } catch { /* keep raw */ }
  return { ok: res.ok, status: res.status, raw, json };
}

const HANDLE_KEYS = ["handle", "username", "creator_handle", "nickname", "unique_id", "creator_name", "name"];
const FOLLOWER_KEYS = ["follower_count", "followers", "fans", "follower", "follower_cnt"];
const GMV_KEYS = ["gmv", "total_gmv", "affiliate_gmv"];

type Json = any;
type Creator = { handle: string; followers: number | null; gmv: number | null };

function num(v: unknown): number | null {
  if (typeof v === "number") return v;
  if (typeof v === "string") { const n = parseFloat(v.replace(/[^0-9.]/g, "")); return isNaN(n) ? null : n; }
  return null;
}

// Walk the response for the first array of creator-like objects (any object
// carrying a recognizable handle field) and normalize each.
export function extractCreators(json: Json, limit = 40): Creator[] {
  const out: Creator[] = [];
  const seen = new Set<string>();
  const get = (o: Json, keys: string[]) => { for (const k of keys) { if (o && o[k] != null) return o[k]; } return undefined; };

  const pushFrom = (arr: Json[]) => {
    for (const it of arr) {
      if (!it || typeof it !== "object") continue;
      const handle = get(it, HANDLE_KEYS);
      if (typeof handle !== "string" || !handle.trim()) continue;
      const h = handle.trim().replace(/^@/, "");
      if (seen.has(h.toLowerCase())) continue;
      seen.add(h.toLowerCase());
      out.push({ handle: h, followers: num(get(it, FOLLOWER_KEYS)), gmv: num(get(it, GMV_KEYS)) });
      if (out.length >= limit) return;
    }
  };

  const walk = (node: Json, depth: number) => {
    if (out.length >= limit || depth > 6 || !node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      const looks = node.some((n) => n && typeof n === "object" && HANDLE_KEYS.some((k) => typeof n[k] === "string"));
      if (looks) pushFrom(node);
      for (const n of node) walk(n, depth + 1);
    } else {
      for (const v of Object.values(node)) walk(v, depth + 1);
    }
  };

  walk(json, 0);
  return out;
}
