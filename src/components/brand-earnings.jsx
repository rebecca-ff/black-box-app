"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Brand earnings — native ledger (NOT Cruva). Light/Noise style. Aggregates the
// commission your creators have earned; the commission total is the payout
// liability that leads into Stripe payouts.

const SYSTEM = "#FF3B1D";
const INK = "#0A0A0B";
const MUTE = "#6b6b70";
const LINE = "#e6e3dc";
const GREEN = "#1f9d62";

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: LINE }}>
      <div className="text-2xl font-black" style={{ color: accent || INK }}>{value}</div>
      <div className="mt-0.5 text-[12px]" style={{ color: MUTE }}>{label}</div>
    </div>
  );
}

export default function BrandEarnings({ userId, onBack }) {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!sb || !userId) { setLoading(false); return; }
      const { data } = await sb.from("earnings").select("creator_id,gmv,commission,units").eq("brand_id", userId);
      if (alive) { setRows(data || []); setLoading(false); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = rows.reduce(
    (a, r) => ({ gmv: a.gmv + (+r.gmv || 0), commission: a.commission + (+r.commission || 0), units: a.units + (+r.units || 0) }),
    { gmv: 0, commission: 0, units: 0 },
  );
  const creators = new Set(rows.map((r) => r.creator_id)).size;
  const money = (n) => `$${Math.round(n || 0).toLocaleString()}`;
  const numf = (n) => (n || 0).toLocaleString();

  return (
    <div className="min-h-screen px-5 pb-12 pt-6" style={{ backgroundColor: "#faf8f4" }}>
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: MUTE }}><ArrowLeft size={17} /> Dashboard</button>
      <div className="mt-4 text-2xl font-black tracking-tight" style={{ color: INK }}>Earnings</div>
      <p className="mt-1 text-[14px]" style={{ color: MUTE }}>What your creators are driving on your campaigns.</p>

      {loading ? (
        <div className="py-16 text-center"><Loader2 size={22} className="mx-auto animate-spin" style={{ color: SYSTEM }} /></div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Stat label="Commission (payout owed)" value={money(totals.commission)} accent={GREEN} />
            <Stat label="Creator GMV" value={money(totals.gmv)} />
            <Stat label="Units sold" value={numf(totals.units)} />
            <Stat label="Earning creators" value={numf(creators)} />
          </div>

          <div className="mt-6 rounded-2xl border bg-white p-4" style={{ borderColor: LINE }}>
            <div className="text-[13px] leading-snug" style={{ color: "#52504a" }}>
              {totals.commission > 0
                ? <>The <span style={{ color: GREEN, fontWeight: 700 }}>{money(totals.commission)}</span> commission is what your affiliates have earned — one-tap payouts (Stripe) come next.</>
                : "Earnings populate as your creators' posts drive sales (and auto-sync from the TikTok Shop affiliate API once connected)."}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
