"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, Check, Plus, Loader2, RefreshCw, Send, Link2, Gift, Sparkles, CheckCircle2, Clapperboard } from "lucide-react";
import ShotFilmer from "./shot-filmer";
import CreatorProfile from "./creator-profile";
import Community from "./community";
import BrandDiscover from "./brand-discover";
import BrandEarnings from "./brand-earnings";
import CampaignBuilder from "./campaign-builder";
import CreatorInvites from "./creator-invites";
import CreatorShop from "./creator-shop";
import BrandProducts from "./brand-products";
import HookLab from "./hook-lab";
import { supabaseBrowser } from "@/lib/supabase-browser";

// ---------------------------------------------------------------------------
// callsheet.  — dual-ended TikTok Shop affiliate briefing.
// BRAND side: build the campaign + deal, AI writes the brief, publish it.
// CREATOR side: browse what's live, join, get the brief, film, post.
// One shared campaign pool. Publish -> appears in the creator feed.
// ---------------------------------------------------------------------------

const INK = "#0A0A0B";
const PAPER = "#F5F3EF";
const SYSTEM = "#FF3B1D";
const GREEN = "#3ECF8E";

const TIERS = ["Nano", "Micro", "Mid"];
const COLLABS = ["Open", "Targeted"];

// --- seeded example briefs so the creator feed has content on load ----------
const SOV_BRIEF = {
  concept: "POV: the thing I take before anyone in the house gets sick",
  shots: [
    { title: "Shot 1", action: "Film yourself mid morning-routine, holding the bottle, slightly unbothered.", onscreen: "my 'don't get sick' insurance", note: "Casual, not salesy" },
    { title: "Shot 2", action: "Talk to camera: when the season turns, your routine matters more than your panic.", onscreen: "", note: "Low energy, conversational" },
    { title: "Shot 3", action: "Show the dropper, take it, set the bottle down. Simple.", onscreen: "10 drops, done", note: "" },
    { title: "Shot 4", action: "Hold the bottle to camera and tap the yellow basket.", onscreen: "it's on my shop", note: "Point at the product link" },
  ],
  caption: "my 'don't get sick' insurance",
  postDescription: "Adding this to the morning lineup before the season turns.\nNot a cure for anything — just how I keep my routine boring.",
  hashtags: ["#wellnessroutine", "#immunesupport", "#tiktokshopfinds", "#morningritual", "#dailywellness"],
};
const DOUST_BRIEF = {
  concept: "POV: you switched to one ingredient and your shelf got quieter",
  shots: [
    { title: "Shot 1", action: "Film the jar in soft light, scoop a little, rub it between your fingers.", onscreen: "one ingredient. that's it.", note: "Slow, tactile" },
    { title: "Shot 2", action: "To camera: I stopped counting the words on my labels.", onscreen: "", note: "Dry delivery" },
    { title: "Shot 3", action: "Apply to the back of your hand, show the finish.", onscreen: "skin feels fed, not coated", note: "Show texture, not claims" },
    { title: "Shot 4", action: "Hold the jar and tap the basket.", onscreen: "on my shop", note: "" },
  ],
  caption: "one ingredient. that's it.",
  postDescription: "Whipped tallow. That's the whole label.\nMy skincare routine is mostly just this now.",
  hashtags: ["#tallow", "#slowbeauty", "#minimalskincare", "#tiktokshop", "#skinbarrier"],
};

const SEED = [
  { id: "sov", name: "Sovereign Silver", product: "Bio-Active Silver Hydrosol", category: "Wellness", commission: 18, sample: true, collab: "Open", tier: "Micro", color: "#3B82F6", ink: "#091633",
    vibe: "Calm, editorial, science-forward", compliance: "No antimicrobial / kill / cure language. Daily wellness + immune support framing only.",
    status: "Live", brief: SOV_BRIEF, joinedCount: 14, postedCount: 9 },
  { id: "doust", name: "doust.", product: "Whipped Tallow Balm", category: "Beauty", commission: 30, sample: true, collab: "Open", tier: "Nano", color: "#C46B3E", ink: "#2A1108",
    vibe: "Slow beauty, ingredient-forward, dry wit", compliance: "No acne / eczema treatment claims. Skin-feel and ritual framing only.",
    status: "Live", brief: DOUST_BRIEF, joinedCount: 7, postedCount: 3 },
  { id: "fido", name: "Fifth & Fido", product: "Turkey Tail+ Chews", category: "Pet", commission: 25, sample: true, collab: "Targeted", tier: "Micro", color: "#E8A23D", ink: "#2E2006",
    vibe: "Warm, senior-dog love, founder voice", compliance: "No disease, lump, or cancer claims. Immune + senior vitality support only.",
    status: "Draft", brief: null, joinedCount: 0, postedCount: 0 },
  { id: "contour", name: "Contour Cube", product: "Facial Ice Mold", category: "Beauty", commission: 20, sample: true, collab: "Open", tier: "Nano", color: "#67D3E0", ink: "#04262E",
    vibe: "Clean, cold-girl, morning routine", compliance: "It is an ice mold, never an ice roller. No medical skin claims.",
    status: "Draft", brief: null, joinedCount: 0, postedCount: 0 },
  { id: "skimp", name: "Skimpies", product: "The Original Leggings Liner", category: "Apparel", commission: 22, sample: true, collab: "Open", tier: "Micro", color: "#FF4D8D", ink: "#33081C",
    vibe: "Deadpan, relatable, zero shame", compliance: "No hygiene fear-mongering. Light and matter-of-fact.",
    status: "Draft", brief: null, joinedCount: 0, postedCount: 0 },
  { id: "arber", name: "Arber", product: "Plant Biotic Defense", category: "Garden", commission: 15, sample: false, collab: "Targeted", tier: "Mid", color: "#2FA66B", ink: "#052817",
    vibe: "Hands-in-soil, calm, real results", compliance: "No pesticide efficacy guarantees. Plant health support framing.",
    status: "Draft", brief: null, joinedCount: 0, postedCount: 0 },
];

// Brief generation runs server-side at /api/brief so the Anthropic API key
// never reaches the browser. The route builds the prompt and returns the
// parsed brief JSON.
async function writeBrief(c, creatorVoice) {
  const res = await fetch("/api/brief", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campaign: c, creatorVoice: creatorVoice || "" }),
  });
  if (!res.ok) throw new Error("Brief request failed");
  return res.json();
}

// --- shared bits -------------------------------------------------------------

