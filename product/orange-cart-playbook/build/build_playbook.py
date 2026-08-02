# -*- coding: utf-8 -*-
"""
Builds the three editions of THE ORANGE CART PLAYBOOK as print-ready HTML.
A shared "system core" is combined with edition-specific chapters (cover,
promise, the 'Apply it to you' chapter, the 90-day rollout, and the offer).

All proof numbers are ROUNDED/RANGED from a real 6-month TikTok Shop portfolio
(two brands, two unrelated categories). No brand is named; no exact figure is
published. Source figures live in build/PROOF_SOURCE.md.
"""
import os, html

OUT = os.path.join(os.path.dirname(__file__), "..", "editions")
os.makedirs(OUT, exist_ok=True)

# ----------------------------------------------------------------------------
# DESIGN SYSTEM  (system fonts only — renders offline in headless chromium)
# ----------------------------------------------------------------------------
def css(accent, accent_deep, accent_soft):
    return f"""
:root{{
  --ink:#16130F; --paper:#FBF8F3; --muted:#6E655B; --faint:#9A9086;
  --rule:#E7DDCE; --card:#FFFFFF; --shadow:rgba(30,20,10,.06);
  --accent:{accent}; --accent-deep:{accent_deep}; --accent-soft:{accent_soft};
}}
*{{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
html,body{{margin:0;padding:0;background:var(--paper);color:var(--ink);}}
body{{font-family:Georgia,'Times New Roman',serif;font-size:11.2pt;line-height:1.62;}}
.page{{page-break-after:always;position:relative;padding:64px 70px 72px;min-height:9.3in;}}
.page:last-child{{page-break-after:auto;}}
h1,h2,h3,h4,.kick,.display,.num,.lede,.stat,.btn,.tag,th,.cover *{{
  font-family:'Helvetica Neue',Arial,'Segoe UI',sans-serif;}}
.kick{{font-size:8.6pt;letter-spacing:.24em;text-transform:uppercase;font-weight:800;
  color:var(--accent-deep);margin:0 0 14px;}}
h2{{font-size:26pt;line-height:1.06;font-weight:800;letter-spacing:-.02em;margin:0 0 10px;}}
h3{{font-size:14.5pt;font-weight:800;letter-spacing:-.01em;margin:26px 0 8px;}}
h4{{font-size:11pt;font-weight:800;margin:18px 0 6px;text-transform:none;}}
p{{margin:0 0 11px;}}
.lede{{font-size:13pt;line-height:1.5;color:#2C2620;font-weight:600;margin:0 0 16px;}}
strong{{color:var(--ink);font-weight:700;}}
em{{color:var(--accent-deep);font-style:italic;}}
a{{color:var(--accent-deep);}}
.small{{font-size:9.4pt;color:var(--muted);line-height:1.5;}}
.divider{{height:3px;width:54px;background:var(--accent);margin:0 0 22px;border-radius:2px;}}

/* cover */
.cover{{background:var(--ink);color:#F7F1E8;min-height:9.3in;padding:72px 70px;
  page-break-after:always;position:relative;overflow:hidden;}}
.cover .blob{{position:absolute;width:480px;height:480px;border-radius:50%;
  background:radial-gradient(circle at 30% 30%,var(--accent),var(--accent-deep));
  right:-150px;top:-260px;opacity:.92;}}
.cover .blob2{{position:absolute;width:300px;height:300px;border-radius:50%;
  border:2px solid rgba(255,255,255,.14);right:60px;bottom:-90px;}}
.cover .brandline{{font-size:9pt;letter-spacing:.34em;text-transform:uppercase;
  font-weight:800;color:var(--accent);}}
.cover .edtag{{display:inline-block;margin-top:10px;padding:7px 15px;border-radius:999px;
  border:1.5px solid var(--accent);color:#F7F1E8;font-size:8.6pt;font-weight:800;
  letter-spacing:.16em;text-transform:uppercase;}}
.cover h1{{font-size:56pt;line-height:.98;font-weight:800;letter-spacing:-.03em;
  margin:172px 0 0;max-width:8.4in;position:relative;z-index:2;}}
.cover h1 .hl{{color:var(--accent);}}
.cover .sub{{font-family:Georgia,serif;font-size:15pt;line-height:1.45;color:#D9CFC0;
  max-width:6in;margin-top:22px;}}
.cover .foot{{position:absolute;left:70px;bottom:64px;right:70px;display:flex;
  justify-content:space-between;align-items:flex-end;}}
.cover .foot .who{{font-size:10pt;color:#CDBFAC;max-width:5in;}}
.cover .foot .price{{text-align:right;}}
.cover .foot .price .p{{font-size:30pt;font-weight:800;color:#F7F1E8;}}
.cover .foot .price .l{{font-size:8pt;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);font-weight:800;}}

/* cards + data */
.card{{background:var(--card);border:1px solid var(--rule);border-radius:14px;
  padding:22px 24px;margin:16px 0;break-inside:avoid;box-shadow:0 1px 0 var(--shadow);}}
.callout{{background:var(--accent-soft);border:1px solid var(--rule);border-left:4px solid var(--accent);
  border-radius:10px;padding:16px 20px;margin:16px 0;break-inside:avoid;}}
.callout .kick{{margin-bottom:6px;}}
.statgrid{{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:18px 0;}}
.stat{{background:var(--ink);color:#F6F0E6;border-radius:12px;padding:18px 16px;break-inside:avoid;}}
.stat .n{{font-size:27pt;font-weight:800;letter-spacing:-.02em;line-height:1;color:#fff;}}
.stat .n .u{{font-size:14pt;color:var(--accent);}}
.stat .l{{font-size:8.4pt;letter-spacing:.06em;text-transform:uppercase;color:#C9BBA8;
  margin-top:8px;font-weight:700;line-height:1.35;}}
.pull{{font-family:'Helvetica Neue',Arial,sans-serif;font-size:19pt;line-height:1.24;
  font-weight:800;letter-spacing:-.015em;color:var(--ink);margin:26px 0;padding-left:20px;
  border-left:5px solid var(--accent);}}
.pull .hl{{color:var(--accent-deep);}}
table{{width:100%;border-collapse:collapse;margin:14px 0;font-size:10pt;break-inside:avoid;}}
th{{text-align:left;background:var(--ink);color:#F6F0E6;padding:9px 12px;font-size:8.6pt;
  letter-spacing:.06em;text-transform:uppercase;font-weight:800;}}
td{{padding:9px 12px;border-bottom:1px solid var(--rule);vertical-align:top;}}
tr:nth-child(even) td{{background:#F5EFE5;}}
.tag{{display:inline-block;background:var(--accent-soft);color:var(--accent-deep);
  border:1px solid var(--rule);border-radius:999px;padding:3px 11px;font-size:8pt;
  font-weight:800;letter-spacing:.05em;text-transform:uppercase;margin:0 5px 5px 0;}}
ul,ol{{margin:6px 0 12px;padding-left:22px;}}
li{{margin:0 0 6px;}}
.check li{{list-style:none;position:relative;padding-left:26px;margin-bottom:8px;}}
.check li:before{{content:"";position:absolute;left:0;top:2px;width:15px;height:15px;
  border-radius:4px;border:2px solid var(--accent);}}
.steps{{counter-reset:s;list-style:none;padding:0;margin:12px 0;}}
.steps>li{{counter-increment:s;position:relative;padding:2px 0 14px 46px;margin:0;}}
.steps>li:before{{content:counter(s);position:absolute;left:0;top:-2px;width:30px;height:30px;
  background:var(--accent);color:#fff;border-radius:8px;font-family:'Helvetica Neue',Arial,sans-serif;
  font-weight:800;font-size:13pt;display:flex;align-items:center;justify-content:center;}}
.steps>li b{{display:block;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11.5pt;}}
.partcover{{page-break-after:always;padding:64px 70px;min-height:9.3in;
  display:flex;flex-direction:column;justify-content:center;background:var(--paper);}}
.partcover .pnum{{font-family:'Helvetica Neue',Arial,sans-serif;font-size:120pt;font-weight:800;
  color:var(--accent);line-height:.8;letter-spacing:-.04em;opacity:.16;}}
.partcover h2{{font-size:40pt;max-width:8in;margin-top:-30px;}}
.partcover .lede{{max-width:6.4in;font-size:13.5pt;}}
.footer{{position:absolute;left:70px;right:70px;bottom:34px;display:flex;justify-content:space-between;
  font-family:'Helvetica Neue',Arial,sans-serif;font-size:8pt;letter-spacing:.1em;
  text-transform:uppercase;color:var(--faint);border-top:1px solid var(--rule);padding-top:10px;}}
.two{{display:grid;grid-template-columns:1fr 1fr;gap:20px;}}
.toc li{{display:flex;justify-content:space-between;border-bottom:1px dotted var(--rule);
  padding:9px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11pt;}}
.toc li span:first-child{{font-weight:700;}}
.toc .p{{color:var(--accent-deep);font-weight:800;}}
.mini{{font-family:'Helvetica Neue',Arial,sans-serif;font-size:8.4pt;font-weight:800;
  letter-spacing:.12em;text-transform:uppercase;color:var(--faint);}}
"""

