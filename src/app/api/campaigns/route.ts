import { type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { SEED_ROWS } from "@/lib/seed";

export const dynamic = "force-dynamic";

// GET /api/campaigns — list all campaigns. { enabled } tells the client whether
// persistence is on; when off it falls back to its in-memory seed.
export async function GET() {
  const db = supabaseAdmin();
  if (!db) return Response.json({ enabled: false, campaigns: [] });

  // Idempotent seed of the starter brands. Fixed ids mean a re-run (or a race
  // between two first-load requests) hits a PK conflict and is ignored — so the
  // six brands can never duplicate.
  const { count } = await db
    .from("campaigns")
    .select("id", { count: "exact", head: true });
  if (!count) {
    await db.from("campaigns").upsert(SEED_ROWS, { onConflict: "id", ignoreDuplicates: true });
  }

  const { data, error } = await db
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ enabled: true, campaigns: [], error: error.message }, { status: 500 });
  }
  return Response.json({ enabled: true, campaigns: data ?? [] });
}

// POST /api/campaigns — create a campaign (a brand joining / a new product).
export async function POST(req: NextRequest) {
  const db = supabaseAdmin();
  if (!db) return Response.json({ error: "Supabase not configured" }, { status: 503 });

  const c = await req.json().catch(() => null);
  if (!c?.name || !c?.product) {
    return Response.json({ error: "name and product are required" }, { status: 400 });
  }

  const row = {
    name: String(c.name),
    product: String(c.product),
    category: c.category ?? null,
    commission: typeof c.commission === "number" ? c.commission : 20,
    flat_fee: c.flatFee ?? null,
    bonus: c.bonus ?? null,
    sample: c.sample ?? true,
    collab: c.collab ?? "Open",
    tier: c.tier ?? "Micro",
    color: c.color ?? "#FF3B1D",
    ink: c.ink ?? "#33080b",
    vibe: c.vibe ?? null,
    compliance: c.compliance ?? null,
    status: c.status ?? "Draft",
    brief: c.brief ?? null,
    deal_type: c.dealType ?? "commission",
    cpm: c.cpm ?? null,
    max_payout: c.maxPayout ?? null,
    bonus_per_post: c.bonusPerPost ?? null,
    bonuses_per_day: c.bonusesPerDay ?? null,
    budget: c.budget ?? null,
    start_date: c.startDate ?? null,
    end_date: c.endDate ?? null,
    max_creators: c.maxCreators ?? null,
  };

  const { data, error } = await db.from("campaigns").insert(row).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ campaign: data });
}

// PATCH /api/campaigns — update a campaign's brief / status (publish, rewrite).
export async function PATCH(req: NextRequest) {
  const db = supabaseAdmin();
  if (!db) return Response.json({ error: "Supabase not configured" }, { status: 503 });

  const body = await req.json().catch(() => null);
  if (!body?.id) return Response.json({ error: "id is required" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  for (const k of ["status", "brief", "joined_count", "posted_count", "flat_fee", "bonus"]) {
    if (k in body) patch[k] = body[k];
  }
  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "nothing to update" }, { status: 400 });
  }

  const { data, error } = await db
    .from("campaigns")
    .update(patch)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ campaign: data });
}
