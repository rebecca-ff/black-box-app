"use client";

import { useEffect, useState } from "react";
import { Loader2, Store, Clapperboard, ArrowLeft } from "lucide-react";
import { supabaseBrowser, authEnabled } from "@/lib/supabase-browser";
import CallsheetApp from "./callsheet-app";

// ---------------------------------------------------------------------------
// AuthGate — two login portals (Brand / Creator) in front of the app.
// Off by default: unless NEXT_PUBLIC_AUTH_ENABLED === "true" AND a Supabase
// anon key is set, it renders the app in anonymous demo mode unchanged.
// When on: landing -> pick portal -> email sign up / sign in -> role-routed app.
// ---------------------------------------------------------------------------

const INK = "#0A0A0B";
const PAPER = "#F5F3EF";
const SYSTEM = "#FF3B1D";
const ROLE_KEY = "cs_intended_role";

function Shell({ children }) {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#000" }}>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-10" style={{ backgroundColor: INK }}>
        {children}
      </div>
    </div>
  );
}

function Wordmark() {
  return <div className="text-3xl font-black tracking-tight" style={{ color: PAPER }}>callsheet<span style={{ color: SYSTEM }}>.</span></div>;
}

export default function AuthGate() {
  const sb = supabaseBrowser();
  const enabled = authEnabled();
  const [phase, setPhase] = useState(enabled ? "loading" : "demo"); // loading|demo|unauth|ready
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!enabled || !sb) { setPhase("demo"); return; }
    let alive = true;

    async function resolve(session) {
      if (!alive) return;
      if (!session) { setRole(null); setUserId(null); setPhase("unauth"); return; }
      setUserId(session.user.id);
      const { data: prof } = await sb.from("profiles").select("role").eq("id", session.user.id).maybeSingle();
      let r = prof?.role || null;
      if (!r) {
        // New account: adopt the portal they picked before signing up.
        const intended = typeof window !== "undefined" ? window.localStorage.getItem(ROLE_KEY) : null;
        if (intended === "brand" || intended === "creator") {
          await sb.from("profiles").upsert({ id: session.user.id, role: intended });
          r = intended;
        }
      }
      if (!alive) return;
      if (r) { setRole(r); setPhase("ready"); }
      else { setPhase("unauth"); } // no role + no intent -> back to portal picker
    }

    sb.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => resolve(session));
    return () => { alive = false; sub?.subscription?.unsubscribe?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOut() {
    if (sb) await sb.auth.signOut();
    if (typeof window !== "undefined") window.localStorage.removeItem(ROLE_KEY);
    setRole(null); setPhase("unauth");
  }

  if (phase === "demo") return <CallsheetApp />;
  if (phase === "loading") {
    return <Shell><div className="m-auto text-center"><Loader2 size={24} className="mx-auto animate-spin" style={{ color: SYSTEM }} /></div></Shell>;
  }
  if (phase === "ready") return <CallsheetApp authRole={role} userId={userId} onSignOut={signOut} />;
  return <AuthScreen sb={sb} />;
}

function AuthScreen({ sb }) {
  const [intendedRole, setIntendedRole] = useState(null); // brand|creator
  const [mode, setMode] = useState("signup"); // signup|signin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  function pick(r) {
    setIntendedRole(r);
    if (typeof window !== "undefined") window.localStorage.setItem(ROLE_KEY, r);
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(""); setMsg("");
    try {
      if (mode === "signup") {
        const { data, error } = await sb.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        if (data.session && data.user) {
          await sb.from("profiles").upsert({ id: data.user.id, role: intendedRole });
          // onAuthStateChange in AuthGate takes over from here.
        } else {
          setMsg("Account created — check your email to confirm, then sign in.");
          setMode("signin");
        }
      } else {
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (e2) {
      setErr(e2?.message || "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  // Step 1 — choose a portal.
  if (!intendedRole) {
    return (
      <Shell>
        <Wordmark />
        <p className="mt-2 text-[15px]" style={{ color: "#9a9aa0" }}>One place for brands and creators. Pick how you&apos;re joining.</p>
        <div className="mt-8 space-y-3.5">
          <button onClick={() => pick("brand")} className="block w-full rounded-2xl p-5 text-left transition-transform active:scale-[0.985]" style={{ backgroundColor: SYSTEM, color: PAPER }}>
            <Store size={22} />
            <div className="mt-3 text-xl font-black">I&apos;m a brand</div>
            <div className="mt-1 text-[14px] font-semibold" style={{ opacity: 0.85 }}>Find creators, brief them, set deals, run partnership ads.</div>
          </button>
          <button onClick={() => pick("creator")} className="block w-full rounded-2xl p-5 text-left transition-transform active:scale-[0.985]" style={{ backgroundColor: "#15171b", color: PAPER, border: "1px solid #2a2a30" }}>
            <Clapperboard size={22} style={{ color: SYSTEM }} />
            <div className="mt-3 text-xl font-black">I&apos;m a creator</div>
            <div className="mt-1 text-[14px] font-semibold" style={{ color: "#9a9aa0" }}>Get briefs + winning hooks, film, post, grow, and get paid.</div>
          </button>
        </div>
      </Shell>
    );
  }

  // Step 2 — email auth for the chosen portal.
  return (
    <Shell>
      <button onClick={() => { setIntendedRole(null); setErr(""); setMsg(""); }} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#9a9aa0" }}><ArrowLeft size={17} /> Back</button>
      <div className="mt-6"><Wordmark /></div>
      <div className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold" style={{ backgroundColor: "#16161a", color: SYSTEM, border: "1px solid #2a2a30" }}>
        {intendedRole === "brand" ? <Store size={13} /> : <Clapperboard size={13} />}{intendedRole === "brand" ? "Brand portal" : "Creator portal"}
      </div>

      <form onSubmit={submit} className="mt-7 space-y-3">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full rounded-xl px-3.5 py-3 text-[15px] outline-none" style={{ backgroundColor: "#16161a", color: PAPER, border: "1px solid #2a2a30" }} />
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password (6+ characters)" className="w-full rounded-xl px-3.5 py-3 text-[15px] outline-none" style={{ backgroundColor: "#16161a", color: PAPER, border: "1px solid #2a2a30" }} />
        {err ? <div className="text-[13px] font-semibold" style={{ color: SYSTEM }}>{err}</div> : null}
        {msg ? <div className="text-[13px] font-semibold" style={{ color: "#3ECF8E" }}>{msg}</div> : null}
        <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-transform active:scale-95 disabled:opacity-50" style={{ backgroundColor: SYSTEM, color: PAPER }}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : null}{mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <button onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setErr(""); setMsg(""); }} className="mt-4 text-center text-[13px] font-semibold" style={{ color: "#9a9aa0" }}>
        {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>
    </Shell>
  );
}