# ----------------------------------------------------------------------------
# SHARED CONTENT BLOCKS
# ----------------------------------------------------------------------------
def foot(ed):
    return f'<div class="footer"><span>The Orange Cart Playbook</span><span>{ed}</span></div>'

def partcover(n, title, lede, ed):
    return f"""<section class="partcover"><div class="pnum">{n}</div>
      <h2>{title}</h2><div class="divider"></div><p class="lede">{lede}</p>{foot(ed)}</section>"""

def proof_page(ed):
    return f"""<section class="page">
      <p class="kick">Part 00 · The Proof</p>
      <h2>Two brands. Two unrelated worlds.<br>One system.</h2><div class="divider"></div>
      <p class="lede">This isn't theory pulled from a webinar. Everything in this playbook was run
      across a live TikTok Shop portfolio for six months &mdash; one brand in <strong>wellness</strong>,
      one in <strong>plant care</strong>. Two audiences that share nothing. The same engine drove both.</p>
      <div class="statgrid">
        <div class="stat"><div class="n">$65K<span class="u">+</span></div><div class="l">GMV in 6 months across the two shops</div></div>
        <div class="stat"><div class="n">3.4M<span class="u">+</span></div><div class="l">Organic video views</div></div>
        <div class="stat"><div class="n">~80%</div><div class="l">Of GMV came from affiliate creators &mdash; not the brand's own posts</div></div>
        <div class="stat"><div class="n">2,000<span class="u">+</span></div><div class="l">Creators activated to post</div></div>
        <div class="stat"><div class="n">~3,000</div><div class="l">Product samples shipped to creators</div></div>
        <div class="stat"><div class="n">~$18</div><div class="l">GMV per sample shipped &mdash; in <em>both</em> categories</div></div>
      </div>
      <div class="callout"><p class="kick">The number that proves it's a system, not luck</p>
      <p style="margin:0">Ship a sample, get about <strong>$18 in GMV back</strong>. That figure came out
      nearly identical for a colloidal-silver supplement and a bottle of organic plant spray &mdash; two products
      with zero overlap in buyer, price, or use case. When the same input produces the same output across
      unrelated markets, you're not looking at a lucky video. You're looking at a <strong>repeatable machine</strong>.
      This playbook is that machine.</p></div>
      <p class="small">Figures are rounded from a real 6-month TikTok Shop portfolio. Exact revenue and brand
      identities are withheld by design &mdash; the point isn't the brands, it's that the same numbers show up
      no matter what you sell.</p>
      {foot(ed)}</section>"""

def model_page(ed):
    return f"""{partcover("01","Stop trying to go viral. Build a machine instead.",
        "The single mental shift that separates brands doing $2K/month from brands doing $30K/month on TikTok Shop.", ed)}
    <section class="page">
      <p class="kick">Part 01 · The Model</p>
      <h2>The affiliate-first volume engine</h2><div class="divider"></div>
      <p class="lede">Almost everyone starts TikTok Shop the same wrong way: they try to make <em>one</em>
      video go viral off their own account. Then they wonder why 5,000 views turned into three sales.</p>
      <p>Here is what the data actually says. Across the portfolio, roughly <strong>80% of all GMV came from
      affiliate creators</strong> &mdash; other people posting about the product &mdash; not from the brand's own
      account. And of the thousands of videos those creators posted, only about <strong>6&ndash;11% ever produced a
      single sale.</strong></p>
      <p>Read that twice. <strong>Nine out of ten videos sold nothing.</strong> And it didn't matter, because
      the tenth one paid for all of them. That is the whole game.</p>
      <div class="pull">You don't need a viral video.<br>You need <span class="hl">a hundred at-bats</span> and a system that keeps swinging.</div>
      <h3>The three laws of the engine</h3>
      <div class="card"><h4>Law 1 &mdash; Volume beats brilliance</h4>
      <p style="margin:0">One brand-perfect video is one lottery ticket. Fifty good-enough creator videos are fifty
      tickets, in fifty different feeds, with fifty different audiences. The brand that ships more <em>at-bats</em>
      wins &mdash; not the brand with the best single edit. Your job is not to be a filmmaker. Your job is to run a
      content factory that never stops.</p></div>
      <div class="card"><h4>Law 2 &mdash; Creators are the distribution, samples are the fuel</h4>
      <p style="margin:0">You will never out-post an army of creators from one account. So you don't try. You put
      product in creators' hands and let their audiences do the reach. At ~$18 of GMV per sample shipped, a sample
      isn't a cost &mdash; it's a <strong>media buy with a known return</strong>. That reframes your entire budget.</p></div>
      <div class="card"><h4>Law 3 &mdash; The system is the moat, not the video</h4>
      <p style="margin:0">Any single video can be copied. A repeatable pipeline &mdash; find creators, screen them,
      ship samples, hand them a script that converts, stay compliant, scale the winners &mdash; cannot. Competitors
      see your winning video. They never see the machine behind it. This playbook builds the machine.</p></div>
      <h3>The five gears</h3>
      <p>Every part that follows is one gear in the same engine. Miss one and the machine grinds:</p>
      <table><tr><th>Gear</th><th>What it does</th><th>Covered in</th></tr>
      <tr><td><strong>Content</strong></td><td>A framework that makes any video convert, not just entertain</td><td>Part 02 &amp; 03</td></tr>
      <tr><td><strong>Creators</strong></td><td>Find, screen &amp; fuel the army that distributes it</td><td>Part 04</td></tr>
      <tr><td><strong>Compliance</strong></td><td>Keep the machine from getting shut off</td><td>Part 05</td></tr>
      <tr><td><strong>Production</strong></td><td>Turn scripts into finished videos at volume</td><td>Part 06</td></tr>
      <tr><td><strong>Retention</strong></td><td>Turn buyers &amp; reviewers into repeat GMV</td><td>Part 07</td></tr></table>
      {foot(ed)}</section>"""

