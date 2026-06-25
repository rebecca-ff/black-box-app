"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, TrendingUp } from "lucide-react";

// Brand earnings overview — what the shop's creators are driving over the last
// 30 days (Cruva shop stats) + top creators. The commission total is the
// payout liability that leads into Stripe payouts.

const PAPER = "#F5F3EF";
const SYSTEM = "#FF3B1D";
const GREEN = "#3ECF8E";

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: "#101216", border: "1px solid #23252b" }}>
      <div className="text-2xl font-black" style={{ color: accent || PAPER }}>{value}</div>
      <div className="mt-0.5 text-[12px]" style={{ color: "#8a8a90" }}>{label}</div>
    </div>
  );
}

export default function BrandEarnings({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/shop-earnings");
        const d = await res.json();
        if (!alive) return;
        setConfigured(d.configured !== false);
        setData(d);
      } catch { /* ignore */ }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const t = (data && data.totals) || {};
  const money = (n) => `$${Math.round(n || 0).toLocaleString()}`;
  const numf = (n) => (n || 0).toLocaleString();

  return (
    <div className="px-5 pt-6 pb-12">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#9a9aa0" }}><ArrowLeft size={17} /> Dashboard</button>
      <div className="mt-4 text-2xl font-black tracking-tight" style={{ color: PAPER }}>Earnings</div>
      <p className="mt-1 text-[14px]" style={{ color: "#8a8a90" }}>What your creators are driving — last 30 days (via Cruva).</p>

      {loading ? (
        <div className="py-16 text-center"><Loader2 size={22} className="mx-auto animate-spin" style={{ color: SYSTEM }} /></div>
      ) : !configured ? (
        <div className="mt-6 rounded-2xl border border-dashed p-5 text-center" style={{ borderColor: "#2a2a30" }}>
          <div className="text-[15px] font-bold" style={{ color: PAPER }}>Connect Cruva to see earnings</div>
          <div className="mt-1.5 text-[13px]" style={{ color: "#8a8a90" }}>Add <span style={{ color: PAPER }}>CRUVA_API_KEY</span> in Vercel, then redeploy.</div>
        </div>
      ) : data?.error ? (
        <div className="mt-6 text-[13px] font-semibold" style={{ color: SYSTEM }}>Couldn&apos;t load earnings right now.</div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Stat label="Commission (payout owed)" value={money(t.commission)} accent={GREEN} />
            <Stat label="Affiliate GMV" value={money(t.gmv)} />
            <Stat label="Units sold" value={numf(t.units)} />
            <Stat label="Active creators" value={numf(t.creators)} />
          </div>

          <div className="mt-7">
            <div className="flex items-center gap-1.5"><TrendingUp size={15} style={{ color: GREEN }} /><div className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "#7a7a80" }}>Top creators by GMV</div></div>
            <div className="mt-3 space-y-2">
              {(data.topCreators || []).length === 0 && <div className="text-[13px]" style={{ color: "#6b6b70" }}>No creator data yet.</div>}
              {(data.topCreators || []).map((c) => (
                <div key={c.handle} className="flex items-center justify-between rounded-xl p-3.5" style={{ backgroundColor: "#15171b", border: "1px solid #23252b" }}>
                  <div className="text-[15px] font-black" style={{ color: PAPER }}>@{c.handle}</div>
                  <div className="text-[14px] font-bold" style={{ color: GREEN }}>{money(c.gmv)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl p-4" style={{ backgroundColor: "#101216", border: "1px solid #23252b" }}>
            <div className="text-[13px] leading-snug" style={{ color: "#bcbcc2" }}>
              The <span style={{ color: GREEN, fontWeight: 700 }}>{money(t.commission)}</span> commission is what your affiliates have earned — one-tap payouts (Stripe) come next.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
