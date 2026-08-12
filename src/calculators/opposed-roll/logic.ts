const MIN_SKILL = 1;
const MAX_SKILL = 100;
const EFFECTIVE_SKILL_FLOOR = 5;
const DIE_FACES = 100;

export type SuccessLevel =
  "criticalFailure" | "moderateFailure" | "moderateSuccess" | "criticalSuccess";

const SUCCESS_LEVEL_RANK: Record<SuccessLevel, number> = {
  criticalFailure: 0,
  moderateFailure: 1,
  moderateSuccess: 2,
  criticalSuccess: 3,
};

export interface SkillInput {
  skillValue: number;
  modifier: number;
  useAltCrit: boolean;
}

export interface OpposedRollProbabilities {
  effectiveSkillA: number;
  effectiveSkillB: number;
  winA: number;
  winB: number;
  tie: number;
  winACriticalSuccess: number;
  winBCriticalSuccess: number;
  lossACriticalFailure: number;
  lossBCriticalFailure: number;
}

export type OpposedRollResult =
  | { kind: "success"; probabilities: OpposedRollProbabilities }
  | { kind: "invalidInput"; reason: string };

function getEffectiveSkill(input: SkillInput): number {
  return Math.max(EFFECTIVE_SKILL_FLOOR, input.skillValue + input.modifier);
}

function classifyRoll(
  effectiveSkill: number,
  roll: number,
  useAltCrit: boolean,
): SuccessLevel {
  const isSuccess = roll <= effectiveSkill;
  const isDouble = roll % 11 === 0; // 11, 22, ..., 99
  const isMultipleOfTen = useAltCrit && roll % 10 === 0; // 10, 20, ..., 100

  if (isSuccess) {
    return isDouble || isMultipleOfTen ? "criticalSuccess" : "moderateSuccess";
  }
  return isDouble ? "criticalFailure" : "moderateFailure";
}

function compareRolls(
  levelA: SuccessLevel,
  rollA: number,
  levelB: SuccessLevel,
  rollB: number,
): "a" | "b" | "tie" {
  const bothMissed =
    SUCCESS_LEVEL_RANK[levelA] < SUCCESS_LEVEL_RANK.moderateSuccess &&
    SUCCESS_LEVEL_RANK[levelB] < SUCCESS_LEVEL_RANK.moderateSuccess;
  if (bothMissed) return "tie";

  if (levelA !== levelB) {
    return SUCCESS_LEVEL_RANK[levelA] > SUCCESS_LEVEL_RANK[levelB] ? "a" : "b";
  }
  if (rollA !== rollB) {
    return rollA > rollB ? "a" : "b";
  }
  return "tie";
}

function validateSkillInput(input: SkillInput, label: string): string | null {
  if (
    !Number.isInteger(input.skillValue) ||
    input.skillValue < MIN_SKILL ||
    input.skillValue > MAX_SKILL
  ) {
    return `${label} skill must be a whole number between ${MIN_SKILL} and ${MAX_SKILL}.`;
  }
  if (!Number.isInteger(input.modifier)) {
    return `${label} modifier must be a whole number.`;
  }
  return null;
}

export function resolveOpposedRoll(
  sideA: SkillInput,
  sideB: SkillInput,
): OpposedRollResult {
  const errorA = validateSkillInput(sideA, "Side A");
  if (errorA) return { kind: "invalidInput", reason: errorA };

  const errorB = validateSkillInput(sideB, "Side B");
  if (errorB) return { kind: "invalidInput", reason: errorB };

  const effectiveSkillA = getEffectiveSkill(sideA);
  const effectiveSkillB = getEffectiveSkill(sideB);

  let winA = 0;
  let winB = 0;
  let tie = 0;
  let winACriticalSuccess = 0;
  let winBCriticalSuccess = 0;
  let lossACriticalFailure = 0;
  let lossBCriticalFailure = 0;

  const totalOutcomes = DIE_FACES * DIE_FACES;

  for (let rollA = 1; rollA <= DIE_FACES; rollA++) {
    const levelA = classifyRoll(effectiveSkillA, rollA, sideA.useAltCrit);
    for (let rollB = 1; rollB <= DIE_FACES; rollB++) {
      const levelB = classifyRoll(effectiveSkillB, rollB, sideB.useAltCrit);
      const winner = compareRolls(levelA, rollA, levelB, rollB);

      if (winner === "a") {
        winA++;
        if (levelA === "criticalSuccess") winACriticalSuccess++;
        if (levelB === "criticalFailure") lossBCriticalFailure++;
      } else if (winner === "b") {
        winB++;
        if (levelB === "criticalSuccess") winBCriticalSuccess++;
        if (levelA === "criticalFailure") lossACriticalFailure++;
      } else {
        tie++;
      }
    }
  }

  return {
    kind: "success",
    probabilities: {
      effectiveSkillA,
      effectiveSkillB,
      winA: (winA / totalOutcomes) * 100,
      winB: (winB / totalOutcomes) * 100,
      tie: (tie / totalOutcomes) * 100,
      winACriticalSuccess: (winACriticalSuccess / totalOutcomes) * 100,
      winBCriticalSuccess: (winBCriticalSuccess / totalOutcomes) * 100,
      lossACriticalFailure: (lossACriticalFailure / totalOutcomes) * 100,
      lossBCriticalFailure: (lossBCriticalFailure / totalOutcomes) * 100,
    },
  };
}
