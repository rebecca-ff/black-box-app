import { type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

const client = new Anthropic();

function stripFences(t: string) {
  return t.replace(/```json/gi, "").replace(/```/g, "").trim();
}
/* eslint-disable @typescript-eslint/no-explicit-any */
function parseJson(text: string): any {
  const c = stripFences(text);
  try { return JSON.parse(c); } catch { /* extract */ }
  const s = c.indexOf("{");
  const e = c.lastIndexOf("}");
  if (s >= 0 && e > s) return JSON.parse(c.slice(s, e + 1));
  throw new Error("no parseable JSON");
}

// POST /api/hookscript — build the full shot-by-shot script around a chosen
// opening hook, so the creator films the whole video, not just the hook.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const hook = typeof body?.hook === "string" ? body.hook.trim() : "";
  const product = typeof body?.product === "string" ? body.product.trim() : "";
  if (!hook || !product) {
    return Response.json({ error: "hook and product are required" }, { status: 400 });
  }
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const compliance = typeof body?.compliance === "string" ? body.compliance.trim() : "";
  const creatorVoice = typeof body?.creatorVoice === "string" ? body.creatorVoice.trim() : "";

  const prompt = `You are a TikTok Shop creative director. Build the FULL short-form video script around a chosen opening hook, so the creator can film the whole thing start to finish.

PRODUCT: ${product}
CATEGORY: ${category || "general"}
${description ? `WHAT IT IS: ${description}` : ""}
${compliance ? `COMPLIANCE (hard rules — never break, never imply a banned claim): ${compliance}` : ""}
${creatorVoice ? `CREATOR VOICE: write everything in this creator's natural on-camera style: ${creatorVoice}` : ""}

OPENING HOOK — shot 1 MUST open with this exact line as both the on-screen text and the spoken opener:
"${hook}"

Use the Timote framework across the shots: Hook -> Problem -> Solution -> Proof -> CTA. The CTA drives viewers to buy on the creator's TikTok Shop (product link / yellow basket), never off-platform. Voice: deadpan, specific, no influencer fluff.

Return ONLY valid JSON — no preamble, no markdown, no fences:
{
  "concept": "one-line POV concept",
  "shots": [{"title": "Shot 1", "action": "what the creator films or says", "onscreen": "on-screen text or empty string", "note": "one short tip or empty string"}],
  "caption": "the single on-screen caption",
  "postDescription": "TikTok post caption, 1-3 short deadpan lines",
  "hashtags": ["#tag"]
}

4 or 5 shots, ordered Hook, Problem, Solution, Proof, CTA. Shot 1's onscreen must be the hook above. 5-8 hashtags. Respect compliance absolutely.`;

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("\n");
    const data = parseJson(text);
    return Response.json(data);
  } catch (err) {
    console.error("hookscript error:", err);
    return Response.json({ error: "Script generation failed" }, { status: 502 });
  }
}