def timote_page(ed):
    return f"""{partcover("02","Every video that sells is built the same way.",
        "The 5-part content framework behind the portfolio's best-performing videos &mdash; and the 7 angles that keep the feed fresh.", ed)}
    <section class="page">
      <p class="kick">Part 02 · The Content Engine</p>
      <h2>The 5-part framework<br>behind every selling video</h2><div class="divider"></div>
      <p class="lede">Entertaining videos get views. <em>Structured</em> videos get sales. This is the skeleton
      under every high-converting TikTok Shop video &mdash; a 30-second arc that walks a stranger from
      scroll to cart.</p>
      <table><tr><th style="width:22%">Beat</th><th style="width:16%">Timing</th><th>The job of this beat</th></tr>
      <tr><td><strong>1. Hook</strong></td><td>0&ndash;3s</td><td>Stop the scroll. A pattern interrupt, bold claim, or the viewer's exact pain said out loud. If the hook fails, nothing else matters.</td></tr>
      <tr><td><strong>2. Problem</strong></td><td>3&ndash;8s</td><td>Agitate one real, daily frustration. Use "you." Make them feel seen before you sell anything.</td></tr>
      <tr><td><strong>3. Solution</strong></td><td>8&ndash;15s</td><td>Introduce the product as the natural answer. Show it in action. One or two features &mdash; never a feature dump.</td></tr>
      <tr><td><strong>4. Proof</strong></td><td>15&ndash;22s</td><td>Reviews, before/after, a number, a real result. UGC-authentic beats polished. This is where trust is won.</td></tr>
      <tr><td><strong>5. CTA</strong></td><td>22&ndash;30s</td><td>One clear instruction. "Tap the orange cart." Remove friction. Add honest urgency only if it's real.</td></tr></table>
      <div class="callout"><p class="kick">Why this order and no other</p>
      <p style="margin:0">People buy in a sequence: <strong>attention &rarr; recognition &rarr; belief &rarr; action.</strong>
      Hook earns attention. Problem earns recognition ("that's me"). Solution + Proof earn belief. CTA converts
      belief into action. Skip a beat and you ask for the sale before you've earned it &mdash; which is why most
      videos "get views but no sales." They jumped to the CTA.</p></div>
      <div class="pull">A video with no Proof is a claim.<br>A video with no Problem is <span class="hl">an ad nobody asked for.</span></div>
      {foot(ed)}</section>
    <section class="page">
      <p class="kick">Part 02 · The Content Engine</p>
      <h3>The 7 content pillars &mdash; so you never run the same angle twice</h3>
      <p>The framework is the skeleton. The <strong>pillar</strong> is the angle you approach it from. Rotate
      these so a viewer never sees the same setup two videos in a row &mdash; that's what kills a content account.</p>
      <table><tr><th>Pillar</th><th>What it is</th><th>Best format pairing</th></tr>
      <tr><td><strong>Pain Point</strong></td><td>Lead with the problem the product solves</td><td>Story / talking head</td></tr>
      <tr><td><strong>Demo / Tutorial</strong></td><td>Show the product in use, how-to style</td><td>Screen-close, hands-on</td></tr>
      <tr><td><strong>Social Proof</strong></td><td>Reviews, reactions, testimonials</td><td>Reaction / green-screen</td></tr>
      <tr><td><strong>Lifestyle</strong></td><td>Product woven into a real daily routine</td><td>Morning-routine / vlog</td></tr>
      <tr><td><strong>Trend-Jack</strong></td><td>Adapt a trending sound/format to the product</td><td>Whatever's trending</td></tr>
      <tr><td><strong>Comparison</strong></td><td>Us vs. the old way (never name a competitor)</td><td>Side-by-side / before-after</td></tr>
      <tr><td><strong>Behind the Scenes</strong></td><td>Brand story, sourcing, quality, "every mg on the label"</td><td>Founder / factory</td></tr></table>
      <h3>The weekly rotation</h3>
      <p>Don't decide what to post each day &mdash; that's how consistency dies. Assign the pillar in advance and
      only decide the <em>execution</em>:</p>
      <table><tr><th>Day</th><th>Pillar</th><th>Day</th><th>Pillar</th></tr>
      <tr><td>Monday</td><td>Pain Point</td><td>Friday</td><td>Lifestyle</td></tr>
      <tr><td>Tuesday</td><td>Demo / Tutorial</td><td>Saturday</td><td>Comparison</td></tr>
      <tr><td>Wednesday</td><td>Social Proof</td><td>Sunday</td><td>Behind the Scenes</td></tr>
      <tr><td>Thursday</td><td>Trend-Jack</td><td colspan="2" style="color:var(--muted)">(The Vault ships this as a fill-in calendar.)</td></tr></table>
      <h3>Voice rules that separate "converts" from "cringe"</h3>
      <ul>
      <li><strong>Write how people talk, not how brands write.</strong> If it sounds like a commercial, rewrite it.</li>
      <li><strong>You-copy, not we-copy.</strong> Count "you/your" vs "we/our" before shipping. Aim 3-to-1 for <em>you</em>.</li>
      <li><strong>Be specific, kill "amazing."</strong> "Golf-ball to grape in four weeks" beats "amazing results" every time.</li>
      <li><strong>One emotion per video.</strong> Fear, hope, or surprise &mdash; pick one. Three at once dilutes all three.</li>
      <li><strong>The hero is the customer.</strong> If a line makes the brand the star, rewrite it. You're the guide, not the hero.</li>
      </ul>
      {foot(ed)}</section>"""

def hooklab_page(ed):
    return f"""{partcover("03","The first two seconds are the whole job.",
        "How to write hooks that stop the scroll &mdash; the patterns, the formats, and the view benchmarks behind them.", ed)}
    <section class="page">
      <p class="kick">Part 03 · The Hook Lab</p>
      <h2>Hooks: the 2 seconds that<br>decide everything</h2><div class="divider"></div>
      <p class="lede">If the hook fails, the perfect script behind it is never seen. This is the highest-leverage
      copywriting you will ever do &mdash; and it follows patterns you can reuse forever.</p>
      <h3>The proven hook patterns</h3>
      <p>These structures tested best across the portfolio and the wider category. Don't copy the words &mdash;
      copy the <em>shape</em>, then fill it with your product's pain and payoff.</p>
      <table><tr><th>Pattern</th><th>The shape</th><th>Example skeleton</th></tr>
      <tr><td><strong>Problem &rarr; Solution</strong></td><td>State the pain, promise a reveal</td><td>"My [X] had [problem] for months. I tried this and here's what happened&hellip;"</td></tr>
      <tr><td><strong>POV Empathy</strong></td><td>Put them in the moment of relief</td><td>"POV: you finally find something that actually works for [problem]."</td></tr>
      <tr><td><strong>Time-stamped update</strong></td><td>Specificity = credibility</td><td>"120-day update. Honest results."</td></tr>
      <tr><td><strong>Loss aversion / FOMO</strong></td><td>Warn before they waste money</td><td>"If you have [problem], watch this before spending on [expensive alternative]."</td></tr>
      <tr><td><strong>Audience call-out</strong></td><td>Name the exact person</td><td>"[Specific person] &mdash; you NEED to know about this."</td></tr>
      <tr><td><strong>Skeptic-to-believer</strong></td><td>Earn trust by admitting doubt</td><td>"I almost didn't buy this. I was wrong."</td></tr>
      <tr><td><strong>Daily-routine reveal</strong></td><td>Curiosity gap on a habit</td><td>"I add one of these every morning. This is what changed."</td></tr></table>
      <div class="callout"><p class="kick">Hook-writing rules</p>
      <ul style="margin:0">
      <li><strong>Curiosity <u>or</u> specificity &mdash; not both.</strong> "120 days later" is specificity. "What I do every morning" is curiosity. One per hook.</li>
      <li><strong>Avoid superlatives.</strong> "Best," "miracle," "revolutionary" trigger both ad rejection and viewer skepticism.</li>
      <li><strong>Read it out loud.</strong> If it sounds like an ad, rewrite. If it sounds like a friend texting you, ship it.</li>
      </ul></div>
      {foot(ed)}</section>
    <section class="page">
      <p class="kick">Part 03 · The Hook Lab</p>
      <h3>Pair the hook with the right format</h3>
      <p>A hook is only half a video. The <strong>format</strong> is the visual structure it lives in. These are
      the formats that consistently drove the most reach in-category &mdash; use the view range as a rough signal of
      which structures the algorithm rewards, then pick the one that fits your hook.</p>
      <table><tr><th>Format</th><th>Best for</th><th>Reach signal*</th></tr>
      <tr><td><strong>Reaction</strong></td><td>Social proof, delight, "watch this happen"</td><td>Very high</td></tr>
      <tr><td><strong>Emotional close</strong></td><td>Personal story, stakes that matter</td><td>Very high</td></tr>
      <tr><td><strong>Before &amp; After</strong></td><td>Problem &rarr; solution, transformation</td><td>High</td></tr>
      <tr><td><strong>The "reveal" story</strong></td><td>The moment everything changed</td><td>High</td></tr>
      <tr><td><strong>Authority reaction</strong></td><td>Expert / pro weighs in</td><td>High</td></tr>
      <tr><td><strong>Comparison (old way vs new)</strong></td><td>Problem &rarr; solution</td><td>Medium-high</td></tr>
      <tr><td><strong>Morning routine</strong></td><td>Lifestyle, habit, daily use</td><td>Medium-high</td></tr>
      <tr><td><strong>Educational explainer</strong></td><td>How it works, the mechanism</td><td>Medium</td></tr>
      <tr><td><strong>Unboxing + review</strong></td><td>First impressions, trust</td><td>Medium</td></tr></table>
      <p class="small">*Directional, from real in-category performance. Your mileage varies by niche &mdash; treat this
      as "where to place your bets first," then let your own data re-rank it. The two highest-reach formats
      (Reaction and Emotional close) should appear in every batch you produce at least once.</p>
      <h3>The customer-language method &mdash; where hooks actually come from</h3>
      <p>The best hooks aren't invented. They're <strong>mined.</strong> Your customers already say the words that
      convert &mdash; in reviews, in support tickets, in the comments. Your job is to steal them.</p>
      <ol class="steps">
      <li><b>Harvest the exact phrases.</b> Pull direct language from reviews, DMs, and comments. Keep the grammar imperfect &mdash; "he's not himself anymore" converts; "reduced vitality" does not.</li>
      <li><b>Sort into Pain vs. Payoff.</b> Pain phrases open hooks and Problem beats. Payoff phrases power Proof beats (in testimonial form &mdash; see Part 05).</li>
      <li><b>Map to awareness stage.</b> A "problem-aware" viewer needs their pain named. A "most-aware" viewer just needs the price and the cart. Match the hook to where they are.</li>
      <li><b>Feed winners back in.</b> Every week, the hook that won becomes the seed for next week's variations. The library compounds.</li>
      </ol>
      <div class="callout"><p class="kick">The 5 awareness stages &mdash; meet them where they are</p>
      <p style="margin:0"><strong>Unaware</strong> (educate) &rarr; <strong>Problem-aware</strong> (name the pain) &rarr;
      <strong>Solution-aware</strong> (position your category) &rarr; <strong>Product-aware</strong> (why yours) &rarr;
      <strong>Most-aware</strong> (offer + remove friction). Most TikTok Shop videos should target Problem-aware or
      Solution-aware &mdash; that's where the volume is.</p></div>
      {foot(ed)}</section>"""

