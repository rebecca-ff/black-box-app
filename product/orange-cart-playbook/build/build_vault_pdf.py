# -*- coding: utf-8 -*-
"""Builds The Vault swipe-file PDF: hook library, brief template,
compliance checklist, DM/outreach scripts, and CX response bank."""
import os
OUT = os.path.join(os.path.dirname(__file__), "..", "vault", "orange-cart-vault-swipe-files.html")

CSS = """
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
html,body{margin:0;background:#FBF8F3;color:#16130F;}
body{font-family:Georgia,'Times New Roman',serif;font-size:11pt;line-height:1.55;}
.page{page-break-after:always;padding:56px 64px 64px;min-height:9.3in;position:relative;}
.page:last-child{page-break-after:auto;}
h1,h2,h3,h4,.kick,.mono,th,.cover *{font-family:'Helvetica Neue',Arial,sans-serif;}
.kick{font-size:8.4pt;letter-spacing:.22em;text-transform:uppercase;font-weight:800;color:#B23A0E;margin:0 0 12px;}
h2{font-size:24pt;font-weight:800;letter-spacing:-.02em;line-height:1.05;margin:0 0 8px;}
h3{font-size:13pt;font-weight:800;margin:22px 0 6px;}
h4{font-size:10.5pt;font-weight:800;margin:14px 0 4px;color:#B23A0E;}
p{margin:0 0 9px;}
.divider{height:3px;width:52px;background:#FF5A1F;margin:0 0 20px;border-radius:2px;}
.lede{font-size:12.5pt;font-weight:600;color:#2C2620;margin:0 0 14px;}
.small{font-size:9.2pt;color:#6E655B;}
.cover{background:#16130F;color:#F7F1E8;min-height:9.3in;padding:72px 64px;page-break-after:always;position:relative;overflow:hidden;}
.cover .blob{position:absolute;width:460px;height:460px;border-radius:50%;
  background:radial-gradient(circle at 30% 30%,#FF5A1F,#B23A0E);right:-150px;top:-250px;}
.cover .bl{font-size:9pt;letter-spacing:.32em;text-transform:uppercase;font-weight:800;color:#FF5A1F;}
.cover h1{font-size:62pt;line-height:.96;font-weight:800;letter-spacing:-.03em;margin:180px 0 0;}
.cover .sub{font-family:Georgia,serif;font-size:15pt;color:#D9CFC0;max-width:6in;margin-top:20px;}
.cover .list{position:absolute;left:64px;bottom:64px;font-size:10pt;color:#CDBFAC;}
.cover .list b{color:#F7F1E8;}
.card{background:#fff;border:1px solid #E7DDCE;border-left:4px solid #FF5A1F;border-radius:10px;
  padding:14px 18px;margin:12px 0;break-inside:avoid;}
.fill{color:#B23A0E;font-weight:700;font-family:'Helvetica Neue',Arial,sans-serif;}
.mono{font-family:'Helvetica Neue',Arial,sans-serif;}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:9.8pt;break-inside:avoid;}
th{text-align:left;background:#16130F;color:#F6F0E6;padding:8px 11px;font-size:8.4pt;letter-spacing:.05em;text-transform:uppercase;font-weight:800;}
td{padding:8px 11px;border-bottom:1px solid #E7DDCE;vertical-align:top;}
tr:nth-child(even) td{background:#F5EFE5;}
ol,ul{margin:6px 0 10px;padding-left:20px;}li{margin:0 0 5px;}
.check li{list-style:none;position:relative;padding-left:24px;}
.check li:before{content:"";position:absolute;left:0;top:2px;width:14px;height:14px;border-radius:4px;border:2px solid #FF5A1F;}
.reply{background:#FDEEE4;border:1px solid #E7DDCE;border-radius:8px;padding:10px 14px;margin:6px 0;break-inside:avoid;}
.reply .c{font-family:'Helvetica Neue',Arial,sans-serif;font-size:8pt;font-weight:800;color:#0E7C6B;float:right;}
.blank{display:inline-block;border-bottom:1.5px solid #C9BBA8;min-width:120px;height:14px;}
.footer{position:absolute;left:64px;right:64px;bottom:30px;display:flex;justify-content:space-between;
  font-family:'Helvetica Neue',Arial,sans-serif;font-size:8pt;letter-spacing:.1em;text-transform:uppercase;
  color:#9A9086;border-top:1px solid #E7DDCE;padding-top:9px;}
.two{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
"""

def foot():
    return '<div class="footer"><span>The Orange Cart Playbook · The Vault</span><span>Swipe Files</span></div>'

