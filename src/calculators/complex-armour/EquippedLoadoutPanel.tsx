import type { CatalogItem, GarmentSlotType } from "./catalog";
import type { MountPoint } from "./hitLocations";
import type { EquippedPiece } from "./logic";

const MOUNT_ORDER: readonly MountPoint[] = [
  "Sk",
  "Fa",
  "Nk",
  "Sh",
  "Ua",
  "El",
  "Fo",
  "Ha",
  "Th",
  "Ab",
  "Gr",
  "Hp",
  "Tg",
  "Kn",
  "Cf",
  "Ft",
];

const MOUNT_LABEL: Record<MountPoint, string> = {
  Sk: "Skull",
  Fa: "Face",
  Nk: "Neck",
  Sh: "Shoulder",
  Ua: "Upper Arm",
  El: "Elbow",
  Fo: "Forearm",
  Ha: "Hand",
  Th: "Thorax",
  Ab: "Abdomen",
  Gr: "Groin",
  Hp: "Hip",
  Tg: "Thigh",
  Kn: "Knee",
  Cf: "Calf",
  Ft: "Foot",
};

const GARMENT_SLOT_ORDER: readonly GarmentSlotType[] = [
  "Clothing",
  "Padding",
  "Flexible",
  "Rigid",
  "Outer",
];

const CELL_BORDER_CLASS = {
  occupied: "border-2 border-accent",
  empty: "border border-rule",
};

const unequipButtonClassName =
  "self-start border border-rule bg-paper px-2 py-1 text-xs font-medium text-ink-muted outline-none transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export interface EquippedLoadoutPanelProps {
  loadout: readonly EquippedPiece[];
  catalog: readonly CatalogItem[];
  onUnequip: (itemId: string) => void;
}

export function EquippedLoadoutPanel({
  loadout,
  catalog,
  onUnequip,
}: EquippedLoadoutPanelProps) {
  const equippedItems = loadout
    .map((piece) => catalog.find((item) => item.id === piece.itemId))
    .filter((item): item is CatalogItem => item !== undefined);

  // Usually 0 or 1 item, but a "left" and "right" individual piece (e.g. a
  // Right and Left Pauldron) can both occupy the same Mount + Garment Slot
  // at once, so this returns every match rather than just the first. A
  // full-leg garment (e.g. Trousers) spans two Mounts via additionalMounts
  // and shows up in both of that item's rows.
  function itemsAt(mount: MountPoint, slot: GarmentSlotType): CatalogItem[] {
    return equippedItems.filter(
      (item) =>
        (item.mount === mount || item.additionalMounts?.includes(mount)) &&
        item.garmentSlots.includes(slot),
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-lg font-semibold text-ink">
        Equipped Loadout
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <caption className="sr-only">
            Currently equipped armour by Mounting point and Garment Slot
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-28 border border-rule p-2" />
              {GARMENT_SLOT_ORDER.map((slot) => (
                <th
                  key={slot}
                  scope="col"
                  className="border border-rule bg-paper-raised p-2 font-display text-xs font-semibold tracking-wide text-ink uppercase"
                >
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOUNT_ORDER.map((mount) => (
              <tr key={mount}>
                <th
                  scope="row"
                  className="border border-rule bg-paper-raised p-2 font-display text-xs font-semibold tracking-wide text-ink uppercase"
                >
                  {MOUNT_LABEL[mount]}
                </th>
                {GARMENT_SLOT_ORDER.map((slot) => {
                  const items = itemsAt(mount, slot);
                  return (
                    <td
                      key={slot}
                      className={`p-2 align-top ${items.length > 0 ? CELL_BORDER_CLASS.occupied : CELL_BORDER_CLASS.empty}`}
                    >
                      {items.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {items.map((item) => (
                            <div key={item.id} className="flex flex-col gap-1">
                              <span className="text-ink">{item.name}</span>
                              <button
                                type="button"
                                className={unequipButtonClassName}
                                aria-label={`Unequip ${item.name}`}
                                onClick={() => onUnequip(item.id)}
                              >
                                Unequip
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span aria-hidden="true" className="text-ink-faint">
                          —
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
