# Going live: from demo mode to real accounts

If the app shows a **brand/creator toggle, sample brands, and no login or TikTok
connect**, it's running in **anonymous demo mode**. That happens whenever
Supabase Auth isn't configured. The real product — email login/logout, each
brand seeing only its own catalog, the creator marketplace, and TikTok connect —
turns on the moment the env vars below are present.

Nothing here is a code change; it's all configuration.

## 1. Create a Supabase project

1. Go to https://supabase.com → New project (free tier is fine).
2. Project Settings → **API** — copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, keep secret)

## 2. Run the SQL (Supabase → SQL editor)

Run each file in `supabase/` once (safe to re-run):

- `auth-schema.sql` — profiles + connected accounts (required for login)
- `schema.sql`, `campaign-fields-schema.sql`, `multitenancy-schema.sql` — campaigns
- `earnings-schema.sql`, `saved-hooks-schema.sql`, `community-schema.sql`,
  `discovery-schema.sql`, `outreach-schema.sql`, `deals-schema.sql` — features
- `tiktok-schema.sql` — TikTok OAuth tokens + video↔brand links
- `catalog-schema.sql` — product catalog + sample requests

## 3. Set env vars in Vercel

Project → Settings → Environment Variables (Production + Preview):

```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
# TikTok Login Kit + Display API
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

> Make sure `NEXT_PUBLIC_AUTH_ENABLED` is **not** set to `false` — that flag
> forces demo mode even when Supabase is present.

Redeploy after saving.

## 4. TikTok app

In the TikTok for Developers portal, register the redirect URI:

```
<NEXT_PUBLIC_APP_URL>/api/tiktok/callback
```

and request the `user.info.basic`, `user.info.profile`, `user.info.stats`, and
`video.list` scopes. Until the app is approved, the UI degrades gracefully
(manual handle entry still works); once approved, Connect TikTok pulls the real
handle, follower count, and live video metrics.

## What you'll see once configured

- Landing shows the **brand / creator portal picker**, then email sign up / sign in.
- **Sign out** replaces the demo role toggle.
- **No sample brands** — a brand starts empty and builds its own catalog under
  **Products**; a creator browses the live marketplace under **Shop**.
- **Connect TikTok** appears for creators (Profile) and, in the next phase, the
  TikTok Shop seller link appears for brands.
