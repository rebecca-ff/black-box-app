"use client";

import { useState, useRef } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, Check, Plus, Loader2, RefreshCw, Send, Link2, Gift, Sparkles, CheckCircle2, Clapperboard } from "lucide-react";
import ShotFilmer from "./shot-filmer";

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
        {c.sample && <Chip bg="#1a1a1f" fg="#9a9aa0">Free sample</Chip>}
        <Chip bg="#1a1a1f" fg="#9a9aa0">{c.collab} collab</Chip>
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
            <CopyButton text={fullPost} color={INK} label="Copy" />
          </div>
          <div className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed" style={{ color: "#1b1b1f" }}>{brief.postDescription}</div>
          {brief.hashtags?.length ? <div className="mt-3 flex flex-wrap gap-1.5">{brief.hashtags.map((h, k) => <span key={k} className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ backgroundColor: "#e7e4dc", color: "#3a3a40" }}>{h}</span>)}</div> : null}
        </div>
      </div>
    </div>
  );
}

// ============================ BRAND SIDE =====================================

function BrandDash({ campaigns, role, onRole, onOpen, onNew }) {
  const live = campaigns.filter((c) => c.status === "Live").length;
  return (
    <div className="px-5 pt-7 pb-12">
      <div className="flex items-center justify-between">
        <div className="text-3xl font-black tracking-tight" style={{ color: PAPER }}>callsheet<span style={{ color: SYSTEM }}>.</span></div>
        <RoleToggle role={role} onChange={onRole} />
      </div>
      <p className="mt-2 text-[15px] leading-snug" style={{ color: "#9a9aa0" }}>Set the deal. AI writes the brief. Publish to your creators.</p>
      <div className="mt-6 flex items-center gap-4"><Eyebrow style={{ color: "#6b6b70" }}>{campaigns.length} campaigns</Eyebrow><Eyebrow style={{ color: live ? GREEN : "#6b6b70" }}>{live} live</Eyebrow></div>

      <div className="mt-4 space-y-3.5">
        {campaigns.map((c) => (
          <button key={c.id} onClick={() => onOpen(c.id)} className="block w-full overflow-hidden rounded-2xl text-left transition-transform active:scale-[0.985]" style={{ backgroundColor: c.color, border: "1px solid rgba(0,0,0,0.25)" }}>
            <div className="p-5" style={{ color: c.ink }}>
              <div className="flex items-start justify-between gap-3">
                <Eyebrow style={{ color: c.ink, opacity: 0.7 }}>{c.category}</Eyebrow>
                <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: c.status === "Live" ? INK : "rgba(0,0,0,0.18)", color: c.status === "Live" ? GREEN : c.ink }}>{c.status}</span>
              </div>
              <div className="mt-3 text-2xl font-black leading-none tracking-tight">{c.name}</div>
              <div className="mt-1.5 text-[15px] font-semibold" style={{ opacity: 0.85 }}>{c.product}</div>
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <Chip bg={INK} fg={c.color}>{c.commission}%</Chip>
                {c.sample && <Chip bg="rgba(0,0,0,0.18)" fg={c.ink}>Sample</Chip>}
                <Chip bg="rgba(0,0,0,0.18)" fg={c.ink}>{c.collab}</Chip>
                <Chip bg="rgba(0,0,0,0.18)" fg={c.ink}>{c.tier}</Chip>
              </div>
              {c.status === "Live" && <div className="mt-3 text-[12px] font-bold" style={{ color: c.ink, opacity: 0.8 }}>{c.joinedCount} joined · {c.postedCount} posted</div>}
            </div>
          </button>
        ))}
        <button onClick={onNew} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-5 text-sm font-bold" style={{ borderColor: "#33333a", color: "#8a8a90" }}><Plus size={17} /> New campaign</button>
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
  const [f, setF] = useState({ name: "", product: "", category: "", commission: 20, sample: true, collab: "Open", tier: "Micro", vibe: "", compliance: "" });
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
        <div className="flex items-center justify-between rounded-xl px-3.5 py-3" style={{ backgroundColor: "#16161a", border: "1px solid #2a2a30" }}>
          <div className="flex items-center gap-2"><Gift size={16} style={{ color: "#9a9aa0" }} /><span className="text-[15px] font-semibold" style={{ color: PAPER }}>Free sample</span></div>
          <button onClick={() => set("sample", !f.sample)} className="h-7 w-12 rounded-full p-0.5 transition-colors" style={{ backgroundColor: f.sample ? SYSTEM : "#33333a" }}><div className="h-6 w-6 rounded-full bg-white transition-transform" style={{ transform: f.sample ? "translateX(20px)" : "translateX(0)" }} /></button>
        </div>
        <div><Eyebrow style={{ color: "#7a7a80" }}>Collaboration</Eyebrow><Segmented options={COLLABS} value={f.collab} onChange={(v) => set("collab", v)} color={SYSTEM} /></div>
        <div><Eyebrow style={{ color: "#7a7a80" }}>Target tier</Eyebrow><Segmented options={TIERS} value={f.tier} onChange={(v) => set("tier", v)} color={SYSTEM} /></div>
        {input("Creative vibe", "vibe", "Calm, editorial, science-forward")}
        {input("Compliance / off-limits", "compliance", "No cure claims. Wellness framing only.", true)}
      </div>
      <button disabled={!ready} onClick={() => onCreate({ id: "c" + Date.now(), name: f.name.trim(), product: f.product.trim(), category: f.category.trim() || "Custom", commission: f.commission, sample: f.sample, collab: f.collab, tier: f.tier, color: SYSTEM, ink: "#33080b", vibe: f.vibe.trim() || "Authentic, specific", compliance: f.compliance.trim() || "Keep claims honest and verifiable.", status: "Draft", brief: null, joinedCount: 0, postedCount: 0 })}
        className="mt-7 w-full rounded-full py-4 text-sm font-bold transition-transform active:scale-95 disabled:opacity-40" style={{ backgroundColor: SYSTEM, color: PAPER }}>Create campaign</button>
    </div>
  );
}

