"use client";

import { useState } from "react";
import { ArrowLeft, Sparkles, Loader2, Copy, Check, TrendingUp, Zap, Layers } from "lucide-react";

// Hook & Framework Lab — the core intelligence, product-driven. A brand enters
// their product; the app surfaces the real top-performing hooks for the
// category and generates fresh product-specific hooks + content frameworks.

const PAPER = "#F5F3EF";
const INK = "#0A0A0B";
const SYSTEM = "#FF3B1D";
const GREEN = "#3ECF8E";

function Copyable({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
        setDone(true); setTimeout(() => setDone(false), 1200);
      }}
      className="shrink-0 grid h-8 w-8 place-items-center rounded-full"
      style={{ backgroundColor: "#0d0e11", border: "1px solid #2a2a30", color: done ? GREEN : "#9a9aa0" }}
    >
      {done ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

export default function HookLab({ defaultProduct = "", defaultCategory = "", defaultCompliance = "", onBack }) {
  const [product, setProduct] = useState(defaultProduct);
  const [category, setCategory] = useState(defaultCategory);
  const [description, setDescription] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);

  async function generate() {
    if (!product.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/hooklab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, category, description, compliance: defaultCompliance }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "failed");
      setResult(data);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="px-5 pt-6 pb-12">
      {onBack && <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#9a9aa0" }}><ArrowLeft size={17} /> Dashboard</button>}
      <div className="mt-4 flex items-center gap-2">
        <Sparkles size={20} style={{ color: SYSTEM }} />
        <div className="text-2xl font-black tracking-tight" style={{ color: PAPER }}>Hook &amp; Framework Lab</div>
      </div>
      <p className="mt-1 text-[14px]" style={{ color: "#8a8a90" }}>Drop in your product. Get the hooks and frameworks that are working — and fresh ones built for it.</p>

      <div className="mt-5 space-y-3">
        <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Product (e.g. Bio-Active Silver Hydrosol)" className="w-full rounded-xl px-3.5 py-3 text-[15px] outline-none" style={{ backgroundColor: "#16161a", color: PAPER, border: "1px solid #2a2a30" }} />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g. Wellness)" className="w-full rounded-xl px-3.5 py-3 text-[15px] outline-none" style={{ backgroundColor: "#16161a", color: PAPER, border: "1px solid #2a2a30" }} />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="One line on what it does (optional)" className="w-full resize-none rounded-xl px-3.5 py-3 text-[15px] outline-none" style={{ backgroundColor: "#16161a", color: PAPER, border: "1px solid #2a2a30" }} />
        <button disabled={!product.trim() || state === "loading"} onClick={generate} className="inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold disabled:opacity-40" style={{ backgroundColor: SYSTEM, color: PAPER }}>
          {state === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {state === "loading" ? "Working…" : "Find + generate hooks & frameworks"}
        </button>
        {state === "error" && <div className="text-[13px] font-semibold" style={{ color: SYSTEM }}>That didn&apos;t land. Try again.</div>}
      </div>

      {state === "done" && result && (
        <div className="mt-7 space-y-7">
          {/* Top hooks */}
          {result.topHooks?.length ? (
            <div>
              <div className="flex items-center gap-1.5"><TrendingUp size={15} style={{ color: GREEN }} /><div className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: GREEN }}>Top hooks right now</div>{result.usedLiveHooks ? <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: "#0f1d16", color: GREEN, border: `1px solid ${GREEN}` }}>live data</span> : null}</div>
              <div className="mt-3 space-y-2">
                {result.topHooks.map((h, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 rounded-xl p-3.5" style={{ backgroundColor: "#15171b", border: "1px solid #23252b" }}>
                    <div>
                      <div className="text-[15px] font-bold" style={{ color: PAPER }}>{h.hook}</div>
                      {h.why ? <div className="mt-1 text-[12px]" style={{ color: "#8a8a90" }}>↳ {h.why}</div> : null}
                    </div>
                    <Copyable text={h.hook} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* New hooks */}
          {result.newHooks?.length ? (
            <div>
              <div className="flex items-center gap-1.5"><Zap size={15} style={{ color: SYSTEM }} /><div className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: SYSTEM }}>Fresh hooks for your product</div></div>
              <div className="mt-3 space-y-2">
                {result.newHooks.map((h, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 rounded-xl p-3.5" style={{ backgroundColor: "#15171b", border: "1px solid #23252b" }}>
                    <div className="text-[15px] font-semibold" style={{ color: PAPER }}>{h}</div>
                    <Copyable text={h} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Frameworks */}
          {result.frameworks?.length ? (
            <div>
              <div className="flex items-center gap-1.5"><Layers size={15} style={{ color: "#67D3E0" }} /><div className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "#67D3E0" }}>Frameworks that work</div></div>
              <div className="mt-3 space-y-2.5">
                {result.frameworks.map((f, i) => (
                  <div key={i} className="rounded-2xl p-4" style={{ backgroundColor: "#15171b", border: "1px solid #23252b" }}>
                    <div className="text-[15px] font-black" style={{ color: PAPER }}>{f.name}</div>
                    {f.structure ? <div className="mt-1.5 text-[13px] leading-snug" style={{ color: "#bcbcc2" }}>{f.structure}</div> : null}
                    {f.forThisProduct ? <div className="mt-2 rounded-xl px-3 py-2 text-[13px] leading-snug" style={{ backgroundColor: "#0d0e11", color: PAPER, border: "1px solid #26282e" }}>For your product: {f.forThisProduct}</div> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
