import { type NextRequest } from "next/server";
import { fetchCreatorVideos, tiktokConfigured } from "@/lib/tiktok";

export const dynamic = "force-dynamic";

// GET /api/tiktok/videos?u=<userId>
// Real-time performance for the creator's own TikTok videos — views, likes,
// comments, shares — pulled straight from TikTok's Display API (no Cruva).
// Reads the creator's server-stored OAuth token and calls TikTok on their behalf.
export async function GET(req: NextRequest) {
  if (!tiktokConfigured()) return Response.json({ configured: false, connected: false, videos: [] });

  const userId = (req.nextUrl.searchParams.get("u") || "").trim();
  if (!userId) return Response.json({ configured: true, connected: false, videos: [] });

  try {
    const { connected, videos } = await fetchCreatorVideos(userId);
    return Response.json({ configured: true, connected, videos });
  } catch (err) {
    return Response.json({ configured: true, connected: false, videos: [], error: String(err) }, { status: 502 });
  }
}
