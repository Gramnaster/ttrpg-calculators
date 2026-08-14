// Hide, Coat of Plates, Brigandine, and Coat are intentionally omitted -- the
// design doc has no B/S/P/F/M/C row for them (Coat of Plates has no item
// table at all). Fabricating zero-value stats for real, nameable pieces would
// look like a design decision instead of a placeholder, so those builds (and
// their items) are excluded from the catalog until the source doc is filled
// in. See the plan for the full rationale.
export type ArmourBuild =
  | "Cloth"
  | "Quilted"
  | "Leather"
  | "Mail"
  | "Splint"
  | "Scale"
  | "Lamellar"
  | "Plate"
  | "ArticulatedPlate";

export interface ArmourValueRow {
  blunt: number;
  slash: number;
  pierce: number;
  fire: number;
  magic: number;
  crush: number;
}

// "Plate" here corresponds to the "Individual Plate" row in the design doc's
// Armour Values table -- same build as the "Plate" row in the Armour Types
// table, just labeled differently between the two tables.
export const ARMOUR_VALUES: Readonly<Record<ArmourBuild, ArmourValueRow>> = {
  Cloth: { blunt: 1, slash: 1, pierce: 0, fire: 1, magic: 0, crush: 0 },
  Quilted: { blunt: 4, slash: 2, pierce: 1, fire: 3, magic: 0, crush: 0 },
  Leather: { blunt: 1, slash: 3, pierce: 2, fire: 2, magic: 4, crush: 0 },
  Mail: { blunt: 2, slash: 6, pierce: 4, fire: 1, magic: 2, crush: 0 },
  Splint: { blunt: 2, slash: 5, pierce: 1, fire: 1, magic: 1, crush: 1 },
  Scale: { blunt: 3, slash: 8, pierce: 5, fire: 4, magic: 3, crush: 2 },
  Lamellar: { blunt: 2, slash: 4, pierce: 3, fire: 3, magic: 1, crush: 1 },
  Plate: { blunt: 6, slash: 9, pierce: 6, fire: 5, magic: 6, crush: 4 },
  ArticulatedPlate: {
    blunt: 12,
    slash: 14,
    pierce: 11,
    fire: 10,
    magic: 12,
    crush: 6,
  },
};

// Standard Armour Quality per the design doc. Higher/lower AQ is described as
// scaling protection, but the doc's own explanation of the formula is an
// unfinished sentence -- there is nothing to implement yet, so this is a
// fixed constant rather than a per-item field for v1.
export const STANDARD_ARMOUR_QUALITY = 4;
