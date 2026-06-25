import { type NextRequest } from "next/server";
import { marketplaceSearch, affiliateRoster, extractCreators, cruvaConfigured, listShopsRaw } from "@/lib/cruva";

export const dynamic = "force-dynamic";

// GET /api/discover?q=... — search the Cruva creator marketplace.
// ?debug=1 also shows the auto-resolved shop id + raw upstream responses.
export async function GET(req: NextRequest) {
  const debug = req.nextUrl.searchParams.get("debug") === "1";

  if (!cruvaConfigured()) {
    return Response.json({
      configured: false,
      creators: [],
      // Diagnostic: which CRUVA_* var NAMES exist in the deployment (no values).
      ...(debug ? { cruvaEnvVarsPresent: Object.keys(process.env).filter((k) => k.toUpperCase().includes("CRUVA")) } : {}),
    });
  }

  const q = req.nextUrl.searchParams.get("q") ?? "";
  // Default to the affiliate roster (works on the standard plan). Net-new
  // marketplace search is enterprise-gated; reachable via ?source=marketplace.
  const useMarketplace = req.nextUrl.searchParams.get("source") === "marketplace";
  const call = useMarketplace ? marketplaceSearch : affiliateRoster;

  try {
    const { ok, status, raw, json, shopId } = await call(q);
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
