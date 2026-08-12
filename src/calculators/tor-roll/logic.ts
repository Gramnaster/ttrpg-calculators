export type FeatDieMode = "normal" | "favoured" | "illFavoured";

export interface TorRollInput {
  rating: number;
  attribute: number;
  targetNumberBase: 18 | 20;
  targetNumberModifier: number;
  diceModifier: number;
  featDieMode: FeatDieMode;
  isWeary: boolean;
  isMiserable: boolean;
  isMagicalSuccess: boolean;
}

export interface TorRollBreakdown {
  failure: number;
  success: number;
  greatSuccess: number;
  extraordinarySuccess: number;
}

export interface TorGridCell {
  successDice: number;
  anySuccess: number;
}

export interface TorGridRow {
  targetNumber: number;
  cells: TorGridCell[];
}

export type TorRollResult =
  | {
      kind: "success";
      targetNumber: number;
      successDice: number;
      breakdown: TorRollBreakdown;
      anySuccess: number;
      piercingBlow: number | null;
      grid: TorGridRow[] | null;
    }
  | { kind: "invalidInput"; reason: string };

export interface FeatDieRankProbability {
  rank: number;
  probability: number;
}

export interface SuccessDiceJointDistribution {
  diceCount: number;
  isWeary: boolean;
  maxSum: number;
  // probabilityAt[sum][icons], fractions that sum to 1 across the whole grid.
  probabilityAt: number[][];
}

export const MIN_RATING = 0;
export const MAX_RATING = 6;
export const MIN_ATTRIBUTE = 1;
export const MAX_ATTRIBUTE = 9;
export const MAX_SUCCESS_DICE = 20;
export const GRID_TARGET_NUMBERS: readonly number[] = Array.from(
  { length: 11 },
  (_, i) => 10 + i,
); // 10..20
export const GRID_DICE_COUNTS: readonly number[] = Array.from(
  { length: 9 },
  (_, i) => i,
); // 0..8

// Feat die faces are ranked Eye < 1..10 < Gandalf, so the die is modeled as
// rank indices 0-11 rather than raw face values -- rank IS the numeric value
// for the ten ordinary faces, but 0 (Eye) and 11 (Gandalf) need special
// handling wherever ranks are combined with Success Dice.
const FEAT_DIE_RANK_COUNT = 12;
const EYE_RANK = 0;
const GANDALF_RANK = 11;
const PIERCING_BLOW_FEAT_VALUE = 10;

export function getFeatDieDistribution(
  mode: FeatDieMode,
): FeatDieRankProbability[] {
  const n = FEAT_DIE_RANK_COUNT;
  return Array.from({ length: n }, (_, rank) => {
    let probability: number;
    switch (mode) {
      case "normal":
        probability = 1 / n;
        break;
      case "favoured":
        // Max of two independent draws: P(rank = k) = (2k + 1) / n^2.
        probability = (2 * rank + 1) / (n * n);
        break;
      case "illFavoured":
        // Min of two independent draws: P(rank = k) = (2n - 2k - 1) / n^2.
        probability = (2 * n - 2 * rank - 1) / (n * n);
        break;
    }
    return { rank, probability };
  });
}

// Convolves n independent Success Dice into a joint distribution over
// (sum, icon count). Sum and icon count are positively correlated -- a die
// showing 6 adds both its face value and an icon -- so they cannot be
// modeled independently once the roll is conditioned on success.
export function getSuccessDiceJointDistribution(
  diceCount: number,
  isWeary: boolean,
): SuccessDiceJointDistribution {
  const maxSum = 6 * diceCount;
  const emptyGrid = (): number[][] =>
    Array.from({ length: maxSum + 1 }, () =>
      new Array<number>(diceCount + 1).fill(0),
    );

  let current = emptyGrid();
  current[0][0] = 1;

  for (let die = 0; die < diceCount; die++) {
    const next = emptyGrid();
    for (let sum = 0; sum <= maxSum; sum++) {
      for (let icons = 0; icons <= diceCount; icons++) {
        const mass = current[sum][icons];
        if (mass === 0) continue;
        for (let face = 1; face <= 6; face++) {
          const addedValue = isWeary && face <= 3 ? 0 : face;
          const addedIcon = face === 6 ? 1 : 0;
          next[sum + addedValue][icons + addedIcon] += mass / 6;
        }
      }
    }
    current = next;
  }

  return { diceCount, isWeary, maxSum, probabilityAt: current };
}

