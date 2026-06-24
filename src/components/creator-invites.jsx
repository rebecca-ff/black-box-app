"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Check, X, Mail } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Creator-side invites inbox: brand campaign invitations, accept or decline.

const PAPER = "#F5F3EF";
const SYSTEM = "#FF3B1D";
const GREEN = "#3ECF8E";

export default function CreatorInvites({ userId, onBack }) {
  const sb = supabaseBrowser();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!sb || !userId) { setLoading(false); return; }
      const { data } = await sb.from("invitations").select("*").eq("creator_id", userId).order("created_at", { ascending: false });
      if (alive) { setInvites(data || []); setLoading(false); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function respond(id, status) {
    if (!sb) return;
    setBusy(id);
    await sb.from("invitations").update({ status }).eq("id", id);
    setInvites((xs) => xs.map((i) => (i.id === id ? { ...i, status } : i)));
    setBusy(null);
  }

  return (
    <div className="px-5 pt-6 pb-12">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#9a9aa0" }}><ArrowLeft size={17} /> Feed</button>
      <div className="mt-4 text-2xl font-black tracking-tight" style={{ color: PAPER }}>Invites</div>
      <p className="mt-1 text-[14px]" style={{ color: "#8a8a90" }}>Brands that want to work with you.</p>

      {loading ? (
        <div className="py-16 text-center"><Loader2 size={22} className="mx-auto animate-spin" style={{ color: SYSTEM }} /></div>
      ) : (
        <div className="mt-5 space-y-3">
          {invites.length === 0 && (
            <div className="rounded-2xl border border-dashed py-12 text-center" style={{ borderColor: "#2a2a30" }}>
              <Mail size={22} className="mx-auto" style={{ color: "#6b6b70" }} />
              <div className="mt-3 text-[14px] font-semibold" style={{ color: "#8a8a90" }}>No invites yet. Link your TikTok so brands can find you.</div>
            </div>
          )}
          {invites.map((inv) => (
            <div key={inv.id} className="rounded-2xl p-4" style={{ backgroundColor: "#15171b", border: "1px solid #23252b" }}>
              <div className="flex items-center justify-between">
                <div className="text-[15px] font-black" style={{ color: PAPER }}>A brand invited you</div>
                {inv.status === "accepted" && <span className="inline-flex items-center gap-1 text-[12px] font-bold" style={{ color: GREEN }}><Check size={13} /> Accepted</span>}
                {inv.status === "declined" && <span className="text-[12px] font-bold" style={{ color: "#6b6b70" }}>Declined</span>}
              </div>
              {inv.message ? <div className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed" style={{ color: "#bcbcc2" }}>{inv.message}</div> : null}
              {inv.status === "sent" && (
                <div className="mt-3 flex gap-2">
                  <button disabled={busy === inv.id} onClick={() => respond(inv.id, "declined")} className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold disabled:opacity-50" style={{ border: "1px solid #3a3a42", color: "#9a9aa0" }}><X size={15} /> Decline</button>
                  <button disabled={busy === inv.id} onClick={() => respond(inv.id, "accepted")} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold disabled:opacity-50" style={{ backgroundColor: SYSTEM, color: PAPER }}>{busy === inv.id ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Accept</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
