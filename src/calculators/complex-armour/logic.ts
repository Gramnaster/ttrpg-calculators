import {
  ARMOUR_VALUES,
  STANDARD_ARMOUR_QUALITY,
  type ArmourBuild,
  type ArmourValueRow,
} from "./armourValues";
import {
  CATALOG,
  type CatalogItem,
  type GarmentSlotType,
  type Laterality,
} from "./catalog";
import {
  HIT_LOCATIONS,
  type HitLocationCode,
  type MountPoint,
} from "./hitLocations";

export interface EquippedPiece {
  itemId: string;
}

export type EquipResult =
  | { kind: "equipped"; loadout: EquippedPiece[] }
  | { kind: "conflict"; reason: string; conflictingItemIds: string[] }
  | { kind: "unknownItem" };

// One covering piece's entry in a Hit Location's "Armour Summary" -- e.g.
// "C (5) + Q (0) + M (5)" is three of these, joined for display by the view.
// gapPercent here is that piece's OWN Gap, not the row's aggregate: the
// Strike Gap Combat Exploit is resolved per piece (rolling under a piece's
// own Gap% bypasses that piece specifically, not every piece stacked at the
// location), so a player needs to see each piece's Gap individually, not
// just the row's worst-case max (HitLocationArmour.gapPercent, unchanged).
export interface CoveringPiece {
  itemId: string;
  build: ArmourBuild;
  gapPercent: number;
}

export interface HitLocationArmour {
  location: HitLocationCode;
  label: string;
  dmgMod: number;
  coveringItemIds: string[];
  coveringPieces: readonly CoveringPiece[];
  totals: ArmourValueRow;
  gapPercent: number;
  armourQuality: number;
}

// Innermost to outermost, matching how the design doc orders its own
// "Armour Summary" column (e.g. "C + Q + M" lists Clothing before Padding
// before Flexible).
const GARMENT_SLOT_ORDER: readonly GarmentSlotType[] = [
  "Clothing",
  "Padding",
  "Flexible",
  "Rigid",
  "Outer",
];

function primaryGarmentSlotIndex(item: CatalogItem): number {
  const [primarySlot] = item.garmentSlots;
  return primarySlot ? GARMENT_SLOT_ORDER.indexOf(primarySlot) : -1;
}

const ZERO_ARMOUR_VALUES: ArmourValueRow = {
  blunt: 0,
  slash: 0,
  pierce: 0,
  fire: 0,
  magic: 0,
  crush: 0,
};

function findCatalogItem(itemId: string): CatalogItem | undefined {
  return CATALOG.find((item) => item.id === itemId);
}

function slotsOverlap(
  a: readonly GarmentSlotType[],
  b: readonly GarmentSlotType[],
): boolean {
  return a.some((slot) => b.includes(slot));
}

// Most items have a single Mount; a few (e.g. Trousers, belted at Hp but
// reaching down to Tg) also compete for a slot at each of item.additionalMounts.
function mountsOf(item: CatalogItem): readonly MountPoint[] {
  return item.additionalMounts
    ? [item.mount, ...item.additionalMounts]
    : [item.mount];
}

function mountsOverlap(a: CatalogItem, b: CatalogItem): boolean {
  const aMounts = mountsOf(a);
  return mountsOf(b).some((mount) => aMounts.includes(mount));
}

// "shared" claims the whole mount, so it conflicts with anything there.
// "left" and "right" only conflict with themselves or with "shared" -- a
// right-side piece and a left-side piece can be worn at the same time.
function lateralityConflicts(a: Laterality, b: Laterality): boolean {
  if (a === "shared" || b === "shared") return true;
  return a === b;
}

function sumArmourValues(a: ArmourValueRow, b: ArmourValueRow): ArmourValueRow {
  return {
    blunt: a.blunt + b.blunt,
    slash: a.slash + b.slash,
    pierce: a.pierce + b.pierce,
    fire: a.fire + b.fire,
    magic: a.magic + b.magic,
    crush: a.crush + b.crush,
  };
}

// A new item conflicts with an equipped piece only when they share a Mount
// (an item spanning additionalMounts competes at each of them, see catalog.ts),
// overlap in Garment Slot, AND overlap in laterality. Scale pieces occupy
// two slots (Flexible + Rigid) at once -- its scales are attached to a
// flexible backing that's part of the piece -- so they can be blocked by, or
// block, an item in either slot, not just an exact-slot match. A
// "left"/"right" piece (e.g. a Pauldron) only conflicts with the same side
// or with a "shared" piece (e.g. a Hauberk, which claims the whole mount);
// two opposite-side individual pieces can be worn at once.
export function tryEquip(
  loadout: EquippedPiece[],
  itemId: string,
): EquipResult {
  const newItem = findCatalogItem(itemId);
  if (!newItem) return { kind: "unknownItem" };

  const conflicting = loadout
    .map((piece) => ({ piece, item: findCatalogItem(piece.itemId) }))
    .filter(
      (entry): entry is { piece: EquippedPiece; item: CatalogItem } =>
        entry.item !== undefined &&
        mountsOverlap(entry.item, newItem) &&
        slotsOverlap(entry.item.garmentSlots, newItem.garmentSlots) &&
        lateralityConflicts(entry.item.laterality, newItem.laterality),
    );

  if (conflicting.length > 0) {
    const names = conflicting.map(({ item }) => item.name).join(", ");
    const slots = newItem.garmentSlots.join("/");
    return {
      kind: "conflict",
      reason: `${names} already occupies the ${slots} slot at this mount point — unequip it first.`,
      conflictingItemIds: conflicting.map(({ piece }) => piece.itemId),
    };
  }

  return { kind: "equipped", loadout: [...loadout, { itemId }] };
}

export function unequip(
  loadout: EquippedPiece[],
  itemId: string,
): EquippedPiece[] {
  return loadout.filter((piece) => piece.itemId !== itemId);
}

export function resolveHitLocationTable(
  loadout: EquippedPiece[],
): HitLocationArmour[] {
  const equippedItems = loadout
    .map((piece) => findCatalogItem(piece.itemId))
    .filter((item): item is CatalogItem => item !== undefined);

  return HIT_LOCATIONS.map((location) => {
    const covering = equippedItems.filter((item) =>
      item.cover.includes(location.code),
    );
    const totals = covering.reduce(
      (acc, item) => sumArmourValues(acc, ARMOUR_VALUES[item.build]),
      ZERO_ARMOUR_VALUES,
    );
    const gapPercent =
      covering.length > 0
        ? Math.max(...covering.map((item) => item.gapPercent))
        : 0;
    const coveringPieces: CoveringPiece[] = [...covering]
      .sort((a, b) => primaryGarmentSlotIndex(a) - primaryGarmentSlotIndex(b))
      .map((item) => ({
        itemId: item.id,
        build: item.build,
        gapPercent: item.gapPercent,
      }));

    return {
      location: location.code,
      label: location.label,
      dmgMod: location.dmgMod,
      coveringItemIds: covering.map((item) => item.id),
      coveringPieces,
      totals,
      gapPercent,
      armourQuality: STANDARD_ARMOUR_QUALITY,
    };
  });
}
