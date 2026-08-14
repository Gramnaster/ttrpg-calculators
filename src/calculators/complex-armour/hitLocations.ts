export type HitLocationCode =
  | "Sk"
  | "Fa"
  | "Nk"
  | "RSh"
  | "RUA"
  | "REl"
  | "RFo"
  | "RHa"
  | "LSh"
  | "LUA"
  | "LEl"
  | "LFo"
  | "LHa"
  | "Th"
  | "Ab"
  | "Gr"
  | "Hp"
  | "RTg"
  | "RKn"
  | "RCf"
  | "RFt"
  | "LTg"
  | "LKn"
  | "LCf"
  | "LFt";

export interface HitLocationDefinition {
  code: HitLocationCode;
  label: string;
  rangeStart: number;
  rangeEnd: number;
  dmgMod: number;
}

export const HIT_LOCATIONS: readonly HitLocationDefinition[] = [
  { code: "Sk", label: "Skull", rangeStart: 1, rangeEnd: 5, dmgMod: 5 },
  { code: "Fa", label: "Face", rangeStart: 6, rangeEnd: 10, dmgMod: 4 },
  { code: "Nk", label: "Neck", rangeStart: 11, rangeEnd: 14, dmgMod: 5 },
  {
    code: "RSh",
    label: "Right Shoulder",
    rangeStart: 15,
    rangeEnd: 18,
    dmgMod: 1,
  },
  {
    code: "RUA",
    label: "Right Upper Arm",
    rangeStart: 19,
    rangeEnd: 23,
    dmgMod: 0,
  },
  {
    code: "REl",
    label: "Right Elbow",
    rangeStart: 24,
    rangeEnd: 25,
    dmgMod: 1,
  },
  {
    code: "RFo",
    label: "Right Forearm",
    rangeStart: 26,
    rangeEnd: 29,
    dmgMod: 0,
  },
  { code: "RHa", label: "Right Hand", rangeStart: 30, rangeEnd: 32, dmgMod: 1 },
  {
    code: "LSh",
    label: "Left Shoulder",
    rangeStart: 33,
    rangeEnd: 36,
    dmgMod: 1,
  },
  {
    code: "LUA",
    label: "Left Upper Arm",
    rangeStart: 37,
    rangeEnd: 41,
    dmgMod: 0,
  },
  { code: "LEl", label: "Left Elbow", rangeStart: 42, rangeEnd: 43, dmgMod: 1 },
  {
    code: "LFo",
    label: "Left Forearm",
    rangeStart: 44,
    rangeEnd: 47,
    dmgMod: 0,
  },
  { code: "LHa", label: "Left Hand", rangeStart: 48, rangeEnd: 50, dmgMod: 1 },
  { code: "Th", label: "Thorax", rangeStart: 51, rangeEnd: 63, dmgMod: 4 },
  { code: "Ab", label: "Abdomen", rangeStart: 64, rangeEnd: 72, dmgMod: 5 },
  { code: "Gr", label: "Groin", rangeStart: 73, rangeEnd: 76, dmgMod: 3 },
  { code: "Hp", label: "Hip", rangeStart: 77, rangeEnd: 82, dmgMod: 4 },
  {
    code: "RTg",
    label: "Right Thigh",
    rangeStart: 83,
    rangeEnd: 85,
    dmgMod: 3,
  },
  { code: "RKn", label: "Right Knee", rangeStart: 86, rangeEnd: 87, dmgMod: 1 },
  { code: "RCf", label: "Right Calf", rangeStart: 88, rangeEnd: 90, dmgMod: 0 },
  { code: "RFt", label: "Right Foot", rangeStart: 91, rangeEnd: 91, dmgMod: 1 },
  { code: "LTg", label: "Left Thigh", rangeStart: 92, rangeEnd: 94, dmgMod: 3 },
  { code: "LKn", label: "Left Knee", rangeStart: 95, rangeEnd: 96, dmgMod: 1 },
  { code: "LCf", label: "Left Calf", rangeStart: 97, rangeEnd: 99, dmgMod: 0 },
  {
    code: "LFt",
    label: "Left Foot",
    rangeStart: 100,
    rangeEnd: 100,
    dmgMod: 1,
  },
];

// Mount points as written in the design doc's MNT column. These have no
// inherent laterality -- "Sh" is a single mounting point that a piece equips
// at once, even though it covers both shoulders (see MOUNT_CODE_EXPANSION
// below). Distinct from HitLocationCode, which is always laterality-specific.
export type MountPoint =
  | "Sk"
  | "Fa"
  | "Nk"
  | "Th"
  | "Ab"
  | "Gr"
  | "Hp"
  | "Sh"
  | "Ua"
  | "El"
  | "Fo"
  | "Ha"
  | "Tg"
  | "Kn"
  | "Cf"
  | "Ft";

// Unprefixed mount/cover code, as written in the design doc's MNT/CVR columns,
// mapped to the HitLocationCode(s) it expands to. A code with no L/R prefix in
// the source covers both the left and right hit locations.
export const MOUNT_CODE_EXPANSION: Readonly<
  Record<MountPoint, readonly HitLocationCode[]>
> = {
  Sk: ["Sk"],
  Fa: ["Fa"],
  Nk: ["Nk"],
  Th: ["Th"],
  Ab: ["Ab"],
  Gr: ["Gr"],
  Hp: ["Hp"],
  Sh: ["RSh", "LSh"],
  Ua: ["RUA", "LUA"],
  El: ["REl", "LEl"],
  Fo: ["RFo", "LFo"],
  Ha: ["RHa", "LHa"],
  Tg: ["RTg", "LTg"],
  Kn: ["RKn", "LKn"],
  Cf: ["RCf", "LCf"],
  Ft: ["RFt", "LFt"],
};
