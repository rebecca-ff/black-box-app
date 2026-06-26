# callsheet.

An AI-powered, dual-ended TikTok Shop affiliate briefing app — **JoinBrands × Noise**.
Brands post campaigns; creators join and get an AI-written, shot-by-shot brief
(hook → shots → caption → hashtags) so they know exactly how to film the video.

One shared campaign pool, two doors:

- **Brand side** — set the deal (commission, sample, collab type, target tier),
  add a compliance guardrail, let Claude write the brief, then **Publish** it to
  the creator feed. See live Joined / Posted counts.
- **Creator side** — browse campaigns that are live, **Join**, open the brief in
  a swipeable shot-list flow (the Noise-style slide UI), **Remix to your voice**,
  request a free sample, and mark it posted.

Flip between the two with the Brand / Creator toggle in the top-right.

---

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4**
- **Anthropic SDK** (`@anthropic-ai/sdk`) — Claude writes the briefs, server-side
- **lucide-react** icons
- Deploys on **Vercel**

Mirrors the proven config from `blk-box-portal` so the build is predictable.

---

## How the AI brief works (and why the key is safe)

Generation runs **server-side only**, at `POST /api/brief`. The route builds the
Timote-framework prompt (Hook → Problem → Solution → Proof → CTA), injects the
campaign's compliance line as a hard rule, calls Claude, and returns the parsed
brief JSON. The browser never sees the Anthropic API key.

`src/app/api/brief/route.ts` → `new Anthropic()` reads `ANTHROPIC_API_KEY` from
the server environment. **Never** add `NEXT_PUBLIC_` to it.

---

## Environment

Copy `.env.example` to `.env.local` and fill in:

```
ANTHROPIC_API_KEY=sk-ant-...
# Supabase (persistence + auth)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # server-only
# TikTok Login Kit + Display API (connect account + live video metrics)
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...             # server-only
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

In Vercel, set the same variables under **Project → Settings → Environment
Variables** (all environments, or at least Production + Preview). Register
`<APP_URL>/api/tiktok/callback` as the redirect URI in your TikTok app, and run
`supabase/tiktok-schema.sql` so the token store + video↔brand links exist.

### Direct TikTok connection (no Cruva)

Creators connect TikTok via real Login Kit OAuth (`/api/tiktok/auth` →
`/api/tiktok/callback`). The callback stores their handle + follower count and
their OAuth tokens **server-side only** (`tiktok_tokens`, RLS with no policies).
The profile then calls `/api/tiktok/videos`, which reads those tokens (refreshing
when expired) and pulls **real-time video metrics — views, likes, comments,
shares — straight from TikTok's Display API**. Creators tag each video to a brand
campaign they joined here, so performance rolls up per brand. Sales/commission
($GMV) remain a separate self-report ledger, since that data isn't in the
Display API.

---

## Deploy (your Cursor → GitHub → Vercel flow)

This folder is a self-contained repo. There's no Node toolchain on the dev
machine, so let Vercel run the build:

1. **Open this folder in Cursor.**
2. **Commit** the initial scaffold (the working tree is already staged-ready;
   `git init` has been run).
3. **Create a GitHub repo** and push (Cursor: *Publish to GitHub*, or
   `git remote add origin <url>` then `git push -u origin main`).
4. **Import the repo in Vercel** → it auto-detects Next.js. Add the
   `ANTHROPIC_API_KEY` env var. Deploy.
5. Every push builds a Preview; merges to `main` ship to Production.

Run locally only if you install Node: `npm install` then `npm run dev`.

---

## Multi-tenant: real brands & creators

When Supabase Auth is configured, **signed-in accounts never see the demo seed
brands**. A brand sees only its own campaigns + product catalog; a creator sees
the live marketplace. The seed portfolio only renders in anonymous demo mode
(no auth).

- **Brand catalog** — each brand sets its name and manages a **products** table
  (its catalog) under the **Products** tab: add/edit/archive products and act on
  incoming sample requests. Products added manually now; the TikTok Shop import
  (next phase) writes into the same table with `source='tiktok_shop'`.
- **Creator shop** — the **Shop** tab lists every brand's active products across
  the platform, with search + brand filters, and a one-tap **Request free
  sample** (writes `sample_requests`, which the brand acts on).
- Run `supabase/catalog-schema.sql` to create `products` + `sample_requests`
  (RLS: brands own their products, creators browse all active products and own
  their requests).

## What's real vs. mocked (MVP honesty)

This is a working front-to-back MVP for the **brief experience**. In anonymous
demo mode the **marketplace state is in-memory** — it resets on refresh:

- Campaigns, joins, posts, and sample requests live in React state (seeded with
  your portfolio: Sovereign Silver, Fifth & Fido, Contour Cube, Skimpies, Arber,
  doust.). Sovereign Silver and doust. ship pre-published so the creator feed
  isn't empty. (Signed-in accounts use Supabase instead — no seed.)
- The affiliate link (`shop.tiktok.com/affiliate/...`) is a placeholder.
- The compliance guardrail is a **soft** prompt rule, not a hard claims filter.

### Natural next steps

1. **Persistence** — Supabase for campaigns / joins / posts / samples and real
   auth, so the two sides share state across devices and sessions (you already
   run this pattern in `blk-box-portal`).
2. **Lock one approved brief per campaign** — generate + approve *before*
   publish, so every creator on a campaign gets the same shot list (instead of a
   fresh generation each open).
3. **Claims-scrub pass** — a second AI/regex check on brief output before it's
   shown, especially for regulated brands (Sovereign Silver, Fifth & Fido).
4. **Real affiliate wiring** — connect joins/posts/links through Cruva +
   TikTok Shop so a "join" is an actual affiliate application and "posted" is an
   attributed video.

---

## Project layout

```
src/
  app/
    layout.tsx          root layout (Inter font, dark canvas)
    globals.css         Tailwind v4 import
    page.tsx            renders the app
    api/brief/route.ts  server-side Claude brief generation
  components/
    callsheet-app.jsx   the whole dual-ended UI (brand + creator)
```