function Eyebrow({ children, style }) {
  return <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={style}>{children}</div>;
}
function Chip({ children, bg, fg }) {
  return <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: bg, color: fg }}>{children}</span>;
}
function CopyButton({ text, color, label = "Copy", block, icon }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch {} document.body.removeChild(ta); }
    setDone(true); setTimeout(() => setDone(false), 1400);
  };
  return (
    <button onClick={copy} className={`${block ? "w-full" : ""} inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-transform active:scale-95`} style={{ backgroundColor: color, color: INK }}>
      {done ? <Check size={16} /> : (icon || <Copy size={16} />)}{done ? "Copied" : label}
    </button>
  );
}
function RoleToggle({ role, onChange }) {
  return (
    <div className="flex rounded-full p-1" style={{ backgroundColor: "#16161a", border: "1px solid #2a2a30" }}>
      {["brand", "creator"].map((r) => (
        <button key={r} onClick={() => onChange(r)} className="rounded-full px-3.5 py-1.5 text-[12px] font-bold capitalize transition-colors"
          style={{ backgroundColor: role === r ? SYSTEM : "transparent", color: role === r ? PAPER : "#8a8a90" }}>{r}</button>
      ))}
    </div>
  );
}

// --- the brief slide flow (shared) ------------------------------------------

