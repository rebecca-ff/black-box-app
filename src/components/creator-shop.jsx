"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Search, Gift, Check, Store, Package } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Creator marketplace: browse every brand's active products across the platform,
// search the catalog, and request a free sample. Products + requests go through
// the browser client — RLS lets any signed-in creator read active products and
// manage their own sample requests.

const INK = "#0A0A0B";
const PAPER = "#F5F3EF";
const SYSTEM = "#FF3B1D";
const GREEN = "#3ECF8E";

const STATUS_LABEL = { requested: "Requested", approved: "Approved", shipped: "Shipped", declined: "Declined" };

export default function CreatorShop({ userId, onBack }) {
  const sb = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState({}); // product_id -> request row
  const [handle, setHandle] = useState("");
  const [q, setQ] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [pending, setPending] = useState({}); // product_id -> bool (in-flight)

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!sb) { setLoading(false); return; }
      const reqs = userId
        ? sb.from("sample_requests").select("*").eq("creator_id", userId)
        : Promise.resolve({ data: [] });
      const acct = userId
        ? sb.from("connected_accounts").select("handle").eq("user_id", userId).eq("platform", "tiktok").maybeSingle()
        : Promise.resolve({ data: null });
      const [{ data: prods }, { data: r }, { data: a }] = await Promise.all([
        sb.from("products").select("*").eq("status", "active").order("created_at", { ascending: false }),
        reqs,
        acct,
      ]);
      if (!alive) return;
      setProducts(prods || []);
      const map = {};
      (r || []).forEach((row) => { map[row.product_id] = row; });
      setRequests(map);
      setHandle(a?.handle || "");
      setLoading(false);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const brands = useMemo(() => {
    const seen = new Map();
    for (const p of products) if (!seen.has(p.brand_name)) seen.set(p.brand_name, p.brand_color || SYSTEM);
    return [...seen.entries()].map(([name, color]) => ({ name, color }));
  }, [products]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products.filter((p) => {
      if (brandFilter && p.brand_name !== brandFilter) return false;
      if (!needle) return true;
      return [p.title, p.brand_name, p.category, p.description].filter(Boolean).some((s) => s.toLowerCase().includes(needle));
    });
  }, [products, q, brandFilter]);

  async function requestSample(p) {
    if (!sb || !userId || requests[p.id] || pending[p.id]) return;
    setPending((m) => ({ ...m, [p.id]: true }));
    const row = {
      product_id: p.id,
      creator_id: userId,
      brand_id: p.owner_id,
      product_title: p.title,
      handle: handle || null,
      status: "requested",
    };
    const { data, error } = await sb.from("sample_requests").upsert(row, { onConflict: "product_id,creator_id" }).select().single();
    if (!error && data) setRequests((m) => ({ ...m, [p.id]: data }));
    setPending((m) => ({ ...m, [p.id]: false }));
  }

  if (loading) {
    return <Shell onBack={onBack}><div className="grid flex-1 place-items-center py-20"><Loader2 size={22} className="animate-spin" style={{ color: SYSTEM }} /></div></Shell>;
  }

  return (
    <Shell onBack={onBack}>
      <div className="mt-4 text-2xl font-black tracking-tight" style={{ color: PAPER }}>Brand shop</div>
      <p className="mt-1 text-[14px]" style={{ color: "#8a8a90" }}>Every brand on the platform. Search the catalog and request a free sample.</p>

      {/* search */}
      <div className="mt-4 flex items-center gap-2 rounded-2xl px-3.5 py-3" style={{ backgroundColor: "#15171b", border: "1px solid #2a2a30" }}>
        <Search size={17} style={{ color: "#8a8a90" }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, brands, categories…" className="w-full bg-transparent text-[15px] outline-none" style={{ color: PAPER }} />
        {q && <button onClick={() => setQ("")} className="text-[12px] font-bold" style={{ color: "#8a8a90" }}>Clear</button>}
      </div>

      {/* brand filter chips */}
      {brands.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip active={!brandFilter} onClick={() => setBrandFilter("")}>All brands</Chip>
          {brands.map((b) => <Chip key={b.name} active={brandFilter === b.name} onClick={() => setBrandFilter(brandFilter === b.name ? "" : b.name)} dot={b.color}>{b.name}</Chip>)}
        </div>
      )}

      {/* results */}
      <div className="mt-4 space-y-3">
        {products.length === 0 ? (
          <Empty icon={Store} title="No brands yet" body="Brands are still adding products. Check back soon." />
        ) : filtered.length === 0 ? (
          <Empty icon={Package} title="No matches" body="Try a different search or clear the filter." />
        ) : (
          filtered.map((p) => {
            const req = requests[p.id];
            const isPending = pending[p.id];
            return (
              <div key={p.id} className="rounded-2xl p-4" style={{ backgroundColor: "#15171b", border: "1px solid #23252b" }}>
                <div className="flex gap-3">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" style={{ backgroundColor: "#0d0e11" }} />
                  ) : (
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: "#0d0e11" }}><Package size={20} style={{ color: "#3a3a42" }} /></div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p.brand_color || SYSTEM }} />
                      <span className="truncate text-[12px] font-bold uppercase tracking-[0.12em]" style={{ color: "#8a8a90" }}>{p.brand_name}</span>
                    </div>
                    <div className="mt-0.5 truncate text-[16px] font-black" style={{ color: PAPER }}>{p.title}</div>
                    {p.description && <div className="mt-0.5 line-clamp-2 text-[13px] leading-snug" style={{ color: "#8a8a90" }}>{p.description}</div>}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {p.price != null && <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: PAPER, color: INK }}>${p.price}</span>}
                      <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: "#1a1a1f", color: GREEN }}>Earn {p.commission}%</span>
                      {p.category && <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: "#1a1a1f", color: "#9a9aa0" }}>{p.category}</span>}
                    </div>
                  </div>
                </div>

                {p.sample_available ? (
                  req ? (
                    <div className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-bold" style={{ backgroundColor: "#101216", border: `1px solid ${req.status === "declined" ? "#3a3a42" : GREEN}`, color: req.status === "declined" ? "#8a8a90" : GREEN }}>
                      <Check size={14} /> Sample {STATUS_LABEL[req.status]?.toLowerCase() || "requested"}
                    </div>
                  ) : (
                    <button onClick={() => requestSample(p)} disabled={!userId || isPending} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-bold disabled:opacity-50" style={{ backgroundColor: SYSTEM, color: PAPER }}>
                      {isPending ? <Loader2 size={14} className="animate-spin" /> : <Gift size={14} />} Request free sample
                    </button>
                  )
                ) : (
                  <div className="mt-3 text-center text-[12px]" style={{ color: "#6b6b70" }}>No sample for this product</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Shell>
  );
}

function Shell({ children, onBack }) {
  return (
    <div className="flex min-h-screen flex-col px-5 pt-6 pb-12">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#9a9aa0" }}><ArrowLeft size={17} /> Feed</button>
      {children}
    </div>
  );
}

function Chip({ children, active, onClick, dot }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold" style={{ backgroundColor: active ? PAPER : "#16161a", color: active ? INK : "#9a9aa0", border: "1px solid #2a2a30" }}>
      {dot && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />}{children}
    </button>
  );
}

function Empty({ icon: Icon, title, body }) {
  return (
    <div className="rounded-2xl border border-dashed py-12 text-center" style={{ borderColor: "#2a2a30" }}>
      <Icon size={22} className="mx-auto" style={{ color: "#3a3a42" }} />
      <div className="mt-2 text-[15px] font-bold" style={{ color: "#9a9aa0" }}>{title}</div>
      <div className="mx-auto mt-1 max-w-[18rem] text-[13px]" style={{ color: "#6b6b70" }}>{body}</div>
    </div>
  );
}