function validateTorRollInput(input: TorRollInput): string | null {
  if (
    !Number.isInteger(input.rating) ||
    input.rating < MIN_RATING ||
    input.rating > MAX_RATING
  ) {
    return `Rating must be a whole number between ${MIN_RATING} and ${MAX_RATING}.`;
  }
  if (
    !Number.isInteger(input.attribute) ||
    input.attribute < MIN_ATTRIBUTE ||
    input.attribute > MAX_ATTRIBUTE
  ) {
    return `Attribute must be a whole number between ${MIN_ATTRIBUTE} and ${MAX_ATTRIBUTE}.`;
  }
  if (!Number.isInteger(input.targetNumberModifier)) {
    return "Target Number modifier must be a whole number.";
  }
  if (!Number.isInteger(input.diceModifier)) {
    return "Dice modifier must be a whole number.";
  }
  if (getEffectiveSuccessDice(input) > MAX_SUCCESS_DICE) {
    return `Total Success Dice cannot exceed ${MAX_SUCCESS_DICE}.`;
  }
  if (getTargetNumber(input) < 1) {
    return "Target Number must be at least 1.";
  }
  return null;
}

function getEffectiveSuccessDice(input: TorRollInput): number {
  return Math.max(0, input.rating + input.diceModifier);
}

export function getTargetNumber(input: TorRollInput): number {
  return input.targetNumberBase - input.attribute + input.targetNumberModifier;
}

function addToBucket(
  breakdown: TorRollBreakdown,
  icons: number,
  mass: number,
): void {
  if (icons === 0) breakdown.success += mass;
  else if (icons === 1) breakdown.greatSuccess += mass;
  else breakdown.extraordinarySuccess += mass;
}

// Splits one feat rank's probability mass across the breakdown buckets,
// given the Success Dice pool's joint (sum, icons) distribution and the
// numeric value that rank contributes to the total (0 for a non-Miserable
// Eye, the rank itself for every numeric face).
function addThresholdMass(
  breakdown: TorRollBreakdown,
  dist: SuccessDiceJointDistribution,
  featValue: number,
  targetNumber: number,
  featProbability: number,
): void {
  const minSumToSucceed = targetNumber - featValue;
  for (let sum = 0; sum <= dist.maxSum; sum++) {
    const succeeds = sum >= minSumToSucceed;
    for (let icons = 0; icons <= dist.diceCount; icons++) {
      const cellProbability = dist.probabilityAt[sum][icons];
      if (cellProbability === 0) continue;
      const weighted = featProbability * cellProbability;
      if (succeeds) addToBucket(breakdown, icons, weighted);
      else breakdown.failure += weighted;
    }
  }
}

// A Gandalf rune succeeds regardless of the Success Dice sum, so its degree
// of success comes from the marginal icon distribution alone.
function addMarginalIconMass(
  breakdown: TorRollBreakdown,
  dist: SuccessDiceJointDistribution,
  featProbability: number,
): void {
  for (let icons = 0; icons <= dist.diceCount; icons++) {
    let mass = 0;
    for (let sum = 0; sum <= dist.maxSum; sum++)
      mass += dist.probabilityAt[sum][icons];
    addToBucket(breakdown, icons, featProbability * mass);
  }
}

// P(sum >= targetNumber - featValue), marginalized over icons -- used to
// weigh the Piercing Blow chance, which cares only about whether the attack
// succeeded, not its degree.
function successMassAtFeatValue(
  dist: SuccessDiceJointDistribution,
  featValue: number,
  targetNumber: number,
): number {
  const minSum = Math.max(0, targetNumber - featValue);
  let mass = 0;
  for (let sum = minSum; sum <= dist.maxSum; sum++) {
    for (let icons = 0; icons <= dist.diceCount; icons++) {
      mass += dist.probabilityAt[sum][icons];
    }
  }
  return mass;
}

function toPercentageBreakdown(breakdown: TorRollBreakdown): TorRollBreakdown {
  return {
    failure: breakdown.failure * 100,
    success: breakdown.success * 100,
    greatSuccess: breakdown.greatSuccess * 100,
    extraordinarySuccess: breakdown.extraordinarySuccess * 100,
  };
}

interface GridColumn {
  maxSum: number;
  tailCdf: number[];
}

function marginalizeSumDistribution(
  dist: SuccessDiceJointDistribution,
): number[] {
  const sumDistribution = new Array<number>(dist.maxSum + 1).fill(0);
  for (let sum = 0; sum <= dist.maxSum; sum++) {
    let mass = 0;
    for (let icons = 0; icons <= dist.diceCount; icons++)
      mass += dist.probabilityAt[sum][icons];
    sumDistribution[sum] = mass;
  }
  return sumDistribution;
}

function buildTailCdf(sumDistribution: number[]): number[] {
  const maxSum = sumDistribution.length - 1;
  const tailCdf = new Array<number>(maxSum + 1).fill(0);
  let running = 0;
  for (let sum = maxSum; sum >= 0; sum--) {
    running += sumDistribution[sum];
    tailCdf[sum] = running;
  }
  return tailCdf;
}