function SlideFlow({ c, brief }) {
  const slides = brief.shots || [];
  const [i, setI] = useState(0);
  const last = slides.length - 1;
  const go = (n) => setI(Math.max(0, Math.min(last, n)));
  const touch = useRef(null);
  const onStart = (e) => (touch.current = e.touches[0].clientX);
  const onEnd = (e) => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; if (dx < -45) go(i + 1); if (dx > 45) go(i - 1); touch.current = null; };
  const tags = (brief.hashtags || []).join(" ");
  const fullPost = `${brief.postDescription || ""}${tags ? "\n\n" + tags : ""}`;
  const pct = slides.length ? ((i + 1) / slides.length) * 100 : 0;

  return (
    <div>
      {/* progress bar — Noise-style step indicator */}
      <div className="mx-5 mb-4 h-1 overflow-hidden rounded-full" style={{ backgroundColor: "#23252b" }}>
        <div className="h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${pct}%`, backgroundColor: SYSTEM }} />
      </div>

      <div className="mx-5 flex flex-wrap items-center gap-1.5 rounded-xl px-3.5 py-3" style={{ backgroundColor: "#101216", border: "1px solid #23252b" }}>
        <Eyebrow style={{ color: "#7a7a80" }}>Your deal</Eyebrow><span className="mx-1 text-[#3a3a42]">·</span>
        <Chip bg={c.color} fg={c.ink}>{c.commission}% commission</Chip>
        {c.flatFee ? <Chip bg="#1a1a1f" fg="#9a9aa0">${c.flatFee} flat</Chip> : null}
        {c.sample && <Chip bg="#1a1a1f" fg="#9a9aa0">Free sample</Chip>}
        <Chip bg="#1a1a1f" fg="#9a9aa0">{c.collab} collab</Chip>
        {c.bonus ? <div className="mt-1 w-full text-[12px] font-semibold" style={{ color: GREEN }}>★ Bonus: {c.bonus}</div> : null}
      </div>

      <div className="px-5 pt-5">
        <Eyebrow style={{ color: c.color }}>The concept</Eyebrow>
        <div className="mt-1.5 text-[22px] font-black leading-tight tracking-tight" style={{ color: PAPER }}>{brief.concept}</div>
      </div>

      <div className="mt-5 overflow-hidden" onTouchStart={onStart} onTouchEnd={onEnd}>
        <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(calc(7% - ${i * 86}%))` }}>
          {slides.map((s, idx) => (
            <div key={idx} className="shrink-0 px-1.5" style={{ flexBasis: "82%" }}>
              <div className="flex min-h-[340px] flex-col rounded-3xl p-6 transition-opacity duration-300" style={{ backgroundColor: "#15171b", border: `1px solid ${idx === i ? c.color : "#23252b"}`, opacity: idx === i ? 1 : 0.45 }}>
                <Eyebrow style={{ color: c.color }}>{s.title || `Shot ${idx + 1}`}</Eyebrow>
                <div className="mt-3 text-[19px] font-bold leading-snug" style={{ color: PAPER }}>{s.action}</div>
                {s.onscreen ? (
                  <div className="mt-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "#7a7a80" }}>On-screen text</div>
                    <div className="mt-1.5 rounded-xl px-3 py-2.5 text-[15px] font-semibold" style={{ backgroundColor: "#0d0e11", color: PAPER, border: "1px solid #26282e" }}>{s.onscreen}</div>
                  </div>
                ) : null}
                {s.note ? <div className="mt-auto pt-4 text-[13px] leading-snug" style={{ color: "#8a8a90" }}>↳ {s.note}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between px-7">
        <button onClick={() => go(i - 1)} disabled={i === 0} className="grid h-12 w-12 place-items-center rounded-full transition-opacity disabled:opacity-25" style={{ border: "1.5px solid #3a3a42", color: PAPER }}><ChevronLeft size={22} /></button>
        <div className="text-[17px] font-black" style={{ color: PAPER }}>Shot {i + 1} <span style={{ color: "#6b6b70" }}>of {slides.length}</span></div>
        <button onClick={() => go(i + 1)} disabled={i === last} className="grid h-12 w-12 place-items-center rounded-full transition-opacity disabled:opacity-25" style={{ border: "1.5px solid #3a3a42", color: PAPER }}><ChevronRight size={22} /></button>
      </div>

      <div className="mt-6 px-5"><CopyButton text={brief.caption} color={c.color} label="Copy caption" block /></div>

      <div className="mt-4 px-5">
        <div className="rounded-2xl p-5" style={{ backgroundColor: PAPER }}>
          <div className="flex items-center justify-between">
            <div><div className="text-[15px] font-black" style={{ color: INK }}>Post description</div><div className="text-[12px]" style={{ color: "#6b6b70" }}>Caption + hashtags for your post</div></div>
            <CopyButton text={fullPost} color={c.color} label="Copy" />
          </div>
          <div className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed" style={{ color: "#1b1b1f" }}>{brief.postDescription}</div>
          {brief.hashtags?.length ? <div className="mt-3 flex flex-wrap gap-1.5">{brief.hashtags.map((h, k) => <span key={k} className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ backgroundColor: "#e7e4dc", color: "#3a3a40" }}>{h}</span>)}</div> : null}
        </div>
      </div>
    </div>
  );
}

// ============================ BRAND SIDE =====================================

function BrandDash({ campaigns, role, onRole, onOpen, onNew, onSignOut, onCommunity, onDiscover, onHookLab, onEarnings, onProducts }) {
  const live = campaigns.filter((c) => c.status === "Live").length;
  const lightPill = { backgroundColor: "#fff", color: "#0A0A0B", border: "1px solid #e6e3dc" };
  const dealLabel = (c) => (c.dealType === "paid" ? (c.cpm ? `$${c.cpm} CPM` : "Paid") : `${c.commission}%`);
  return (
    <div className="min-h-screen px-5 pt-7 pb-12" style={{ backgroundColor: "#faf8f4" }}>
      <div className="flex items-start justify-between">
        <div className="text-3xl font-black tracking-tight" style={{ color: "#0A0A0B" }}>callsheet<span style={{ color: SYSTEM }}>.</span></div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {onHookLab && <button onClick={onHookLab} className="rounded-full px-3.5 py-1.5 text-[12px] font-bold" style={{ backgroundColor: SYSTEM, color: "#fff" }}>✨ Hooks</button>}
          {onProducts && <button onClick={onProducts} className="rounded-full px-3.5 py-1.5 text-[12px] font-bold" style={lightPill}>Products</button>}
          {onDiscover && <button onClick={onDiscover} className="rounded-full px-3.5 py-1.5 text-[12px] font-bold" style={lightPill}>Find creators</button>}
          {onEarnings && <button onClick={onEarnings} className="rounded-full px-3.5 py-1.5 text-[12px] font-bold" style={lightPill}>Earnings</button>}
          {onCommunity && <button onClick={onCommunity} className="rounded-full px-3.5 py-1.5 text-[12px] font-bold" style={lightPill}>Community</button>}
          {onSignOut
            ? <button onClick={onSignOut} className="rounded-full px-3.5 py-1.5 text-[12px] font-bold" style={{ backgroundColor: "#fff", color: "#6b6b70", border: "1px solid #e6e3dc" }}>Sign out</button>
            : <RoleToggle role={role} onChange={onRole} />}
        </div>
      </div>
      <p className="mt-2 text-[15px] leading-snug" style={{ color: "#6b6b70" }}>Set the deal. AI writes the brief. Publish to your creators.</p>
      <div className="mt-5 flex items-center gap-4">
        <span className="text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: "#9a958c" }}>{campaigns.length} campaigns</span>
        <span className="text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: live ? "#1f9d62" : "#9a958c" }}>{live} live</span>
      </div>

      <div className="mt-4 space-y-3">
        {campaigns.map((c) => (
          <button key={c.id} onClick={() => onOpen(c.id)} className="block w-full rounded-2xl border bg-white p-5 text-left transition-transform active:scale-[0.99]" style={{ borderColor: "#e6e3dc" }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "#9a958c" }}>{c.category}</span>
              </div>
              <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: c.status === "Live" ? "#e7f7ee" : "#f0ede7", color: c.status === "Live" ? "#1f9d62" : "#8a857c" }}>{c.status}</span>
            </div>
            <div className="mt-2.5 text-2xl font-black leading-none tracking-tight" style={{ color: "#0A0A0B" }}>{c.name}</div>
            <div className="mt-1.5 text-[15px] font-semibold" style={{ color: "#6b6b70" }}>{c.product}</div>
            <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: "#0A0A0B", color: "#fff" }}>{dealLabel(c)}</span>
              {c.sample && <Chip bg="#f0ede7" fg="#6b6b70">Sample</Chip>}
              <Chip bg="#f0ede7" fg="#6b6b70">{c.tier === "premium" ? "Premium" : c.tier === "basic" ? "Basic" : c.collab}</Chip>
            </div>
            {c.status === "Live" && <div className="mt-3 text-[12px] font-bold" style={{ color: "#8a857c" }}>{c.joinedCount} joined · {c.postedCount} posted</div>}
          </button>
        ))}
        <button onClick={onNew} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-5 text-sm font-bold" style={{ borderColor: "#d8d3c9", color: "#8a857c" }}><Plus size={17} /> New campaign</button>
      </div>
    </div>
  );
}

function Segmented({ options, value, onChange, color }) {
  return (
    <div className="mt-1.5 flex gap-1.5">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className="flex-1 rounded-xl py-2.5 text-[14px] font-bold transition-colors" style={{ backgroundColor: value === o ? color : "#16161a", color: value === o ? INK : "#9a9aa0", border: "1px solid #2a2a30" }}>{o}</button>
      ))}
    </div>
  );
}

function NewCampaign({ onCancel, onCreate }) {
  const [f, setF] = useState({ name: "", product: "", category: "", commission: 20, flatFee: "", bonus: "", sample: true, collab: "Open", tier: "Micro", vibe: "", compliance: "" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const ready = f.name.trim() && f.product.trim();
  const input = (label, k, ph, area) => (
    <label className="block"><Eyebrow style={{ color: "#7a7a80" }}>{label}</Eyebrow>
      {area ? <textarea value={f[k]} onChange={(e) => set(k, e.target.value)} placeholder={ph} rows={2} className="mt-1.5 w-full resize-none rounded-xl px-3.5 py-3 text-[15px] outline-none" style={{ backgroundColor: "#16161a", color: PAPER, border: "1px solid #2a2a30" }} />
        : <input value={f[k]} onChange={(e) => set(k, e.target.value)} placeholder={ph} className="mt-1.5 w-full rounded-xl px-3.5 py-3 text-[15px] outline-none" style={{ backgroundColor: "#16161a", color: PAPER, border: "1px solid #2a2a30" }} />}
    </label>
  );
  return (
    <div className="px-5 pt-7 pb-12">
      <button onClick={onCancel} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#9a9aa0" }}><ArrowLeft size={17} /> Campaigns</button>
      <div className="text-2xl font-black tracking-tight" style={{ color: PAPER }}>New campaign</div>
      <p className="mt-1.5 text-[14px]" style={{ color: "#8a8a90" }}>Deal terms shape the script. Compliance is the hard line.</p>
      <div className="mt-6 space-y-4">
        {input("Brand", "name", "Sovereign Silver")}
        {input("Product", "product", "Bio-Active Silver Hydrosol")}
        {input("Category", "category", "Wellness")}
        <div><Eyebrow style={{ color: "#7a7a80" }}>Commission — {f.commission}%</Eyebrow><input type="range" min="5" max="40" value={f.commission} onChange={(e) => set("commission", +e.target.value)} className="mt-2 w-full" style={{ accentColor: SYSTEM }} /></div>
        {input("Flat fee ($, optional)", "flatFee", "e.g. 150")}
        {input("Bonus (optional)", "bonus", "e.g. $100 bonus at 100k views")}
        <div className="flex items-center justify-between rounded-xl px-3.5 py-3" style={{ backgroundColor: "#16161a", border: "1px solid #2a2a30" }}>
          <div className="flex items-center gap-2"><Gift size={16} style={{ color: "#9a9aa0" }} /><span className="text-[15px] font-semibold" style={{ color: PAPER }}>Free sample</span></div>
          <button onClick={() => set("sample", !f.sample)} className="h-7 w-12 rounded-full p-0.5 transition-colors" style={{ backgroundColor: f.sample ? SYSTEM : "#33333a" }}><div className="h-6 w-6 rounded-full bg-white transition-transform" style={{ transform: f.sample ? "translateX(20px)" : "translateX(0)" }} /></button>
        </div>
        <div><Eyebrow style={{ color: "#7a7a80" }}>Collaboration</Eyebrow><Segmented options={COLLABS} value={f.collab} onChange={(v) => set("collab", v)} color={SYSTEM} /></div>
        <div><Eyebrow style={{ color: "#7a7a80" }}>Target tier</Eyebrow><Segmented options={TIERS} value={f.tier} onChange={(v) => set("tier", v)} color={SYSTEM} /></div>
        {input("Creative vibe", "vibe", "Calm, editorial, science-forward")}
        {input("Compliance / off-limits", "compliance", "No cure claims. Wellness framing only.", true)}
      </div>
      <button disabled={!ready} onClick={() => onCreate({ id: "c" + Date.now(), name: f.name.trim(), product: f.product.trim(), category: f.category.trim() || "Custom", commission: f.commission, flatFee: f.flatFee ? +f.flatFee : null, bonus: f.bonus.trim() || null, sample: f.sample, collab: f.collab, tier: f.tier, color: SYSTEM, ink: "#33080b", vibe: f.vibe.trim() || "Authentic, specific", compliance: f.compliance.trim() || "Keep claims honest and verifiable.", status: "Draft", brief: null, joinedCount: 0, postedCount: 0 })}
        className="mt-7 w-full rounded-full py-4 text-sm font-bold transition-transform active:scale-95 disabled:opacity-40" style={{ backgroundColor: SYSTEM, color: PAPER }}>Create campaign</button>
    </div>
  );
}

function BrandDetail({ c, onBack, onGenerate, onPublish, state }) {
  const link = `shop.tiktok.com/affiliate/${c.id}`;
  const dealLabel = c.dealType === "paid" ? (c.cpm ? `$${c.cpm} CPM` : "Paid") : `${c.commission}% commission`;
  const [tab, setTab] = useState("editor");
  const [slideBrief, setSlideBrief] = useState(null);
  const [slideState, setSlideState] = useState("idle");
  const conv = c.joinedCount ? Math.round((c.postedCount / c.joinedCount) * 100) : 0;

  async function genSlideshow() {
    setSlideState("loading");
    try {
      const res = await fetch("/api/brief", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ campaign: c, format: "slideshow" }) });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error("failed");
      setSlideBrief(data); setSlideState("idle");
    } catch { setSlideState("failed"); }
  }

  const aStat = (label, value, accent) => (
    <div className="rounded-xl border bg-white px-4 py-3" style={{ borderColor: "#e6e3dc" }}><div className="text-2xl font-black" style={{ color: accent || "#0A0A0B" }}>{value}</div><span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "#9a958c" }}>{label}</span></div>
  );

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: "#faf8f4" }}>
      <div className="px-5 pt-6"><button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#6b6b70" }}><ArrowLeft size={17} /> Campaigns</button></div>

      <div className="mx-5 mt-4 rounded-2xl border bg-white p-5" style={{ borderColor: "#e6e3dc" }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} /><span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "#9a958c" }}>{c.category}</span></div>
          <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: c.status === "Live" ? "#e7f7ee" : "#f0ede7", color: c.status === "Live" ? "#1f9d62" : "#8a857c" }}>{c.status}</span>
        </div>
        <div className="mt-2.5 text-2xl font-black tracking-tight" style={{ color: "#0A0A0B" }}>{c.name}</div>
        <div className="text-[15px] font-semibold" style={{ color: "#6b6b70" }}>{c.product}</div>
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: "#0A0A0B", color: "#fff" }}>{dealLabel}</span>
          {c.sample && <Chip bg="#f0ede7" fg="#6b6b70">Free sample</Chip>}
          <Chip bg="#f0ede7" fg="#6b6b70">{c.tier === "premium" ? "Premium" : c.tier === "basic" ? "Basic" : c.collab}</Chip>
        </div>
      </div>

      <div className="mx-5 mt-4 flex gap-1 rounded-xl border p-1" style={{ borderColor: "#e6e3dc", backgroundColor: "#fff" }}>
        {[["editor", "Editor"], ["slideshows", "Slideshows"], ["analytics", "Analytics"]].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} className="flex-1 rounded-lg py-2 text-[13px] font-bold transition-colors" style={{ backgroundColor: tab === t ? "#0A0A0B" : "transparent", color: tab === t ? "#fff" : "#6b6b70" }}>{label}</button>
        ))}
      </div>

      {tab === "analytics" && (
        <div className="mx-5 mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {aStat("Joined", c.joinedCount)}
            {aStat("Posted", c.postedCount)}
            {aStat("Conversion", `${conv}%`, "#1f9d62")}
            {aStat("Status", c.status)}
          </div>
          <div className="rounded-2xl border bg-white p-4" style={{ borderColor: "#e6e3dc" }}><div className="text-[13px] leading-snug" style={{ color: "#52504a" }}>Views, sales and per-creator commission for this campaign sync from the TikTok Shop affiliate API once connected. Joins &amp; posts are live now.</div></div>
        </div>
      )}

      {tab === "slideshows" && (
        <div className="mt-4">
          <div className="px-5"><span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "#9a958c" }}>Slideshow playbook — faceless, text-over-image</span></div>
          {slideState === "loading" ? (
            <div className="py-16 text-center"><Loader2 size={22} className="mx-auto animate-spin" style={{ color: SYSTEM }} /><div className="mt-3 text-[15px] font-bold" style={{ color: "#0A0A0B" }}>Building the slideshow</div></div>
          ) : slideBrief ? (
            <div className="mt-3">
              <SlideFlow c={c} brief={slideBrief} />
              <div className="mx-5 mt-4"><button onClick={genSlideshow} className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border bg-white py-3 text-sm font-bold" style={{ borderColor: "#d8d3c9", color: "#0A0A0B" }}><RefreshCw size={15} /> Regenerate slideshow</button></div>
            </div>
          ) : (
            <div className="mx-5 mt-3 rounded-2xl border border-dashed py-10 text-center" style={{ borderColor: "#d8d3c9" }}>
              <div className="text-[15px] font-semibold" style={{ color: "#8a857c" }}>Faceless slideshow version</div>
              <div className="mx-auto mt-1 max-w-[18rem] text-[13px]" style={{ color: "#9a958c" }}>Text-over-image slides, no talking to camera — for creators who don&apos;t show their face.</div>
              <button onClick={genSlideshow} className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white" style={{ backgroundColor: SYSTEM }}><Sparkles size={16} /> Generate slideshow</button>
              {slideState === "failed" && <div className="mt-3 text-[12px] font-semibold" style={{ color: SYSTEM }}>Didn&apos;t land. Try again.</div>}
            </div>
          )}
        </div>
      )}

      {tab === "editor" && (
      <>
      <div className="mx-5 mt-4 rounded-xl border bg-white px-3.5 py-3" style={{ borderColor: "#e6e3dc" }}><span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: SYSTEM }}>Compliance guardrail</span><div className="mt-1 text-[13px] leading-snug" style={{ color: "#52504a" }}>{c.compliance}</div></div>

      <div className="mt-6">
        <div className="px-5"><span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "#9a958c" }}>Creator brief — what your affiliates receive</span></div>
        {state === "idle" && !c.brief && (
          <div className="mx-5 mt-3 rounded-2xl border border-dashed py-10 text-center" style={{ borderColor: "#d8d3c9" }}>
            <div className="text-[15px] font-semibold" style={{ color: "#8a857c" }}>No brief yet.</div>
            <button onClick={onGenerate} className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white" style={{ backgroundColor: SYSTEM }}><Sparkles size={16} /> Write the brief</button>
          </div>
        )}
        {state === "generating" && <div className="py-16 text-center"><Loader2 size={22} className="mx-auto animate-spin" style={{ color: SYSTEM }} /><div className="mt-3 text-[15px] font-bold" style={{ color: "#0A0A0B" }}>Writing the brief</div><div className="mt-1 text-[13px]" style={{ color: "#8a857c" }}>Inside the {c.name} rules</div></div>}
        {state === "failed" && <div className="mx-5 mt-3 rounded-2xl border py-10 text-center" style={{ borderColor: "#e6e3dc" }}><div className="text-[15px] font-bold" style={{ color: "#0A0A0B" }}>The writer choked</div><button onClick={onGenerate} className="mt-3 rounded-full px-5 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: SYSTEM }}>Rewrite</button></div>}
        {state === "idle" && c.brief && (
          <div className="mt-3">
            <SlideFlow c={c} brief={c.brief} />
            <div className="mx-5 mt-6 rounded-2xl border bg-white p-5" style={{ borderColor: "#e6e3dc" }}>
              {c.status === "Live" ? (
                <div>
                  <div className="flex items-center gap-2"><Check size={16} style={{ color: "#1f9d62" }} /><span className="text-[15px] font-black" style={{ color: "#0A0A0B" }}>Live for affiliates</span></div>
                  <div className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-3" style={{ backgroundColor: "#faf8f4", borderColor: "#e6e3dc" }}><Link2 size={15} style={{ color: "#9a958c" }} /><span className="flex-1 truncate text-[13px]" style={{ color: "#52504a" }}>{link}</span><CopyButton text={link} color={SYSTEM} label="Copy" /></div>
                  <button onClick={onGenerate} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border py-3 text-sm font-bold" style={{ borderColor: "#d8d3c9", color: "#0A0A0B" }}><RefreshCw size={15} /> Rewrite</button>
                </div>
              ) : (
                <div>
                  <div className="text-[15px] font-black" style={{ color: "#0A0A0B" }}>Ready to send</div>
                  <div className="mt-1 text-[13px]" style={{ color: "#8a857c" }}>Publishing opens this to creators in the feed.</div>
                  <div className="mt-4 flex gap-2"><button onClick={onGenerate} className="inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-3 text-sm font-bold" style={{ borderColor: "#d8d3c9", color: "#0A0A0B" }}><RefreshCw size={15} /> Rewrite</button><button onClick={onPublish} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white" style={{ backgroundColor: SYSTEM }}><Send size={15} /> Publish</button></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}

// ============================ CREATOR SIDE ===================================

function CreatorFeed({ campaigns, creator, role, onRole, tab, onTab, onOpen, onJoin, onSignOut, onProfile, onCommunity, onInvites, onHooks, onShop }) {
  const live = campaigns.filter((c) => c.status === "Live" && c.brief);
  const discover = live.filter((c) => !creator.joined.includes(c.id));
  const joined = live.filter((c) => creator.joined.includes(c.id));
  const list = tab === "discover" ? discover : joined;
  return (
    <div className="px-5 pt-7 pb-12">
      <div className="flex items-start justify-between">
        <div className="text-3xl font-black tracking-tight" style={{ color: PAPER }}>callsheet<span style={{ color: SYSTEM }}>.</span></div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {onHooks && <button onClick={onHooks} className="rounded-full px-3.5 py-1.5 text-[12px] font-bold" style={{ backgroundColor: SYSTEM, color: PAPER }}>✨ Hooks</button>}
          {onShop && <button onClick={onShop} className="rounded-full px-3.5 py-1.5 text-[12px] font-bold" style={{ backgroundColor: "#16161a", color: PAPER, border: "1px solid #2a2a30" }}>Shop</button>}
          {onInvites && <button onClick={onInvites} className="rounded-full px-3.5 py-1.5 text-[12px] font-bold" style={{ backgroundColor: "#16161a", color: PAPER, border: "1px solid #2a2a30" }}>Invites</button>}
          {onCommunity && <button onClick={onCommunity} className="rounded-full px-3.5 py-1.5 text-[12px] font-bold" style={{ backgroundColor: "#16161a", color: PAPER, border: "1px solid #2a2a30" }}>Community</button>}
          {onProfile && <button onClick={onProfile} className="rounded-full px-3.5 py-1.5 text-[12px] font-bold" style={{ backgroundColor: "#16161a", color: PAPER, border: "1px solid #2a2a30" }}>Profile</button>}
          {onSignOut
            ? <button onClick={onSignOut} className="rounded-full px-3.5 py-1.5 text-[12px] font-bold" style={{ backgroundColor: "#16161a", color: "#8a8a90", border: "1px solid #2a2a30" }}>Sign out</button>
            : <RoleToggle role={role} onChange={onRole} />}
        </div>
      </div>
      <p className="mt-2 text-[15px] leading-snug" style={{ color: "#9a9aa0" }}>Brands you can post for. Join one, get the script, film it.</p>

      <div className="mt-5 flex gap-2">
        {[["discover", `Discover · ${discover.length}`], ["joined", `Joined · ${joined.length}`]].map(([t, label]) => (
          <button key={t} onClick={() => onTab(t)} className="rounded-full px-4 py-2 text-[13px] font-bold transition-colors" style={{ backgroundColor: tab === t ? PAPER : "#16161a", color: tab === t ? INK : "#8a8a90", border: "1px solid #2a2a30" }}>{label}</button>
        ))}
      </div>

      <div className="mt-4 space-y-3.5">
        {list.length === 0 && <div className="rounded-2xl border border-dashed py-12 text-center text-[14px] font-semibold" style={{ borderColor: "#2a2a30", color: "#8a8a90" }}>{tab === "discover" ? "Nothing new right now. Check Joined." : "You haven't joined anything yet."}</div>}
        {list.map((c) => {
          const posted = creator.posted.includes(c.id);
          return (
            <div key={c.id} className="overflow-hidden rounded-2xl" style={{ backgroundColor: c.color, border: "1px solid rgba(0,0,0,0.25)" }}>
              <div className="p-5" style={{ color: c.ink }}>
                <div className="flex items-start justify-between gap-3"><Eyebrow style={{ color: c.ink, opacity: 0.7 }}>{c.category}</Eyebrow>{posted && <Chip bg={INK} fg={GREEN}>Posted</Chip>}</div>
                <div className="mt-3 text-2xl font-black leading-none tracking-tight">{c.name}</div>
                <div className="mt-1.5 text-[15px] font-semibold" style={{ opacity: 0.85 }}>{c.product}</div>
                <div className="mt-4 flex flex-wrap items-center gap-1.5"><Chip bg={INK} fg={c.color}>Earn {c.commission}%</Chip>{c.sample && <Chip bg="rgba(0,0,0,0.18)" fg={c.ink}>Free sample</Chip>}<Chip bg="rgba(0,0,0,0.18)" fg={c.ink}>{c.collab}</Chip></div>
                {tab === "discover" ? (
                  <button onClick={() => onJoin(c.id)} className="mt-4 w-full rounded-full py-3 text-sm font-bold" style={{ backgroundColor: INK, color: c.color }}>Join campaign</button>
                ) : (
                  <button onClick={() => onOpen(c.id)} className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full py-3 text-sm font-bold" style={{ backgroundColor: INK, color: c.color }}>Open brief <ChevronRight size={16} /></button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CreatorBrief({ c, creator, userId, onBack, onSample, onPost, onFilmed, onOpenHookLab }) {
  const [filming, setFilming] = useState(false);
  const [override, setOverride] = useState(null);
  const [savedHooks, setSavedHooks] = useState([]);
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const brief = override || c.brief;
  const posted = creator.posted.includes(c.id);
  const sampled = creator.samples.includes(c.id);
  const filmed = creator.filmed.includes(c.id);

  useEffect(() => {
    const sb = supabaseBrowser();
    if (!sb || !userId) return;
    let alive = true;
    sb.from("saved_hooks").select("id,hook").eq("user_id", userId).order("created_at", { ascending: false })
      .then(({ data }) => { if (alive) setSavedHooks(data || []); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function swapToHook(hook) {
    setSwapping(true);
    try {
      const res = await fetch("/api/hookscript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hook, product: c.product, category: c.category, compliance: c.compliance }),
      });
      const data = await res.json();
      if (data.shots && data.shots.length) { setOverride(data); setSwapOpen(false); }
    } catch { /* ignore */ }
    setSwapping(false);
  }
  return (
    <div className="pb-12">
      <div className="px-5 pt-6"><button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#9a9aa0" }}><ArrowLeft size={17} /> Feed</button></div>
      <div className="px-5 pt-3"><div className="text-2xl font-black tracking-tight" style={{ color: PAPER }}>{c.name}</div><div className="text-[14px] font-semibold" style={{ color: "#8a8a90" }}>{c.product}</div></div>

      {override && <div className="mx-5 mt-3 flex items-center justify-between rounded-xl px-3.5 py-2.5" style={{ backgroundColor: "#101216", border: `1px solid ${c.color}` }}><span className="text-[12px] font-bold" style={{ color: c.color }}>Using your hook</span><button onClick={() => setOverride(null)} className="text-[12px] font-bold" style={{ color: "#8a8a90" }}>Back to brand hook</button></div>}

      <div className="mt-4"><SlideFlow c={c} brief={brief} /></div>

      <div className="mx-5 mt-6 space-y-2.5">
        {/* film */}
        <button onClick={() => setFilming(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold" style={{ backgroundColor: filmed ? "#101216" : c.color, color: filmed ? GREEN : c.ink, border: filmed ? `1px solid ${GREEN}` : "none" }}>
          {filmed ? <><Check size={16} /> Filmed — re-shoot</> : <><Clapperboard size={16} /> Film it</>}
        </button>

        {/* hook swap — use the brand's hook, a saved hook, or open Hook Lab */}
        {!swapOpen ? (
          <button onClick={() => setSwapOpen(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold" style={{ border: "1px solid #3a3a42", color: PAPER }}><Sparkles size={15} /> Use a different hook</button>
        ) : (
          <div className="rounded-2xl p-4" style={{ backgroundColor: "#101216", border: "1px solid #23252b" }}>
            <Eyebrow style={{ color: "#7a7a80" }}>Swap the hook</Eyebrow>
            <div className="mt-1 text-[12px] leading-snug" style={{ color: "#8a8a90" }}>This is the hook {c.name} is pushing. Pick one of your saved hooks (the script rebuilds around it), or open the Hook Lab.</div>
            {swapping ? (
              <div className="py-6 text-center"><Loader2 size={20} className="mx-auto animate-spin" style={{ color: c.color }} /><div className="mt-2 text-[13px]" style={{ color: "#8a8a90" }}>Rebuilding the script around your hook…</div></div>
            ) : (
              <>
                {savedHooks.length ? (
                  <div className="mt-3 space-y-1.5">
                    {savedHooks.map((s) => (
                      <button key={s.id} onClick={() => swapToHook(s.hook)} className="block w-full rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold" style={{ backgroundColor: "#16161a", color: PAPER, border: "1px solid #2a2a30" }}>{s.hook}</button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 text-[13px]" style={{ color: "#6b6b70" }}>No saved hooks yet — save some in the Hook Lab.</div>
                )}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setSwapOpen(false)} className="rounded-full px-4 py-2.5 text-sm font-bold" style={{ border: "1px solid #3a3a42", color: "#9a9aa0" }}>Cancel</button>
                  {onOpenHookLab && <button onClick={onOpenHookLab} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold" style={{ backgroundColor: c.color, color: c.ink }}><Sparkles size={15} /> Open Hook Lab</button>}
                </div>
              </>
            )}
          </div>
        )}

        {/* sample */}
        {c.sample && (sampled
          ? <div className="inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold" style={{ backgroundColor: "#101216", border: "1px solid #23252b", color: GREEN }}><Check size={15} /> Sample requested</div>
          : <button onClick={() => onSample(c.id)} className="inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold" style={{ border: "1px solid #3a3a42", color: PAPER }}><Gift size={15} /> Request free sample</button>)}

        {/* posted */}
        {posted
          ? <div className="inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold" style={{ backgroundColor: "#101216", border: `1px solid ${GREEN}`, color: GREEN }}><CheckCircle2 size={16} /> Marked as posted</div>
          : <button onClick={() => onPost(c.id)} className="inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold" style={{ backgroundColor: c.color, color: c.ink }}><Send size={16} /> I posted this</button>}
      </div>

      {filming && (
        <ShotFilmer
          shots={brief.shots}
          color={c.color}
          ink={c.ink}
          onClose={() => setFilming(false)}
          onComplete={() => onFilmed(c.id)}
        />
      )}
    </div>
  );
}

// ============================ ROOT ===========================================

// Map a Supabase campaign row (snake_case) to the shape the UI uses.
function mapRow(r) {
  return {
    id: r.id, name: r.name, product: r.product, category: r.category,
    commission: r.commission, flatFee: r.flat_fee ?? null, bonus: r.bonus ?? null,
    sample: r.sample, collab: r.collab, tier: r.tier,
    color: r.color, ink: r.ink, vibe: r.vibe, compliance: r.compliance,
    status: r.status, brief: r.brief,
    joinedCount: r.joined_count ?? 0, postedCount: r.posted_count ?? 0,
    dealType: r.deal_type ?? "commission", cpm: r.cpm ?? null, maxPayout: r.max_payout ?? null,
    bonusPerPost: r.bonus_per_post ?? null, bonusesPerDay: r.bonuses_per_day ?? null,
    budget: r.budget ?? null, startDate: r.start_date ?? null, endDate: r.end_date ?? null,
    maxCreators: r.max_creators ?? null,
  };
}

// A stable anonymous id for this creator, kept in localStorage (until real auth).
function getCreatorKey() {
  if (typeof window === "undefined") return "";
  let k = window.localStorage.getItem("cs_creator_key");
  if (!k) {
    k = (window.crypto && window.crypto.randomUUID)
      ? window.crypto.randomUUID()
      : "ck_" + Date.now() + "_" + Math.random().toString(36).slice(2);
    window.localStorage.setItem("cs_creator_key", k);
  }
  return k;
}

export default function App({ authRole, userId, onSignOut } = {}) {
  // Real, signed-in accounts never see the demo seed brands — a brand sees only
  // its own campaigns, a creator sees the live marketplace. SEED is anonymous
  // demo mode only.
  const [campaigns, setCampaigns] = useState(authRole ? [] : SEED);
  const [role, setRole] = useState(authRole || "brand");
  const [community, setCommunity] = useState(false);
  const [hookFilm, setHookFilm] = useState(null);
  // brand nav
  const [bView, setBView] = useState("dash");
  const [bOpen, setBOpen] = useState(null);
  const [genState, setGenState] = useState("idle");
  // creator nav — land on the profile when returning from TikTok OAuth so the
  // creator sees the connect result (?tiktok=connected|error|unconfigured).
  const [cView, setCView] = useState(() =>
    typeof window !== "undefined" && /[?&]tiktok=/.test(window.location.search) ? "profile" : "feed",
  );
  const [cOpen, setCOpen] = useState(null);
  const [cTab, setCTab] = useState("discover");
  const [creator, setCreator] = useState({ joined: [], posted: [], samples: [], filmed: [], remixes: {} });
  const [remixState, setRemixState] = useState("idle");
  const [enabled, setEnabled] = useState(false);
  const creatorKey = useRef("");

  // Load persisted state from Supabase when configured; otherwise stay on SEED.
  useEffect(() => {
    creatorKey.current = getCreatorKey();
    let alive = true;
    (async () => {
      try {
        // Multi-tenant: a brand loads only THEIR campaigns; a creator loads the
        // live marketplace. Real accounts never see the demo seed.
        const scope = authRole === "creator" ? "marketplace=1" : `owner=${encodeURIComponent(userId || "")}`;
        const res = await fetch(`/api/campaigns?${scope}`);
        const data = await res.json();
        if (!alive || !data || !data.enabled) return; // not configured -> demo SEED
        setEnabled(true);

        const rows = Array.isArray(data.campaigns) ? data.campaigns.map(mapRow) : [];
        if (alive) setCampaigns(rows);

        const pRes = await fetch(`/api/participations?creator=${encodeURIComponent(creatorKey.current)}`);
        const pData = await pRes.json();
        if (!alive || !pData || !Array.isArray(pData.participations)) return;
        const next = { joined: [], posted: [], samples: [], filmed: [], remixes: {} };
        for (const p of pData.participations) {
          if (p.joined) next.joined.push(p.campaign_id);
          if (p.posted) next.posted.push(p.campaign_id);
          if (p.sample_requested) next.samples.push(p.campaign_id);
          if (p.filmed) next.filmed.push(p.campaign_id);
          if (p.remix) next.remixes[p.campaign_id] = p.remix;
        }
        if (alive) setCreator(next);
      } catch { /* any failure -> stay on in-memory SEED */ }
    })();
    return () => { alive = false; };
  }, []);

  const bCampaign = campaigns.find((c) => c.id === bOpen);
  const cCampaign = campaigns.find((c) => c.id === cOpen);
  const patch = (id, fn) => setCampaigns((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));
  const saveCampaign = (id, fields) => { if (enabled) fetch("/api/campaigns", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...fields }) }).catch(() => {}); };
  const saveParticipation = (id, fields) => { if (enabled) fetch("/api/participations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ campaign_id: id, creator_key: creatorKey.current, ...fields }) }).catch(() => {}); };

  // brand
  const bOpenC = (id) => { setBOpen(id); setGenState("idle"); setBView("detail"); };
  const createCampaign = async (c) => {
    if (enabled) {
      try {
        const res = await fetch("/api/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...c, ownerId: userId }) });
        const data = await res.json();
        if (data && data.campaign) { const m = mapRow(data.campaign); setCampaigns((cs) => [m, ...cs]); bOpenC(m.id); return; }
      } catch { /* fall back to local */ }
    }
    setCampaigns((cs) => [c, ...cs]); bOpenC(c.id);
  };
  const generate = async () => { setGenState("generating"); try { const brief = await writeBrief(bCampaign); patch(bOpen, (c) => ({ ...c, brief })); saveCampaign(bOpen, { brief }); setGenState("idle"); } catch { setGenState("failed"); } };
  const publish = () => { patch(bOpen, (c) => ({ ...c, status: "Live" })); saveCampaign(bOpen, { status: "Live" }); };

  // creator
  const join = (id) => { setCreator((s) => s.joined.includes(id) ? s : { ...s, joined: [...s.joined, id] }); patch(id, (c) => ({ ...c, joinedCount: c.joinedCount + 1 })); saveParticipation(id, { joined: true }); setCTab("joined"); };
  const openBrief = (id) => { setCOpen(id); setRemixState("idle"); setCView("brief"); };
  const requestSample = (id) => { setCreator((s) => s.samples.includes(id) ? s : { ...s, samples: [...s.samples, id] }); saveParticipation(id, { sample_requested: true }); };
  const markPosted = (id) => { setCreator((s) => s.posted.includes(id) ? s : { ...s, posted: [...s.posted, id] }); patch(id, (c) => ({ ...c, postedCount: c.postedCount + 1 })); saveParticipation(id, { posted: true }); };
  const markFilmed = (id) => { setCreator((s) => s.filmed.includes(id) ? s : { ...s, filmed: [...s.filmed, id] }); saveParticipation(id, { filmed: true }); };
  const remix = async (id, voice) => { setRemixState("loading"); try { const b = await writeBrief(cCampaign, voice); setCreator((s) => ({ ...s, remixes: { ...s.remixes, [id]: b } })); saveParticipation(id, { remix: b }); setRemixState("idle"); } catch { setRemixState("failed"); } };
  const resetRemix = (id) => { setCreator((s) => { const r = { ...s.remixes }; delete r[id]; return { ...s, remixes: r }; }); saveParticipation(id, { remix: null }); };

  const filmHook = (shots) => setHookFilm(Array.isArray(shots) && shots.length ? shots : null);

  const switchRole = (r) => setRole(r);

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#000" }}>
      <div className="mx-auto min-h-screen w-full max-w-md" style={{ backgroundColor: INK }}>
        {role === "brand" && (
          <>
            {bView === "dash" && <BrandDash campaigns={campaigns} role={role} onRole={switchRole} onOpen={bOpenC} onNew={() => setBView("new")} onSignOut={authRole ? onSignOut : undefined} onCommunity={authRole ? () => setCommunity(true) : undefined} onDiscover={authRole === "brand" ? () => setBView("discover") : undefined} onHookLab={() => setBView("hooklab")} onEarnings={authRole === "brand" ? () => setBView("earnings") : undefined} onProducts={authRole === "brand" && userId ? () => setBView("products") : undefined} />}
            {bView === "new" && <CampaignBuilder onCancel={() => setBView("dash")} onCreate={createCampaign} />}
            {bView === "detail" && bCampaign && <BrandDetail c={bCampaign} state={genState} onBack={() => setBView("dash")} onGenerate={generate} onPublish={publish} />}
            {bView === "discover" && <BrandDiscover userId={userId} onBack={() => setBView("dash")} />}
            {bView === "hooklab" && <HookLab userId={userId} onBack={() => setBView("dash")} />}
            {bView === "earnings" && <BrandEarnings userId={userId} onBack={() => setBView("dash")} />}
            {bView === "products" && <BrandProducts userId={userId} onBack={() => setBView("dash")} />}
          </>
        )}
        {role === "creator" && (
          <>
            {cView === "feed" && <CreatorFeed campaigns={campaigns} creator={creator} role={role} onRole={switchRole} tab={cTab} onTab={setCTab} onOpen={openBrief} onJoin={join} onSignOut={authRole ? onSignOut : undefined} onProfile={authRole === "creator" && userId ? () => setCView("profile") : undefined} onCommunity={authRole ? () => setCommunity(true) : undefined} onInvites={authRole === "creator" && userId ? () => setCView("invites") : undefined} onHooks={() => setCView("hooklab")} onShop={authRole === "creator" && userId ? () => setCView("shop") : undefined} />}
            {cView === "brief" && cCampaign && <CreatorBrief c={cCampaign} creator={creator} userId={userId} onBack={() => setCView("feed")} onSample={requestSample} onPost={markPosted} onFilmed={markFilmed} onOpenHookLab={() => setCView("hooklab")} />}
            {cView === "shop" && <CreatorShop userId={userId} onBack={() => setCView("feed")} />}
            {cView === "profile" && <CreatorProfile userId={userId} onBack={() => setCView("feed")} brands={campaigns.filter((c) => creator.joined.includes(c.id)).map((c) => ({ id: String(c.id), name: c.name, color: c.color }))} />}
            {cView === "invites" && <CreatorInvites userId={userId} onBack={() => setCView("feed")} />}
            {cView === "hooklab" && <HookLab creatorMode userId={userId} onFilm={filmHook} onBack={() => setCView("feed")} />}
          </>
        )}
      </div>
      {community && authRole && (
        <div className="fixed inset-0 z-40 overflow-y-auto" style={{ backgroundColor: INK }}>
          <div className="mx-auto min-h-screen w-full max-w-md" style={{ backgroundColor: INK }}>
            <Community userId={userId} authRole={authRole} onBack={() => setCommunity(false)} />
          </div>
        </div>
      )}
      {hookFilm && <ShotFilmer shots={hookFilm} color={SYSTEM} ink="#33080b" onClose={() => setHookFilm(null)} onComplete={() => setHookFilm(null)} />}
    </div>
  );
}
