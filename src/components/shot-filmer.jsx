"use client";

import { useEffect, useRef, useState } from "react";
import { X, RotateCcw, ChevronRight, Download, Check, AlertCircle, Loader2, Clapperboard } from "lucide-react";

// ---------------------------------------------------------------------------
// ShotFilmer — film the brief, one clip per shot, right in the browser.
// Camera capture via getUserMedia + MediaRecorder (no native app, no deps).
// Each shot card becomes a teleprompter: the on-screen text and the director
// note float over the live camera while the creator records that shot.
// Editing / caption-burn / posting are the next phase — this captures + saves.
// ---------------------------------------------------------------------------

const PAPER = "#F5F3EF";
const SYSTEM = "#FF3B1D";
const GREEN = "#3ECF8E";

function pickMime() {
  if (typeof MediaRecorder === "undefined") return "";
  const types = [
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  for (const t of types) {
    try { if (MediaRecorder.isTypeSupported(t)) return t; } catch { /* ignore */ }
  }
  return "";
}

export default function ShotFilmer({ shots = [], color = SYSTEM, ink = "#0A0A0B", onClose, onComplete }) {
  const list = shots.length ? shots : [{ title: "Shot 1", action: "Film your clip", onscreen: "", note: "" }];
  const last = list.length - 1;

  const [phase, setPhase] = useState("loading"); // loading | ready | review | error
  const [error, setError] = useState("");
  const [facing, setFacing] = useState("user");
  const [shotIndex, setShotIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [clips, setClips] = useState({}); // { [i]: { url, mime } }
  const [seconds, setSeconds] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const clipsRef = useRef({});

  const supported =
    typeof navigator !== "undefined" &&
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) &&
    typeof MediaRecorder !== "undefined";

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  async function startCamera(face) {
    if (!supported) {
      setError("This browser can't reach the camera. Try Safari or Chrome on your phone.");
      setPhase("error");
      return;
    }
    setPhase("loading");
    setError("");
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: face, width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setPhase("ready");
    } catch (e) {
      const denied = e && (e.name === "NotAllowedError" || e.name === "SecurityError");
      setError(denied
        ? "Camera access was blocked. Allow the camera for this site, then tap Retry."
        : "Couldn't start the camera on this device.");
      setPhase("error");
    }
  }

  // Mount: start the camera. Unmount: stop everything and free clip URLs.
  useEffect(() => {
    startCamera(facing);
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
      Object.values(clipsRef.current).forEach((c) => c && c.url && URL.revokeObjectURL(c.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-bind the stream to the <video> element whenever we (re)enter "ready".
  useEffect(() => {
    if (phase === "ready" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [phase]);

  useEffect(() => { clipsRef.current = clips; }, [clips]);

  function flip() {
    const f = facing === "user" ? "environment" : "user";
    setFacing(f);
    startCamera(f);
  }

  function startRec() {
    if (!streamRef.current || recording) return;
    const mime = pickMime();
    let rec;
    try {
      rec = mime
        ? new MediaRecorder(streamRef.current, { mimeType: mime })
        : new MediaRecorder(streamRef.current);
    } catch {
      setError("Recording isn't supported in this browser.");
      setPhase("error");
      return;
    }
    chunksRef.current = [];
    rec.ondataavailable = (ev) => { if (ev.data && ev.data.size) chunksRef.current.push(ev.data); };
    rec.onstop = () => {
      const type = rec.mimeType || mime || "video/webm";
      const blob = new Blob(chunksRef.current, { type });
      const url = URL.createObjectURL(blob);
      setClips((c) => {
        const prev = c[shotIndex];
        if (prev && prev.url) URL.revokeObjectURL(prev.url);
        return { ...c, [shotIndex]: { url, mime: type } };
      });
    };
    recRef.current = rec;
    rec.start();
    setRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  function stopRec() {
    if (recRef.current && recording) { try { recRef.current.stop(); } catch { /* ignore */ } }
    setRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  const toggleRec = () => (recording ? stopRec() : startRec());

  function goNext() {
    if (recording) stopRec();
    if (shotIndex < last) setShotIndex(shotIndex + 1);
    else { stopStream(); setPhase("review"); }
  }
  function goPrev() {
    if (recording) stopRec();
    if (shotIndex > 0) setShotIndex(shotIndex - 1);
  }

  function download(i) {
    const clip = clips[i];
    if (!clip) return;
    const ext = clip.mime.includes("mp4") ? "mp4" : "webm";
    const a = document.createElement("a");
    a.href = clip.url;
    a.download = `shot-${i + 1}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  const downloadAll = () => list.forEach((_, i) => clips[i] && download(i));

  function close() {
    stopStream();
    if (timerRef.current) clearInterval(timerRef.current);
    onClose && onClose();
  }

  function refilm() {
    setShotIndex(0);
    setPhase("loading");
    startCamera(facing);
  }

  const cur = list[shotIndex];
  const capturedCount = Object.keys(clips).length;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50" style={{ backgroundColor: "#000" }}>
      <div className="relative mx-auto h-full w-full max-w-md overflow-hidden" style={{ backgroundColor: "#000" }}>

        {/* top bar */}
        <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-4 pt-4">
          <button onClick={close} className="grid h-10 w-10 place-items-center rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.5)", color: PAPER }}><X size={20} /></button>
          {phase !== "review" ? (
            <div className="rounded-full px-3 py-1.5 text-[13px] font-bold" style={{ backgroundColor: "rgba(0,0,0,0.5)", color: PAPER }}>Shot {shotIndex + 1} <span style={{ opacity: 0.6 }}>of {list.length}</span></div>
          ) : (
            <div className="text-[15px] font-black" style={{ color: PAPER }}>Your footage</div>
          )}
          {phase === "ready" ? (
            <button onClick={flip} className="grid h-10 w-10 place-items-center rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.5)", color: PAPER }}><RotateCcw size={18} /></button>
          ) : <div className="h-10 w-10" />}
        </div>

        {/* loading */}
        {phase === "loading" && (
          <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
            <Loader2 size={26} className="animate-spin" style={{ color }} />
            <div className="mt-4 text-[15px] font-bold" style={{ color: PAPER }}>Starting the camera…</div>
            <div className="mt-1 text-[13px]" style={{ color: "#8a8a90" }}>Allow camera + mic when your browser asks.</div>
          </div>
        )}

        {/* error */}
        {phase === "error" && (
          <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
            <AlertCircle size={26} style={{ color: SYSTEM }} />
            <div className="mt-4 text-[15px] font-bold" style={{ color: PAPER }}>{error}</div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => startCamera(facing)} className="rounded-full px-5 py-2.5 text-sm font-bold" style={{ backgroundColor: color, color: ink }}>Retry</button>
              <button onClick={close} className="rounded-full px-5 py-2.5 text-sm font-bold" style={{ border: "1px solid #3a3a42", color: PAPER }}>Close</button>
            </div>
          </div>
        )}

        {/* camera + teleprompter */}
        {phase === "ready" && (
          <>
            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />

            {recording && (
              <div className="absolute left-1/2 top-16 z-20 -translate-x-1/2 rounded-full px-3 py-1 text-[13px] font-bold" style={{ backgroundColor: SYSTEM, color: PAPER }}>● {fmt(seconds)}</div>
            )}

            {/* on-screen text (what the viewer will see) */}
            {cur.onscreen ? (
              <div className="absolute inset-x-0 top-24 z-10 px-6 text-center">
                <div className="inline-block rounded-xl px-3 py-2 text-[22px] font-black leading-tight" style={{ backgroundColor: "rgba(0,0,0,0.45)", color: PAPER }}>{cur.onscreen}</div>
              </div>
            ) : null}

            {/* director note (what to do) */}
            <div className="absolute inset-x-0 bottom-44 z-10 px-5">
              <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
                <div className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color }}>{cur.title || `Shot ${shotIndex + 1}`} · what to do</div>
                <div className="mt-1 text-[15px] font-semibold leading-snug" style={{ color: PAPER }}>{cur.action}</div>
                {cur.note ? <div className="mt-1 text-[12px]" style={{ color: "#c8c8cc" }}>↳ {cur.note}</div> : null}
              </div>
            </div>

            {/* controls */}
            <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-7 pt-4" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}>
              <div className="mb-4 flex items-center justify-center gap-1.5">
                {list.map((_, i) => (
                  <div key={i} className="h-1.5 rounded-full transition-all" style={{ width: i === shotIndex ? 22 : 8, backgroundColor: clips[i] ? GREEN : (i === shotIndex ? PAPER : "rgba(255,255,255,0.3)") }} />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <button onClick={goPrev} disabled={shotIndex === 0} className="w-14 text-left text-[13px] font-bold disabled:opacity-30" style={{ color: PAPER }}>Prev</button>
                <button onClick={toggleRec} className="grid h-[72px] w-[72px] place-items-center rounded-full" style={{ border: `4px solid ${PAPER}` }} aria-label={recording ? "Stop" : "Record"}>
                  <div style={{ backgroundColor: SYSTEM, width: recording ? 26 : 56, height: recording ? 26 : 56, borderRadius: recording ? 6 : 999, transition: "all 0.15s" }} />
                </button>
                {clips[shotIndex] ? (
                  <button onClick={goNext} className="inline-flex w-14 items-center justify-end gap-0.5 text-[13px] font-bold" style={{ color: GREEN }}>{shotIndex === last ? "Done" : "Next"} <ChevronRight size={15} /></button>
                ) : <div className="w-14" />}
              </div>
              <div className="mt-3 text-center text-[12px] font-semibold" style={{ color: "#c8c8cc" }}>
                {recording ? "Recording…" : clips[shotIndex] ? "Saved ✓ — press ● to re-record, or Next →" : "Press ● to record this shot"}
              </div>
            </div>
          </>
        )}

        {/* review */}
        {phase === "review" && (
          <div className="h-full w-full overflow-y-auto px-5 pb-10 pt-16">
            <div className="text-[13px] font-semibold" style={{ color: "#8a8a90" }}>{capturedCount} of {list.length} shots captured</div>

            <div className="mt-4 space-y-3">
              {list.map((s, i) => (
                <div key={i} className="rounded-2xl p-3" style={{ backgroundColor: "#15171b", border: "1px solid #23252b" }}>
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-bold" style={{ color: PAPER }}>{s.title || `Shot ${i + 1}`}</div>
                    {clips[i]
                      ? <span className="inline-flex items-center gap-1 text-[12px] font-bold" style={{ color: GREEN }}><Check size={13} /> captured</span>
                      : <span className="text-[12px] font-bold" style={{ color: "#6b6b70" }}>not filmed</span>}
                  </div>
                  {clips[i] ? (
                    <video src={clips[i].url} controls playsInline className="mt-2 w-full rounded-xl" style={{ maxHeight: 280, backgroundColor: "#000" }} />
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl p-4" style={{ backgroundColor: "#101216", border: "1px solid #23252b" }}>
              <div className="text-[13px] leading-snug" style={{ color: "#bcbcc2" }}>
                Editing, caption burn-in and one-tap posting are coming next. For now, save your clips and finish the post in TikTok.
              </div>
              <button onClick={downloadAll} disabled={!capturedCount} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold disabled:opacity-40" style={{ border: "1px solid #3a3a42", color: PAPER }}><Download size={15} /> Save all clips</button>
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={refilm} className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-3 text-sm font-bold" style={{ border: "1px solid #3a3a42", color: PAPER }}><RotateCcw size={15} /> Re-film</button>
              <button onClick={() => { onComplete && onComplete(); close(); }} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold" style={{ backgroundColor: color, color: ink }}><Clapperboard size={16} /> Done — mark filmed</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
