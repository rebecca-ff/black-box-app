"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Search, Check, BookmarkPlus } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Brand-side creator discovery over the Cruva TikTok Shop marketplace.
// Brands search the external creator pool and save targets to an outreach list.
// (Community is separate — that's callsheet's own signed-up creators.)

const PAPER = "#F5F3EF";
const SYSTEM = "#FF3B1D";
const GREEN = "#3ECF8E";

const TIERS = [
  { key: "all", label: "All", min: 0 },
  { key: "1k", label: "1k+", min: 1000 },
  { key: "10k", label: "10k+", min: 10000 },
  { key: "100k", label: "100k+", min: 100000 },
];

export default function BrandDiscover({ userId, onBack }) {
  const sb = supabaseBrowser();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [q, setQ] = useState("");
  const [tier, setTier] = useState("all");
  const [saved, setSaved] = useState({});
  const [savingH, setSavingH] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (sb && userId) {
        const { data } = await sb.from("outreach_targets").select("handle").eq("brand_id", userId);
        const m = {};
        (data || []).forEach((r) => { m[r.handle.toLowerCase()] = true; });
        setSaved(m);
      }
      await search("");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function search(query) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/discover?q=${encodeURIComponent(query || "")}`);
      const data = await res.json();
      setConfigured(data.configured !== false);
      setCreators(Array.isArray(data.creators) ? data.creators : []);
      if (data.error) setError("Couldn't reach Cruva — check the API key / shop id.");
    } catch {
      setError("Discovery request failed.");
    }
    setLoading(false);
  }

  async function save(c) {
    if (!sb || !userId) return;
    setSavingH(c.handle);
    await sb.from("outreach_targets").upsert(
      { brand_id: userId, handle: c.handle, follower_count: c.followers, gmv: c.gmv, status: "saved" },
      { onConflict: "brand_id,handle" },
    );
    setSaved((m) => ({ ...m, [c.handle.toLowerCase()]: true }));
    setSavingH(null);
  }

  const minF = TIERS.find((t) => t.key === tier)?.min || 0;
  const list = creators.filter((c) => (c.followers || 0) >= minF);

  return (
    <div className="px-5 pt-6 pb-12">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#9a9aa0" }}><ArrowLeft size={17} /> Dashboard</button>
      <div className="mt-4 text-2xl font-black tracking-tight" style={{ color: PAPER }}>Find creators</div>
      <p className="mt-1 text-[14px]" style={{ color: "#8a8a90" }}>Your TikTok Shop creator network (via Cruva) — search and save who to work with.</p>

      <form onSubmit={(e) => { e.preventDefault(); search(q); }} className="mt-5 flex items-center gap-2 rounded-xl px-3.5 py-2.5" style={{ backgroundColor: "#16161a", border: "1px solid #2a2a30" }}>
        <Search size={16} style={{ color: "#7a7a80" }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search creators (niche, keyword, handle)…" className="w-full bg-transparent text-[15px] outline-none" style={{ color: PAPER }} />
        <button type="submit" className="rounded-full px-3 py-1.5 text-[12px] font-bold" style={{ backgroundColor: SYSTEM, color: PAPER }}>Search</button>
      </form>
      <div className="mt-3 flex gap-1.5">
        {TIERS.map((t) => (
          <button key={t.key} onClick={() => setTier(t.key)} className="flex-1 rounded-xl py-2 text-[13px] font-bold transition-colors" style={{ backgroundColor: tier === t.key ? PAPER : "#16161a", color: tier === t.key ? "#0A0A0B" : "#9a9aa0", border: "1px solid #2a2a30" }}>{t.label}</button>
        ))}
      </div>

      {!configured ? (
        <div className="mt-6 rounded-2xl border border-dashed p-5 text-center" style={{ borderColor: "#2a2a30" }}>
          <div className="text-[15px] font-bold" style={{ color: PAPER }}>Connect Cruva to discover creators</div>
          <div className="mt-1.5 text-[13px] leading-snug" style={{ color: "#8a8a90" }}>Add <span style={{ color: PAPER }}>CRUVA_API_KEY</span> and <span style={{ color: PAPER }}>CRUVA_SHOP_ID</span> in Vercel, then redeploy.</div>
        </div>
      ) : loading ? (
        <div className="py-16 text-center"><Loader2 size={22} className="mx-auto animate-spin" style={{ color: SYSTEM }} /></div>
      ) : (
        <div className="mt-4 space-y-3">
          {error ? <div className="text-[13px] font-semibold" style={{ color: SYSTEM }}>{error}</div> : null}
          {list.length === 0 && !error && <div className="rounded-2xl border border-dashed py-12 text-center text-[14px] font-semibold" style={{ borderColor: "#2a2a30", color: "#8a8a90" }}>No creators match. Try a different search.</div>}
          {list.map((c) => {
            const isSaved = !!saved[c.handle.toLowerCase()];
            return (
              <div key={c.handle} className="flex items-center justify-between rounded-2xl p-4" style={{ backgroundColor: "#15171b", border: "1px solid #23252b" }}>
                <div>
                  <div className="text-[16px] font-black" style={{ color: PAPER }}>@{c.handle}</div>
                  <div className="text-[12px] font-semibold" style={{ color: "#8a8a90" }}>
                    {c.followers != null ? `${c.followers.toLocaleString()} followers` : "—"}{c.gmv != null ? ` · $${Math.round(c.gmv).toLocaleString()} GMV` : ""}
                  </div>
                </div>
                {isSaved
                  ? <span className="inline-flex items-center gap-1 text-[13px] font-bold" style={{ color: GREEN }}><Check size={14} /> Saved</span>
                  : <button disabled={savingH === c.handle} onClick={() => save(c)} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold disabled:opacity-50" style={{ backgroundColor: SYSTEM, color: PAPER }}>{savingH === c.handle ? <Loader2 size={14} className="animate-spin" /> : <BookmarkPlus size={14} />} Save</button>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
