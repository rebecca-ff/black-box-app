# callsheet — Product Spec & Roadmap

> Working name: **callsheet** (repo `black-box-app`). Status: live at black-box-app-two.vercel.app.
> This doc is the full vision — review and edit freely before we build. Effort = T-shirt size (S/M/L/XL). "Drag" = regulatory/approval friction outside our control.

---

## 1. One-liner

An all-encompassing creator–brand platform: brands **find, reach out to, brief, and pay** high-quality creators; creators **learn, qualify, create, film, upload, and get paid** — with AI-discovered hooks and the winning content amplified as ads.

## 2. The wedge (why this beats Noise)

Noise is **inbound and hands-off**: a brand publishes a *Playbook* (brief), it appears in a separate Noise Creator App, creators self-serve and post, and winning UGC is amplified with a daily ad budget. There is **no creator search, no outreach, no community, and no "grow your own creators."**

callsheet is a **superset** on three axes Noise ignores:
1. **Active discovery + outreach** — find existing high-quality creators and contact them (we already have the data: Cruva + TikTok affiliate).
2. **Grow your own supply** — a Community + Academy that takes an aspiring creator to 1k followers → TikTok affiliate → working your campaigns.
3. **AI hooks + full deal/payout/ads loop in one place** — real top hooks (live), deal terms, payouts, and partnership ads.

## 3. Competitive teardown — Noise (observed 2026-06-24)

- **Playbooks** = creative briefs ("tell creators exactly what to create").
- **Campaigns** wrap playbooks; have a Type (UGC), Platforms, and a **daily budget + spend** → paid amplification of UGC.
- **Creators** = passive roster of creators who already posted; filter by Creator Level + Platform. No search/outreach.
- **Settings:** Branding, Members (team), Billing. Separate **Noise Creator App** for the creator side.
- Model: publish brief → network self-serves → amplify winners as ads.

## 4. Users & model

Two sides, one platform (web + PWA now; native Expo later):
- **Brand / operator** — discover, outreach, brief, set deals, approve, pay, amplify, track.
- **Creator** — learn/qualify, browse campaigns, join, get AI brief, film/edit/upload, link product, track metrics + earnings, hit benchmarks for bonuses.

---

## 5. Feature map (full scope)

### A. Brand side
- **Creator discovery** — search/filter by niche, platform, follower tier, GMV, engagement; powered by Cruva + TikTok affiliate data (port from blk-box-portal).
- **Outreach** — shortlist, message/invite, track status (invited → responded → joined).
- **Campaigns** — product, message, compliance, target tier; wraps the AI brief.
- **AI brief + live hooks** — Timote-structured shot list, seeded with the week's real top hooks (✅ built; Kalopilot daily cache).
- **Deal terms** — commission %, flat fee, bonuses, benchmark rules (e.g. "$X at 100k views").
- **User rights / licensing** — creator grants usage rights for ads (e-sign).
- **Ads** — push winning content to **Meta Partnership Ads** + **TikTok Spark Ads**.
- **Analytics** — joins, posts, views, GMV, ROI, spend, payouts.

### B. Creator side
- **Discover + join** campaigns (✅ built).
- **AI brief + remix to my voice** (✅ built).
- **Film** (✅ built — record-per-shot teleprompter) → **edit + caption-render** (next) → **link product + upload to TikTok** (needs Content Posting API).
- **Metrics + earnings** — views, sales, commission, bonus progress.
- **Benchmarks/bonuses** — hit app benchmarks → unlock payouts/perks.
- **Account linking** — TikTok + Meta OAuth.

### C. Community / Academy (the supply moat)
- **Support** — Q&A/help feed (peer + brand). Option: bridge the existing Sovereign Silver Discord to start.
- **Training** — lessons on going viral / making content / becoming an affiliate; tied to the AI briefs as practice; completion feeds benchmarks.
- **Social** — creator profiles + follow graph + feed.
- **Qualify + enroll** — link TikTok → read follower count → **1,000-follower qualification meter** → at 1k, mark eligible + **deep-link into TikTok's affiliate enrollment** (TikTok owns the actual enrollment; we are the tracker + on-ramp).

### D. Payments
- **Payouts** of commissions + bonuses via **Stripe Connect Express** (creator KYC onboarding, transfers, 1099s).

