const MIN_SKILL = 1;
const MAX_SKILL = 100;
const EFFECTIVE_SKILL_FLOOR = 5;
export const DIE_FACES = 100;
// 95-00 always fails as a moderate failure, even against an effective skill
// high enough to otherwise succeed. Rolls that fail on their own merits keep
// their normal critical-failure-on-doubles classification.
const AUTO_FAIL_MIN_ROLL = 95;

export type SuccessLevel =
  "criticalFailure" | "moderateFailure" | "moderateSuccess" | "criticalSuccess";

export const SUCCESS_LEVEL_RANK: Record<SuccessLevel, number> = {
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

export function getEffectiveSkill(input: SkillInput): number {
  return Math.max(EFFECTIVE_SKILL_FLOOR, input.skillValue + input.modifier);
}

export function classifySuccessLevel(
  effectiveSkill: number,
  roll: number,
  useAltCrit: boolean,
): SuccessLevel {
  const wouldSucceed = roll <= effectiveSkill;
  const isDouble = roll % 11 === 0; // 11, 22, ..., 99
  const isMultipleOfTen = useAltCrit && roll % 10 === 0; // 10, 20, ..., 100

  if (wouldSucceed && roll >= AUTO_FAIL_MIN_ROLL) {
    return "moderateFailure";
  }
  if (wouldSucceed) {
    return isDouble || isMultipleOfTen ? "criticalSuccess" : "moderateSuccess";
  }
  return isDouble ? "criticalFailure" : "moderateFailure";
}

export function getSuccessLevelDistribution(
  input: SkillInput,
): Record<SuccessLevel, number> {
  const effectiveSkill = getEffectiveSkill(input);
  const counts: Record<SuccessLevel, number> = {
    criticalFailure: 0,
    moderateFailure: 0,
    moderateSuccess: 0,
    criticalSuccess: 0,
  };

  for (let roll = 1; roll <= DIE_FACES; roll++) {
    counts[classifySuccessLevel(effectiveSkill, roll, input.useAltCrit)] += 1;
  }

  return {
    criticalFailure: (counts.criticalFailure / DIE_FACES) * 100,
    moderateFailure: (counts.moderateFailure / DIE_FACES) * 100,
    moderateSuccess: (counts.moderateSuccess / DIE_FACES) * 100,
    criticalSuccess: (counts.criticalSuccess / DIE_FACES) * 100,
  };
}

export function validateSkillInput(
  input: SkillInput,
  label: string,
): string | null {
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