# ---- HOOK LIBRARY ----
HOOK_PATTERNS = [
 ("Problem → Solution", [
   'My [subject] had [problem] for [time]. I tried this and here’s what happened…',
   'I struggled with [problem] for years. Then I found [product category].',
   'Nobody told me [problem] could be fixed this easily.',
   '[Problem] used to run my life. Watch what changed.',
   'I fixed [problem] in [timeframe] — here’s exactly how.',
 ]),
 ("POV / Empathy", [
   'POV: you finally find something that actually works for [problem].',
   'POV: the [product] that made you stop [old painful behavior].',
   'POV: you stopped wasting money on [expensive alternative].',
   'That feeling when [problem] just… isn’t a problem anymore.',
 ]),
 ("Time-stamped update", [
   '[N]-day update on [product]. Honest results.',
   'I used [product] every day for [N] days. Here’s the truth.',
   'Week [N] with [product]. Nobody talks about this.',
   '[N] days later. I did NOT expect this.',
 ]),
 ("Loss aversion / FOMO", [
   'If you have [problem], watch this before spending on [expensive alternative].',
   'Don’t buy another [category] until you’ve seen this.',
   'Stop wasting money on [old solution]. Do this instead.',
   'You’re overpaying for [category] and here’s the proof.',
 ]),
 ("Audience call-out", [
   '[Specific person] — you NEED to know about this.',
   'If you’re a [specific person], this is for you.',
   'Attention [audience]: this changes everything about [topic].',
   'Every [audience] should own one of these.',
 ]),
 ("Skeptic → Believer", [
   'I almost didn’t buy this. I was completely wrong.',
   'I thought this was a scam. Then I tried it.',
   'I’m the biggest skeptic and even I’m impressed.',
   'I abandoned my cart 4 times before buying. I regret waiting.',
 ]),
 ("Daily-routine reveal", [
   'I add one of these every [morning/night]. This is what changed.',
   'The [product] I use every single day — and why.',
   'My [routine] isn’t complete without this one thing.',
   'This is the [product] that lives on my [counter/desk] now.',
 ]),
 ("Curiosity / mechanism", [
   'The real reason [problem] keeps happening (it’s not what you think).',
   'Here’s what the label should actually say.',
   'What [category] companies don’t want you to know.',
   'The one ingredient/feature that actually matters in [category].',
 ]),
]

def hook_pages():
    blocks=""
    for name,hooks in HOOK_PATTERNS:
        items="".join(f"<li>{h}</li>" for h in hooks)
        blocks+=f'<div class="card"><h4>{name}</h4><ul style="margin:4px 0 0">{items}</ul></div>'
    half=len(HOOK_PATTERNS)//2+1
    b1="";b2=""
    acc=""
    # split across two pages
    p1=""
    for name,hooks in HOOK_PATTERNS[:5]:
        items="".join(f"<li>{h}</li>" for h in hooks)
        p1+=f'<div class="card"><h4>{name}</h4><ul style="margin:4px 0 0">{items}</ul></div>'
    p2=""
    for name,hooks in HOOK_PATTERNS[5:]:
        items="".join(f"<li>{h}</li>" for h in hooks)
        p2+=f'<div class="card"><h4>{name}</h4><ul style="margin:4px 0 0">{items}</ul></div>'
    return f"""<section class="page"><p class="kick">Vault 01 · Hook Library</p>
      <h2>50+ hook skeletons</h2><div class="divider"></div>
      <p class="lede">Swipe the <em>shape</em>, not the words. Fill the <span class="fill">[brackets]</span> with your
      product’s pain and payoff. One curiosity gap OR one specific number per hook — never both.</p>
      {p1}{foot()}</section>
      <section class="page"><p class="kick">Vault 01 · Hook Library</p>
      <h3 style="margin-top:0">More patterns</h3>{p2}
      <div class="card" style="border-left-color:#0E7C6B"><h4 style="color:#0A5A4E">Rewrite rule</h4>
      <p style="margin:0" class="small">Read every hook out loud before you use it. If it sounds like an ad → rewrite.
      If it sounds like a friend texting you → ship it. Avoid “best / miracle / revolutionary” — they trigger
      both ad rejection and viewer skepticism.</p></div>{foot()}</section>"""