---

## 6. Already built (Phase 0 ✅)

Dual-ended brief app · AI shot lists (server-side, key safe) · **live top-hooks via Kalopilot daily cache** · in-app filming (teleprompter) · Supabase persistence (campaigns + participations, idempotent 6-brand seed) · new brands join · installable PWA.

## 7. Architecture

- **Now:** Next.js 16 + Tailwind v4 on Vercel; Supabase (Postgres + Auth + Storage); Anthropic (briefs); Kalopilot (hooks). PWA shell.
- **Later:** **Expo/React Native** native app (same Vercel APIs as backend) for the polished film/edit/upload/post experience + stores.
- **Integrations to add:** TikTok Login Kit + Content Posting API + Marketing API (Spark Ads); Meta Facebook Login for Business + Marketing API (Partnership Ads); Stripe Connect; Cruva (creator data).

## 8. The heavy / regulated pieces (plan around these)

| Capability | Needs | Drag |
|---|---|---|
| Payouts (commission/bonus) | Stripe Connect Express, creator KYC, 1099s | **High** — money movement |
| Meta partnership ads | Marketing API + Business verification + Partnership Ads access; creator permission grant | **High** |
| TikTok upload + Spark Ads | Content Posting API (app **audit**) + Spark Ads auth codes | **High** |
| Account linking | TikTok Login Kit + Facebook Login for Business (OAuth, app review) | Medium |
| User rights/licensing | Contract + e-sign layer | Low–Medium |
| 1k follower verification | TikTok account link (reads follower count) | rides on account linking |

> Principle: **everything regulated comes *after* the marketplace proves out.** Don't block a usable product on a months-long API audit.

## 9. Phased roadmap

- **Phase 0 — Core loop** ✅ *(done)*
- **Phase 1 — Community & Academy** · M · drag: none. Profiles, follow graph, support/Q&A feed, training modules, benchmark progress. *Unblocked, compounding supply.* (Optional Discord bridge.)
- **Phase 2 — Discovery + outreach** · L · drag: low. Creator search/filter (Cruva + TikTok affiliate data), shortlist, in-app messaging/invites, status pipeline. *The wedge.*
- **Phase 3 — Deal engine** · M · drag: none. Commission / flat-fee / bonus + benchmark rules on campaigns; offer → accept; rights e-sign stub. Data only, no money yet.
- **Phase 4 — Account linking & metrics** · L · drag: medium. TikTok + Meta OAuth → follower count (1k meter), video/sales metrics → earnings + benchmark tracking.
- **Phase 5 — Payouts** · XL · drag: high. Stripe Connect Express: creator onboarding/KYC, pay commissions + bonuses, 1099s. *Do when there's real GMV.*
- **Phase 6 — Ads** · XL · drag: high. Meta Partnership Ads + TikTok Spark Ads; finalize user-rights licensing.
- **Phase 7 — Creator edit → upload** · L–XL · drag: high (TikTok audit). In-app edit + caption-render (Arcads) → link product → upload via Content Posting API. (v1 fallback: export + share to TikTok.)
- **Phase 8 — Native Expo app** · XL · drag: app-store review + Apple/Google accounts. Once validated on web/PWA.

## 10. Open decisions

1. **Name** — keep "callsheet," or rebrand for the bigger platform?
2. **Creator app** — keep one responsive app for both sides, or a separate creator app (like Noise) eventually?
3. **Community** — build native in-app, or bridge the existing Discord first?
4. **Deal model** — commission-only to start, or commission + flat-fee + bonus from day one?
5. **Auth** — when do we add real brand/creator login (Supabase Auth)? (Currently anonymous device key.) Likely needed at Phase 1 for profiles.

## 11. Risks

- **Supply liquidity** — both discovery and Academy must produce enough active creators before brands see value. Community is the hedge.
- **Approval lead times** — TikTok Content Posting audit, Meta business verification, Stripe onboarding all take weeks; start them early in parallel once committed.
- **Compliance** — regulated brands (Sovereign Silver, Fifth & Fido) need the claims-scrub pass before any AI brief or creator content goes out.
- **Scope** — this is a multi-quarter platform; ship the unblocked, compounding pieces first and keep each phase independently useful.
