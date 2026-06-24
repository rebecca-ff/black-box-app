import { type NextRequest } from "next/server";
import { getTopHooks, probeVideoRank } from "@/lib/kalodata";

export const dynamic = "force-dynamic";

// GET /api/hooks?category=Wellness — top hooks for a category this week.
// Add &debug=1 to see the raw upstream Kalodata result (status/success/sample).
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? undefined;
  const range = req.nextUrl.searchParams.get("range") ?? "last7Day";

  if (req.nextUrl.searchParams.get("debug") === "1") {
    return Response.json({ debug: true, ...(await probeVideoRank(category, range)) });
  }

  const configured = !!process.env.KALODATA_API_KEY;
  const hooks = await getTopHooks(category, range, 12);
  return Response.json({
    configured,
    category: category ?? null,
    range,
    count: hooks.length,
    hooks,
  });
}