# ---- BRIEF TEMPLATE ----
def brief_page():
    return f"""<section class="page"><p class="kick">Vault 02 · Creator Brief</p>
      <h2>Shot-by-shot brief template</h2><div class="divider"></div>
      <p class="lede">Hand this to every creator so their video is built on the framework. Copy it, fill the
      <span class="fill">[brackets]</span>, send it with the sample.</p>
      <table>
      <tr><th style="width:22%">Field</th><th>Fill in</th></tr>
      <tr><td><b>Product + link</b></td><td>[product name] — tag in the video, orange cart</td></tr>
      <tr><td><b>Who it’s for</b></td><td>[target customer + their #1 pain]</td></tr>
      <tr><td><b>Angle / pillar</b></td><td>[Pain Point / Demo / Social Proof / Lifestyle / Trend / Comparison / BTS]</td></tr>
      <tr><td><b>HOOK (0–3s)</b></td><td>[the scroll-stopper — pull one from the Hook Library]</td></tr>
      <tr><td><b>PROBLEM (3–8s)</b></td><td>[agitate the pain in “you” language]</td></tr>
      <tr><td><b>SOLUTION (8–15s)</b></td><td>[show product in action — 1–2 features max]</td></tr>
      <tr><td><b>PROOF (15–22s)</b></td><td>[review / before-after / number — keep outcome claims as YOUR experience]</td></tr>
      <tr><td><b>CTA (22–30s)</b></td><td>“Tap the orange cart.” [+ honest urgency only if real]</td></tr>
      <tr><td><b>On-screen text</b></td><td>[3–4 caption overlays, bold, word-by-word]</td></tr>
      <tr><td><b>Sound</b></td><td>[trending sound / soft music bed at ~10–15%]</td></tr>
      <tr><td><b>Caption</b></td><td>[mirror the hook, &lt;100 chars]</td></tr>
      <tr><td><b>Hashtags</b></td><td>[3–5: mix broad + niche + brand]</td></tr>
      <tr><td><b>Do NOT say</b></td><td>[compliance red-lines for this product — see Vault 03]</td></tr>
      </table>
      <div class="card"><p style="margin:0" class="small"><b>Format pairing:</b> pick a proven format to match the hook —
      Reaction, Emotional close, Before &amp; After, Reveal story, Authority reaction, Comparison, Morning routine,
      Explainer, or Unboxing. Put at least one Reaction and one Emotional-close in every batch.</p></div>
      {foot()}</section>"""

# ---- COMPLIANCE CHECKLIST ----
def compliance_page():
    return f"""<section class="page"><p class="kick">Vault 03 · Compliance</p>
      <h2>Pre-flight checklist</h2><div class="divider"></div>
      <p class="lede">Run this on every script — yours and every creator’s — before it ships. One disabled ad costs
      more than a slightly weaker hook ever will.</p>
      <div class="two">
      <div><h4>Kill it if it contains…</h4>
      <ul class="check">
      <li>“Cures / treats / eliminates / shrinks” applied to the product</li>
      <li>A named disease or medical condition</li>
      <li>“FDA approved” (for a supplement)</li>
      <li>“Clinically proven to [outcome]”</li>
      <li>“Guaranteed to work”</li>
      <li>“Replaces [prescription / medical care]” as YOUR claim</li>
      <li>Fear-based CTA (“before it’s too late”)</li>
      </ul></div>
      <div><h4>Ship it when…</h4>
      <ul class="check">
      <li>Claims use “supports / may help / promotes”</li>
      <li>Every outcome is a customer’s quoted experience</li>
      <li>Mechanism is factual (“[ingredient] supports [function]”)</li>
      <li>Authority is “developed with [experts]” not “doctors say”</li>
      <li>Risk-reversal is stated (“90-day guarantee”)</li>
      <li>CTA removes friction (“tap the orange cart”)</li>
      </ul></div></div>
      <h3>Say this, not that</h3>
      <table><tr><th>Tempted to write</th><th>Use instead</th></tr>
      <tr><td>“Shrinks [problem]”</td><td>“Daily [category] wellness support”</td></tr>
      <tr><td>“Cures [condition]”</td><td>“Helps maintain a normal [function]”</td></tr>
      <tr><td>“Will fix your…”</td><td>“May help support…” / “Customers report…”</td></tr>
      <tr><td>“Doctors recommend”</td><td>“Developed with [experts]”</td></tr>
      <tr><td>“Proven to [outcome]”</td><td>“Made for [benefit], the honest way”</td></tr></table>
      <p class="small">General operating guidance from running regulated categories on TikTok Shop — not legal advice.
      Confirm claims for your product and market with qualified counsel or current platform policy.</p>
      {foot()}</section>"""