def affiliate_page(ed):
    return f"""{partcover("04","This is the part almost nobody runs. It's 80% of the money.",
        "The affiliate creator engine: find them, screen them, fuel them with samples, and forecast the return before you spend a dollar.", ed)}
    <section class="page">
      <p class="kick">Part 04 · The Affiliate Engine &nbsp;·&nbsp; the growth driver</p>
      <h2>The funnel that turns<br>samples into GMV</h2><div class="divider"></div>
      <p class="lede">Content is the product. <strong>Creators are the distribution.</strong> This is the machine
      that recruits an army to post for you &mdash; and the reason ~80% of the portfolio's GMV existed at all.</p>
      <h3>The five-stage creator funnel</h3>
      <p>Every affiliate dollar flows through the same pipe. Know your numbers at each stage and you can forecast
      revenue like a factory forecasts output.</p>
      <table><tr><th>Stage</th><th>The action</th><th>The lever</th></tr>
      <tr><td><strong>1. Reach out</strong></td><td>DM creators at volume with the offer</td><td>Volume + a clear, honest offer</td></tr>
      <tr><td><strong>2. Sample request</strong></td><td>Interested creators request free product</td><td>Offer clarity; commission rate</td></tr>
      <tr><td><strong>3. Screen &amp; approve</strong></td><td>You approve the right ones only</td><td><strong>This is the profit lever</strong></td></tr>
      <tr><td><strong>4. Deliver &amp; brief</strong></td><td>Ship the sample + hand them a script</td><td>The brief (Parts 02&ndash;03)</td></tr>
      <tr><td><strong>5. Post &amp; sell</strong></td><td>They post; a fraction drive sales</td><td>Volume &times; brief quality</td></tr></table>
      <div class="callout"><p class="kick">Screening is where the money is made or lost</p>
      <p style="margin:0">Across the portfolio, only <strong>7&ndash;30% of sample requests got approved.</strong> That
      range is not indecision &mdash; it's the single biggest cost lever you control. Every sample you ship to a
      wrong-fit creator is money and product burned for a video their audience won't buy from. Approve like the
      product is coming out of your own pocket &mdash; because it is.</p></div>
      <div class="pull">A sample isn't a giveaway.<br>It's a <span class="hl">$18 media buy</span> &mdash; but only if you screen who gets one.</div>
      {foot(ed)}</section>
    <section class="page">
      <p class="kick">Part 04 · The Affiliate Engine</p>
      <h3>The screening scorecard</h3>
      <p>Before you approve a creator, run them through this. It's the exact logic that keeps the ~$18-per-sample
      return healthy. (The Vault ships this as a scored spreadsheet.)</p>
      <table><tr><th>Check</th><th>Approve if&hellip;</th><th>Reject if&hellip;</th></tr>
      <tr><td><strong>Category fit</strong></td><td>Their niche overlaps your buyer</td><td>Zero topical overlap</td></tr>
      <tr><td><strong>Real human</strong></td><td>A real person appears on camera</td><td>Faceless / AI / product-only</td></tr>
      <tr><td><strong>Content style</strong></td><td>Authentic, varied, talks to camera</td><td>Only "SALE 50% OFF" reposts</td></tr>
      <tr><td><strong>Audience match</strong></td><td>Followers look like your customer</td><td>Wrong age/gender/geo entirely</td></tr>
      <tr><td><strong>Track record (GMV)</strong></td><td>Meets your tier threshold</td><td>Below threshold <em>and</em> weak fit</td></tr></table>
      <div class="callout"><p class="kick">The tiered rule that scales</p>
      <p style="margin:0">Set a GMV threshold, then tier it: <strong>above the threshold</strong>, approve any real
      human (proven sellers earn a shot). <strong>Below it</strong>, approve only on strong category + audience fit.
      This lets you say yes to volume without shipping product to people who'll never move a unit.</p></div>
      <h3>Forecast before you spend</h3>
      <p>Because ~$18 GMV/sample held across two unrelated categories, you can budget like an operator instead of
      gambling:</p>
      <div class="card"><p style="margin:0 0 8px"><span class="mini">The formula</span></p>
      <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13pt;font-weight:800;letter-spacing:-.01em">
      Samples shipped &times; GMV-per-sample = forecast GMV</p>
      <p style="margin:10px 0 0" class="small">Ship 200 well-screened samples at a conservative $15&ndash;18/sample
      &rarr; <strong>~$3,000&ndash;3,600 in forecast GMV</strong> from that cohort. Track your <em>own</em> ratio for
      a month, then replace $18 with your real number and the forecast gets sharper every cycle. This one formula
      turns "I hope this works" into a plan you can fund.</p></div>
      <h3>Outreach at volume</h3>
      <p>The top of the funnel is a numbers game &mdash; the portfolio sent <strong>hundreds of thousands of creator
      DMs</strong> to fill it. You don't do that by hand; you do it with tooling (TikTok Shop's affiliate tools,
      Cruva-style outreach platforms, automations). The principle: <strong>keep the top of the funnel wide, keep
      the approval gate narrow.</strong> Wide top = enough at-bats. Narrow gate = healthy return per sample.</p>
      {foot(ed)}</section>"""

def compliance_page(ed):
    return f"""{partcover("05","One disabled ad can cost more than a weak hook ever will.",
        "The claims framework that keeps regulated products (supplements, health, beauty) selling without getting pulled.", ed)}
    <section class="page">
      <p class="kick">Part 05 · Compliance &amp; Trust</p>
      <h2>How to make bold claims<br>without getting shut off</h2><div class="divider"></div>
      <p class="lede">Compliance failures are the #1 reason TikTok and Meta disable creative &mdash; and the #1
      silent killer of a TikTok Shop brand. The fix isn't to be boring. It's to know exactly where the line is.</p>
      <h3>The dividing line</h3>
      <p>Your <strong>brand voice</strong> stays in <em>structure-function</em> and <em>wellness-support</em> language.
      Any outcome-heavy, transformation language belongs in <strong>customer-testimonial form only</strong> &mdash;
      and clearly framed as the customer's experience, not your claim.</p>
      <div class="two">
        <div class="card"><h4 style="color:var(--accent-deep)">&#10003;&nbsp; You MAY say (brand voice)</h4>
        <ul style="margin:0">
        <li>"Supports&hellip;" / "may help&hellip;" / "promotes&hellip;"</li>
        <li>"Many customers report&hellip;"</li>
        <li>Ingredient + mechanism ("beta-glucans support natural immune defenses")</li>
        <li>"Developed with [experts]" / "[X]-approved formula"</li>
        <li>Materials, sourcing, "every mg on the label"</li>
        <li>Guarantees &amp; risk-reversal ("90-day money-back")</li>
        </ul></div>
        <div class="card"><h4 style="color:#B3261E">&#10007;&nbsp; Never say (as your claim)</h4>
        <ul style="margin:0">
        <li>"Cures / treats / eliminates / shrinks"</li>
        <li>Named diseases or conditions</li>
        <li>"Clinically proven to [outcome]"</li>
        <li>"FDA approved" (for a supplement)</li>
        <li>"Guaranteed to work"</li>
        <li>Replacing a prescription or medical care</li>
        </ul></div>
      </div>
      <div class="callout"><p class="kick">The testimonial escape hatch</p>
      <p style="margin:0">Your brand is in the structure-function lane. Your <strong>customers are not.</strong>
      Outcome language <em>is</em> allowed when it's unmistakably a customer's lived experience &mdash; "Six weeks
      in, she said his lump went from golf-ball to grape" &mdash; not the brand asserting it. The tell: could a
      skeptical regulator read it as <em>you</em> making a medical claim? If yes, reframe it as <em>them</em>
      saying it, or cut it.</p></div>
      {foot(ed)}</section>
    <section class="page">
      <p class="kick">Part 05 · Compliance &amp; Trust</p>
      <h3>Say this, not that</h3>
      <table><tr><th>Tempted to write</th><th>Use instead</th></tr>
      <tr><td>"Shrinks [problem]"</td><td>"Daily [category] wellness support"</td></tr>
      <tr><td>"Cures [condition]"</td><td>"Helps maintain a normal [function]"</td></tr>
      <tr><td>"Will fix your&hellip;"</td><td>"May help support&hellip;" / "Customers report&hellip;"</td></tr>
      <tr><td>"Doctors recommend"</td><td>"Developed with [experts]" / "[X]-approved"</td></tr>
      <tr><td>"Proven to [outcome]"</td><td>"Made for [the benefit], the honest way"</td></tr>
      <tr><td>"Order now or [fear]"</td><td>"Try it risk-free with our guarantee"</td></tr></table>
      <h3>The pre-flight checklist</h3>
      <p>Run this on every script &mdash; yours and every creator's &mdash; before it ships. (Vault includes it as a
      one-page printable.)</p>
      <ul class="check">
      <li>No "cures / treats / eliminates / shrinks" applied to the product</li>
      <li>No named diseases or medical conditions</li>
      <li>No "FDA approved" or "clinically proven to [outcome]"</li>
      <li>No prescription-replacement claim in brand voice (testimonial framing only)</li>
      <li>Every outcome claim is in customer-quote form, attributed to the customer</li>
      <li>No "guaranteed to work" &mdash; only "may help" / "customers report"</li>
      <li>CTA is friction-removing, not fear-based ("tap the orange cart," not "before it's too late")</li>
      </ul>
      <div class="pull">A slightly weaker hook that <span class="hl">runs</span><br>beats a stronger hook that gets <span class="hl">pulled.</span></div>
      <p class="small">This is general operating guidance from running regulated categories on TikTok Shop &mdash;
      not legal advice. For your specific product and market, confirm claims with qualified counsel or your
      platform's current policy.</p>
      {foot(ed)}</section>"""

