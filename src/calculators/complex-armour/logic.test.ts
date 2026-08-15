import { describe, expect, it } from "vitest";
import {
  applyPreset,
  resolveHitLocationTable,
  tryEquip,
  unequip,
  type EquippedPiece,
} from "./logic";

function equipAll(itemIds: readonly string[]): EquippedPiece[] {
  let loadout: EquippedPiece[] = [];
  for (const itemId of itemIds) {
    const result = tryEquip(loadout, itemId);
    expect(result.kind).toBe("equipped");
    if (result.kind !== "equipped") throw new Error("setup failed");
    loadout = result.loadout;
  }
  return loadout;
}

describe("tryEquip", () => {
  it("equips an item into an empty loadout", () => {
    const result = tryEquip([], "tunic");

    expect(result.kind).toBe("equipped");
    if (result.kind !== "equipped") return;
    expect(result.loadout).toEqual([{ itemId: "tunic" }]);
  });

  it("returns unknownItem for an id not in the catalog", () => {
    const result = tryEquip([], "not-a-real-item");

    expect(result.kind).toBe("unknownItem");
  });

  it("equips two items at the same mount when their garment slots differ", () => {
    // Tunic (Clothing) and Gambeson (Padding) both mount at Th.
    const loadout = equipAll(["tunic"]);
    const result = tryEquip(loadout, "gambeson");

    expect(result.kind).toBe("equipped");
    if (result.kind !== "equipped") return;
    expect(result.loadout).toHaveLength(2);
  });

  it("returns conflict when two items share a mount and garment slot", () => {
    // Tunic and Shirt are both Cloth/Clothing, both mounted at Th.
    const loadout = equipAll(["tunic"]);
    const result = tryEquip(loadout, "shirt");

    expect(result.kind).toBe("conflict");
    if (result.kind !== "conflict") return;
    expect(result.conflictingItemIds).toEqual(["tunic"]);
    expect(result.reason).toContain("Tunic");
  });

  it("returns conflict for a multi-slot item against either of its occupied slots", () => {
    // Splint Cuirass occupies only Rigid at Th. Scale Cuirass occupies
    // Flexible + Rigid at Th, so it must still be blocked by the Rigid
    // overlap even though its Flexible slot is free.
    const loadout = equipAll(["splint-cuirass"]);
    const result = tryEquip(loadout, "scale-cuirass");

    expect(result.kind).toBe("conflict");
    if (result.kind !== "conflict") return;
    expect(result.conflictingItemIds).toEqual(["splint-cuirass"]);
  });

  it("equips items at different mounts without interference", () => {
    const loadout = equipAll(["mail-hauberk"]);
    const result = tryEquip(loadout, "mail-skirt");

    expect(result.kind).toBe("equipped");
    if (result.kind !== "equipped") return;
    expect(result.loadout).toHaveLength(2);
  });

  it("equips a hip-only Skirt alongside full-leg Chausses in the same slot", () => {
    // Mail Skirt (mount Hp) and Mail Chausses (mount Tg) used to both mount
    // at Hp and falsely conflict. A skirt hanging from the waist and
    // separate chausses on the legs is a normal, non-redundant combo.
    const loadout = equipAll(["mail-skirt"]);
    const result = tryEquip(loadout, "mail-chausses");

    expect(result.kind).toBe("equipped");
    if (result.kind !== "equipped") return;
    expect(result.loadout).toHaveLength(2);
  });

  it("returns conflict between Chausses and a same-slot full-leg garment via additionalMounts", () => {
    // Trousers (mount Hp, additionalMounts Tg) and Chausses (Cloth) (mount
    // Tg) are two different styles of the same hip-to-calf coverage --
    // wearing both is redundant, so they must still conflict even though
    // Chausses no longer mounts at Hp.
    const loadout = equipAll(["trousers"]);
    const result = tryEquip(loadout, "chausses-cloth");

    expect(result.kind).toBe("conflict");
    if (result.kind !== "conflict") return;
    expect(result.conflictingItemIds).toEqual(["trousers"]);
  });

  it("returns conflict between two competing full-leg garments already sharing a Mount", () => {
    // Scale Leggings (mount Tg) and Scale Chausses (mount Tg) previously
    // didn't conflict because Chausses used to mount at Hp -- the mirror
    // image of the Skirt bug above, fixed by the same change.
    const loadout = equipAll(["scale-leggings"]);
    const result = tryEquip(loadout, "scale-chausses");

    expect(result.kind).toBe("conflict");
    if (result.kind !== "conflict") return;
    expect(result.conflictingItemIds).toEqual(["scale-leggings"]);
  });

  it("equips a right and a left individual piece at the same mount and slot", () => {
    // Plate Pauldrons (Right) and Plate Pauldrons (Left) both mount at Sh in
    // the Rigid slot, but opposite laterality means they don't conflict.
    const loadout = equipAll(["plate-pauldrons-right"]);
    const result = tryEquip(loadout, "plate-pauldrons-left");

    expect(result.kind).toBe("equipped");
    if (result.kind !== "equipped") return;
    expect(result.loadout).toHaveLength(2);
  });

  it("returns conflict for two individual pieces on the same side", () => {
    // Plate Spaulders (Right) and Plate Pauldrons (Right) are both Sh/Rigid,
    // both laterality "right" -- same side, so they conflict.
    const loadout = equipAll(["plate-spaulders-right"]);
    const result = tryEquip(loadout, "plate-pauldrons-right");

    expect(result.kind).toBe("conflict");
    if (result.kind !== "conflict") return;
    expect(result.conflictingItemIds).toEqual(["plate-spaulders-right"]);
  });
});

