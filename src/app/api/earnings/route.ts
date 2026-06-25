import { type NextRequest } from "next/server";
import { affiliateRoster, extractCreatorStats, cruvaConfigured } from "@/lib/cruva";

export const dynamic = "force-dynamic";

// GET /api/earnings?handle=<tiktok-handle>
// A creator's sales + commission for the shop, from Cruva's affiliate roster.
export async function GET(req: NextRequest) {
  if (!cruvaConfigured()) return Response.json({ configured: false, stats: null });

  const handle = (req.nextUrl.searchParams.get("handle") || "").replace(/^@/, "").trim();
  if (!handle) return Response.json({ configured: true, stats: null });

  try {
    const { ok, status, json } = await affiliateRoster(handle, 5);
    if (!ok) return Response.json({ configured: true, stats: null, error: `Cruva ${status}` }, { status: 502 });
    const stats = extractCreatorStats(json);
    return Response.json({ configured: true, stats });
  } catch (err) {
    return Response.json({ configured: true, stats: null, error: String(err) }, { status: 502 });
  }
}