def production_page(ed):
    return f"""{partcover("06","From a script on a page to a finished video &mdash; in an afternoon.",
        "The exact tool pipeline that turns 10 scripts into 10 TikTok-ready videos, plus the ad logic that scales the winners.", ed)}
    <section class="page">
      <p class="kick">Part 06 · The Production Line</p>
      <h2>The 5-stage content factory</h2><div class="divider"></div>
      <p class="lede">Volume only works if producing a video is cheap and fast. This is the assembly line that makes
      a full batch of 10 videos a half-day of work &mdash; and far less once you build the muscle.</p>
      <ol class="steps">
      <li><b>Script &mdash; AI-assisted (≈3 min)</b> Generate a batch of 10 scripts on the framework (Hook &rarr; Problem &rarr; Solution &rarr; Proof &rarr; CTA), each on a different pillar. Skim, fix the weak one, move on.</li>
      <li><b>Visuals &mdash; AI image gen (≈30&ndash;45 min)</b> Turn each script into a thumbnail + B-roll stills. The look you want is "my friend's iPhone camera roll," not a magazine spread. Regenerate anything that looks like an ad.</li>
      <li><b>Avatars &mdash; AI UGC video (≈15&ndash;25 min)</b> Feed each script to an AI-avatar tool (or film real creators) for the talking-head. Vertical 9:16. Generate two takes with different avatars &mdash; they test as different creative.</li>
      <li><b>Edit &amp; caption &mdash; CapCut (≈15 min/video)</b> Avatar on the main track, B-roll stills on top, bold word-by-word captions, a soft music bed at ~10&ndash;15% volume, thumbnail as the cover. Save the first as a template &mdash; every next video is drag-and-drop.</li>
      <li><b>Post &mdash; TikTok Shop / ads (≈10 min)</b> Tag the product, mirror the hook in the caption, 3&ndash;5 hashtags, post 1&ndash;2/day rotating the angle. Or run them as Spark Ads.</li>
      </ol>
      <div class="callout"><p class="kick">The whole pipeline, one line</p>
      <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700">
      Script &rarr; Images &rarr; Avatar video &rarr; CapCut edit &rarr; TikTok Shop / Ads &rarr; live</p></div>
      {foot(ed)}</section>
    <section class="page">
      <p class="kick">Part 06 · The Production Line</p>
      <h3>The scale-the-winner ad logic</h3>
      <p>Volume gets you at-bats. This is how you find the home run and pour money on it &mdash; the same 90%-fail
      math from Part 01, run on purpose with a budget:</p>
      <ol class="steps">
      <li><b>Launch wide.</b> Run all 10 creatives in parallel for 5&ndash;7 days at a small daily budget each ($20&ndash;30). You're buying data, not scale yet.</li>
      <li><b>Kill the bottom half.</b> After the test window, cut the worst 50% without sentiment. They already did their job &mdash; they told you what doesn't work.</li>
      <li><b>Double the top third.</b> Increase budget on the best 30%. These are your proven at-bats &mdash; now you scale the ones the market already voted for.</li>
      <li><b>Feed winners back into scripting.</b> The winning hook/angle becomes the seed for next week's batch. The system compounds &mdash; every cycle starts smarter than the last.</li>
      </ol>
      <h3>The realistic weekly cadence</h3>
      <table><tr><th>Day</th><th>Action</th></tr>
      <tr><td>Mon AM</td><td>Generate 10 scripts</td></tr>
      <tr><td>Mon PM</td><td>Images + avatar videos (mostly queue-and-wait)</td></tr>
      <tr><td>Tue</td><td>Edit pass in CapCut &rarr; upload / launch ads</td></tr>
      <tr><td>Wed&ndash;Fri</td><td>Watch metrics, kill losers, scale winners</td></tr>
      <tr><td>Fri PM</td><td>Note which hooks won &rarr; seed next week</td></tr></table>
      <p>That's <strong>10 fresh creatives every week</strong> from one person &mdash; the volume the engine runs on.</p>
      {foot(ed)}</section>"""

def cx_page(ed):
    return f"""{partcover("07","The sale isn't the finish line. The review is.",
        "The response system that turns reviews, confusion, and even complaints into trust, retention, and repeat GMV.", ed)}
    <section class="page">
      <p class="kick">Part 07 · CX &amp; Reviews</p>
      <h2>Turn every review into<br>social proof</h2><div class="divider"></div>
      <p class="lede">On TikTok Shop, your review replies are public &mdash; and future buyers read them. A great
      reply to a bad review sells more than the review costs you. Here's the system, built for the platform's
      constraints.</p>
      <h3>The 4-move reply formula</h3>
      <ol class="steps">
      <li><b>Validate first.</b> "We hear you." / "Fair feedback." Never defensive. You earn the right to educate by acknowledging first.</li>
      <li><b>Educate gently.</b> Correct the misunderstanding without "you're using it wrong." Lead with the one differentiator that resolves it.</li>
      <li><b>Close with grace.</b> "Not every product is for everyone." / "We're here if you have questions." Leave the door open.</li>
      <li><b>Stay in the limit.</b> Public comments are capped (~150 characters on TikTok Shop). No emails, no external links &mdash; they're not allowed and they get filtered.</li>
      </ol>
      <div class="callout"><p class="kick">The constraint that shapes everything</p>
      <p style="margin:0">~150 characters, no email addresses, no "contact us at&hellip;" links. So every reply is
      tight by necessity. Trim filler first ("really," "just," "totally"), condense the rest. Shorter almost always
      reads as more confident.</p></div>
      {foot(ed)}</section>
    <section class="page">
      <p class="kick">Part 07 · CX &amp; Reviews</p>
      <h3>The scenario playbook</h3>
      <p>Most negative reviews are one of five things. Pre-decide the move for each &mdash; then you're never
      writing from scratch or from emotion. (Vault ships a full response bank.)</p>
      <table><tr><th>Scenario</th><th>What they think</th><th>Your move</th></tr>
      <tr><td><strong>Product confusion</strong></td><td>"It's just a cheaper [generic]"</td><td>Validate &rarr; name the one differentiator &rarr; invite a retry</td></tr>
      <tr><td><strong>Price concern</strong></td><td>"Too expensive"</td><td>Acknowledge &rarr; reframe on value/tech, not price</td></tr>
      <tr><td><strong>Didn't work / usage</strong></td><td>"It failed"</td><td>Empathize &rarr; the one usage tip that fixes it</td></tr>
      <tr><td><strong>Fit / sizing</strong></td><td>"Wrong for me"</td><td>Apologize &rarr; placement/fit guidance</td></tr>
      <tr><td><strong>General negative</strong></td><td>Just didn't like it</td><td>Validate &rarr; thank for trying &rarr; graceful close</td></tr></table>
      <h3>Positive reviews still get a reply</h3>
      <p>A fast, warm reply to a happy customer isn't just manners &mdash; engagement signals feed the algorithm,
      and the next shopper sees a brand that shows up. Keep it short: "This made our day &mdash; welcome to the fam."</p>
      <div class="pull">A complaint is a customer<br>giving you <span class="hl">one more chance</span> in public.</div>
      {foot(ed)}</section>"""

