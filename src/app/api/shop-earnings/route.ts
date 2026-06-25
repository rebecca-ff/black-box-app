import { shopStats, statValue, affiliateRoster, extractCreators, cruvaConfigured } from "@/lib/cruva";

export const dynamic = "force-dynamic";

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

// GET /api/shop-earnings — shop-level affiliate totals (last 30d) + top creators.
export async function GET() {
  if (!cruvaConfigured()) return Response.json({ configured: false });

  const to = new Date();
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    const { ok, status, json } = await shopStats(ymd(from), ymd(to));
    if (!ok) return Response.json({ configured: true, error: `Cruva ${status}` }, { status: 502 });

    const totals = {
      gmv: statValue(json, "affiliate_gmv"),
      commission: statValue(json, "commission"),
      units: statValue(json, "affiliate_units_sold"),
      videos: statValue(json, "affiliate_videos_posted"),
      creators: statValue(json, "distinct_creators"),
    };

    const roster = await affiliateRoster("", 8);
    const topCreators = extractCreators(roster.json, 8);

    return Response.json({ configured: true, totals, topCreators, range: { from: ymd(from), to: ymd(to) } });
  } catch (err) {
    return Response.json({ configured: true, error: String(err) }, { status: 502 });
  }
}
