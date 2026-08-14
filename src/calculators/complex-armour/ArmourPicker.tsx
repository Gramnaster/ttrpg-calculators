import { useState } from "react";
import type { ArmourBuild } from "./armourValues";
import type { CatalogItem } from "./catalog";
import type { EquipResult } from "./logic";

const BUILD_ORDER: readonly ArmourBuild[] = [
  "Cloth",
  "Quilted",
  "Leather",
  "Mail",
  "Splint",
  "Scale",
  "Lamellar",
  "Plate",
  "ArticulatedPlate",
];

const BUILD_LABEL: Record<ArmourBuild, string> = {
  Cloth: "Cloth",
  Quilted: "Quilted",
  Leather: "Leather",
  Mail: "Mail",
  Splint: "Splint",
  Scale: "Scale",
  Lamellar: "Lamellar",
  Plate: "Plate",
  ArticulatedPlate: "Articulated Plate",
};

const buttonClassName =
  "self-start border border-accent bg-accent px-4 py-2 text-sm font-semibold text-paper outline-none transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

const selectClassName =
  "w-full border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export interface ArmourPickerProps {
  catalog: readonly CatalogItem[];
  onEquip: (itemId: string) => void;
  lastResult: EquipResult | null;
}

export function ArmourPicker({
  catalog,
  onEquip,
  lastResult,
}: ArmourPickerProps) {
  const availableBuilds = BUILD_ORDER.filter((build) =>
    catalog.some((item) => item.build === build),
  );
  const [selectedBuild, setSelectedBuild] = useState<ArmourBuild>(
    availableBuilds[0] ?? "Cloth",
  );
  const itemsForBuild = catalog.filter((item) => item.build === selectedBuild);
  const [selectedItemId, setSelectedItemId] = useState(
    itemsForBuild[0]?.id ?? "",
  );
  const selectedItem = catalog.find((item) => item.id === selectedItemId);

  const handleBuildChange = (build: ArmourBuild) => {
    setSelectedBuild(build);
    const firstItemForBuild = catalog.find((item) => item.build === build);
    setSelectedItemId(firstItemForBuild?.id ?? "");
  };

  const handleEquip = () => {
    if (selectedItemId) onEquip(selectedItemId);
  };

  return (
    <fieldset className="flex flex-col gap-3 border border-rule bg-paper-raised px-4 py-4">
      <legend className="px-1 font-display text-base font-semibold text-ink">
        Armour Catalog
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="armour-picker-build"
            className="text-sm text-ink-muted"
          >
            Armour Type
          </label>
          <select
            id="armour-picker-build"
            className={selectClassName}
            value={selectedBuild}
            onChange={(event) =>
              handleBuildChange(event.target.value as ArmourBuild)
            }
          >
            {availableBuilds.map((build) => (
              <option key={build} value={build}>
                {BUILD_LABEL[build]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="armour-picker-item"
            className="text-sm text-ink-muted"
          >
            Armour Piece
          </label>
          <select
            id="armour-picker-item"
            className={selectClassName}
            value={selectedItemId}
            onChange={(event) => setSelectedItemId(event.target.value)}
          >
            {itemsForBuild.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {selectedItem && (
        <p className="text-sm text-ink-muted">
          {selectedItem.garmentSlots.join(" + ")} slot at {selectedItem.mount} —
          Gap {selectedItem.gapPercent}%
        </p>
      )}
      <button type="button" className={buttonClassName} onClick={handleEquip}>
        Equip
      </button>
      {lastResult?.kind === "conflict" && (
        <p role="alert" className="font-medium text-accent">
          {lastResult.reason}
        </p>
      )}
      {lastResult?.kind === "unknownItem" && (
        <p role="alert" className="font-medium text-accent">
          That item doesn&apos;t exist in the catalog.
        </p>
      )}
    </fieldset>
  );
}
