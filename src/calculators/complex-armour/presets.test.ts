import { describe, expect, it } from "vitest";
import { CATALOG } from "./catalog";
import { applyPreset } from "./logic";
import { ARMOUR_PRESETS, presetsForLevel } from "./presets";

const CATALOG_IDS = new Set(CATALOG.map((item) => item.id));

describe("ARMOUR_PRESETS", () => {
  it("has 12 Unarmoured, 12 Light, 6 Medium and 6 Heavy choices, matching HarnMaster Gold's own lettering", () => {
    expect(presetsForLevel("Unarmoured")).toHaveLength(12);
    expect(presetsForLevel("Light")).toHaveLength(12);
    expect(presetsForLevel("Medium")).toHaveLength(6);
    expect(presetsForLevel("Heavy")).toHaveLength(6);
  });

  it("has no duplicate level+choice pairs", () => {
    const keys = ARMOUR_PRESETS.map(
      (preset) => `${preset.level}:${preset.choice}`,
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each(ARMOUR_PRESETS)(
    "$level $choice references only real catalog items",
    (preset) => {
      for (const itemId of preset.itemIds) {
        expect(CATALOG_IDS.has(itemId)).toBe(true);
      }
    },
  );

  it.each(ARMOUR_PRESETS)(
    "$level $choice applies without an internal equip conflict",
    (preset) => {
      const result = applyPreset(preset.itemIds);

      expect(result.kind).toBe("applied");
      if (result.kind !== "applied") return;
      expect(result.loadout).toHaveLength(preset.itemIds.length);
    },
  );

  it.each(ARMOUR_PRESETS)(
    "$level $choice covers at least the Thorax",
    (preset) => {
      const result = applyPreset(preset.itemIds);
      if (result.kind !== "applied") return;

      const torsoCovered = preset.itemIds.some((itemId) => {
        const item = CATALOG.find((catalogItem) => catalogItem.id === itemId);
        return item?.cover.includes("Th");
      });
      expect(torsoCovered).toBe(true);
    },
  );
});
