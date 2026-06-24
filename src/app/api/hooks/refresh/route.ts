import { type NextRequest } from "next/server";
import { refreshHooks, kalopilotRaw, CATEGORIES } from "@/lib/kalodata";

export const dynamic = "force-dynamic";
// Kalopilot is slow — give the function room. (Needs a Vercel plan that allows
// long-running functions; on Hobby this may cap lower and a refresh can time out.)
export const maxDuration = 300;

// Daily cron hits this with `Authorization: Bearer <CRON_SECRET>`. For a manual
// first run you can also pass `?key=<CRON_SECRET>`.
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if (req.headers.get("authorization") === `Bearer ${secret}`) return true;
  if (req.nextUrl.searchParams.get("key") === secret) return true;
  return false;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return Response.json(
      { error: "unauthorized — set CRON_SECRET in Vercel and pass it (Bearer header or ?key=)" },
      { status: 401 },
    );
  }

  // Debug: return Kalopilot's raw reply so we can match the parser to it.
  if (req.nextUrl.searchParams.get("debug") === "1") {
    const category = req.nextUrl.searchParams.get("category") ?? "Wellness";
    return Response.json({ debug: true, ...(await kalopilotRaw(category)) });
  }

  const category = req.nextUrl.searchParams.get("category");
  const cats = category ? [category] : CATEGORIES;

  const refreshed = [];
  for (const c of cats) {
    refreshed.push(await refreshHooks(c));
  }
  return Response.json({ refreshed });
}
