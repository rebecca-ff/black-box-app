import { type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getTopHooks } from "@/lib/kalodata";

export const dynamic = "force-dynamic";

const client = new Anthropic();

function stripFences(t: string) {
  return t.replace(/```json/gi, "").replace(/```/g, "").trim();
}

// POST /api/hooklab — the core intelligence: given a product, surface the real
// top-performing hooks for its category and generate fresh, product-specific
// hooks + content frameworks the brand can hand to creators.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const product = typeof body?.product === "string" ? body.product.trim() : "";
  if (!product) return Response.json({ error: "product is required" }, { status: 400 });

  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const compliance = typeof body?.compliance === "string" ? body.compliance.trim() : "";

  // Real top hooks for the category (Kalopilot daily cache; [] if none yet).
  const liveHooks = await getTopHooks(category).catch(() => [] as string[]);

  const prompt = `You are a TikTok Shop creative strategist. A brand wants the winning hooks and content frameworks for their product, plus fresh ideas to use right now.

PRODUCT: ${product}
CATEGORY: ${category || "general"}
${description ? `WHAT IT IS: ${description}` : ""}
${compliance ? `COMPLIANCE (hard rules — never break, never imply a banned claim): ${compliance}` : ""}

${liveHooks.length
    ? `REAL TOP-PERFORMING HOOKS IN THIS CATEGORY THIS WEEK (ranked by revenue — study the underlying patterns, do not copy verbatim):\n${liveHooks.map((h, i) => `${i + 1}. ${h}`).join("\n")}`
    : `There is no live hook data for this category — use proven, current best-in-class TikTok Shop hook patterns for it.`}

A "framework" is a repeatable content STRUCTURE that consistently performs (e.g. POV problem→fix, before/after, 3-reasons, myth-vs-fact, honest-review, day-in-the-life).

Return ONLY valid JSON — no preamble, no markdown, no fences:
{
  "topHooks": [{"hook": "a proven hook (paraphrase the real ones above if given)", "why": "one line on the mechanism that makes it work"}],
  "newHooks": ["a fresh hook written specifically for THIS product, under 14 words, adapting what works, fully compliant"],
  "frameworks": [{"name": "framework name", "structure": "the beat-by-beat structure", "forThisProduct": "how to apply it to this exact product, 1-2 lines"}]
}

Give 5-6 topHooks, 8 newHooks, and 4 frameworks. Voice: deadpan, specific, no influencer fluff. Respect compliance absolutely.`;

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("\n");
    const data = JSON.parse(stripFences(text));
    return Response.json({ ...data, usedLiveHooks: liveHooks.length });
  } catch (err) {
    console.error("hooklab error:", err);
    return Response.json({ error: "Generation failed" }, { status: 502 });
  }
}