function BrandDetail({ c, onBack, onGenerate, onPublish, state }) {
  const link = `shop.tiktok.com/affiliate/${c.id}`;
  return (
    <div className="pb-12">
      <div className="px-5 pt-6"><button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#9a9aa0" }}><ArrowLeft size={17} /> Campaigns</button></div>
      <div className="mx-5 mt-4 overflow-hidden rounded-2xl" style={{ backgroundColor: c.color }}>
        <div className="p-5" style={{ color: c.ink }}>
          <div className="flex items-start justify-between"><Eyebrow style={{ color: c.ink, opacity: 0.7 }}>{c.category}</Eyebrow>
            <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: c.status === "Live" ? INK : "rgba(0,0,0,0.18)", color: c.status === "Live" ? GREEN : c.ink }}>{c.status}</span></div>
          <div className="mt-2 text-2xl font-black tracking-tight">{c.name}</div>
          <div className="text-[15px] font-semibold" style={{ opacity: 0.85 }}>{c.product}</div>
          <div className="mt-4 flex flex-wrap gap-1.5"><Chip bg={INK} fg={c.color}>{c.commission}% commission</Chip>{c.sample && <Chip bg="rgba(0,0,0,0.18)" fg={c.ink}>Free sample</Chip>}<Chip bg="rgba(0,0,0,0.18)" fg={c.ink}>{c.collab}</Chip><Chip bg="rgba(0,0,0,0.18)" fg={c.ink}>{c.tier}</Chip></div>
        </div>
      </div>

      {c.status === "Live" && (
        <div className="mx-5 mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl px-4 py-3" style={{ backgroundColor: "#101216", border: "1px solid #23252b" }}><div className="text-2xl font-black" style={{ color: PAPER }}>{c.joinedCount}</div><Eyebrow style={{ color: "#7a7a80" }}>Joined</Eyebrow></div>
          <div className="rounded-xl px-4 py-3" style={{ backgroundColor: "#101216", border: "1px solid #23252b" }}><div className="text-2xl font-black" style={{ color: PAPER }}>{c.postedCount}</div><Eyebrow style={{ color: "#7a7a80" }}>Posted</Eyebrow></div>
        </div>
      )}

      <div className="mx-5 mt-3 rounded-xl px-3.5 py-3" style={{ backgroundColor: "#101216", border: "1px solid #23252b" }}><Eyebrow style={{ color: SYSTEM }}>Compliance guardrail</Eyebrow><div className="mt-1 text-[13px] leading-snug" style={{ color: "#bcbcc2" }}>{c.compliance}</div></div>

      <div className="mt-6">
        <div className="px-5"><Eyebrow style={{ color: "#7a7a80" }}>Creator brief — what your affiliates receive</Eyebrow></div>
        {state === "idle" && !c.brief && (
          <div className="mx-5 mt-3 rounded-2xl border border-dashed py-10 text-center" style={{ borderColor: "#2a2a30" }}>
            <div className="text-[15px] font-semibold" style={{ color: "#9a9aa0" }}>No brief yet.</div>
            <button onClick={onGenerate} className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold" style={{ backgroundColor: c.color, color: c.ink }}><Sparkles size={16} /> Write the brief</button>
          </div>
        )}
        {state === "generating" && <div className="py-16 text-center"><Loader2 size={22} className="mx-auto animate-spin" style={{ color: c.color }} /><div className="mt-3 text-[15px] font-bold" style={{ color: PAPER }}>Writing the brief</div><div className="mt-1 text-[13px]" style={{ color: "#8a8a90" }}>Inside the {c.name} rules</div></div>}
        {state === "failed" && <div className="mx-5 mt-3 rounded-2xl border py-10 text-center" style={{ borderColor: "#2a2a30" }}><div className="text-[15px] font-bold" style={{ color: PAPER }}>The writer choked</div><button onClick={onGenerate} className="mt-3 rounded-full px-5 py-2.5 text-sm font-bold" style={{ backgroundColor: c.color, color: c.ink }}>Rewrite</button></div>}
        {state === "idle" && c.brief && (
          <div className="mt-3">
            <SlideFlow c={c} brief={c.brief} />
            <div className="mx-5 mt-6 rounded-2xl p-5" style={{ backgroundColor: "#101216", border: "1px solid #23252b" }}>
              {c.status === "Live" ? (
                <div>
                  <div className="flex items-center gap-2"><Check size={16} style={{ color: GREEN }} /><span className="text-[15px] font-black" style={{ color: PAPER }}>Live for affiliates</span></div>
                  <div className="mt-3 flex items-center gap-2 rounded-xl px-3 py-3" style={{ backgroundColor: "#0d0e11", border: "1px solid #26282e" }}><Link2 size={15} style={{ color: "#7a7a80" }} /><span className="flex-1 truncate text-[13px]" style={{ color: "#bcbcc2" }}>{link}</span><CopyButton text={link} color={c.color} label="Copy" /></div>
                  <button onClick={onGenerate} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full py-3 text-sm font-bold" style={{ border: "1px solid #3a3a42", color: PAPER }}><RefreshCw size={15} /> Rewrite</button>
                </div>
              ) : (
                <div>
                  <div className="text-[15px] font-black" style={{ color: PAPER }}>Ready to send</div>
                  <div className="mt-1 text-[13px]" style={{ color: "#8a8a90" }}>Publishing opens this to creators in the feed.</div>
                  <div className="mt-4 flex gap-2"><button onClick={onGenerate} className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-3 text-sm font-bold" style={{ border: "1px solid #3a3a42", color: PAPER }}><RefreshCw size={15} /> Rewrite</button><button onClick={onPublish} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold" style={{ backgroundColor: c.color, color: c.ink }}><Send size={15} /> Publish</button></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================ CREATOR SIDE ===================================

function CreatorFeed({ campaigns, creator, role, onRole, tab, onTab, onOpen, onJoin }) {
  const live = campaigns.filter((c) => c.status === "Live" && c.brief);
  const discover = live.filter((c) => !creator.joined.includes(c.id));
  const joined = live.filter((c) => creator.joined.includes(c.id));
  const list = tab === "discover" ? discover : joined;
  return (
    <div className="px-5 pt-7 pb-12">
      <div className="flex items-center justify-between">
        <div className="text-3xl font-black tracking-tight" style={{ color: PAPER }}>callsheet<span style={{ color: SYSTEM }}>.</span></div>
        <RoleToggle role={role} onChange={onRole} />
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

function CreatorBrief({ c, creator, onBack, onSample, onPost, onRemix, onReset, onFilmed, remixState }) {
  const [voice, setVoice] = useState("");
  const [open, setOpen] = useState(false);
  const [filming, setFilming] = useState(false);
  const brief = creator.remixes[c.id] || c.brief;
  const remixed = !!creator.remixes[c.id];
  const posted = creator.posted.includes(c.id);
  const sampled = creator.samples.includes(c.id);
  const filmed = creator.filmed.includes(c.id);
  return (
    <div className="pb-12">
      <div className="px-5 pt-6"><button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#9a9aa0" }}><ArrowLeft size={17} /> Feed</button></div>
      <div className="px-5 pt-3"><div className="text-2xl font-black tracking-tight" style={{ color: PAPER }}>{c.name}</div><div className="text-[14px] font-semibold" style={{ color: "#8a8a90" }}>{c.product}</div></div>

      {remixed && <div className="mx-5 mt-3 flex items-center justify-between rounded-xl px-3.5 py-2.5" style={{ backgroundColor: "#101216", border: `1px solid ${c.color}` }}><span className="text-[12px] font-bold" style={{ color: c.color }}>Remixed to your voice</span><button onClick={() => onReset(c.id)} className="text-[12px] font-bold" style={{ color: "#8a8a90" }}>Reset</button></div>}

      <div className="mt-4"><SlideFlow c={c} brief={brief} /></div>

      <div className="mx-5 mt-6 space-y-2.5">
        {/* film */}
        <button onClick={() => setFilming(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold" style={{ backgroundColor: filmed ? "#101216" : c.color, color: filmed ? GREEN : c.ink, border: filmed ? `1px solid ${GREEN}` : "none" }}>
          {filmed ? <><Check size={16} /> Filmed — re-shoot</> : <><Clapperboard size={16} /> Film it</>}
        </button>

        {/* remix */}
        {!open ? (
          <button onClick={() => setOpen(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold" style={{ border: "1px solid #3a3a42", color: PAPER }}><Sparkles size={15} /> Remix to my voice</button>
        ) : (
          <div className="rounded-2xl p-4" style={{ backgroundColor: "#101216", border: "1px solid #23252b" }}>
            <Eyebrow style={{ color: "#7a7a80" }}>How do you talk on camera?</Eyebrow>
            <input value={voice} onChange={(e) => setVoice(e.target.value)} placeholder="fast, funny, lots of slang" className="mt-2 w-full rounded-xl px-3.5 py-3 text-[15px] outline-none" style={{ backgroundColor: "#16161a", color: PAPER, border: "1px solid #2a2a30" }} />
            <div className="mt-3 flex gap-2">
              <button onClick={() => setOpen(false)} className="rounded-full px-4 py-2.5 text-sm font-bold" style={{ border: "1px solid #3a3a42", color: "#9a9aa0" }}>Cancel</button>
              <button disabled={!voice.trim() || remixState === "loading"} onClick={() => onRemix(c.id, voice)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold disabled:opacity-40" style={{ backgroundColor: c.color, color: c.ink }}>{remixState === "loading" ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} Rewrite for me</button>
            </div>
            {remixState === "failed" && <div className="mt-2 text-[12px] font-semibold" style={{ color: SYSTEM }}>Didn&apos;t land. Try again.</div>}
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

export default function App() {
  const [campaigns, setCampaigns] = useState(SEED);
  const [role, setRole] = useState("brand");
  // brand nav
  const [bView, setBView] = useState("dash");
  const [bOpen, setBOpen] = useState(null);
  const [genState, setGenState] = useState("idle");
  // creator nav
  const [cView, setCView] = useState("feed");
  const [cOpen, setCOpen] = useState(null);
  const [cTab, setCTab] = useState("discover");
  const [creator, setCreator] = useState({ joined: [], posted: [], samples: [], filmed: [], remixes: {} });
  const [remixState, setRemixState] = useState("idle");

  const bCampaign = campaigns.find((c) => c.id === bOpen);
  const cCampaign = campaigns.find((c) => c.id === cOpen);
  const patch = (id, fn) => setCampaigns((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));

  // brand
  const bOpenC = (id) => { setBOpen(id); setGenState("idle"); setBView("detail"); };
  const generate = async () => { setGenState("generating"); try { const brief = await writeBrief(bCampaign); patch(bOpen, (c) => ({ ...c, brief })); setGenState("idle"); } catch { setGenState("failed"); } };
  const publish = () => patch(bOpen, (c) => ({ ...c, status: "Live" }));

  // creator
  const join = (id) => { setCreator((s) => s.joined.includes(id) ? s : { ...s, joined: [...s.joined, id] }); patch(id, (c) => ({ ...c, joinedCount: c.joinedCount + 1 })); setCTab("joined"); };
  const openBrief = (id) => { setCOpen(id); setRemixState("idle"); setCView("brief"); };
  const requestSample = (id) => setCreator((s) => s.samples.includes(id) ? s : { ...s, samples: [...s.samples, id] });
  const markPosted = (id) => { setCreator((s) => s.posted.includes(id) ? s : { ...s, posted: [...s.posted, id] }); patch(id, (c) => ({ ...c, postedCount: c.postedCount + 1 })); };
  const markFilmed = (id) => setCreator((s) => s.filmed.includes(id) ? s : { ...s, filmed: [...s.filmed, id] });
  const remix = async (id, voice) => { setRemixState("loading"); try { const b = await writeBrief(cCampaign, voice); setCreator((s) => ({ ...s, remixes: { ...s.remixes, [id]: b } })); setRemixState("idle"); } catch { setRemixState("failed"); } };
  const resetRemix = (id) => setCreator((s) => { const r = { ...s.remixes }; delete r[id]; return { ...s, remixes: r }; });

  const switchRole = (r) => setRole(r);

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#000" }}>
      <div className="mx-auto min-h-screen w-full max-w-md" style={{ backgroundColor: INK }}>
        {role === "brand" && (
          <>
            {bView === "dash" && <BrandDash campaigns={campaigns} role={role} onRole={switchRole} onOpen={bOpenC} onNew={() => setBView("new")} />}
            {bView === "new" && <NewCampaign onCancel={() => setBView("dash")} onCreate={(c) => { setCampaigns((cs) => [c, ...cs]); bOpenC(c.id); }} />}
            {bView === "detail" && bCampaign && <BrandDetail c={bCampaign} state={genState} onBack={() => setBView("dash")} onGenerate={generate} onPublish={publish} />}
          </>
        )}
        {role === "creator" && (
          <>
            {cView === "feed" && <CreatorFeed campaigns={campaigns} creator={creator} role={role} onRole={switchRole} tab={cTab} onTab={setCTab} onOpen={openBrief} onJoin={join} />}
            {cView === "brief" && cCampaign && <CreatorBrief c={cCampaign} creator={creator} onBack={() => setCView("feed")} onSample={requestSample} onPost={markPosted} onRemix={remix} onReset={resetRemix} onFilmed={markFilmed} remixState={remixState} />}
          </>
        )}
      </div>
    </div>
  );
}