def vault_index_page(ed, emphasis):
    badge = '<span class="tag">Start here</span>'
    rows = "".join(f"<tr><td><strong>{n}</strong></td><td>{d}</td><td>{badge if n in emphasis else ''}</td></tr>" for n,d in [
        ("Weekly Content Calendar","The 7-pillar rotation as a fill-in planner &mdash; assign angles a week ahead so consistency runs on rails."),
        ("Hook Library &amp; Patterns","50+ plug-in hook skeletons sorted by pattern and awareness stage. Swipe the shape, fill your product in."),
        ("Shot-by-Shot Brief Template","The one-page brief you hand a creator so their video is built on the framework &mdash; hook, shots, caption, hashtags."),
        ("Affiliate Creator Scorecard","The screening rubric as a scored sheet &mdash; category, human, style, audience, GMV &rarr; approve / reject."),
        ("Sample &rarr; Sale Forecaster","Enter samples &amp; your GMV-per-sample; it forecasts GMV and cost per acquisition so you fund the engine, not a guess."),
        ("Campaign Tracker","One row per creator/campaign: sample &rarr; posted &rarr; views &rarr; GMV. See what's actually working."),
        ("Compliance Pre-Flight Checklist","The printable claims checklist. Run it on every script before it ships."),
        ("DM &amp; Outreach Scripts","Copy-paste creator outreach + follow-ups that fill the top of the funnel."),
        ("CX Review Response Bank","Ready replies for every review scenario, all under the character limit."),
    ])
    return f"""<section class="page">
      <p class="kick">The Vault · Included Templates</p>
      <h2>Nine plug-and-play tools</h2><div class="divider"></div>
      <p class="lede">The playbook is the thinking. <strong>The Vault is the doing.</strong> Every system in these
      pages ships as a template you can use today &mdash; no building from scratch.</p>
      <table><tr><th style="width:30%">Template</th><th>What it does</th><th style="width:16%">For you</th></tr>{rows}</table>
      <p class="small">Delivered as two files: a spreadsheet workbook (calendar, scorecard, forecaster, tracker)
      and a swipe-file document (hooks, brief, checklist, DM scripts, response bank).</p>
      {foot(ed)}</section>"""

# ----------------------------------------------------------------------------
# EDITION-SPECIFIC CONTENT
# ----------------------------------------------------------------------------
def cover(ed):
    return f"""<section class="cover"><div class="blob"></div><div class="blob2"></div>
      <div class="brandline">The Orange Cart Playbook</div>
      <div><span class="edtag">{ed['tag']}</span></div>
      <h1>{ed['h1']}</h1>
      <p class="sub">{ed['sub']}</p>
      <div class="foot"><div class="who">{ed['who']}</div>
      <div class="price"><div class="l">Edition value</div><div class="p">{ed['price']}</div></div></div>
    </section>"""

def promise_toc(ed):
    toc = "".join(f'<li><span>{t}</span><span class="p">{p}</span></li>' for t,p in [
        ("00 &nbsp; The Proof &mdash; two brands, one system","· real"),
        ("01 &nbsp; The Model &mdash; the volume engine","· mindset"),
        ("02 &nbsp; The Content Engine &mdash; the framework","· copy"),
        ("03 &nbsp; The Hook Lab &mdash; stop the scroll","· copy"),
        ("04 &nbsp; The Affiliate Engine &mdash; 80% of the money","· growth"),
        ("05 &nbsp; Compliance &amp; Trust &mdash; don't get pulled","· safety"),
        ("06 &nbsp; The Production Line &mdash; the factory","· ops"),
        ("07 &nbsp; CX &amp; Reviews &mdash; retention","· ops"),
        (f"08 &nbsp; {ed['apply_title']}","· you"),
        ("09 &nbsp; Your First 90 Days","· plan"),
        ("+ &nbsp; The Vault &mdash; 9 plug-and-play templates","· tools"),
    ])
    return f"""<section class="page">
      <p class="kick">Read this first</p>
      <h2>{ed['promise_h']}</h2><div class="divider"></div>
      <p class="lede">{ed['promise_lede']}</p>
      {ed['promise_body']}
      <div class="callout"><p class="kick">Who this edition is for</p><p style="margin:0">{ed['who_long']}</p></div>
      </section>
    <section class="page"><p class="kick">Contents</p><h2>What's inside</h2><div class="divider"></div>
      <ul class="toc" style="list-style:none;padding:0;margin:8px 0 0">{toc}</ul>{foot(ed['tag'])}</section>"""

def rollout_page(ed):
    return f"""{partcover("09","A plan, not a pep talk.",
        ed['rollout_lede'], ed['tag'])}
    <section class="page">
      <p class="kick">Part 09 · Your First 90 Days</p>
      <h2>{ed['rollout_h']}</h2><div class="divider"></div>
      {ed['rollout_body']}
      <div class="pull">The brands that win aren't the most creative.<br>They're the ones that <span class="hl">kept the machine running.</span></div>
      {foot(ed['tag'])}</section>"""

def apply_page(ed):
    return f"""{partcover("08", ed['apply_cover_h'], ed['apply_cover_lede'], ed['tag'])}
    <section class="page">
      <p class="kick">Part 08 · {ed['apply_title']}</p>
      <h2>{ed['apply_h']}</h2><div class="divider"></div>
      {ed['apply_body']}
      {foot(ed['tag'])}</section>"""

def close_page(ed):
    return f"""<section class="page">
      <p class="kick">The bottom line</p>
      <h2>{ed['close_h']}</h2><div class="divider"></div>
      <p class="lede">{ed['close_lede']}</p>
      {ed['close_body']}
      <div class="callout"><p class="kick">License</p><p style="margin:0" class="small">Single-buyer license.
      Use it to run your own shops and clients. Don't resell, repackage, or redistribute the files. The systems are
      yours to use forever; the document is yours to keep, not to sell.</p></div>
      <p style="margin-top:26px;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:13pt">
      Now go tap the orange cart. &#128999;</p>
      {foot(ed['tag'])}</section>"""

# ----------------------------------------------------------------------------
EDITIONS = {}

