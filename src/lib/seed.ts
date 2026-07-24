// Starter brands seeded once into an empty DB by /api/campaigns.
// Fixed UUIDs make the seed idempotent: a PK conflict on re-run = no duplicates,
// which is the fix for the runaway client-side seeding. Server-only.

const SOV_BRIEF = {
  concept: "POV: the thing I take before anyone in the house gets sick",
  shots: [
    { title: "Shot 1", action: "Film yourself mid morning-routine, holding the bottle, slightly unbothered.", onscreen: "my 'don't get sick' insurance", note: "Casual, not salesy" },
    { title: "Shot 2", action: "Talk to camera: when the season turns, your routine matters more than your panic.", onscreen: "", note: "Low energy, conversational" },
    { title: "Shot 3", action: "Show the dropper, take it, set the bottle down. Simple.", onscreen: "10 drops, done", note: "" },
    { title: "Shot 4", action: "Hold the bottle to camera and tap the yellow basket.", onscreen: "it's on my shop", note: "Point at the product link" },
  ],
  caption: "my 'don't get sick' insurance",
  postDescription: "Adding this to the morning lineup before the season turns.\nNot a cure for anything — just how I keep my routine boring.",
  hashtags: ["#wellnessroutine", "#immunesupport", "#tiktokshopfinds", "#morningritual", "#dailywellness"],
};

const SOV_COPPER_BRIEF = {
  concept: "POV: my first greys sent me down a copper rabbit hole a friend started",
  shots: [
    { title: "Shot 1 — Hook", action: "Talk straight to camera, casual: \"So I just started noticing my first few grey hairs… And I remember hearing that if I pluck one, like five more grow back in its place — so now I'm scared to even touch it.\"", onscreen: "so I just found my first greys…", note: "Deadpan, no product yet, just you and the mirror energy" },
    { title: "Shot 2 — Problem", action: "\"But then… to actually get my hair done? That's $150, $200 every few weeks. Forever. I can't.\"", onscreen: "$200 every few weeks. forever??", note: "Let the number land — this is the pain point" },
    { title: "Shot 3 — Bridge", action: "\"So I was talking to my friends about it, and one of them told me to start taking a copper supplement? And I'm like — copper? For grey hair? But she explained it: copper's a mineral your body uses to make melanin. The pigment that actually gives your hair its color. And most of us are barely getting any.\"", onscreen: "copper… for grey hair??", note: "This is the 'wait, what?' turn — say it like you're still surprised" },
    { title: "Shot 4 — Solution", action: "Pick up the bottle: \"So I looked it up and found this — Sovereign Copper. It's a bio-active copper the brand makes for hair, skin, and nails. Two ingredients, super absorbable, just a few drops a day.\"", onscreen: "Sovereign Copper — hair, skin & nails", note: "Show the dropper, keep it matter-of-fact" },
    { title: "Shot 5 — Proof / compliance", action: "\"Now, I'm not saying it's gonna un-grey my hair. I'm just done ignoring my body and finally giving it the copper it's supposed to have.\"", onscreen: "not un-greying anything. just feeding my body.", note: "Say this line word-for-word — it's the safety line. No before/after, no reversal claim." },
    { title: "Shot 6 — CTA", action: "\"It's on the TikTok shop right now — tap the orange cart. And seriously, go look up what copper does. That's the rabbit hole my friend sent me down.\"", onscreen: "tap the orange cart 🛒", note: "Point at the product link, send them down the rabbit hole" },
  ],
  caption: "copper? for grey hair? okay I looked it up",
  postDescription: "found out copper is the mineral your body uses to make hair pigment.\nnot un-greying anything — just done ignoring my body.\nit's on my shop, tap the orange cart.",
  hashtags: ["#greyhair", "#copper", "#hairskinnails", "#melanin", "#tiktokshopfinds", "#wellnesstok"],
};

