import { type NextRequest } from "next/server";
import { marketplaceSearch, extractCreators, cruvaConfigured } from "@/lib/cruva";

export const dynamic = "force-dynamic";

// GET /api/discover?q=... — search the Cruva creator marketplace.
// ?debug=1 returns the raw upstream response so we can confirm field mapping.
export async function GET(req: NextRequest) {
  if (!cruvaConfigured()) {
    return Response.json({ configured: false, creators: [] });
  }

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const debug = req.nextUrl.searchParams.get("debug") === "1";

  try {
    const { ok, status, raw, json } = await marketplaceSearch(q);
    if (debug) {
      return Response.json({
        debug: true,
        ok,
        status,
        topKeys: json && typeof json === "object" ? Object.keys(json) : null,
        extractedCount: extractCreators(json).length,
        sample: raw.slice(0, 1500),
      });
    }
    if (!ok) return Response.json({ configured: true, creators: [], error: `Cruva ${status}` }, { status: 502 });
    return Response.json({ configured: true, creators: extractCreators(json) });
  } catch (err) {
    return Response.json({ configured: true, creators: [], error: String(err) }, { status: 502 });
  }
}
