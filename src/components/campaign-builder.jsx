"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Gift, Check } from "lucide-react";

// Noise-style campaign builder — light & clean, numbered sections, deal-type
// toggle (Commission or Paid/CPM), per-post bonus, budget + dates, max creators,
// and Basic/Premium creator tier cards. Returns a campaign object to onCreate.

const SYSTEM = "#FF3B1D";
const INK = "#0A0A0B";
const MUTE = "#6b6b70";
const LINE = "#e6e3dc";
const FIELD = "#f6f4ef";

function Section({ n, title, sub, children }) {
  return (
    <div className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
      <div className="flex items-center gap-2.5">
        <div className="grid h-6 w-6 place-items-center rounded-md text-[13px] font-black text-white" style={{ backgroundColor: SYSTEM }}>{n}</div>
        <div>
          <div className="text-[16px] font-black" style={{ color: INK }}>{title}</div>
          {sub ? <div className="text-[12px]" style={{ color: MUTE }}>{sub}</div> : null}
        </div>
      </div>
      <div className="mt-4 space-y-3.5">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTE }}>{label}</div>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export default function CampaignBuilder({ onCancel, onCreate }) {
  const [f, setF] = useState({
    name: "", product: "", category: "", vibe: "", compliance: "",
    dealType: "commission", commission: 20, flatFee: "",
    cpm: "", maxPayout: "", bonusPerPost: "", bonusesPerDay: "",
    budget: "", startDate: "", endDate: "", maxCreators: "",
    tier: "basic", sample: true,
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const ready = f.name.trim() && f.product.trim();

  const inputCls = "w-full rounded-xl border px-3.5 py-3 text-[15px] outline-none";
  const inputSty = { backgroundColor: FIELD, color: INK, borderColor: LINE };
  const txt = (k, ph, area) => area
    ? <textarea value={f[k]} onChange={(e) => set(k, e.target.value)} placeholder={ph} rows={2} className={inputCls + " resize-none"} style={inputSty} />
    : <input value={f[k]} onChange={(e) => set(k, e.target.value)} placeholder={ph} className={inputCls} style={inputSty} />;
  const numTxt = (k, ph) => <input value={f[k]} onChange={(e) => set(k, e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder={ph} className={inputCls} style={inputSty} />;

  function create() {
    const paid = f.dealType === "paid";
    onCreate({
      id: "c" + Date.now(),
      name: f.name.trim(), product: f.product.trim(), category: f.category.trim() || "Custom",
      color: SYSTEM, ink: "#33080b",
      vibe: f.vibe.trim() || "Authentic, specific",
      compliance: f.compliance.trim() || "Keep claims honest and verifiable.",
      dealType: f.dealType,
      commission: paid ? 0 : f.commission,
      flatFee: !paid && f.flatFee ? +f.flatFee : null,
      cpm: paid && f.cpm ? +f.cpm : null,
      maxPayout: paid && f.maxPayout ? +f.maxPayout : null,
      bonusPerPost: f.bonusPerPost ? +f.bonusPerPost : null,
      bonusesPerDay: f.bonusesPerDay ? +f.bonusesPerDay : null,
      budget: f.budget ? +f.budget : null,
      startDate: f.startDate || null, endDate: f.endDate || null,
      maxCreators: f.maxCreators ? +f.maxCreators : null,
      tier: f.tier, sample: f.sample,
      collab: f.tier === "premium" ? "Targeted" : "Open",
      status: "Draft", brief: null, joinedCount: 0, postedCount: 0,
    });
  }

  const seg = (active) => ({ backgroundColor: active ? SYSTEM : "#fff", color: active ? "#fff" : INK, borderColor: active ? SYSTEM : LINE });

  return (
    <div className="min-h-screen px-5 pb-12 pt-6" style={{ backgroundColor: "#faf8f4" }}>
      <button onClick={onCancel} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: MUTE }}><ArrowLeft size={17} /> Campaigns</button>
      <div className="text-2xl font-black tracking-tight" style={{ color: INK }}>New campaign</div>
      <p className="mt-1 text-[14px]" style={{ color: MUTE }}>Set the offer and who can post. AI writes the brief next.</p>

      <div className="mt-5 space-y-4">
        <Section n="1" title="Basics" sub="Brand, product, and the rules.">
          <Field label="Brand">{txt("name", "Sovereign Silver")}</Field>
          <Field label="Product">{txt("product", "Bio-Active Silver Hydrosol")}</Field>
          <Field label="Category">{txt("category", "Wellness")}</Field>
          <Field label="Creative vibe">{txt("vibe", "Calm, editorial, science-forward")}</Field>
          <Field label="Compliance / off-limits">{txt("compliance", "No cure claims. Wellness framing only.", true)}</Field>
        </Section>

        <Section n="2" title="Rates & budget" sub="How creators get paid.">
          <div className="flex gap-2">
            {[["commission", "Commission %"], ["paid", "Paid (CPM)"]].map(([v, label]) => (
              <button key={v} onClick={() => set("dealType", v)} className="flex-1 rounded-xl border py-2.5 text-[14px] font-bold" style={seg(f.dealType === v)}>{label}</button>
            ))}
          </div>

          {f.dealType === "commission" ? (
            <>
              <div>
                <div className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTE }}>Commission — {f.commission}%</div>
                <input type="range" min="5" max="40" value={f.commission} onChange={(e) => set("commission", +e.target.value)} className="mt-2 w-full" style={{ accentColor: SYSTEM }} />
              </div>
              <Field label="Flat fee ($, optional)">{numTxt("flatFee", "e.g. 150")}</Field>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label="CPM ($/1k views)">{numTxt("cpm", "3")}</Field>
              <Field label="Max payout / post">{numTxt("maxPayout", "2000")}</Field>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Bonus / post ($)">{numTxt("bonusPerPost", "optional")}</Field>
            <Field label="Bonuses / day">{numTxt("bonusesPerDay", "optional")}</Field>
          </div>
          <Field label="Max creators (blank = unlimited)">{numTxt("maxCreators", "unlimited")}</Field>
          <Field label="Budget ($)">{numTxt("budget", "10000")}</Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date"><input type="date" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputCls} style={inputSty} /></Field>
            <Field label="End date"><input type="date" value={f.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputCls} style={inputSty} /></Field>
          </div>
        </Section>

        <Section n="3" title="Creators" sub="Who can post about this.">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => set("tier", "basic")} className="rounded-2xl border p-4 text-left" style={{ borderColor: f.tier === "basic" ? SYSTEM : LINE, backgroundColor: f.tier === "basic" ? "#fff1ee" : "#fff" }}>
              <div className="text-[15px] font-black" style={{ color: INK }}>Basic</div>
              <div className="mt-1 text-[12px] leading-snug" style={{ color: MUTE }}>Open to all creators. Max reach, lower cost.</div>
            </button>
            <button onClick={() => set("tier", "premium")} className="rounded-2xl border p-4 text-left" style={{ borderColor: f.tier === "premium" ? SYSTEM : LINE, backgroundColor: f.tier === "premium" ? "#fff1ee" : "#fff" }}>
              <div className="text-[15px] font-black" style={{ color: INK }}>Premium</div>
              <div className="mt-1 text-[12px] leading-snug" style={{ color: MUTE }}>Vetted, trained creators. Higher quality + bonus.</div>
            </button>
          </div>
          <div className="flex items-center justify-between rounded-xl border px-3.5 py-3" style={{ borderColor: LINE, backgroundColor: "#fff" }}>
            <div className="flex items-center gap-2"><Gift size={16} style={{ color: MUTE }} /><span className="text-[15px] font-semibold" style={{ color: INK }}>Free sample</span></div>
            <button onClick={() => set("sample", !f.sample)} className="h-7 w-12 rounded-full p-0.5 transition-colors" style={{ backgroundColor: f.sample ? SYSTEM : "#d8d4cc" }}><div className="h-6 w-6 rounded-full bg-white transition-transform" style={{ transform: f.sample ? "translateX(20px)" : "translateX(0)" }} /></button>
          </div>
        </Section>
      </div>

      <button disabled={!ready} onClick={create} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-black text-white transition-transform active:scale-95 disabled:opacity-40" style={{ backgroundColor: INK }}>
        <Plus size={17} /> Create campaign
      </button>
    </div>
  );
}
