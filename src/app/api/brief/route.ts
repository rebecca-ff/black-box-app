import { type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getTopHooks } from "@/lib/kalodata";

export const dynamic = "force-dynamic";

const client = new Anthropic();

type Campaign = {
  name: string;
  product: string;
  category?: string;
  commission?: number;
  sample?: boolean;
  collab?: string;
  tier?: string;
  vibe?: string;
  compliance?: string;
};

function stripFences(t: string) {
  return t.replace(/```json/gi, "").replace(/```/g, "").trim();
}

function buildPrompt(c: Campaign, creatorVoice: string, hooks: string[]) {
  const hooksBlock = hooks.length
    ? `\nTOP-PERFORMING HOOKS IN THIS CATEGORY THIS WEEK (real TikTok Shop video openers, ranked by revenue). Study the PATTERN behind why these work and adapt the single strongest into a fresh hook for THIS brand. Never copy one verbatim, and never break compliance:\n${hooks.map((h, i) => `${i + 1}. ${h}`).join("\n")}\n`
    : "";

  return `You are a TikTok Shop creative director writing the affiliate creator brief for a brand campaign. Use the Timote framework: Hook -> Problem -> Solution -> Proof -> CTA.

BRAND: ${c.name}
PRODUCT: ${c.product}
CATEGORY: ${c.category}
DEAL: ${c.commission}% commission${c.sample ? ", free sample provided" : ", no sample"}, ${c.collab} collaboration, targeting ${c.tier} creators.
CREATIVE VIBE: ${c.vibe}
COMPLIANCE (follow exactly, no exceptions): ${c.compliance}
${creatorVoice ? `CREATOR VOICE: adapt wording to this creator's natural style while keeping every shot's structure and all compliance intact: ${creatorVoice}` : ""}
${hooksBlock}
The CTA must drive viewers to buy on the creator's TikTok Shop (product link / yellow basket), never off-platform.
Voice: deadpan, specific, no aspirational filler, no influencer-speak.

Return ONLY valid JSON — no preamble, no markdown, no fences — exactly:
{
  "concept": "POV-style on-screen hook line, under 12 words",
  "shots": [{"title": "Shot 1", "action": "what the creator films or does", "onscreen": "text overlay or empty string", "note": "one short tip or empty string"}],
  "caption": "the single on-screen caption to overlay",
  "postDescription": "TikTok post caption, 1-3 short deadpan lines",
  "hashtags": ["#tag"]
}

4 or 5 shots ordered Hook, Problem, Solution, Proof, CTA. 5-8 hashtags. Respect compliance absolutely.`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const c: Campaign | undefined = body?.campaign;

  if (!c?.name || !c?.product) {
    return Response.json(
      { error: "Missing campaign name or product" },
      { status: 400 }
    );
  }

  const creatorVoice =
    typeof body?.creatorVoice === "string" ? body.creatorVoice : "";

  // Pull this week's top hooks for the category (no-op without KALODATA_API_KEY;
  // never blocks or fails generation).
  const hooks = await getTopHooks(c.category).catch(() => [] as string[]);

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: buildPrompt(c, creatorVoice, hooks) }],
    });

    const text = msg.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n");

    const brief = JSON.parse(stripFences(text));
    return Response.json(brief);
  } catch (err) {
    console.error("brief generation error:", err);
    return Response.json(
      { error: "Brief generation failed" },
      { status: 502 }
    );
  }
}
