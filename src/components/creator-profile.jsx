"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Check, Link2, ExternalLink, Sparkles, RefreshCw, AlertTriangle, X, Eye, Heart, MessageCircle, Send, BarChart3 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Creator profile: link TikTok / Instagram, track progress to the 1,000-follower
// affiliate threshold, and watch REAL-TIME performance of the videos they post.
//
// TikTok connects through real Login Kit OAuth (/api/tiktok/auth), which writes
// back the handle + follower count AND stores tokens server-side. Once connected,
// /api/tiktok/videos pulls live video metrics (views/likes/comments/shares)
// straight from TikTok's Display API — no Cruva. Creators tag each video to a
// brand campaign they joined here, so performance rolls up per brand.

const PAPER = "#F5F3EF";
const SYSTEM = "#FF3B1D";
const GREEN = "#3ECF8E";

const PLATFORMS = [
  { key: "tiktok", label: "TikTok", color: "#FF3B5C" },
  { key: "instagram", label: "Instagram", color: "#C13584" },
];

const fmt = (n) => {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 1) + "K";
  return v.toLocaleString();
};

export default function CreatorProfile({ userId, onBack, brands = [] }) {
  const sb = supabaseBrowser();
  const [accounts, setAccounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [handle, setHandle] = useState("");
  const [followers, setFollowers] = useState("");
  const [busy, setBusy] = useState(false);
  const [earnings, setEarnings] = useState(null);
  const [notice, setNotice] = useState(null); // OAuth result banner: connected|error|unconfigured
  const [showLog, setShowLog] = useState(false);
  const [gmvIn, setGmvIn] = useState("");
  const [commIn, setCommIn] = useState("");
  const [unitsIn, setUnitsIn] = useState("");
  const [savingLog, setSavingLog] = useState(false);

  // live TikTok video performance (direct from TikTok)
  const [videos, setVideos] = useState(null); // null=not loaded, []=loaded empty
  const [vidState, setVidState] = useState("idle"); // idle|loading|connected|unconnected|unconfigured|error
  const [links, setLinks] = useState({}); // video_id -> campaign_id

  const brandById = Object.fromEntries(brands.map((b) => [String(b.id), b]));

  // Surface the result of the TikTok OAuth round-trip (the callback redirects to
  // /?tiktok=connected|error|unconfigured), then strip the param so a refresh is clean.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const status = new URLSearchParams(window.location.search).get("tiktok");
    if (status === "connected" || status === "error" || status === "unconfigured") {
      setNotice(status);
      const url = new URL(window.location.href);
      url.searchParams.delete("tiktok");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }
  }, []);

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
      loadEarnings();
      loadVideoLinks();
      // Connected to TikTok? Pull live video performance straight from TikTok.
      if (map.tiktok) loadVideos();
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

  async function loadEarnings() {
    if (!sb || !userId) return;
    const { data } = await sb.from("earnings").select("gmv,commission,units").eq("creator_id", userId);
    if (data && data.length) {
      setEarnings(data.reduce((a, r) => ({ gmv: a.gmv + (+r.gmv || 0), commission: a.commission + (+r.commission || 0), units: a.units + (+r.units || 0), sales: a.sales + 1 }), { gmv: 0, commission: 0, units: 0, sales: 0 }));
    } else {
      setEarnings(null);
    }
  }

  // Real-time video metrics, pulled directly from TikTok's Display API.
  async function loadVideos() {
    if (!userId) return;
    setVidState("loading");
    try {
      const res = await fetch(`/api/tiktok/videos?u=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (!data?.configured) { setVidState("unconfigured"); setVideos(null); return; }
      if (!data?.connected) { setVidState("unconnected"); setVideos(null); return; }
      setVideos(Array.isArray(data.videos) ? data.videos : []);
      setVidState("connected");
    } catch {
      setVidState("error");
    }
  }

  // Which campaign (brand) each video was posted for. Creator-owned rows.
  async function loadVideoLinks() {
    if (!sb || !userId) return;
    const { data } = await sb.from("creator_video_links").select("video_id,campaign_id").eq("creator_id", userId);
    const map = {};
    (data || []).forEach((r) => { map[r.video_id] = r.campaign_id; });
    setLinks(map);
  }

  async function tagVideo(videoId, campaignId) {
    setLinks((m) => ({ ...m, [videoId]: campaignId || undefined }));
    if (!sb || !userId) return;
    if (!campaignId) {
      await sb.from("creator_video_links").delete().eq("creator_id", userId).eq("video_id", videoId);
    } else {
      await sb.from("creator_video_links").upsert(
        { creator_id: userId, video_id: videoId, campaign_id: String(campaignId) },
        { onConflict: "creator_id,video_id" },
      );
    }
  }

  async function logSale() {
    if (!sb || !userId) return;
    const g = parseFloat(gmvIn) || 0;
    const com = parseFloat(commIn) || 0;
    if (!g && !com) return;
    setSavingLog(true);
    await sb.from("earnings").insert({ creator_id: userId, gmv: g, commission: com, units: parseInt(unitsIn, 10) || 0 });
    setGmvIn(""); setCommIn(""); setUnitsIn("");
    setShowLog(false);
    await loadEarnings();
    setSavingLog(false);
  }

  const tt = accounts.tiktok;
  const ttFollowers = tt?.follower_count || 0;
  const pct = Math.min(100, Math.round((ttFollowers / 1000) * 100));
  const eligible = ttFollowers >= 1000;

  // Aggregate live metrics (overall + per brand).
  const totals = (videos || []).reduce(
    (a, v) => ({ views: a.views + v.views, likes: a.likes + v.likes, comments: a.comments + v.comments, shares: a.shares + v.shares }),
    { views: 0, likes: 0, comments: 0, shares: 0 },
  );
  const byBrand = {};
  for (const v of videos || []) {
    const cid = links[v.id];
    if (!cid || !brandById[cid]) continue;
    const b = (byBrand[cid] ||= { brand: brandById[cid], views: 0, likes: 0, comments: 0, shares: 0, count: 0 });
    b.views += v.views; b.likes += v.likes; b.comments += v.comments; b.shares += v.shares; b.count += 1;
  }
  const brandRollup = Object.values(byBrand).sort((a, b) => b.views - a.views);

  return (
    <div className="px-5 pt-6 pb-12">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#9a9aa0" }}><ArrowLeft size={17} /> Feed</button>
      <div className="mt-4 text-2xl font-black tracking-tight" style={{ color: PAPER }}>Your accounts</div>
      <p className="mt-1 text-[14px]" style={{ color: "#8a8a90" }}>Connect TikTok to track real-time performance and grow toward affiliate eligibility.</p>

      {/* OAuth round-trip result */}
      {notice && (
        <div className="mt-4 flex items-start gap-2 rounded-xl px-3.5 py-3" style={{
          backgroundColor: notice === "connected" ? "#0f1d16" : "#1d1210",
          border: `1px solid ${notice === "connected" ? GREEN : SYSTEM}`,
        }}>
          {notice === "connected" ? <Check size={16} style={{ color: GREEN, marginTop: 1 }} /> : <AlertTriangle size={16} style={{ color: SYSTEM, marginTop: 1 }} />}
          <div className="flex-1 text-[13px] leading-snug" style={{ color: "#d6d6dc" }}>
            {notice === "connected" && <><span style={{ color: GREEN, fontWeight: 800 }}>TikTok connected.</span> Your handle, follower count, and live video performance are now linked.</>}
            {notice === "error" && <><span style={{ color: SYSTEM, fontWeight: 800 }}>Couldn&apos;t connect TikTok.</span> The authorization didn&apos;t complete. Tap Connect TikTok to try again.</>}
            {notice === "unconfigured" && <><span style={{ color: SYSTEM, fontWeight: 800 }}>TikTok login isn&apos;t set up yet.</span> Add your handle manually below for now — real login turns on once the TikTok app is approved.</>}
          </div>
          <button onClick={() => setNotice(null)} aria-label="Dismiss" style={{ color: "#8a8a90" }}><X size={15} /></button>
        </div>
      )}

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

      {/* live video performance — direct from TikTok */}
      {tt && (
        <div className="mt-4 rounded-2xl p-5" style={{ backgroundColor: "#101216", border: "1px solid #23252b" }}>
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: GREEN }}><BarChart3 size={13} /> Live video performance</div>
            <button onClick={loadVideos} disabled={vidState === "loading"} className="inline-flex items-center gap-1 text-[12px] font-bold disabled:opacity-50" style={{ color: GREEN }}>
              {vidState === "loading" ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Refresh
            </button>
          </div>

          {vidState === "loading" && videos == null ? (
            <div className="mt-4 flex items-center gap-2 text-[13px]" style={{ color: "#8a8a90" }}><Loader2 size={14} className="animate-spin" /> Pulling your latest TikToks…</div>
          ) : vidState === "unconfigured" ? (
            <div className="mt-2 text-[13px] leading-snug" style={{ color: "#8a8a90" }}>Live TikTok metrics turn on once the TikTok app is approved. Your handle is linked in the meantime.</div>
          ) : vidState === "unconnected" ? (
            <div className="mt-3">
              <div className="text-[13px] leading-snug" style={{ color: "#8a8a90" }}>Reconnect TikTok with video access to pull live views, likes, comments, and shares.</div>
              <a href={`/api/tiktok/auth?u=${encodeURIComponent(userId || "")}`} className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-bold" style={{ backgroundColor: SYSTEM, color: PAPER }}>Reconnect TikTok <ExternalLink size={14} /></a>
            </div>
          ) : vidState === "error" ? (
            <div className="mt-2 text-[13px]" style={{ color: "#8a8a90" }}>Couldn&apos;t reach TikTok just now. Tap Refresh to retry.</div>
          ) : videos && videos.length === 0 ? (
            <div className="mt-2 text-[13px] leading-snug" style={{ color: "#8a8a90" }}>No videos yet. Post your first brand video and it&apos;ll show up here with live stats.</div>
          ) : videos && videos.length > 0 ? (
            <>
              {/* overall totals */}
              <div className="mt-3 grid grid-cols-4 gap-2">
                <Metric icon={Eye} label="Views" value={totals.views} />
                <Metric icon={Heart} label="Likes" value={totals.likes} />
                <Metric icon={MessageCircle} label="Comments" value={totals.comments} />
                <Metric icon={Send} label="Shares" value={totals.shares} />
              </div>
              <div className="mt-2 text-[11px]" style={{ color: "#6b6b70" }}>Live from TikTok across your {videos.length} most recent video{videos.length === 1 ? "" : "s"}.</div>

              {/* per-brand rollup */}
              {brandRollup.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "#6b6b70" }}>By brand</div>
                  {brandRollup.map((b) => (
                    <div key={b.brand.id} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ backgroundColor: "#15171b", border: "1px solid #23252b" }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: b.brand.color || SYSTEM }} />
                        <span className="truncate text-[13px] font-bold" style={{ color: PAPER }}>{b.brand.name}</span>
                        <span className="text-[11px]" style={{ color: "#6b6b70" }}>· {b.count} video{b.count === 1 ? "" : "s"}</span>
                      </div>
                      <div className="shrink-0 text-[12px] font-semibold" style={{ color: "#bcbcc2" }}>{fmt(b.views)} views · {fmt(b.likes)} likes</div>
                    </div>
                  ))}
                </div>
              )}

              {/* per-video list with brand tagging */}
              <div className="mt-4 space-y-2.5">
                {videos.map((v) => (
                  <div key={v.id} className="rounded-xl p-3" style={{ backgroundColor: "#15171b", border: "1px solid #23252b" }}>
                    <div className="flex gap-3">
                      {v.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.cover} alt="" className="h-16 w-12 shrink-0 rounded-lg object-cover" style={{ backgroundColor: "#0d0e11" }} />
                      ) : (
                        <div className="grid h-16 w-12 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: "#0d0e11" }}><Clapper /></div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-semibold" style={{ color: PAPER }}>{v.caption || "Untitled video"}</div>
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px]" style={{ color: "#bcbcc2" }}>
                          <span className="inline-flex items-center gap-1"><Eye size={12} style={{ color: "#8a8a90" }} /> {fmt(v.views)}</span>
                          <span className="inline-flex items-center gap-1"><Heart size={12} style={{ color: "#8a8a90" }} /> {fmt(v.likes)}</span>
                          <span className="inline-flex items-center gap-1"><MessageCircle size={12} style={{ color: "#8a8a90" }} /> {fmt(v.comments)}</span>
                          <span className="inline-flex items-center gap-1"><Send size={12} style={{ color: "#8a8a90" }} /> {fmt(v.shares)}</span>
                        </div>
                      </div>
                      {v.url && (
                        <a href={v.url} target="_blank" rel="noopener noreferrer" className="shrink-0 self-start" style={{ color: "#6b6b70" }} aria-label="Open on TikTok"><ExternalLink size={15} /></a>
                      )}
                    </div>
                    {brands.length > 0 && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="text-[11px] font-semibold" style={{ color: "#6b6b70" }}>Brand</span>
                        <select
                          value={links[v.id] || ""}
                          onChange={(e) => tagVideo(v.id, e.target.value)}
                          className="flex-1 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold outline-none"
                          style={{ backgroundColor: "#0d0e11", color: links[v.id] ? PAPER : "#8a8a90", border: "1px solid #2a2a30" }}
                        >
                          <option value="">Not assigned</option>
                          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* earnings — self-report ledger (manual; sales/commission, not video stats) */}
      <div className="mt-4 rounded-2xl p-5" style={{ backgroundColor: "#101216", border: "1px solid #23252b" }}>
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: GREEN }}>Your sales &amp; commission</div>
          <button onClick={() => setShowLog((v) => !v)} className="text-[12px] font-bold" style={{ color: SYSTEM }}>{showLog ? "Cancel" : "Log a sale"}</button>
        </div>

        {showLog && (
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              <input value={gmvIn} onChange={(e) => setGmvIn(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder="Sale $ (GMV)" className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none" style={{ backgroundColor: "#16161a", color: PAPER, border: "1px solid #2a2a30" }} />
              <input value={commIn} onChange={(e) => setCommIn(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder="Commission $" className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none" style={{ backgroundColor: "#16161a", color: PAPER, border: "1px solid #2a2a30" }} />
            </div>
            <button disabled={savingLog || (!gmvIn && !commIn)} onClick={logSale} className="inline-flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold disabled:opacity-40" style={{ backgroundColor: SYSTEM, color: PAPER }}>{savingLog ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save sale</button>
          </div>
        )}

        {earnings ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div><div className="text-2xl font-black" style={{ color: GREEN }}>${Math.round(earnings.commission || 0).toLocaleString()}</div><div className="text-[12px]" style={{ color: "#8a8a90" }}>Commission earned</div></div>
            <div><div className="text-2xl font-black" style={{ color: PAPER }}>${Math.round(earnings.gmv || 0).toLocaleString()}</div><div className="text-[12px]" style={{ color: "#8a8a90" }}>Sales (GMV)</div></div>
            <div><div className="text-2xl font-black" style={{ color: PAPER }}>{(earnings.units || 0).toLocaleString()}</div><div className="text-[12px]" style={{ color: "#8a8a90" }}>Units sold</div></div>
            <div><div className="text-2xl font-black" style={{ color: PAPER }}>{(earnings.sales || 0).toLocaleString()}</div><div className="text-[12px]" style={{ color: "#8a8a90" }}>Sales logged</div></div>
          </div>
        ) : (
          <div className="mt-2 text-[13px] leading-snug" style={{ color: "#8a8a90" }}>No sales tracked yet. Log a sale above to keep a running tally of your commission.</div>
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
                {!isEditing && (
                  p.key === "tiktok"
                    ? <a href={`/api/tiktok/auth?u=${encodeURIComponent(userId || "")}`} className="rounded-full px-3.5 py-2 text-[13px] font-bold" style={{ backgroundColor: a ? "#16161a" : SYSTEM, color: a ? "#9a9aa0" : PAPER, border: a ? "1px solid #2a2a30" : "none" }}>{a ? "Reconnect" : "Connect TikTok"}</a>
                    : <button onClick={() => startEdit(p.key)} className="rounded-full px-3.5 py-2 text-[13px] font-bold" style={{ backgroundColor: a ? "#16161a" : SYSTEM, color: a ? "#9a9aa0" : PAPER, border: a ? "1px solid #2a2a30" : "none" }}>{a ? "Edit" : "Connect"}</button>
                )}
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
        <div className="text-[12px] leading-snug" style={{ color: "#8a8a90" }}>TikTok connects through TikTok&apos;s real login and pulls your handle, follower count, and live video stats automatically (once the TikTok app is approved). Instagram is manual for now.</div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl px-2 py-2.5 text-center" style={{ backgroundColor: "#15171b", border: "1px solid #23252b" }}>
      <Icon size={14} style={{ color: GREEN, margin: "0 auto" }} />
      <div className="mt-1 text-[16px] font-black" style={{ color: PAPER }}>{fmt(value)}</div>
      <div className="text-[10px]" style={{ color: "#8a8a90" }}>{label}</div>
    </div>
  );
}

function Clapper() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3a3a42" strokeWidth="2"><path d="M3 7l18-2M3 7v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7M3 7l3 .5M9 5.5l3 .5M15 4.5l3 .5" /></svg>;
}
