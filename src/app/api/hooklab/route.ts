import { type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getTopHooks } from "@/lib/kalodata";

export const dynamic = "force-dynamic";

const client = new Anthropic();

function stripFences(t: string) {
  return t.replace(/```json/gi, "").replace(/```/g, "").trim();
}

// Tolerant of preamble / trailing prose — extract the JSON object if a raw
// JSON.parse fails.
/* eslint-disable @typescript-eslint/no-explicit-any */
function parseJson(text: string): any {
  const c = stripFences(text);
  try { return JSON.parse(c); } catch { /* try to extract */ }
  const s = c.indexOf("{");
  const e = c.lastIndexOf("}");
  if (s >= 0 && e > s) return JSON.parse(c.slice(s, e + 1));
  throw new Error("no parseable JSON");
}

function buildPrompt(
  product: string,
  category: string,
  description: string,
  compliance: string,
  creatorVoice: string,
  liveHooks: string[],
) {
  return `You are a TikTok Shop creative strategist. A brand wants the winning hooks and content frameworks for their product, plus fresh ideas to use right now.

PRODUCT: ${product}
CATEGORY: ${category || "general"}
${description ? `WHAT IT IS: ${description}` : ""}
${compliance ? `COMPLIANCE (hard rules — never break, never imply a banned claim): ${compliance}` : ""}
${creatorVoice ? `CREATOR VOICE: write the newHooks in this creator's natural on-camera style while keeping every hook compliant: ${creatorVoice}` : ""}

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
}

async function run(opts: { product: string; category: string; description: string; compliance: string; creatorVoice: string }) {
  const liveHooks = await getTopHooks(opts.category).catch(() => [] as string[]);
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: buildPrompt(opts.product, opts.category, opts.description, opts.compliance, opts.creatorVoice, liveHooks) }],
  });
  const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("\n");
  return { text, stopReason: msg.stop_reason, liveHooks };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const product = typeof body?.product === "string" ? body.product.trim() : "";
  if (!product) return Response.json({ error: "product is required" }, { status: 400 });

  const opts = {
    product,
    category: typeof body?.category === "string" ? body.category.trim() : "",
    description: typeof body?.description === "string" ? body.description.trim() : "",
    compliance: typeof body?.compliance === "string" ? body.compliance.trim() : "",
    creatorVoice: typeof body?.creatorVoice === "string" ? body.creatorVoice.trim() : "",
  };

  try {
    const { text, liveHooks } = await run(opts);
    const data = parseJson(text);
    return Response.json({ ...data, usedLiveHooks: liveHooks.length });
  } catch (err) {
    console.error("hooklab error:", err);
    return Response.json({ error: "Generation failed", detail: String(err) }, { status: 502 });
  }
}

// GET ?debug=1 — sample run that surfaces stop_reason + parse result.
export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("debug") !== "1") {
    return Response.json({ error: "POST only" }, { status: 405 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ hasAnthropicKey: false, note: "ANTHROPIC_API_KEY is NOT set in this deployment — add it in Vercel and redeploy" });
  }
  try {
    const { text, stopReason, liveHooks } = await run({
      product: "Bio-Active Silver Hydrosol",
      category: "Health",
      description: "daily wellness drops",
      compliance: "",
      creatorVoice: "",
    });
    let parsed: any = null;
    let parseError: string | null = null;
    try { parsed = parseJson(text); } catch (e) { parseError = String(e); }
    return Response.json({
      stopReason,
      liveHooks: liveHooks.length,
      rawLength: text.length,
      parseOk: !!parsed,
      parseError,
      counts: parsed ? { topHooks: parsed.topHooks?.length, newHooks: parsed.newHooks?.length, frameworks: parsed.frameworks?.length } : null,
      rawTail: text.slice(-200),
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 200 });
  }
}
