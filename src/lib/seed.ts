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
  concept: "POV: nobody told me the mineral my hair color is made from was a thing you could take",
  shots: [
    { title: "Shot 1", action: "Film yourself in the mirror, lifting a section of hair, catching the greys in the light.", onscreen: "nobody told me copper had anything to do with this", note: "Deadpan, in the mirror, no big reveal" },
    { title: "Shot 2", action: "To camera: I was doing everything for my hair except the one mineral it's actually built from.", onscreen: "", note: "Dry, conversational" },
    { title: "Shot 3", action: "Show the copper bottle, take the dropper, set it down. Simple.", onscreen: "copper hydrosol — 10 drops", note: "Support framing, never a fix" },
    { title: "Shot 4", action: "Talk about staying consistent — hair, skin & nails routine for a few weeks.", onscreen: "week 6 of just being consistent", note: "How you feel about the routine, not a before/after" },
    { title: "Shot 5", action: "Hold the bottle to camera and tap the yellow basket.", onscreen: "it's on my shop", note: "Point at the product link" },
  ],
  caption: "nobody told me copper had anything to do with this",
  postDescription: "Adding copper to the hair, skin & nails routine.\nNot a magic fix — just the mineral my hair color is actually made from.",
  hashtags: ["#greyhair", "#hairskinnails", "#coppermineral", "#beautyfromwithin", "#tiktokshopfinds", "#wellnessroutine"],
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
