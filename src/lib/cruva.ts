// Cruva creator discovery — the external TikTok Shop creator pool.
//
// Cruva auth needs x-api-key + x-shop-id. The shop id is ONLY an auth
// credential — `marketplace/search` returns Cruva's whole creator database
// regardless of which shop authenticates. So callsheet needs no brand-specific
// config: it auto-resolves a shop id from the account with just CRUVA_API_KEY
// (an explicit CRUVA_SHOP_ID env still overrides if you ever want one).

const BASE = "https://api.cruva.com/v1";
const key = () => process.env.CRUVA_API_KEY ?? "";

export function cruvaConfigured(): boolean {
  return !!key();
}

function envShopId(): string {
  return (
    process.env.CRUVA_SHOP_ID ||
    process.env.CRUVA_SHOP_ID_SOVEREIGN_SILVER ||
    process.env.CRUVA_SHOP_ID_FIFTH_FIDO ||
    process.env.CRUVA_SHOP_ID_ARBER ||
    ""
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Json = any;

export async function listShopsRaw() {
  const res = await fetch(`${BASE}/account/shops`, {
    method: "GET",
    headers: { "x-api-key": key(), "Content-Type": "application/json" },
  });
  const raw = await res.text();
  let json: Json = null;
  try { json = JSON.parse(raw); } catch { /* keep raw */ }
  return { ok: res.ok, status: res.status, raw, json };
}

// Cruva shop ids look like 24-char hex (Mongo ObjectIds); match on that so we
// don't grab some unrelated "id" field.
const SHOPID_KEYS = ["shop_id", "shopId", "_id", "id", "cruva_shop_id"];
function firstShopId(json: Json): string {
  let found = "";
  const walk = (n: Json, depth: number) => {
    if (found || depth > 5 || !n || typeof n !== "object") return;
    if (Array.isArray(n)) {
      for (const x of n) {
        if (found) return;
        if (x && typeof x === "object") {
          for (const k of SHOPID_KEYS) {
            const v = x[k];
            if (typeof v === "string" && /^[a-f0-9]{16,}$/i.test(v)) { found = v; return; }
          }
          walk(x, depth + 1);
        }
      }
    } else {
      for (const v of Object.values(n)) { if (found) return; walk(v, depth + 1); }
    }
  };
  walk(json, 0);
  return found;
}

let cachedShopId: string | undefined;
export async function resolveShopId(): Promise<string> {
  const env = envShopId();
  if (env) return env;
  if (cachedShopId) return cachedShopId;
  try {
    const { json } = await listShopsRaw();
    cachedShopId = firstShopId(json);
    return cachedShopId;
  } catch {
    return "";
  }
}

export async function marketplaceSearch(query: string, pageSize = 30) {
  const shopId = await resolveShopId();
  const res = await fetch(`${BASE}/affiliate/marketplace/search`, {
    method: "POST",
    headers: { "x-api-key": key(), "x-shop-id": shopId, "Content-Type": "application/json" },
    body: JSON.stringify({ page_size: pageSize, page_number: 1, ...(query ? { query } : {}) }),
  });
  const raw = await res.text();
  let json: Json = null;
  try { json = JSON.parse(raw); } catch { /* keep raw */ }
  return { ok: res.ok, status: res.status, raw, json, shopId };
}

// Affiliate roster (CRM) — creators already in the shop's orbit. Available on
// the standard plan (unlike marketplace/search). This is the working source.
export async function affiliateRoster(query: string, pageSize = 40) {
  const shopId = await resolveShopId();
  const res = await fetch(`${BASE}/affiliate/crm/list`, {
    method: "POST",
    headers: { "x-api-key": key(), "x-shop-id": shopId, "Content-Type": "application/json" },
    body: JSON.stringify({ page_size: pageSize, page_number: 1, sort_by: "gmv", ...(query ? { handle: query } : {}) }),
  });
  const raw = await res.text();
  let json: Json = null;
  try { json = JSON.parse(raw); } catch { /* keep raw */ }
  return { ok: res.ok, status: res.status, raw, json, shopId };
}

const HANDLE_KEYS = ["handle", "username", "creator_handle", "nickname", "unique_id", "creator_name", "name"];
const FOLLOWER_KEYS = ["follower_count", "followers", "fans", "follower", "follower_cnt"];
const GMV_KEYS = ["gmv", "total_gmv", "affiliate_gmv"];

type Creator = { handle: string; followers: number | null; gmv: number | null };

function num(v: unknown): number | null {
  if (typeof v === "number") return v;
  if (typeof v === "string") { const n = parseFloat(v.replace(/[^0-9.]/g, "")); return isNaN(n) ? null : n; }
  return null;
}

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
