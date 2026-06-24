"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Check, Link2, ExternalLink, Sparkles } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Creator profile: link TikTok / Instagram and track progress to the 1,000-
// follower TikTok-affiliate threshold. Reads/writes connected_accounts directly
// via the browser client (RLS scopes rows to the signed-in creator). Follower
// count is entered for now; real OAuth + auto-count comes when the dev apps exist.

const PAPER = "#F5F3EF";
const SYSTEM = "#FF3B1D";
const GREEN = "#3ECF8E";

const PLATFORMS = [
  { key: "tiktok", label: "TikTok", color: "#FF3B5C" },
  { key: "instagram", label: "Instagram", color: "#C13584" },
];

export default function CreatorProfile({ userId, onBack }) {
  const sb = supabaseBrowser();
  const [accounts, setAccounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [handle, setHandle] = useState("");
  const [followers, setFollowers] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!sb || !userId) { setLoading(false); return; }
      const { data } = await sb
        .from("connected_accounts")
        .select("platform,handle,follower_count")
        .eq("user_id", userId);
      if (!alive) return;
      const map = {};
      (data || []).forEach((r) => { map[r.platform] = r; });
      setAccounts(map);
      setLoading(false);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(p) {
    setEditing(p);
    const a = accounts[p];
    setHandle(a?.handle || "");
    setFollowers(a?.follower_count != null ? String(a.follower_count) : "");
  }

  async function save(p) {
    if (!sb || !userId || !handle.trim()) return;
    setBusy(true);
    const fc = parseInt(followers, 10);
    await sb.from("connected_accounts").upsert(
      { user_id: userId, platform: p, handle: handle.trim().replace(/^@/, ""), follower_count: isNaN(fc) ? null : fc, connected_at: new Date().toISOString() },
      { onConflict: "user_id,platform" },
    );
    const { data } = await sb.from("connected_accounts").select("platform,handle,follower_count").eq("user_id", userId);
    const map = {};
    (data || []).forEach((r) => { map[r.platform] = r; });
    setAccounts(map);
    setEditing(null);
    setBusy(false);
  }

  const tt = accounts.tiktok;
  const ttFollowers = tt?.follower_count || 0;
  const pct = Math.min(100, Math.round((ttFollowers / 1000) * 100));
  const eligible = ttFollowers >= 1000;

  return (
    <div className="px-5 pt-6 pb-12">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#9a9aa0" }}><ArrowLeft size={17} /> Feed</button>
      <div className="mt-4 text-2xl font-black tracking-tight" style={{ color: PAPER }}>Your accounts</div>
      <p className="mt-1 text-[14px]" style={{ color: "#8a8a90" }}>Link your socials and grow toward TikTok affiliate eligibility.</p>

      {/* 1k qualification meter */}
      <div className="mt-5 rounded-2xl p-5" style={{ backgroundColor: eligible ? "#0f1d16" : "#101216", border: `1px solid ${eligible ? GREEN : "#23252b"}` }}>
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: eligible ? GREEN : SYSTEM }}>TikTok affiliate status</div>
          <div className="text-[13px] font-black" style={{ color: PAPER }}>{ttFollowers.toLocaleString()} <span style={{ color: "#6b6b70" }}>/ 1,000</span></div>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "#26282e" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: eligible ? GREEN : SYSTEM }} />
        </div>
        {eligible ? (
          <div className="mt-4">
            <div className="inline-flex items-center gap-1.5 text-[15px] font-black" style={{ color: GREEN }}><Check size={16} /> You qualify!</div>
            <div className="mt-1 text-[13px] leading-snug" style={{ color: "#bcbcc2" }}>Enroll in TikTok Shop affiliate inside the TikTok app → Profile → Creator Tools → TikTok Shop, then start taking brand campaigns here.</div>
            <a href="https://www.tiktok.com/creators" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold" style={{ backgroundColor: GREEN, color: "#06231a" }}>Open TikTok creator tools <ExternalLink size={14} /></a>
          </div>
        ) : (
          <div className="mt-3 text-[13px] leading-snug" style={{ color: "#bcbcc2" }}>
            {tt ? <><span style={{ color: PAPER, fontWeight: 700 }}>{(1000 - ttFollowers).toLocaleString()} to go.</span> Keep posting — the Community and your briefs are built to get you there.</> : "Link your TikTok below to start tracking toward 1,000 followers."}
          </div>
        )}
      </div>

      {/* platform connect cards */}
      <div className="mt-4 space-y-3">
        {PLATFORMS.map((p) => {
          const a = accounts[p.key];
          const isEditing = editing === p.key;
          return (
            <div key={p.key} className="rounded-2xl p-4" style={{ backgroundColor: "#15171b", border: "1px solid #23252b" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-full" style={{ backgroundColor: p.color }}><Link2 size={16} style={{ color: "#fff" }} /></div>
                  <div>
                    <div className="text-[15px] font-black" style={{ color: PAPER }}>{p.label}</div>
                    {a ? <div className="text-[12px] font-semibold" style={{ color: "#8a8a90" }}>@{a.handle}{a.follower_count != null ? ` · ${a.follower_count.toLocaleString()} followers` : ""}</div> : <div className="text-[12px]" style={{ color: "#6b6b70" }}>Not linked</div>}
                  </div>
                </div>
                {!isEditing && <button onClick={() => startEdit(p.key)} className="rounded-full px-3.5 py-2 text-[13px] font-bold" style={{ backgroundColor: a ? "#16161a" : SYSTEM, color: a ? "#9a9aa0" : PAPER, border: a ? "1px solid #2a2a30" : "none" }}>{a ? "Edit" : "Connect"}</button>}
              </div>

              {isEditing && (
                <div className="mt-3 space-y-2.5">
                  <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder={`@your${p.key}handle`} className="w-full rounded-xl px-3.5 py-3 text-[15px] outline-none" style={{ backgroundColor: "#0d0e11", color: PAPER, border: "1px solid #2a2a30" }} />
                  <input value={followers} onChange={(e) => setFollowers(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="follower count" className="w-full rounded-xl px-3.5 py-3 text-[15px] outline-none" style={{ backgroundColor: "#0d0e11", color: PAPER, border: "1px solid #2a2a30" }} />
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(null)} className="rounded-full px-4 py-2.5 text-sm font-bold" style={{ border: "1px solid #3a3a42", color: "#9a9aa0" }}>Cancel</button>
                    <button disabled={!handle.trim() || busy} onClick={() => save(p.key)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold disabled:opacity-40" style={{ backgroundColor: SYSTEM, color: PAPER }}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl px-3.5 py-3" style={{ backgroundColor: "#101216", border: "1px solid #23252b" }}>
        <Sparkles size={15} style={{ color: SYSTEM, marginTop: 2 }} />
        <div className="text-[12px] leading-snug" style={{ color: "#8a8a90" }}>One-tap linking (auto follower count, no typing) is coming once TikTok &amp; Meta app access is set up. For now, enter your handle and follower count.</div>
      </div>
    </div>
  );
}
