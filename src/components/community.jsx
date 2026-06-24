"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Send, Check, GraduationCap, Users } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Community + Academy. Cross-role: brands and creators share one feed; the
// Academy trains creators toward 1k followers + affiliate eligibility.

const PAPER = "#F5F3EF";
const SYSTEM = "#FF3B1D";
const GREEN = "#3ECF8E";

const MODULES = [
  { key: "hooks101", title: "Hooks 101", desc: "Why the first 2 seconds decide everything — and how to open." },
  { key: "shoot", title: "Shooting that doesn't look like an ad", desc: "Lighting, framing, and the 'talk to one person' rule." },
  { key: "grow1k", title: "Getting to 1,000 followers", desc: "The posting cadence + trends that get you affiliate-eligible." },
  { key: "shop", title: "TikTok Shop affiliate basics", desc: "Linking products, the yellow basket, and how commission works." },
  { key: "compliance", title: "Claims you can't make", desc: "Wellness/beauty compliance so your videos don't get pulled." },
];

function timeAgo(iso) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const s = Math.max(0, Math.round((now - then) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function Community({ userId, authRole, onBack }) {
  const sb = supabaseBrowser();
  const [tab, setTab] = useState("feed");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [done, setDone] = useState({});

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!sb) { setLoading(false); return; }
      const { data } = await sb.from("community_posts").select("*").order("created_at", { ascending: false }).limit(50);
      if (!alive) return;
      setPosts(data || []);
      if (userId) {
        const { data: tp } = await sb.from("training_progress").select("module_key").eq("user_id", userId);
        const d = {};
        (tp || []).forEach((r) => { d[r.module_key] = true; });
        if (alive) setDone(d);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitPost() {
    if (!sb || !userId || !body.trim()) return;
    setPosting(true);
    await sb.from("community_posts").insert({ user_id: userId, body: body.trim(), author_role: authRole || "creator" });
    const { data } = await sb.from("community_posts").select("*").order("created_at", { ascending: false }).limit(50);
    setPosts(data || []);
    setBody("");
    setPosting(false);
  }

  async function complete(key) {
    if (!sb || !userId) return;
    await sb.from("training_progress").upsert({ user_id: userId, module_key: key }, { onConflict: "user_id,module_key" });
    setDone((d) => ({ ...d, [key]: true }));
  }

  const completedCount = Object.keys(done).filter((k) => done[k]).length;

  return (
    <div className="px-5 pt-6 pb-12">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#9a9aa0" }}><ArrowLeft size={17} /> Back</button>
      <div className="mt-4 text-2xl font-black tracking-tight" style={{ color: PAPER }}>Community</div>
      <p className="mt-1 text-[14px]" style={{ color: "#8a8a90" }}>Support, training, and the road to TikTok affiliate.</p>

      <div className="mt-5 flex gap-2">
        {[["feed", "Feed", Users], ["academy", "Academy", GraduationCap]].map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold transition-colors" style={{ backgroundColor: tab === t ? PAPER : "#16161a", color: tab === t ? "#0A0A0B" : "#8a8a90", border: "1px solid #2a2a30" }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center"><Loader2 size={22} className="mx-auto animate-spin" style={{ color: SYSTEM }} /></div>
      ) : tab === "feed" ? (
        <div className="mt-5">
          <div className="rounded-2xl p-4" style={{ backgroundColor: "#15171b", border: "1px solid #23252b" }}>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Ask for help, share a win, drop a tip…" className="w-full resize-none rounded-xl px-3.5 py-3 text-[15px] outline-none" style={{ backgroundColor: "#0d0e11", color: PAPER, border: "1px solid #2a2a30" }} />
            <div className="mt-2 flex justify-end">
              <button disabled={!body.trim() || posting} onClick={submitPost} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold disabled:opacity-40" style={{ backgroundColor: SYSTEM, color: PAPER }}>{posting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Post</button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {posts.length === 0 && <div className="rounded-2xl border border-dashed py-10 text-center text-[14px] font-semibold" style={{ borderColor: "#2a2a30", color: "#8a8a90" }}>Be the first to post.</div>}
            {posts.map((p) => (
              <div key={p.id} className="rounded-2xl p-4" style={{ backgroundColor: "#15171b", border: "1px solid #23252b" }}>
                <div className="flex items-center gap-2">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: p.author_role === "brand" ? "#1a1a1f" : SYSTEM, color: p.author_role === "brand" ? "#9a9aa0" : PAPER }}>{p.author_role === "brand" ? "Brand" : "Creator"}</span>
                  <span className="text-[12px]" style={{ color: "#6b6b70" }}>{timeAgo(p.created_at)}</span>
                </div>
                <div className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed" style={{ color: PAPER }}>{p.body}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <div className="rounded-2xl p-4" style={{ backgroundColor: "#101216", border: "1px solid #23252b" }}>
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-bold" style={{ color: PAPER }}>Your progress</div>
              <div className="text-[13px] font-black" style={{ color: GREEN }}>{completedCount} / {MODULES.length}</div>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "#26282e" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.round((completedCount / MODULES.length) * 100)}%`, backgroundColor: GREEN }} />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {MODULES.map((m) => {
              const isDone = !!done[m.key];
              return (
                <div key={m.key} className="rounded-2xl p-4" style={{ backgroundColor: "#15171b", border: `1px solid ${isDone ? GREEN : "#23252b"}` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[15px] font-black" style={{ color: PAPER }}>{m.title}</div>
                      <div className="mt-1 text-[13px] leading-snug" style={{ color: "#8a8a90" }}>{m.desc}</div>
                    </div>
                    {isDone
                      ? <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-bold" style={{ color: GREEN }}><Check size={14} /> Done</span>
                      : <button onClick={() => complete(m.key)} className="shrink-0 rounded-full px-3.5 py-2 text-[13px] font-bold" style={{ backgroundColor: SYSTEM, color: PAPER }}>Mark done</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
