"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Plus, Check, Package, Gift, Archive, Pencil, X, Inbox } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Brand catalog: set your brand name, manage the products creators can browse +
// request samples for, and act on incoming sample requests. Products are added
// manually here now; the TikTok Shop import (next phase) writes into the same
// table with source='tiktok_shop'. All reads/writes go through the browser client
// (RLS scopes products + requests to the signed-in brand).

const INK = "#0A0A0B";
const PAPER = "#F5F3EF";
const SYSTEM = "#FF3B1D";
const GREEN = "#1f9d62";

const emptyForm = { title: "", description: "", category: "", price: "", commission: 20, sample_available: true, image_url: "" };

const STATUS_LABEL = { requested: "New", approved: "Approved", shipped: "Shipped", declined: "Declined" };
const STATUS_COLOR = { requested: SYSTEM, approved: "#b8860b", shipped: GREEN, declined: "#8a857c" };

export default function BrandProducts({ userId, onBack }) {
  const sb = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [editing, setEditing] = useState(null); // product id | "new" | null
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!sb || !userId) { setLoading(false); return; }
      const [{ data: prof }, { data: prods }, { data: reqs }] = await Promise.all([
        sb.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
        sb.from("products").select("*").eq("owner_id", userId).order("created_at", { ascending: false }),
        sb.from("sample_requests").select("*").eq("brand_id", userId).order("created_at", { ascending: false }),
      ]);
      if (!alive) return;
      setBrandName(prof?.display_name || "");
      setNameInput(prof?.display_name || "");
      setProducts(prods || []);
      setRequests(reqs || []);
      setLoading(false);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveName() {
    if (!sb || !userId || !nameInput.trim()) return;
    setSavingName(true);
    await sb.from("profiles").upsert({ id: userId, role: "brand", display_name: nameInput.trim() });
    setBrandName(nameInput.trim());
    setSavingName(false);
  }

  function startNew() { setForm(emptyForm); setEditing("new"); }
  function startEdit(p) {
    setForm({ title: p.title || "", description: p.description || "", category: p.category || "", price: p.price != null ? String(p.price) : "", commission: p.commission ?? 20, sample_available: !!p.sample_available, image_url: p.image_url || "" });
    setEditing(p.id);
  }

  async function reloadProducts() {
    const { data } = await sb.from("products").select("*").eq("owner_id", userId).order("created_at", { ascending: false });
    setProducts(data || []);
  }

  async function saveProduct() {
    if (!sb || !userId || !form.title.trim()) return;
    setBusy(true);
    const row = {
      owner_id: userId,
      brand_name: brandName || "My brand",
      brand_color: SYSTEM,
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      price: form.price ? parseFloat(form.price) : null,
      commission: parseInt(form.commission, 10) || 0,
      sample_available: !!form.sample_available,
      image_url: form.image_url.trim() || null,
      source: "manual",
    };
    if (editing === "new") {
      await sb.from("products").insert(row);
    } else {
      await sb.from("products").update(row).eq("id", editing).eq("owner_id", userId);
    }
    await reloadProducts();
    setEditing(null);
    setBusy(false);
  }

  async function setStatus(p, status) {
    await sb.from("products").update({ status }).eq("id", p.id).eq("owner_id", userId);
    reloadProducts();
  }

  async function actOnRequest(r, status) {
    setRequests((rs) => rs.map((x) => (x.id === r.id ? { ...x, status } : x)));
    await sb.from("sample_requests").update({ status }).eq("id", r.id).eq("brand_id", userId);
  }

  const newReqCount = requests.filter((r) => r.status === "requested").length;

  if (loading) {
    return <div className="grid min-h-screen place-items-center" style={{ backgroundColor: "#faf8f4" }}><Loader2 size={22} className="animate-spin" style={{ color: SYSTEM }} /></div>;
  }

  return (
    <div className="min-h-screen px-5 pt-6 pb-12" style={{ backgroundColor: "#faf8f4" }}>
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#6b6b70" }}><ArrowLeft size={17} /> Dashboard</button>
      <div className="mt-4 text-2xl font-black tracking-tight" style={{ color: INK }}>Your catalog</div>
      <p className="mt-1 text-[14px]" style={{ color: "#6b6b70" }}>The products creators can find and request samples for.</p>

      {/* brand name */}
      <div className="mt-5 rounded-2xl border bg-white p-4" style={{ borderColor: "#e6e3dc" }}>
        <div className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "#9a958c" }}>Brand name</div>
        <div className="mt-2 flex gap-2">
          <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="e.g. Sovereign Silver" className="flex-1 rounded-xl px-3.5 py-2.5 text-[15px] outline-none" style={{ backgroundColor: "#faf8f4", color: INK, border: "1px solid #e6e3dc" }} />
          <button disabled={savingName || !nameInput.trim() || nameInput.trim() === brandName} onClick={saveName} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ backgroundColor: SYSTEM }}>{savingName ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save</button>
        </div>
        {!brandName && <div className="mt-2 text-[12px]" style={{ color: SYSTEM }}>Set your brand name so creators know who they&apos;re working with.</div>}
      </div>

      {/* incoming sample requests */}
      <div className="mt-4">
        <div className="flex items-center gap-2"><Inbox size={15} style={{ color: "#6b6b70" }} /><span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "#9a958c" }}>Sample requests</span>{newReqCount > 0 && <span className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white" style={{ backgroundColor: SYSTEM }}>{newReqCount} new</span>}</div>
        {requests.length === 0 ? (
          <div className="mt-2 rounded-2xl border border-dashed py-6 text-center text-[13px] font-semibold" style={{ borderColor: "#d8d3c9", color: "#9a958c" }}>No sample requests yet.</div>
        ) : (
          <div className="mt-2 space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="rounded-2xl border bg-white p-4" style={{ borderColor: "#e6e3dc" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-black" style={{ color: INK }}>{r.product_title || "Product"}</div>
                    <div className="text-[13px] font-semibold" style={{ color: "#6b6b70" }}>{r.handle ? `@${r.handle}` : "A creator"}</div>
                    {r.note && <div className="mt-1 text-[13px] leading-snug" style={{ color: "#52504a" }}>“{r.note}”</div>}
                  </div>
                  <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: "#f0ede7", color: STATUS_COLOR[r.status] }}>{STATUS_LABEL[r.status]}</span>
                </div>
                {(r.status === "requested" || r.status === "approved") && (
                  <div className="mt-3 flex gap-2">
                    {r.status === "requested" && <button onClick={() => actOnRequest(r, "approved")} className="flex-1 rounded-full py-2 text-[13px] font-bold text-white" style={{ backgroundColor: GREEN }}>Approve</button>}
                    {r.status === "approved" && <button onClick={() => actOnRequest(r, "shipped")} className="flex-1 rounded-full py-2 text-[13px] font-bold text-white" style={{ backgroundColor: GREEN }}>Mark shipped</button>}
                    {r.status === "requested" && <button onClick={() => actOnRequest(r, "declined")} className="rounded-full border px-4 py-2 text-[13px] font-bold" style={{ borderColor: "#d8d3c9", color: "#6b6b70" }}>Decline</button>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* products */}
      <div className="mt-5 flex items-center gap-2"><Package size={15} style={{ color: "#6b6b70" }} /><span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "#9a958c" }}>Products · {products.length}</span></div>
      <div className="mt-2 space-y-2">
        {products.map((p) => (
          <div key={p.id} className="rounded-2xl border bg-white p-4" style={{ borderColor: "#e6e3dc", opacity: p.status === "archived" ? 0.55 : 1 }}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[16px] font-black" style={{ color: INK }}>{p.title}</div>
                {p.category && <div className="text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: "#9a958c" }}>{p.category}</div>}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {p.price != null && <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: INK, color: "#fff" }}>${p.price}</span>}
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: "#f0ede7", color: "#6b6b70" }}>{p.commission}% commission</span>
                  {p.sample_available && <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: "#f0ede7", color: "#6b6b70" }}><Gift size={11} /> Sample</span>}
                  {p.source === "tiktok_shop" && <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: "#f0ede7", color: "#6b6b70" }}>TikTok Shop</span>}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => startEdit(p)} className="grid h-8 w-8 place-items-center rounded-full" style={{ border: "1px solid #e6e3dc", color: "#6b6b70" }} aria-label="Edit"><Pencil size={14} /></button>
                <button onClick={() => setStatus(p, p.status === "archived" ? "active" : "archived")} className="grid h-8 w-8 place-items-center rounded-full" style={{ border: "1px solid #e6e3dc", color: "#6b6b70" }} aria-label={p.status === "archived" ? "Restore" : "Archive"}>{p.status === "archived" ? <Check size={14} /> : <Archive size={14} />}</button>
              </div>
            </div>
          </div>
        ))}
        {editing === "new" ? null : (
          <button onClick={startNew} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-5 text-sm font-bold" style={{ borderColor: "#d8d3c9", color: "#8a857c" }}><Plus size={17} /> Add product</button>
        )}
      </div>

      {/* product editor */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={() => !busy && setEditing(null)}>
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5" style={{ maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="text-xl font-black" style={{ color: INK }}>{editing === "new" ? "Add product" : "Edit product"}</div>
              <button onClick={() => !busy && setEditing(null)} style={{ color: "#9a958c" }}><X size={20} /></button>
            </div>
            <div className="mt-4 space-y-3">
              <Field label="Product title"><input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Bio-Active Silver Hydrosol" className="w-full rounded-xl px-3.5 py-3 text-[15px] outline-none" style={{ backgroundColor: "#faf8f4", color: INK, border: "1px solid #e6e3dc" }} /></Field>
              <Field label="Description"><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="What it is, who it's for" className="w-full resize-none rounded-xl px-3.5 py-3 text-[15px] outline-none" style={{ backgroundColor: "#faf8f4", color: INK, border: "1px solid #e6e3dc" }} /></Field>
              <div className="flex gap-3">
                <Field label="Category" className="flex-1"><input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Wellness" className="w-full rounded-xl px-3.5 py-3 text-[15px] outline-none" style={{ backgroundColor: "#faf8f4", color: INK, border: "1px solid #e6e3dc" }} /></Field>
                <Field label="Price ($)" className="w-28"><input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value.replace(/[^0-9.]/g, "") }))} inputMode="decimal" placeholder="29" className="w-full rounded-xl px-3.5 py-3 text-[15px] outline-none" style={{ backgroundColor: "#faf8f4", color: INK, border: "1px solid #e6e3dc" }} /></Field>
              </div>
              <Field label="Image URL (optional)"><input value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="https://…" className="w-full rounded-xl px-3.5 py-3 text-[15px] outline-none" style={{ backgroundColor: "#faf8f4", color: INK, border: "1px solid #e6e3dc" }} /></Field>
              <Field label={`Commission — ${form.commission}%`}><input type="range" min="0" max="40" value={form.commission} onChange={(e) => setForm((f) => ({ ...f, commission: +e.target.value }))} className="w-full" style={{ accentColor: SYSTEM }} /></Field>
              <div className="flex items-center justify-between rounded-xl px-3.5 py-3" style={{ backgroundColor: "#faf8f4", border: "1px solid #e6e3dc" }}>
                <div className="flex items-center gap-2"><Gift size={16} style={{ color: "#6b6b70" }} /><span className="text-[15px] font-semibold" style={{ color: INK }}>Free sample available</span></div>
                <button onClick={() => setForm((f) => ({ ...f, sample_available: !f.sample_available }))} className="h-7 w-12 rounded-full p-0.5 transition-colors" style={{ backgroundColor: form.sample_available ? SYSTEM : "#d8d3c9" }}><div className="h-6 w-6 rounded-full bg-white transition-transform" style={{ transform: form.sample_available ? "translateX(20px)" : "translateX(0)" }} /></button>
              </div>
            </div>
            <button disabled={busy || !form.title.trim()} onClick={saveProduct} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white disabled:opacity-40" style={{ backgroundColor: SYSTEM }}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {editing === "new" ? "Add to catalog" : "Save changes"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "#9a958c" }}>{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