function tailAt(column: GridColumn, threshold: number): number {
  if (threshold <= 0) return 1;
  if (threshold > column.maxSum) return 0;
  return column.tailCdf[threshold];
}

function computeAnySuccessProbability(
  column: GridColumn,
  featDieDistribution: FeatDieRankProbability[],
  targetNumber: number,
  isMiserable: boolean,
): number {
  let total = 0;
  for (const { rank, probability } of featDieDistribution) {
    if (probability === 0) continue;
    if (rank === EYE_RANK) {
      if (isMiserable) continue;
      total += probability * tailAt(column, targetNumber);
      continue;
    }
    if (rank === GANDALF_RANK) {
      total += probability;
      continue;
    }
    total += probability * tailAt(column, targetNumber - rank);
  }
  return total;
}

// The joint distribution depends only on (poolSize, isWeary), so each of the
// 9 grid columns is convolved once and reused across all 11 Target Number
// rows via a tail CDF, instead of rebuilding the DP per cell.
function buildReferenceGrid(
  input: TorRollInput,
  featDieDistribution: FeatDieRankProbability[],
): TorGridRow[] {
  const columns: GridColumn[] = GRID_DICE_COUNTS.map((successDice) => {
    const dist = getSuccessDiceJointDistribution(successDice, input.isWeary);
    return {
      maxSum: dist.maxSum,
      tailCdf: buildTailCdf(marginalizeSumDistribution(dist)),
    };
  });

  return GRID_TARGET_NUMBERS.map((targetNumber) => ({
    targetNumber,
    cells: GRID_DICE_COUNTS.map((successDice, columnIndex) => ({
      successDice,
      anySuccess:
        computeAnySuccessProbability(
          columns[columnIndex],
          featDieDistribution,
          targetNumber,
          input.isMiserable,
        ) * 100,
    })),
  }));
}

// Magical Success spends 1 Hope for an automatic success -- the Feat Die is
// never rolled. Only the Success Dice are rolled, solely to read off degree.
function resolveMagicalSuccess(
  successDice: number,
  targetNumber: number,
): TorRollResult {
  const dist = getSuccessDiceJointDistribution(successDice, false);
  const breakdown: TorRollBreakdown = {
    failure: 0,
    success: 0,
    greatSuccess: 0,
    extraordinarySuccess: 0,
  };

  for (let icons = 0; icons <= dist.diceCount; icons++) {
    let mass = 0;
    for (let sum = 0; sum <= dist.maxSum; sum++)
      mass += dist.probabilityAt[sum][icons];
    addToBucket(breakdown, icons, mass * 100);
  }

  return {
    kind: "success",
    targetNumber,
    successDice,
    breakdown,
    anySuccess: 100,
    piercingBlow: null,
    grid: null,
  };
}

export function resolveTorRoll(input: TorRollInput): TorRollResult {
  const validationError = validateTorRollInput(input);
  if (validationError) return { kind: "invalidInput", reason: validationError };

  const successDice = getEffectiveSuccessDice(input);
  const targetNumber = getTargetNumber(input);

  if (input.isMagicalSuccess) {
    return resolveMagicalSuccess(successDice, targetNumber);
  }

  const featDieDistribution = getFeatDieDistribution(input.featDieMode);
  const jointDistribution = getSuccessDiceJointDistribution(
    successDice,
    input.isWeary,
  );

  const breakdown: TorRollBreakdown = {
    failure: 0,
    success: 0,
    greatSuccess: 0,
    extraordinarySuccess: 0,
  };
  let piercingBlow = 0;

  for (const { rank, probability: featProbability } of featDieDistribution) {
    if (featProbability === 0) continue;

    if (rank === EYE_RANK && input.isMiserable) {
      breakdown.failure += featProbability;
      continue;
    }

    if (rank === GANDALF_RANK) {
      addMarginalIconMass(breakdown, jointDistribution, featProbability);
      // A Gandalf rune is always a total success, so it always clears the
      // Piercing Blow feat-die threshold too.
      piercingBlow += featProbability;
      continue;
    }

    const featValue = rank === EYE_RANK ? 0 : rank;
    addThresholdMass(
      breakdown,
      jointDistribution,
      featValue,
      targetNumber,
      featProbability,
    );

    if (featValue === PIERCING_BLOW_FEAT_VALUE) {
      piercingBlow +=
        featProbability *
        successMassAtFeatValue(jointDistribution, featValue, targetNumber);
    }
  }

  const grid = buildReferenceGrid(input, featDieDistribution);

  return {
    kind: "success",
    targetNumber,
    successDice,
    breakdown: toPercentageBreakdown(breakdown),
    anySuccess: (1 - breakdown.failure) * 100,
    piercingBlow: piercingBlow * 100,
    grid,
  };
}
