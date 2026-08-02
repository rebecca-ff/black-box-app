# The Orange Cart Playbook — a sellable TikTok Shop digital product

A complete, ready-to-sell digital product built from a real 6-month TikTok Shop
portfolio (two brands, two unrelated categories). It packages the affiliate-first
GMV system — content framework, hook lab, affiliate/sample engine, compliance,
production pipeline, and CX — into **three tailored editions plus a template Vault**.

All proof is **rounded / ranged** from real data; no brand is named and no exact
figure is published. The source numbers behind every claim live in
`build/PROOF_SOURCE.md` (keep that file out of anything you hand a buyer).

---

## What's in the bundle

| File | What it is | Sell as |
|---|---|---|
| `editions/orange-cart-playbook-brand.pdf` | 37-pg playbook, **Brand & Founder** edition | $197 |
| `editions/orange-cart-playbook-creator.pdf` | 37-pg playbook, **Creator** edition | $47 |
| `editions/orange-cart-playbook-agency.pdf` | 37-pg playbook, **Agency & Operator** edition | $497 |
| `vault/orange-cart-vault-workbook.xlsx` | The Vault — 4 live-formula tools (calendar, scorecard, forecaster, tracker) | included w/ every edition |
| `vault/orange-cart-vault-swipe-files.pdf` | The Vault — 9-pg swipe files (hooks, brief, compliance, DM scripts, CX bank) | included w/ every edition |
| `sales/index.html` | Standalone sales/landing page (self-contained, drop on any host) | your funnel |
| `sales/landing.html` | Same page as an editor-friendly fragment (also published as a Claude Artifact) | — |

Every edition shares the same 8-part system core and differs in: cover & accent
color, an "Apply it to you" chapter, a 90-day rollout, and the offer/price.

## The three editions at a glance

- **Brand & Founder ($197)** — treat samples as a media buy with a known return;
  set commission against margins; build an affiliate roster you own.
- **Creator ($47)** — get approved for samples on purpose; pick products that
  convert; turn your GMV into a résumé for bigger brands.
- **Agency & Operator ($497)** — productize the engine; roles, SOPs & scorecards
  you can staff; reporting that renews the retainer.

## The proof it's built on (rounded)

$65K+ GMV in 6 months · ~80% of it from affiliates · 3.4M+ views · 2,000+ creators
activated · ~3,000 samples shipped · **~$18 GMV per sample in *both* categories** ·
only ~6–11% of videos ever produced a sale (volume, not virality).

The ~$18-per-sample constant across two unrelated categories is the spine of the
whole product: it's the evidence the *system* travels, not a lucky video.

---

## How to sell it

1. Pick a storefront: Stan Store, Gumroad, Whop, Payhip, or a Shopify digital product.
2. Upload the edition PDF(s) + both Vault files as the deliverable(s). You can sell
   the three editions separately or as a "pick your seat" bundle.
3. Use `sales/index.html` as the landing page (or the published Artifact link).
4. Keep `build/PROOF_SOURCE.md` private — it's your internal receipts, not buyer-facing.

## Rebuilding / editing

Everything is generated from source so you can update copy, numbers, or design:

```bash
cd product/orange-cart-playbook
python3 build/build_playbook.py     # -> editions/*.html
python3 build/build_vault_xlsx.py   # -> vault/*.xlsx  (recalcs on open in Excel/Sheets)
python3 build/build_vault_pdf.py    # -> vault/*.html

# HTML -> PDF (headless Chromium)
CHROME=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome | head -1)
for f in editions/*.html vault/*swipe*.html; do
  "$CHROME" --headless --no-sandbox --no-pdf-header-footer \
    --print-to-pdf="${f%.html}.pdf" "$f"
done
```

- Edit playbook copy/design in `build/build_playbook.py` (shared core + per-edition config).
- Edit the swipe files in `build/build_vault_pdf.py`.
- Edit the spreadsheet tools in `build/build_vault_xlsx.py`.
- To refresh the numbers, update `build/PROOF_SOURCE.md` and the rounded values in the builders.

## A note on claims

The compliance material is general operating experience from running regulated
categories on TikTok Shop — **not legal advice**. Confirm claims for your specific
product and market with qualified counsel or current platform policy.
