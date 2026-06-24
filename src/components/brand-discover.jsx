"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Search, Send, Check } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Brand-side creator discovery: browse creators who've linked a TikTok account,
// filter by follower tier, and send an invite. Pool = callsheet's own signed-up
// creators for now; a Cruva pull is the upgrade for a bigger pool.

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
  const [tier, setTier] = useState("all");
  const [q, setQ] = useState("");
  const [invited, setInvited] = useState({});
  const [composing, setComposing] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!sb) { setLoading(false); return; }
      const { data } = await sb
        .from("connected_accounts")
        .select("user_id,handle,follower_count,platform")
        .eq("platform", "tiktok")
        .order("follower_count", { ascending: false });
      if (!alive) return;
      setCreators((data || []).filter((c) => c.user_id !== userId));
      if (userId) {
        const { data: inv } = await sb.from("invitations").select("creator_id").eq("brand_id", userId);
        const m = {};
        (inv || []).forEach((r) => { m[r.creator_id] = true; });
        if (alive) setInvited(m);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function invite(creatorId) {
    if (!sb || !userId) return;
    setBusy(true);
    await sb.from("invitations").upsert(
      { brand_id: userId, creator_id: creatorId, message: message.trim() || null, status: "sent" },
      { onConflict: "brand_id,creator_id" },
    );
    setInvited((m) => ({ ...m, [creatorId]: true }));
    setComposing(null);
    setMessage("");
    setBusy(false);
  }

  const minF = TIERS.find((t) => t.key === tier)?.min || 0;
  const list = creators.filter((c) => (c.follower_count || 0) >= minF && (!q.trim() || (c.handle || "").toLowerCase().includes(q.trim().toLowerCase())));

  return (
    <div className="px-5 pt-6 pb-12">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#9a9aa0" }}><ArrowLeft size={17} /> Dashboard</button>
      <div className="mt-4 text-2xl font-black tracking-tight" style={{ color: PAPER }}>Find creators</div>
      <p className="mt-1 text-[14px]" style={{ color: "#8a8a90" }}>Browse creators on callsheet and invite them to a campaign.</p>

      <div className="mt-5 flex items-center gap-2 rounded-xl px-3.5 py-2.5" style={{ backgroundColor: "#16161a", border: "1px solid #2a2a30" }}>
        <Search size={16} style={{ color: "#7a7a80" }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by handle…" className="w-full bg-transparent text-[15px] outline-none" style={{ color: PAPER }} />
      </div>
      <div className="mt-3 flex gap-1.5">
        {TIERS.map((t) => (
          <button key={t.key} onClick={() => setTier(t.key)} className="flex-1 rounded-xl py-2 text-[13px] font-bold transition-colors" style={{ backgroundColor: tier === t.key ? PAPER : "#16161a", color: tier === t.key ? "#0A0A0B" : "#9a9aa0", border: "1px solid #2a2a30" }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center"><Loader2 size={22} className="mx-auto animate-spin" style={{ color: SYSTEM }} /></div>
      ) : (
        <div className="mt-4 space-y-3">
          {list.length === 0 && <div className="rounded-2xl border border-dashed py-12 text-center text-[14px] font-semibold" style={{ borderColor: "#2a2a30", color: "#8a8a90" }}>No creators yet. As creators link TikTok, they show up here.</div>}
          {list.map((c) => {
            const isInvited = !!invited[c.user_id];
            const isComposing = composing === c.user_id;
            return (
              <div key={c.user_id} className="rounded-2xl p-4" style={{ backgroundColor: "#15171b", border: "1px solid #23252b" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[16px] font-black" style={{ color: PAPER }}>@{c.handle}</div>
                    <div className="text-[12px] font-semibold" style={{ color: "#8a8a90" }}>{(c.follower_count || 0).toLocaleString()} followers</div>
                  </div>
                  {isInvited
                    ? <span className="inline-flex items-center gap-1 text-[13px] font-bold" style={{ color: GREEN }}><Check size={14} /> Invited</span>
                    : <button onClick={() => { setComposing(c.user_id); setMessage(""); }} className="rounded-full px-4 py-2 text-[13px] font-bold" style={{ backgroundColor: SYSTEM, color: PAPER }}>Invite</button>}
                </div>
                {isComposing && (
                  <div className="mt-3 space-y-2.5">
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Optional note — what's the campaign?" className="w-full resize-none rounded-xl px-3.5 py-3 text-[14px] outline-none" style={{ backgroundColor: "#0d0e11", color: PAPER, border: "1px solid #2a2a30" }} />
                    <div className="flex gap-2">
                      <button onClick={() => setComposing(null)} className="rounded-full px-4 py-2.5 text-sm font-bold" style={{ border: "1px solid #3a3a42", color: "#9a9aa0" }}>Cancel</button>
                      <button disabled={busy} onClick={() => invite(c.user_id)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold disabled:opacity-50" style={{ backgroundColor: SYSTEM, color: PAPER }}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Send invite</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