const DOUST_BRIEF = {
  concept: "POV: you switched to one ingredient and your shelf got quieter",
  shots: [
    { title: "Shot 1", action: "Film the jar in soft light, scoop a little, rub it between your fingers.", onscreen: "one ingredient. that's it.", note: "Slow, tactile" },
    { title: "Shot 2", action: "To camera: I stopped counting the words on my labels.", onscreen: "", note: "Dry delivery" },
    { title: "Shot 3", action: "Apply to the back of your hand, show the finish.", onscreen: "skin feels fed, not coated", note: "Show texture, not claims" },
    { title: "Shot 4", action: "Hold the jar and tap the basket.", onscreen: "on my shop", note: "" },
  ],
  caption: "one ingredient. that's it.",
  postDescription: "Whipped tallow. That's the whole label.\nMy skincare routine is mostly just this now.",
  hashtags: ["#tallow", "#slowbeauty", "#minimalskincare", "#tiktokshop", "#skinbarrier"],
};

export const SEED_ROWS = [
  { id: "00000000-0000-4000-8000-000000000001", name: "Sovereign Silver", product: "Bio-Active Silver Hydrosol", category: "Wellness", commission: 18, sample: true, collab: "Open", tier: "Micro", color: "#3B82F6", ink: "#091633", vibe: "Calm, editorial, science-forward", compliance: "No antimicrobial / kill / cure language. Daily wellness + immune support framing only.", status: "Live", brief: SOV_BRIEF },
  { id: "00000000-0000-4000-8000-000000000007", name: "Sovereign Copper", product: "Bio-Active Copper Hydrosol", category: "Beauty", commission: 18, sample: true, collab: "Open", tier: "Micro", color: "#B87333", ink: "#2A1206", vibe: "Calm, editorial, beauty-from-within, science-forward", compliance: "No claims that it reverses, stops, restores, or cures grey hair. Copper as an essential trace mineral for hair, skin & nails only. Support framing, never treatment or before/after.", status: "Live", brief: SOV_COPPER_BRIEF },
  { id: "00000000-0000-4000-8000-000000000002", name: "doust.", product: "Whipped Tallow Balm", category: "Beauty", commission: 30, sample: true, collab: "Open", tier: "Nano", color: "#C46B3E", ink: "#2A1108", vibe: "Slow beauty, ingredient-forward, dry wit", compliance: "No acne / eczema treatment claims. Skin-feel and ritual framing only.", status: "Live", brief: DOUST_BRIEF },
  { id: "00000000-0000-4000-8000-000000000003", name: "Fifth & Fido", product: "Turkey Tail+ Chews", category: "Pet", commission: 25, sample: true, collab: "Targeted", tier: "Micro", color: "#E8A23D", ink: "#2E2006", vibe: "Warm, senior-dog love, founder voice", compliance: "No disease, lump, or cancer claims. Immune + senior vitality support only.", status: "Draft", brief: null },
  { id: "00000000-0000-4000-8000-000000000004", name: "Contour Cube", product: "Facial Ice Mold", category: "Beauty", commission: 20, sample: true, collab: "Open", tier: "Nano", color: "#67D3E0", ink: "#04262E", vibe: "Clean, cold-girl, morning routine", compliance: "It is an ice mold, never an ice roller. No medical skin claims.", status: "Draft", brief: null },
  { id: "00000000-0000-4000-8000-000000000005", name: "Skimpies", product: "The Original Leggings Liner", category: "Apparel", commission: 22, sample: true, collab: "Open", tier: "Micro", color: "#FF4D8D", ink: "#33081C", vibe: "Deadpan, relatable, zero shame", compliance: "No hygiene fear-mongering. Light and matter-of-fact.", status: "Draft", brief: null },
  { id: "00000000-0000-4000-8000-000000000006", name: "Arber", product: "Plant Biotic Defense", category: "Garden", commission: 15, sample: false, collab: "Targeted", tier: "Mid", color: "#2FA66B", ink: "#052817", vibe: "Hands-in-soil, calm, real results", compliance: "No pesticide efficacy guarantees. Plant health support framing.", status: "Draft", brief: null },
];