describe("unequip", () => {
  it("removes only the given item, leaving the rest intact", () => {
    const loadout = equipAll(["tunic", "gambeson"]);

    const next = unequip(loadout, "tunic");

    expect(next).toEqual([{ itemId: "gambeson" }]);
  });

  it("is a no-op for an item id that isn't equipped", () => {
    const loadout = equipAll(["tunic"]);

    const next = unequip(loadout, "not-equipped");

    expect(next).toEqual(loadout);
  });
});

describe("applyPreset", () => {
  it("equips every item in the list from an empty loadout", () => {
    const result = applyPreset(["tunic", "hose"]);

    expect(result.kind).toBe("applied");
    if (result.kind !== "applied") return;
    expect(result.loadout).toEqual([{ itemId: "tunic" }, { itemId: "hose" }]);
  });

  it("returns an empty loadout for an empty item list", () => {
    const result = applyPreset([]);

    expect(result.kind).toBe("applied");
    if (result.kind !== "applied") return;
    expect(result.loadout).toEqual([]);
  });

  it("reports a conflict instead of silently dropping a colliding item", () => {
    const result = applyPreset(["tunic", "vest"]);

    expect(result.kind).toBe("conflict");
    if (result.kind !== "conflict") return;
    expect(result.itemId).toBe("vest");
  });

  it("reports a conflict for an unknown item id", () => {
    const result = applyPreset(["not-a-real-item"]);

    expect(result.kind).toBe("conflict");
    if (result.kind !== "conflict") return;
    expect(result.reason).toContain("not-a-real-item");
  });
});

