import { type NextRequest } from "next/server";
import { marketplaceSearch, extractCreators, cruvaConfigured, listShopsRaw } from "@/lib/cruva";

export const dynamic = "force-dynamic";

// GET /api/discover?q=... — search the Cruva creator marketplace.
// ?debug=1 also shows the auto-resolved shop id + raw upstream responses.
export async function GET(req: NextRequest) {
  if (!cruvaConfigured()) {
    return Response.json({ configured: false, creators: [] });
  }

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const debug = req.nextUrl.searchParams.get("debug") === "1";

  try {
    const { ok, status, raw, json, shopId } = await marketplaceSearch(q);
    if (debug) {
      const shops = await listShopsRaw();
      return Response.json({
        debug: true,
        resolvedShopId: shopId,
        shops: { ok: shops.ok, status: shops.status, sample: shops.raw.slice(0, 600) },
        market: {
          ok,
          status,
          topKeys: json && typeof json === "object" ? Object.keys(json) : null,
          extractedCount: extractCreators(json).length,
          sample: raw.slice(0, 1200),
        },
      });
    }
    if (!ok) return Response.json({ configured: true, creators: [], error: `Cruva ${status}` }, { status: 502 });
    return Response.json({ configured: true, creators: extractCreators(json) });
  } catch (err) {
    return Response.json({ configured: true, creators: [], error: String(err) }, { status: 502 });
  }
}