# ---- BRAND / FOUNDER ----
EDITIONS['brand'] = dict(
  tag="Brand &amp; Founder Edition", price="$197",
  accent="#FF5A1F", accent_deep="#B23A0E", accent_soft="#FDEEE4",
  h1='You own the <span class="hl">product.</span><br>Now build the <span class="hl">machine.</span>',
  sub="The affiliate-first system that took two brands in two unrelated categories to $65K+ in six months on TikTok Shop &mdash; with 80% of it driven by creators, not the founder's own account.",
  who="For founders &amp; brand owners who have a product on TikTok Shop and want a repeatable GMV engine.",
  who_long="You have a product live (or nearly) on TikTok Shop. You've maybe posted from the brand account and watched it flatline. This edition hands you the exact engine that made creators &mdash; not you &mdash; the growth driver, and shows you how to fund it like a media buy with a known return.",
  promise_h="You don't have a content problem.<br>You have a system problem.",
  promise_lede="Most brands treat TikTok Shop like a megaphone: post, hope, repeat. The brands that scale treat it like a factory &mdash; a repeatable line that recruits creators, ships samples with a known return, and hands every one of them a script that converts.",
  promise_body="""<p>This edition is written for the person who signs the invoices. Every system here is framed around
  the two questions a founder actually asks: <strong>what does it cost, and what does it return?</strong> The
  headline answer &mdash; roughly <strong>$18 of GMV per sample shipped</strong>, holding across two unrelated
  categories &mdash; is what lets you stop guessing and start budgeting.</p>
  <p>Read Parts 00&ndash;07 for the full engine. Then Part 08 makes it <em>your</em> product's engine, and Part 09
  is a 90-day plan you can hand to a VA tomorrow.</p>""",
  apply_title="Apply It To Your Brand",
  apply_cover_h="Your product. Your margins. Your engine.",
  apply_cover_lede="How to wire the system to your specific product, price, and sample budget &mdash; and the founder decisions only you can make.",
  apply_h="Making it your brand's engine",
  apply_body="""<h3>Set your commission so creators actually post</h3>
  <p>Creators choose which brands to work based on commission and conversion. Too low and your samples sit unused;
  too high and the math breaks. Anchor it against your gross margin, not a vibe: if ~$18 GMV comes back per sample,
  your commission + product cost + shipping on that sample has to leave room underneath. Model it in the Sample
  &rarr; Sale Forecaster before you set the rate.</p>
  <h3>Turn your sample budget into a media budget</h3>
  <p>This is the founder unlock. Stop calling samples "marketing cost" and start calling them <strong>inventory
  deployed at a known return.</strong> Decide how much GMV you want this quarter, divide by your GMV-per-sample,
  and that's how many well-screened samples you need to ship. Fund <em>that</em> number.</p>
  <div class="callout"><p class="kick">Founder math worked example</p>
  <p style="margin:0">Goal: $15,000 GMV this quarter. At a conservative $15/sample &rarr; ~1,000 samples to ship &amp;
  brief. If your all-in cost per sample (product + ship + commission share) is under ~$6, the cohort is
  contribution-positive before a single repeat purchase. Now it's an operations problem, not a hope.</p></div>
  <h3>Build the roster you own</h3>
  <p>Your affiliate roster is a brand asset that compounds. Every creator who posts and sells once is a warm node
  for the next launch. Track them (Vault: Campaign Tracker), re-engage your sellers first, and protect the
  ~$18 return by keeping the screening gate narrow (Part 04). A big roster of wrong-fit creators is a liability;
  a screened roster of proven sellers is a moat.</p>
  <h3>The founder's four levers</h3>
  <table><tr><th>Lever</th><th>Turn it when&hellip;</th></tr>
  <tr><td><strong>Commission rate</strong></td><td>Samples go unclaimed &rarr; raise it; margin is thin &rarr; tighten screening instead</td></tr>
  <tr><td><strong>Sample volume</strong></td><td>You want more GMV and the return holds &rarr; ship more</td></tr>
  <tr><td><strong>Screening strictness</strong></td><td>GMV-per-sample drops &rarr; tighten; samples unused by good creators &rarr; loosen slightly</td></tr>
  <tr><td><strong>Brief quality</strong></td><td>Videos post but don't sell &rarr; the script, not the creator, is usually the problem</td></tr></table>""",
  rollout_lede="A 90-day operator's plan to stand up the engine on your product &mdash; from first samples to a self-running weekly cadence.",
  rollout_h="Your first 90 days as a brand",
  rollout_body="""<h4>Days 1&ndash;30 &mdash; Stand up the line</h4>
  <ul><li>Open the affiliate program; set commission using the Forecaster.</li>
  <li>Produce your first batch of 10 scripts (Parts 02&ndash;03) and one finished brief.</li>
  <li>Start outreach; begin screening with the Scorecard. Ship your first ~50&ndash;100 samples to fit creators only.</li>
  <li>Set your compliance checklist as a hard gate on every script.</li></ul>
  <h4>Days 31&ndash;60 &mdash; Find your real number</h4>
  <ul><li>Track sample &rarr; posted &rarr; GMV. Compute <em>your</em> GMV-per-sample and cost per sale.</li>
  <li>Kill wrong-fit creator segments; double down on the categories that convert.</li>
  <li>Run your first paid test: 10 creatives, small budget, kill bottom half, scale top third.</li></ul>
  <h4>Days 61&ndash;90 &mdash; Make it a machine</h4>
  <ul><li>Lock the weekly cadence (Part 06) and hand the repeatable parts to a VA.</li>
  <li>Re-engage your proven sellers for a second push / new SKU.</li>
  <li>Replace every "$18" assumption with your own tracked number and re-forecast next quarter's sample budget.</li></ul>""",
  close_h="A product is a bet. A system is a business.",
  close_lede="You can keep buying lottery tickets one video at a time &mdash; or you can run the factory that makes the odds work for you.",
  close_body="""<p>Everything in these pages was earned on live shops, real samples, and real GMV. The proof that it's
  a system and not a fluke is the boring part: the same ~$18-per-sample return showed up whether the product was a
  wellness supplement or a plant spray. That's the whole promise &mdash; <strong>it travels to your product too.</strong></p>
  <p>Start with Part 04 and the Forecaster. Ship your first hundred screened samples. Watch the number. Then fund
  more of what works.</p>""",
)

# ---- CREATOR ----
EDITIONS['creator'] = dict(
  tag="Creator Edition", price="$47",
  accent="#FE2C55", accent_deep="#C4123B", accent_soft="#FDE7EC",
  h1='Get the <span class="hl">samples.</span><br>Post the <span class="hl">winners.</span><br>Get <span class="hl">paid.</span>',
  sub="The affiliate creator's playbook for TikTok Shop &mdash; how to get approved for free product, pick products that actually sell, and turn commission into real income.",
  who="For UGC &amp; affiliate creators who want to make money posting for brands on TikTok Shop.",
  who_long="You want to get paid to post &mdash; free product plus commission. This edition flips the whole system around to <em>your</em> side of the table: how brands decide who gets a sample, how to pick products that convert (so you actually earn), and how to build a posting habit that compounds into income.",
  promise_h="Brands are handing out free product<br>and commission. Here's how to get yours.",
  promise_lede="Every brand in this playbook is desperate for one thing: creators who post and sell. That's you. But brands ship samples to a fraction of the creators who ask &mdash; and pay real money only to the ones whose videos convert. This edition gets you into both groups.",
  promise_body="""<p>Here's the secret most creators never learn: <strong>you don't get paid for views. You get paid
  for sales.</strong> A video with 800 views that sells five units earns more than a "viral" one that sells zero.
  Once you understand what the brand is actually buying, you stop chasing the algorithm and start chasing the cart.</p>
  <p>Parts 00&ndash;07 show you the exact machine brands run &mdash; which means you'll know precisely what they
  want from you. Part 08 is your creator business. Part 09 is your first 90 days to real commission.</p>""",
  apply_title="Apply It To Your Creator Business",
  apply_cover_h="Your face. Your feed. Your income.",
  apply_cover_lede="How to get approved for samples, pick winning products, and turn the framework into commission &mdash; the creator's side of the whole system.",
  apply_h="Building your creator income",
  apply_body="""<h3>How to actually get approved for samples</h3>
  <p>Brands screen every request (Part 04) &mdash; only a fraction get a yes. Now you know the rubric, so pass it
  on purpose:</p>
  <ul class="check">
  <li><strong>Be a real human on camera.</strong> Faceless and product-only accounts get rejected first. Show your face.</li>
  <li><strong>Match the niche.</strong> Request products that fit what you already post. A skincare creator requesting garden spray is an instant no.</li>
  <li><strong>Show varied, authentic content.</strong> Not just "SALE 50% OFF" reposts &mdash; talk to the camera, tell stories.</li>
  <li><strong>Have <em>a</em> track record.</strong> Even a little GMV or steady posting beats a blank profile. Start posting before you start requesting.</li></ul>
  <h3>Pick products that pay you</h3>
  <p>You earn on sales, so pick for conversion, not for freebies. A good affiliate product has: a clear problem it
  solves, obvious before/after or demo potential, real reviews to point to, and a commission that's worth your time.
  If you can't imagine the Proof beat (Part 02), skip it &mdash; it won't convert and you won't earn.</p>
  <h3>Use the framework the brands use</h3>
  <p>Every script you post should run the 5 beats (Hook &rarr; Problem &rarr; Solution &rarr; Proof &rarr; CTA) and
  hit the orange-cart CTA. You have the same Hook Lab (Part 03) the brands do &mdash; the difference is you can move
  faster and post more. Volume is your superpower: the same "90% of videos sell nothing" math means your job is
  <strong>at-bats</strong>, not perfection.</p>
  <div class="callout"><p class="kick">The creator's flywheel</p>
  <p style="margin:0">Post more &rarr; find your winning angle &rarr; more sales &rarr; brands see your GMV &rarr;
  better brands approve you &rarr; higher commission &rarr; repeat. Your GMV number is your résumé. Every sale makes
  the next sample easier to get.</p></div>
  <h3>Stay compliant so your videos don't get pulled</h3>
  <p>If you post regulated products (supplements, beauty, health), Part 05 protects <em>you</em> too. Keep outcome
  claims in "here's my experience" form, never "this cures X." A pulled video earns nothing &mdash; and repeat
  violations cost you the account you're building.</p>""",
  rollout_lede="A 90-day plan to go from zero to consistent commission &mdash; sample by sample, post by post.",
  rollout_h="Your first 90 days as a creator",
  rollout_body="""<h4>Days 1&ndash;30 &mdash; Get in the game</h4>
  <ul><li>Pick your niche &amp; post 3&ndash;5 videos on the framework <em>before</em> requesting samples &mdash; build the profile that gets approved.</li>
  <li>Request samples only from brands that fit your niche. Use the approval checklist above.</li>
  <li>Post your first sampled products using the Hook Lab. Tag the product every time.</li></ul>
  <h4>Days 31&ndash;60 &mdash; Find your winner</h4>
  <ul><li>Post volume. Track which hook/format actually sells (not just views).</li>
  <li>Double down on your winning angle &amp; the product categories that convert for your audience.</li>
  <li>Screenshot your GMV &mdash; it's your pitch to better brands.</li></ul>
  <h4>Days 61&ndash;90 &mdash; Turn it into income</h4>
  <ul><li>Lead with your GMV to get approved by higher-commission brands.</li>
  <li>Build a repeatable batch routine (Part 06) so posting daily isn't a grind.</li>
  <li>Reinvest: better lighting, a second angle, more products in your winning category.</li></ul>""",
  close_h="Views feel good. Commission pays rent.",
  close_lede="The creators who win on TikTok Shop aren't the most talented &mdash; they're the ones who understood the machine and kept swinging.",
  close_body="""<p>You just learned the exact system the brands are running &mdash; which means you know what they're
  buying before you ever hit record. Get approved on purpose. Pick products that convert. Post volume on the
  framework. Let your GMV number open bigger doors.</p>
  <p>Start posting this week. Your first sale is closer than you think.</p>""",
)

