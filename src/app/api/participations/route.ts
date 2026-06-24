import { type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET /api/participations?creator=<key> — a creator's relationship to campaigns
// (joined / posted / sample requested / filmed / remix).
export async function GET(req: NextRequest) {
  const db = supabaseAdmin();
  if (!db) return Response.json({ enabled: false, participations: [] });

  const creator = req.nextUrl.searchParams.get("creator");
  if (!creator) return Response.json({ enabled: true, participations: [] });

  const { data, error } = await db
    .from("participations")
    .select("*")
    .eq("creator_key", creator);

  if (error) {
    return Response.json({ enabled: true, participations: [], error: error.message }, { status: 500 });
  }
  return Response.json({ enabled: true, participations: data ?? [] });
}

// POST /api/participations — upsert one creator's action on one campaign.
// Only the fields provided are changed; the campaign's joined/posted counts are
// kept in sync by the DB trigger.
export async function POST(req: NextRequest) {
  const db = supabaseAdmin();
  if (!db) return Response.json({ error: "Supabase not configured" }, { status: 503 });

  const body = await req.json().catch(() => null);
  if (!body?.campaign_id || !body?.creator_key) {
    return Response.json({ error: "campaign_id and creator_key are required" }, { status: 400 });
  }

  const payload: Record<string, unknown> = {
    campaign_id: body.campaign_id,
    creator_key: body.creator_key,
    updated_at: new Date().toISOString(),
  };
  for (const k of ["joined", "posted", "sample_requested", "filmed", "remix"]) {
    if (k in body) payload[k] = body[k];
  }

  const { data, error } = await db
    .from("participations")
    .upsert(payload, { onConflict: "campaign_id,creator_key" })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ participation: data });
}
