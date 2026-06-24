import { type NextRequest } from "next/server";
import { getTopHooks } from "@/lib/kalodata";

export const dynamic = "force-dynamic";

// GET /api/hooks?category=Wellness — top hooks for a category this week.
// Doubles as a diagnostic: `configured` shows whether KALODATA_API_KEY is set,
// `count`/`hooks` show whether the Open API returned data we could parse.
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? undefined;
  const range = req.nextUrl.searchParams.get("range") ?? "last7Day";
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