# ---- DM / OUTREACH SCRIPTS ----
def dm_page():
    scripts=[
     ("First touch — the offer",
      'Hey [name]! Love your [niche] content — the [specific video] one especially. We make [product] and think it’d land with your audience. Want a free sample to try? We do [commission]% commission on anything that sells through your link. No pressure either way 💡'),
     ("Follow-up (48h, no reply)",
      'Hey [name] — floating this back up in case it got buried! Free [product] sample + [commission]% commission if you want to give it a shot. Totally cool if not 🙌'),
     ("Approval + sample shipped",
      'You’re in! Sample is on the way 🚚 I’m attaching a quick brief so the video’s easy to film — just a hook, a few shots, and the caption. Tag the product with the orange cart and you’re set.'),
     ("Brief hand-off line",
      'Here’s your shot-by-shot brief — follow the 5 beats (hook → problem → solution → proof → CTA) and you’ll be golden. Film it in your own voice, that’s what converts.'),
     ("Re-engage a proven seller",
      'Hey [name]! Your last video for us actually SOLD — you clearly get our audience 🙌 We just dropped [new product / restocked]. Want first dibs + a bumped commission for being a top creator?'),
     ("Nudge after sample delivered, no post",
      'Hey [name]! Saw the sample got delivered 🎉 No rush at all — whenever you film, the brief’s in our last message. Ping me if you want a different angle to run with!'),
    ]
    cards="".join(f'<div class="card"><h4>{t}</h4><p style="margin:0">{b}</p></div>' for t,b in scripts)
    return f"""<section class="page"><p class="kick">Vault 04 · Outreach</p>
      <h2>DM &amp; outreach scripts</h2><div class="divider"></div>
      <p class="lede">Keep the top of the funnel wide and the approval gate narrow. Copy, fill the
      <span class="fill">[brackets]</span>, send at volume.</p>
      {cards}{foot()}</section>"""

# ---- CX RESPONSE BANK ----
def cx_page():
    def r(txt):
        n=len(txt)
        return f'<div class="reply"><span class="c">{n}/150</span>{txt}</div>'
    return f"""<section class="page"><p class="kick">Vault 05 · CX</p>
      <h2>Review response bank</h2><div class="divider"></div>
      <p class="lede">Every reply: validate → educate → close. Under 150 characters, no emails, no external links.
      Swap the <span class="fill">[differentiator]</span> for your product’s one-liner.</p>
      <h4>Product confusion (“it’s just a cheaper generic”)</h4>
      {r("Fair take! The difference is [differentiator] — totally different from the generic. Worth another shot? 💙")}
      {r("Quick tip — ours does [differentiator], which the drugstore version can’t. Give it one more try? ✨")}
      <h4>Price concern</h4>
      {r("We hear you! The reason it’s priced this way: [differentiator]. Different tech, different result 💙")}
      {r("Get it — not the cheapest. What you’re paying for is [differentiator]. Not for everyone, and that’s ok ✨")}
      <h4>Didn’t work / usage</h4>
      {r("Sorry it missed! Most folks fix that with [one usage tip]. Want to try that before you give up on it? 💙")}
      <h4>Fit / sizing</h4>
      {r("Thanks for flagging! Fit can vary — try [placement/size tip]. Sometimes that’s the whole difference ✨")}
      <h4>General negative</h4>
      {r("We hear you and appreciate the honesty. Not every product is for everyone — we’re here if you have questions 💙")}
      <h4>Positive — still reply (algorithm loves it)</h4>
      {r("This made our day! 💙 Welcome to the fam — so glad it’s working for you!")}
      {r("YES! 🙌 Thank you for the love — this is exactly why we do it.")}
      <p class="small">Trim filler first (“really / just / totally”), then condense. Shorter reads as more confident.</p>
      {foot()}</section>"""

def cover():
    return f"""<section class="cover"><div class="blob"></div>
      <div class="bl">The Orange Cart Playbook</div>
      <h1>The Vault.</h1>
      <p class="sub">Every system in the playbook, as a plug-and-play swipe file. Copy, fill the brackets, ship.</p>
      <div class="list"><b>Inside:</b> &nbsp;01 Hook Library &nbsp;·&nbsp; 02 Creator Brief &nbsp;·&nbsp;
      03 Compliance Checklist &nbsp;·&nbsp; 04 Outreach Scripts &nbsp;·&nbsp; 05 CX Response Bank
      <br><span class="small" style="color:#9A9086">Spreadsheet tools (calendar · scorecard · forecaster · tracker) ship in the companion workbook.</span></div>
    </section>"""

doc=f"""<!doctype html><html><head><meta charset="utf-8"><title>The Vault — Swipe Files</title>
<style>@page{{size:Letter;margin:0;}}{CSS}</style></head><body>
{cover()}{hook_pages()}{brief_page()}{compliance_page()}{dm_page()}{cx_page()}
</body></html>"""
with open(OUT,"w") as f: f.write(doc)
print("wrote",OUT)
