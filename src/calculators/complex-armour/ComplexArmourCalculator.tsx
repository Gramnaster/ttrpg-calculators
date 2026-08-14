import { useState } from "react";
import { ArmourPicker } from "./ArmourPicker";
import { CATALOG } from "./catalog";
import { EquippedLoadoutPanel } from "./EquippedLoadoutPanel";
import { HitLocationTable } from "./HitLocationTable";
import {
  resolveHitLocationTable,
  tryEquip,
  unequip,
  type EquipResult,
  type EquippedPiece,
} from "./logic";

const STORAGE_KEY = "complex-armour-loadout";

function loadStoredLoadout(): EquippedPiece[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as EquippedPiece[]) : [];
  } catch {
    return [];
  }
}

export function ComplexArmourCalculator() {
  const [loadout, setLoadout] = useState<EquippedPiece[]>(loadStoredLoadout);
  const [lastEquipResult, setLastEquipResult] = useState<EquipResult | null>(
    null,
  );

  const handleEquip = (itemId: string) => {
    const result = tryEquip(loadout, itemId);
    setLastEquipResult(result);
    if (result.kind === "equipped") {
      setLoadout(result.loadout);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.loadout));
    }
  };

  const handleUnequip = (itemId: string) => {
    const next = unequip(loadout, itemId);
    setLoadout(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const hitLocationRows = resolveHitLocationTable(loadout);
  const coveredLocationCount = hitLocationRows.filter(
    (row) => row.coveringItemIds.length > 0,
  ).length;

  return (
    <section
      aria-labelledby="complex-armour-heading"
      className="flex w-full max-w-4xl flex-col gap-8"
    >
      <div>
        <h2
          id="complex-armour-heading"
          className="font-display text-2xl font-semibold text-ink"
        >
          Complex Armour Calculator
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Equip armour pieces across Mounting points and Garment Slots, and see
          the resulting damage reduction at every Hit Location.
        </p>
      </div>
      <ArmourPicker
        catalog={CATALOG}
        onEquip={handleEquip}
        lastResult={lastEquipResult}
      />
      {/* A short polite summary, not the full tables below -- announcing two
          entire multi-row tables on every equip/unequip would be far too
          verbose for screen reader users (see rules/accessibility.md). */}
      <p aria-live="polite" role="status" className="text-sm text-ink-muted">
        {loadout.length} {loadout.length === 1 ? "piece" : "pieces"} equipped,
        covering {coveredLocationCount} of {hitLocationRows.length} hit
        locations.
      </p>
      <EquippedLoadoutPanel
        loadout={loadout}
        catalog={CATALOG}
        onUnequip={handleUnequip}
      />
      <HitLocationTable rows={hitLocationRows} />
    </section>
  );
}