# ---- AGENCY ----
EDITIONS['agency'] = dict(
  tag="Agency &amp; Operator Edition", price="$497",
  accent="#0E7C6B", accent_deep="#0A5A4E", accent_soft="#E3F3EF",
  h1='Run it once.<br>Run it for <span class="hl">every client.</span>',
  sub="The operator's system for managing TikTok Shop affiliate programs at scale &mdash; the SOPs, roles, cadence, and reporting behind a portfolio that hit $65K+ GMV across unrelated categories in six months.",
  who="For agencies &amp; operators running TikTok Shop for clients &mdash; or building a portfolio of shops.",
  who_long="You run shops for other people (or several of your own). Your product isn't a video &mdash; it's a <em>repeatable operation</em> you can deploy on any client, in any category, and staff without you in every seat. This edition is the operating system: SOPs, roles, cadence, and the reporting that renews retainers.",
  promise_h="The system already proved<br>it's category-independent.<br>That's your entire business model.",
  promise_lede="The single most valuable fact in this playbook, for you: the same engine returned ~$18 GMV per sample for a wellness brand and a plant-care brand &mdash; unrelated buyers, unrelated products, near-identical output. That's proof the operation travels. Which means you can sell it to any client and deliver.",
  promise_body="""<p>An agency's moat is not creativity &mdash; it's <strong>a system that produces predictable output
  regardless of who's holding the camera.</strong> This edition takes the full engine (Parts 00&ndash;07) and turns
  it into something you can run across a portfolio: documented SOPs, defined roles with measurable scorecards, a
  weekly operating cadence, and client reporting that makes the value undeniable at renewal.</p>
  <p>Part 08 is how you productize and price it. Part 09 is how you onboard a new client shop in 90 days without
  reinventing anything.</p>""",
  apply_title="Apply It Across Client Shops",
  apply_cover_h="Systematize it. Staff it. Sell it.",
  apply_cover_lede="How to turn the engine into a productized service &mdash; roles, SOPs, cadence, reporting, and pricing that scales past your own hours.",
  apply_h="Running the engine as an operation",
  apply_body="""<h3>Define the seats before you fill them</h3>
  <p>The engine has distinct jobs. Documenting them as measurable roles &mdash; not vague "content person" &mdash;
  is what lets you scale past yourself and hold quality across clients. A lightweight scorecard per seat:</p>
  <table><tr><th>Seat</th><th>Owns</th><th>Measured weekly by</th></tr>
  <tr><td><strong>Content Lead</strong></td><td>Scripts, hook library, briefs</td><td># scripts shipped; winning-hook hit rate</td></tr>
  <tr><td><strong>Creator Manager</strong></td><td>Outreach, screening, samples</td><td>Samples shipped; approval rate; GMV/sample</td></tr>
  <tr><td><strong>Producer / Editor</strong></td><td>Video assembly at volume</td><td># finished creatives/week</td></tr>
  <tr><td><strong>Compliance / QA</strong></td><td>Pre-flight on every script</td><td>Violations shipped (target: zero)</td></tr>
  <tr><td><strong>Account Lead</strong></td><td>Client reporting &amp; strategy</td><td>GMV trend; retention; renewal</td></tr></table>
  <h3>The SOP stack</h3>
  <p>Every Vault template maps to a repeatable procedure. That mapping <em>is</em> your delivery system &mdash;
  hand a new hire the template and the SOP and the output is consistent whether it's your best operator or your
  newest:</p>
  <ul><li><strong>Content SOP</strong> &rarr; Framework + Hook Library + weekly calendar.</li>
  <li><strong>Creator SOP</strong> &rarr; Outreach scripts + Scorecard + sample workflow.</li>
  <li><strong>Compliance SOP</strong> &rarr; Pre-flight checklist as a hard gate.</li>
  <li><strong>Reporting SOP</strong> &rarr; Campaign Tracker + Forecaster &rarr; the weekly client update.</li></ul>
  <h3>Price it on outcomes you can forecast</h3>
  <p>Because GMV-per-sample is knowable, you can price with confidence instead of guessing. Three models that work:</p>
  <table><tr><th>Model</th><th>Best when</th><th>The pitch</th></tr>
  <tr><td><strong>Retainer</strong></td><td>Ongoing engine management</td><td>"We run the machine every week: X creatives, Y samples, full reporting."</td></tr>
  <tr><td><strong>Retainer + %</strong></td><td>Client wants aligned incentives</td><td>Base covers ops; % of attributed GMV shares the upside.</td></tr>
  <tr><td><strong>Performance / affiliate-managed</strong></td><td>You trust the category &amp; your system</td><td>Lower base, bigger % &mdash; you're betting on the ~$18 you can forecast.</td></tr></table>
  <div class="callout"><p class="kick">Reporting that renews retainers</p>
  <p style="margin:0">Clients don't renew on activity &mdash; they renew on <strong>a number going up they understand.</strong>
  Every week, show: samples shipped, GMV-per-sample trend, top creators, and next week's forecast from the Forecaster.
  When the client can see the input/output relationship, the retainer defends itself.</p></div>""",
  rollout_lede="A 90-day playbook to onboard a new client shop and get the engine producing &mdash; without rebuilding anything.",
  rollout_h="Onboarding a client shop in 90 days",
  rollout_body="""<h4>Days 1&ndash;30 &mdash; Install the system</h4>
  <ul><li>Audit the client's shop, margins, and compliance surface. Set the sample budget with the Forecaster.</li>
  <li>Deploy the SOP stack &amp; Vault templates onto this client. Assign seats.</li>
  <li>Ship the first batch + first ~100 screened samples. Set compliance as a hard gate from day one.</li></ul>
  <h4>Days 31&ndash;60 &mdash; Calibrate to the client's number</h4>
  <ul><li>Establish <em>this client's</em> GMV-per-sample &amp; approval rate. Re-forecast on real data.</li>
  <li>Tighten screening to protect the return; scale the creator segments that convert.</li>
  <li>Deliver the first monthly report &mdash; input, output, trend, forecast.</li></ul>
  <h4>Days 61&ndash;90 &mdash; Make it renew itself</h4>
  <ul><li>Lock the weekly cadence &amp; hand repeatable seats to your team.</li>
  <li>Show the GMV trend line at the renewal conversation. Present next quarter's forecast.</li>
  <li>Template the whole onboarding so client #2 takes half the time.</li></ul>""",
  close_h="Anyone can run one shop. You can run the system.",
  close_lede="Your clients are buying a video. What you're actually selling &mdash; the thing that renews &mdash; is a machine that produces GMV in any category, staffed by anyone, measured every week.",
  close_body="""<p>The proof is category-independence: same engine, same ~$18-per-sample return, two markets that share
  nothing. That single fact is your entire sales deck &mdash; it means you can walk into any category and deliver.</p>
  <p>Install the SOP stack. Assign the seats. Report the number. Then do it again for the next client.</p>""",
)

# ----------------------------------------------------------------------------
VAULT_EMPHASIS = {
  'brand': {"Sample &rarr; Sale Forecaster","Affiliate Creator Scorecard","Campaign Tracker"},
  'creator': {"Hook Library &amp; Patterns","Weekly Content Calendar","CX Review Response Bank"},
  'agency': {"Campaign Tracker","Compliance Pre-Flight Checklist","Sample &rarr; Sale Forecaster"},
}

def build(edkey):
    ed = EDITIONS[edkey]
    style = css(ed['accent'], ed['accent_deep'], ed['accent_soft'])
    body = "".join([
      cover(ed), promise_toc(ed),
      proof_page(ed['tag']), model_page(ed['tag']), timote_page(ed['tag']),
      hooklab_page(ed['tag']), affiliate_page(ed['tag']), compliance_page(ed['tag']),
      production_page(ed['tag']), cx_page(ed['tag']),
      apply_page(ed), rollout_page(ed),
      vault_index_page(ed['tag'], VAULT_EMPHASIS[edkey]),
      close_page(ed),
    ])
    doc = f"""<!doctype html><html><head><meta charset="utf-8">
    <title>The Orange Cart Playbook &mdash; {ed['tag']}</title>
    <style>@page{{size:Letter;margin:0;}}{style}</style></head><body>{body}</body></html>"""
    path = os.path.join(OUT, f"orange-cart-playbook-{edkey}.html")
    with open(path, "w") as f:
        f.write(doc)
    return path

if __name__ == "__main__":
    for k in ("brand","creator","agency"):
        p = build(k)
        print("wrote", p)
