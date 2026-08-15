import { CATALOG } from "./catalog";

export type ArmourLevel = "Unarmoured" | "Light" | "Medium" | "Heavy";

export type CatalogItemId = (typeof CATALOG)[number]["id"];

export interface ArmourPreset {
  level: ArmourLevel;
  choice: string;
  label: string;
  itemIds: readonly CatalogItemId[];
}

// Sourced from HarnMaster Gold's own "Generic Armour Profiles" appendix (36
// pre-made combos: Unarmoured/Light run A-L, Medium/Heavy run A-F, matching
// the source's own lettering exactly). Full transcription, remap notes, and
// per-item reasoning live at the Obsidian doc:
// notes/TTRPG/99 Research/Harnmaster/Armour Presets.md
//
// Two structural gotchas resolved during transcription -- read before editing:
//
// 1. COVERAGE-CODE REMAP: HMG's own abbreviation legend uses "Tx" for Thorax
// and "Th" for Thighs -- the OPPOSITE of this app's HitLocationCode, where
// "Th" = Thorax and "Tg" = Thigh. Every coverage code below has already been
// remapped (source Tx -> our Th, source Th -> our Tg) during extraction; if
// you're cross-checking against the PDF directly, remember the swap runs
// backwards from what the letters suggest.
//
// 2. MATERIAL SUBSTITUTION: several HMG items use materials this catalog
// doesn't model (Ring, Rawhide, Fur, Kurbul/Kurbul) -- no new ArmourBuild was
// added for them, matching this project's existing precedent of excluding
// data-gap materials (Hide/Coat of Plates/Brigandine/Coat) rather than
// fabricating B/S/P/F/M/C numbers nobody has. Substitutions used throughout:
//   Ring    -> Mail     (same family: flexible metal, historically lighter)
//   Rawhide -> Leather  (same family: cured hide, no rigid processing)
//   Fur     -> Quilted  (HMG's own Basic Materials table already groups
//                        "Quilt/Fur" as one combined material row)
//   Kurbul  -> Splint (rigid limb/torso plates: Vambraces, Rerebraces,
//                        Coudes/Couters, Greaves, Cuirass -- functionally
//                        matches Splint's Rigid-slot forged pieces) or
//                      Leather (soft/semi-rigid wraps with no rigid framing)
// "Ring Half-Helm" specifically maps to the Plate-build "Kettle Hat" rather
// than a Mail item -- a half-helm is a rigid skull cap regardless of what
// covers the rest of the wearer, and this catalog's Mail build has no rigid
// helm shape (only the soft Mail Coif, which is a different garment).
//
// SAME-SLOT LAYERING LIMIT: this catalog's Quilted and Leather builds share
// the "Padding" garment slot (see catalog.ts). Several HMG profiles describe
// a Quilted piece worn *under* a Leather piece at the same body location --
// a real two-layer combo HMG supports that this catalog's single Padding
// slot per mount cannot represent. Where that collision happens, the
// piece listed second in HMG's own inner-to-outer ordering (the outer,
// heavier layer) was kept and the inner one dropped, rather than arbitrarily
// picking one.
//
// COVERAGE APPROXIMATION: this catalog's items don't subdivide the way HMG's
// prose descriptions do (no separate "long" vs "short" cowl, no calf-only
// boot). Each HMG item was matched to the single closest catalog item by
// coverage first, material second -- an exact cover-set match where one
// exists, otherwise the closest reasonable superset. This is a "closest
// achievable combination," not a location-for-location replica; per-profile
// notes on any non-trivial gap live in the Obsidian doc.
export const ARMOUR_PRESETS: readonly ArmourPreset[] = [
  // --- Unarmoured (A-L) ---
  {
    level: "Unarmoured",
    choice: "A",
    label: "A — Cloth Tunic & Foot Swaddle",
    itemIds: ["tunic", "socks-right", "socks-left"],
  },
  {
    level: "Unarmoured",
    choice: "B",
    label: "B — Cloth Tunic & Hose",
    itemIds: ["tunic", "hose", "socks-right", "socks-left"],
  },
  {
    level: "Unarmoured",
    choice: "C",
    label: "C — Cloth Smock with Hood",
    itemIds: ["hood", "tunic", "leather-shoes-right", "leather-shoes-left"],
  },
  {
    level: "Unarmoured",
    choice: "D",
    label: "D — Cloth Robe with Hood",
    itemIds: [
      "hood",
      "tunic",
      "sleeves-right",
      "sleeves-left",
      "chausses-cloth",
      "leather-shoes-right",
      "leather-shoes-left",
    ],
  },
  {
    level: "Unarmoured",
    choice: "E",
    label: "E — Cloth Shirt with Sleeves & Hose",
    itemIds: [
      "shirt",
      "sleeves-right",
      "sleeves-left",
      "hose",
      "leather-shoes-right",
      "leather-shoes-left",
    ],
  },
  {
    level: "Unarmoured",
    choice: "F",
    label: "F — Cloth Shirt & Hose",
    itemIds: ["tunic", "hose", "leather-shoes-right", "leather-shoes-left"],
  },
  {
    level: "Unarmoured",
    choice: "G",
    label: "G — Cloth Tunic with Hood & Hose",
    itemIds: [
      "hood",
      "tunic",
      "hose",
      "leather-shoes-right",
      "leather-shoes-left",
    ],
  },
  {
    level: "Unarmoured",
    choice: "H",
    label: "H — Cloth Smock & Hose",
    itemIds: [
      "hood",
      "tunic",
      "hose",
      "leather-shoes-right",
      "leather-shoes-left",
    ],
  },
  {
    level: "Unarmoured",
    choice: "I",
    label: "I — Cloth Shirt, Leather Vest & Hose",
    itemIds: [
      "shirt",
      "sleeves-right",
      "sleeves-left",
      "leather-jerkin",
      "hose",
      "leather-shoes-right",
      "leather-shoes-left",
    ],
  },
  {
    level: "Unarmoured",
    choice: "J",
    label: "J — Rawhide Tunic & Leggings",
    itemIds: ["leather-coat", "leather-chausses"],
  },
  {
    level: "Unarmoured",
    choice: "K",
    label: "K — Fur Cowl & Mantle, Rawhide Breeches",
    itemIds: ["padded-coif", "gambeson", "leather-leggings"],
  },
  {
    level: "Unarmoured",
    choice: "L",
    label: "L — Rawhide Shirt & Pants",
    itemIds: ["leather-coat", "leather-chausses"],
  },

  // --- Light (A-L) ---
  {
    level: "Light",
    choice: "A",
    label: "A — Leather Hat, Quilt Shirt & Leather Vest",
    itemIds: [
      "leather-cap",
      "leather-jerkin",
      "trousers",
      "leather-shoes-right",
      "leather-shoes-left",
    ],
  },
  {
    level: "Light",
    choice: "B",
    label: "B — Leather Hat & Tunic over Cloth Shirt",
    itemIds: [
      "leather-cap",
      "hood",
      "shirt",
      "sleeves-right",
      "sleeves-left",
      "leather-coat",
      "hose",
      "leather-chausses",
    ],
  },
  {
    level: "Light",
    choice: "C",
    label: "C — Cloth Cowl, Leather Coif & Quilt Vest",
    itemIds: [
      "hood",
      "leather-coif",
      "shirt",
      "sleeves-right",
      "sleeves-left",
      "gambeson",
      "leather-gloves-right",
      "leather-gloves-left",
      "hose",
      "leather-chausses",
    ],
  },
  {
    level: "Light",
    choice: "D",
    label: "D — Leather Hat, Quilted Shirt & Cloth Vest",
    itemIds: [
      "leather-cap",
      "gambeson",
      "vest",
      "arming-hose",
      "leather-shoes-right",
      "leather-shoes-left",
    ],
  },
  {
    level: "Light",
    choice: "E",
    label: "E — Cloth Shirt with Sleeves under Quilt Hauberk",
    itemIds: [
      "cap",
      "shirt",
      "sleeves-right",
      "sleeves-left",
      "aketon",
      "hose",
      "leather-shoes-right",
      "leather-shoes-left",
    ],
  },
  {
    level: "Light",
    choice: "F",
    label: "F — Quilt Shirt, Trousers & Long Cowl",
    itemIds: [
      "padded-coif",
      "aketon",
      "arming-hose",
      "leather-shoes-right",
      "leather-shoes-left",
    ],
  },
  {
    level: "Light",
    choice: "G",
    label: "G — Cloth Mantle & Quilt Smock",
    itemIds: [
      "hood",
      "shirt",
      "sleeves-right",
      "sleeves-left",
      "aketon",
      "hose",
      "leather-shoes-right",
      "leather-shoes-left",
    ],
  },
  {
    level: "Light",
    choice: "H",
    label: "H — Quilt Coif, Plate Half-Helm & Kurbal Vambraces",
    itemIds: [
      "padded-coif",
      "kettle-hat",
      "gambeson",
      "tunic",
      "splint-vambraces-right",
      "splint-vambraces-left",
      "leather-gloves-right",
      "leather-gloves-left",
      "hose",
      "leather-chausses",
    ],
  },
  {
    level: "Light",
    choice: "I",
    label: "I — Ring Half-Helm & Kurbal Ailettes",
    itemIds: [
      "hood",
      "kettle-hat",
      "aketon",
      "tunic",
      "chausses-cloth",
      "splint-spaulders-right",
      "splint-spaulders-left",
      "leather-chausses",
      "splint-greaves-right",
      "splint-greaves-left",
    ],
  },
  {
    level: "Light",
    choice: "J",
    label: "J — Cloth Surcoat, Quilt Gambeson & Leather Vambraces",
    itemIds: [
      "hood",
      "kettle-hat",
      "tunic",
      "chausses-cloth",
      "aketon",
      "splint-vambraces-right",
      "splint-vambraces-left",
      "leather-gloves-right",
      "leather-gloves-left",
      "leather-leggings",
      "leather-shoes-right",
      "leather-shoes-left",
    ],
  },
  {
    level: "Light",
    choice: "K",
    label: "K — Leather Cowl, Coudes & Vambraces",
    itemIds: [
      "leather-coif",
      "shirt",
      "sleeves-right",
      "sleeves-left",
      "leather-coat",
      "splint-couters-right",
      "splint-couters-left",
      "splint-vambraces-right",
      "splint-vambraces-left",
      "leather-gloves-right",
      "leather-gloves-left",
      "hose",
      "leather-chausses",
      "plate-greaves-right",
      "plate-greaves-left",
    ],
  },
  {
    level: "Light",
    choice: "L",
    label: "L — Long Quilt Cowl, Plate Half-Helm & Kurbul Cuirass",
    itemIds: [
      "padded-coif",
      "kettle-hat",
      "gambeson",
      "tunic",
      "chausses-cloth",
      "splint-cuirass",
      "splint-vambraces-right",
      "splint-vambraces-left",
      "leather-gloves-right",
      "leather-gloves-left",
      "arming-hose",
      "leather-shoes-right",
      "leather-shoes-left",
    ],
  },

  // --- Medium (A-F) ---
  {
    level: "Medium",
    choice: "A",
    label: "A — Cloth Cowl, Ring Shirt & Leggings",
    itemIds: [
      "hood",
      "mail-coif",
      "tunic",
      "mail-hauberk",
      "mail-mittens-right",
      "mail-mittens-left",
      "hose",
      "mail-chausses",
    ],
  },
  {
    level: "Medium",
    choice: "B",
    label: "B — Leather & Scale Cowl over Scale Habergeon",
    itemIds: [
      "leather-coif",
      "scale-coif",
      "shirt",
      "sleeves-right",
      "sleeves-left",
      "scale-hauberk",
      "splint-vambraces-right",
      "splint-vambraces-left",
      "hose",
      "leather-shoes-right",
      "leather-shoes-left",
    ],
  },
  {
    level: "Medium",
    choice: "C",
    label: "C — Quilt Cowl, Plate Half-Helm & Mail Habergeon",
    itemIds: [
      "padded-coif",
      "kettle-hat",
      "aketon",
      "mail-hauberk",
      "tunic",
      "chausses-cloth",
      "leather-chausses",
    ],
  },
  {
    level: "Medium",
    choice: "D",
    label: "D — Ring Half-Helm & Scale Hauberk",
    itemIds: [
      "leather-coif",
      "kettle-hat",
      "tunic",
      "scale-hauberk",
      "splint-rerebraces-right",
      "splint-rerebraces-left",
      "splint-vambraces-right",
      "splint-vambraces-left",
      "mail-mittens-right",
      "mail-mittens-left",
      "hose",
      "arming-hose",
      "leather-shoes-right",
      "leather-shoes-left",
    ],
  },
  {
    level: "Medium",
    choice: "E",
    label: "E — Quilt Gambeson under Plate Cuirass",
    itemIds: [
      "padded-coif",
      "kettle-hat",
      "aketon",
      "plate-cuirass",
      "tunic",
      "chausses-cloth",
      "plate-rerebraces-right",
      "plate-rerebraces-left",
      "mail-mittens-right",
      "mail-mittens-left",
      "leather-skirt",
      "leather-chausses",
      "plate-greaves-right",
      "plate-greaves-left",
    ],
  },
  {
    level: "Medium",
    choice: "F",
    label: "F — Scale Cowl over Long Scale Hauberk",
    itemIds: [
      "leather-coif",
      "scale-coif",
      "tunic",
      "chausses-cloth",
      "scale-hauberk",
      "mail-chausses",
    ],
  },

  // --- Heavy (A-F) ---
  {
    level: "Heavy",
    choice: "A",
    label: "A — Quilt Cowl, Plate Half-Helm & Mail Habergeon",
    itemIds: [
      "padded-coif",
      "kettle-hat",
      "gambeson",
      "mail-hauberk",
      "mail-mittens-right",
      "mail-mittens-left",
      "leather-skirt",
      "leather-chausses",
      "mail-chausses",
    ],
  },
  {
    level: "Heavy",
    choice: "B",
    label: "B — Leather & Mail Cowl over Scale Hauberk",
    itemIds: [
      "leather-coif",
      "mail-coif",
      "aketon",
      "scale-hauberk",
      "mail-mittens-right",
      "mail-mittens-left",
      "arming-hose",
      "leather-shoes-right",
      "leather-shoes-left",
    ],
  },
  {
    level: "Heavy",
    choice: "C",
    label: "C — Triple Coif over Mail Hauberk & Plate Ailettes",
    itemIds: [
      "padded-coif",
      "mail-coif",
      "kettle-hat",
      "aketon",
      "mail-hauberk",
      "plate-spaulders-right",
      "plate-spaulders-left",
      "leather-gloves-right",
      "leather-gloves-left",
      "leather-skirt",
      "leather-chausses",
      "mail-chausses",
    ],
  },
  {
    level: "Heavy",
    choice: "D",
    label: "D — Plate Great Helm over Mail Haubergeon",
    itemIds: [
      "padded-coif",
      "great-helm",
      "gambeson",
      "mail-hauberk",
      "plate-spaulders-right",
      "plate-spaulders-left",
      "plate-poleyns-right",
      "plate-poleyns-left",
      "plate-vambraces-right",
      "plate-vambraces-left",
      "mail-mittens-right",
      "mail-mittens-left",
      "arming-hose",
      "mail-chausses",
    ],
  },
  {
    level: "Heavy",
    choice: "E",
    label: "E — Full Plate Pieces over Mail Habergeon",
    itemIds: [
      "padded-coif",
      "mail-coif",
      "aketon",
      "mail-hauberk",
      "great-helm",
      "plate-spaulders-right",
      "plate-spaulders-left",
      "plate-cuirass",
      "plate-rerebraces-right",
      "plate-rerebraces-left",
      "plate-couters-right",
      "plate-couters-left",
      "plate-vambraces-right",
      "plate-vambraces-left",
      "leather-skirt",
      "leather-chausses",
      "mail-chausses",
    ],
  },
  {
    level: "Heavy",
    choice: "F",
    label: "F — Full Plate Harness over Mail & Cloth Surcoat",
    itemIds: [
      "padded-coif",
      "mail-coif",
      "tunic",
      "chausses-cloth",
      "aketon",
      "arming-hose",
      "mail-hauberk",
      "mail-chausses",
      "great-helm",
      "plate-spaulders-right",
      "plate-spaulders-left",
      "plate-cuirass",
      "plate-rerebraces-right",
      "plate-rerebraces-left",
      "plate-couters-right",
      "plate-couters-left",
      "plate-vambraces-right",
      "plate-vambraces-left",
      "plate-poleyns-right",
      "plate-poleyns-left",
      "plate-greaves-right",
      "plate-greaves-left",
    ],
  },
];

export function presetsForLevel(level: ArmourLevel): readonly ArmourPreset[] {
  return ARMOUR_PRESETS.filter((preset) => preset.level === level);
}