describe("resolveHitLocationTable", () => {
  it("reads every location as zero for an empty loadout", () => {
    const rows = resolveHitLocationTable([]);

    expect(rows).toHaveLength(25);
    for (const row of rows) {
      expect(row.totals).toEqual({
        blunt: 0,
        slash: 0,
        pierce: 0,
        fire: 0,
        magic: 0,
        crush: 0,
      });
      expect(row.gapPercent).toBe(0);
      expect(row.coveringItemIds).toEqual([]);
    }
  });

  // Reproduces the design doc's "Lightly Armoured" worked example -- Hood +
  // Tunic + Trousers, all Cloth -- with one deliberate correction: Fa reads
  // zero here, not covered, because Hood's own cover list no longer includes
  // Fa (a hood frames the face rather than guarding it; see catalog.ts's
  // file header note). The doc's own published table still credits Hood
  // with Face coverage; this catalog has been corrected ahead of that doc
  // update, same as the Chausses/Tunic corrections elsewhere in this file.
  it("matches the design doc's Lightly Armoured example row by row", () => {
    const loadout = equipAll(["hood", "tunic", "trousers"]);
    const rows = resolveHitLocationTable(loadout);
    const byLocation = new Map(rows.map((row) => [row.location, row]));
    const cloth = {
      blunt: 1,
      slash: 1,
      pierce: 0,
      fire: 1,
      magic: 0,
      crush: 0,
    };
    const doubleCloth = {
      blunt: 2,
      slash: 2,
      pierce: 0,
      fire: 2,
      magic: 0,
      crush: 0,
    };
    const zero = { blunt: 0, slash: 0, pierce: 0, fire: 0, magic: 0, crush: 0 };

    const covered5 = ["Sk", "Nk"] as const;
    const covered0 = [
      "RSh",
      "RUA",
      "LSh",
      "LUA",
      "Th",
      "Ab",
      "RTg",
      "RKn",
      "RCf",
      "LTg",
      "LKn",
      "LCf",
    ] as const;
    const doubled = ["Gr", "Hp"] as const;
    const empty = [
      "Fa",
      "REl",
      "RFo",
      "RHa",
      "LEl",
      "LFo",
      "LHa",
      "RFt",
      "LFt",
    ] as const;

    for (const code of covered5) {
      expect(byLocation.get(code)?.totals).toEqual(cloth);
      expect(byLocation.get(code)?.gapPercent).toBe(5);
    }
    for (const code of covered0) {
      expect(byLocation.get(code)?.totals).toEqual(cloth);
      expect(byLocation.get(code)?.gapPercent).toBe(0);
    }
    for (const code of doubled) {
      expect(byLocation.get(code)?.totals).toEqual(doubleCloth);
      expect(byLocation.get(code)?.gapPercent).toBe(0);
    }
    for (const code of empty) {
      expect(byLocation.get(code)?.totals).toEqual(zero);
      expect(byLocation.get(code)?.gapPercent).toBe(0);
    }
  });

  // Reproduces the design doc's "Medium Armoured" example (Hood, Tunic,
  // Trousers, Gambeson, Mail Hauberk, Mail Skirt) with the CORRECT totals --
  // not the doc's own published numbers, which contain three confirmed
  // arithmetic slips (verified by hand against the doc's own per-piece
  // stats, all traceable to straightforward summation working everywhere
  // else in the same table):
  //   - LSh/LUA/Th/Ab totals in the doc drop Mail Hauberk's contribution
  //     entirely, while the doc's own RSh/RUA rows (covered by the identical
  //     three pieces) sum it correctly.
  //   - REl/RFo/LEl/LFo Gap reads 0 in the doc despite Mail Hauberk (Gap 5%)
  //     being the sole covering piece there.
  //   - Gr/Hp magic total reads 2 in the doc instead of 4, even though every
  //     other column at those two rows (B/S/P/F/C) sums correctly across all
  //     four covering pieces (Tunic, Trousers, Mail Hauberk, Mail Skirt).
  it("matches the corrected math for the design doc's Medium Armoured example", () => {
    const loadout = equipAll([
      "hood",
      "tunic",
      "trousers",
      "gambeson",
      "mail-hauberk",
      "mail-skirt",
    ]);
    const rows = resolveHitLocationTable(loadout);
    const byLocation = new Map(rows.map((row) => [row.location, row]));

    const hoodOnly = {
      blunt: 1,
      slash: 1,
      pierce: 0,
      fire: 1,
      magic: 0,
      crush: 0,
    };
    const torsoStack = {
      blunt: 7,
      slash: 9,
      pierce: 5,
      fire: 5,
      magic: 2,
      crush: 0,
    };
    const hauberkOnly = {
      blunt: 2,
      slash: 6,
      pierce: 4,
      fire: 1,
      magic: 2,
      crush: 0,
    };
    const hipGroin = {
      blunt: 6,
      slash: 14,
      pierce: 8,
      fire: 4,
      magic: 4,
      crush: 0,
    };
    const thighStack = {
      blunt: 3,
      slash: 7,
      pierce: 4,
      fire: 2,
      magic: 2,
      crush: 0,
    };
    const clothOnly = {
      blunt: 1,
      slash: 1,
      pierce: 0,
      fire: 1,
      magic: 0,
      crush: 0,
    };
    const zero = { blunt: 0, slash: 0, pierce: 0, fire: 0, magic: 0, crush: 0 };

    for (const code of ["Sk", "Nk"] as const) {
      expect(byLocation.get(code)?.totals).toEqual(hoodOnly);
      expect(byLocation.get(code)?.gapPercent).toBe(5);
    }
    for (const code of ["RSh", "RUA", "LSh", "LUA", "Th", "Ab"] as const) {
      expect(byLocation.get(code)?.totals).toEqual(torsoStack);
      expect(byLocation.get(code)?.gapPercent).toBe(5);
    }
    for (const code of ["REl", "RFo", "LEl", "LFo"] as const) {
      expect(byLocation.get(code)?.totals).toEqual(hauberkOnly);
      expect(byLocation.get(code)?.gapPercent).toBe(5);
    }
    // Fa: Hood no longer covers the face (see catalog.ts's file header note),
    // and none of this loadout's other pieces do either.
    for (const code of ["Fa", "RHa", "LHa", "RFt", "LFt"] as const) {
      expect(byLocation.get(code)?.totals).toEqual(zero);
      expect(byLocation.get(code)?.gapPercent).toBe(0);
    }
    for (const code of ["Gr", "Hp"] as const) {
      expect(byLocation.get(code)?.totals).toEqual(hipGroin);
      expect(byLocation.get(code)?.gapPercent).toBe(5);
    }
    for (const code of ["RTg", "LTg"] as const) {
      expect(byLocation.get(code)?.totals).toEqual(thighStack);
      expect(byLocation.get(code)?.gapPercent).toBe(5);
    }
    for (const code of ["RKn", "RCf", "LKn", "LCf"] as const) {
      expect(byLocation.get(code)?.totals).toEqual(clothOnly);
      expect(byLocation.get(code)?.gapPercent).toBe(0);
    }

    // coveringPieces backs the "Armour Summary" column (e.g. "C + Q + M"),
    // ordered innermost-to-outermost by Garment Slot to match the doc, with
    // each piece's OWN Gap alongside it -- distinct from the row's
    // aggregate gapPercent asserted above.
    expect(byLocation.get("RSh")?.coveringPieces).toEqual([
      { itemId: "tunic", build: "Cloth", gapPercent: 0 },
      { itemId: "gambeson", build: "Quilted", gapPercent: 0 },
      { itemId: "mail-hauberk", build: "Mail", gapPercent: 5 },
    ]);
    expect(byLocation.get("Gr")?.coveringPieces).toEqual([
      { itemId: "tunic", build: "Cloth", gapPercent: 0 },
      { itemId: "trousers", build: "Cloth", gapPercent: 0 },
      { itemId: "mail-hauberk", build: "Mail", gapPercent: 5 },
      { itemId: "mail-skirt", build: "Mail", gapPercent: 5 },
    ]);
    expect(byLocation.get("RTg")?.coveringPieces).toEqual([
      { itemId: "trousers", build: "Cloth", gapPercent: 0 },
      { itemId: "mail-skirt", build: "Mail", gapPercent: 5 },
    ]);
  });

  it("expands a shared item's cover to both left and right locations", () => {
    // Mail Mantle mounts at the central "Nk" point and, being a "shared"
    // garment, covers both shoulders from one equip action.
    const loadout = equipAll(["mail-mantle"]);
    const rows = resolveHitLocationTable(loadout);
    const byLocation = new Map(rows.map((row) => [row.location, row]));

    for (const code of ["RSh", "LSh"] as const) {
      expect(byLocation.get(code)?.coveringItemIds).toEqual(["mail-mantle"]);
    }
  });

  it("keeps an individual piece's coverage to only its own side", () => {
    // Plate Pauldrons (Right) is laterality "right" and should never
    // contribute to the left-side hit locations.
    const loadout = equipAll(["plate-pauldrons-right"]);
    const rows = resolveHitLocationTable(loadout);
    const byLocation = new Map(rows.map((row) => [row.location, row]));

    expect(byLocation.get("RSh")?.coveringItemIds).toEqual([
      "plate-pauldrons-right",
    ]);
    expect(byLocation.get("RUA")?.coveringItemIds).toEqual([
      "plate-pauldrons-right",
    ]);
    expect(byLocation.get("LSh")?.coveringItemIds).toEqual([]);
    expect(byLocation.get("LUA")?.coveringItemIds).toEqual([]);
  });

  it("aggregates overlapping Gap percentages as the max, not the sum", () => {
    // Mail Coif (Flexible, Gap 5%) and Plate Helm (Rigid, Gap 15%) both
    // mount at Sk in different garment slots, so both equip and both cover
    // the Skull. If Gap summed, this would read 20%; the rule is max, 15%.
    const loadout = equipAll(["mail-coif", "plate-helm"]);
    const rows = resolveHitLocationTable(loadout);
    const skull = rows.find((row) => row.location === "Sk");

    expect(skull?.gapPercent).toBe(15);
  });
});
