import {
  classifySuccessLevel,
  DIE_FACES,
  getEffectiveSkill,
  SUCCESS_LEVEL_RANK,
  validateSkillInput,
  type SkillInput,
  type SuccessLevel,
} from "../../shared/successLevel";

export interface OpposedRollProbabilities {
  effectiveSkillA: number;
  effectiveSkillB: number;
  winA: number;
  winB: number;
  tie: number;
  winACriticalSuccess: number;
  lossACriticalSuccess: number;
  winAModerateSuccess: number;
  lossAModerateSuccess: number;
  winAModerateFailure: number;
  lossAModerateFailure: number;
  winACriticalFailure: number;
  lossACriticalFailure: number;
  winBCriticalSuccess: number;
  lossBCriticalSuccess: number;
  winBModerateSuccess: number;
  lossBModerateSuccess: number;
  winBModerateFailure: number;
  lossBModerateFailure: number;
  winBCriticalFailure: number;
  lossBCriticalFailure: number;
}

export type OpposedRollResult =
  | { kind: "success"; probabilities: OpposedRollProbabilities }
  | { kind: "invalidInput"; reason: string };

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
  let lossACriticalSuccess = 0;
  let winAModerateSuccess = 0;
  let lossAModerateSuccess = 0;
  let lossAModerateFailure = 0;
  let lossACriticalFailure = 0;
  let winBCriticalSuccess = 0;
  let lossBCriticalSuccess = 0;
  let winBModerateSuccess = 0;
  let lossBModerateSuccess = 0;
  let lossBModerateFailure = 0;
  let lossBCriticalFailure = 0;

  const totalOutcomes = DIE_FACES * DIE_FACES;

  for (let rollA = 1; rollA <= DIE_FACES; rollA++) {
    const levelA = classifySuccessLevel(
      effectiveSkillA,
      rollA,
      sideA.useAltCrit,
    );
    for (let rollB = 1; rollB <= DIE_FACES; rollB++) {
      const levelB = classifySuccessLevel(
        effectiveSkillB,
        rollB,
        sideB.useAltCrit,
      );
      const winner = compareRolls(levelA, rollA, levelB, rollB);

      if (winner === "a") {
        winA++;
        // A can only out-rank B while at moderateSuccess or criticalSuccess (see compareRolls' bothMissed guard).
        if (levelA === "criticalSuccess") winACriticalSuccess++;
        else if (levelA === "moderateSuccess") winAModerateSuccess++;

        if (levelB === "criticalSuccess") lossBCriticalSuccess++;
        else if (levelB === "moderateSuccess") lossBModerateSuccess++;
        else if (levelB === "moderateFailure") lossBModerateFailure++;
        else lossBCriticalFailure++;
      } else if (winner === "b") {
        winB++;
        if (levelB === "criticalSuccess") winBCriticalSuccess++;
        else if (levelB === "moderateSuccess") winBModerateSuccess++;

        if (levelA === "criticalSuccess") lossACriticalSuccess++;
        else if (levelA === "moderateSuccess") lossAModerateSuccess++;
        else if (levelA === "moderateFailure") lossAModerateFailure++;
        else lossACriticalFailure++;
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
      lossACriticalSuccess: (lossACriticalSuccess / totalOutcomes) * 100,
      winAModerateSuccess: (winAModerateSuccess / totalOutcomes) * 100,
      lossAModerateSuccess: (lossAModerateSuccess / totalOutcomes) * 100,
      // A can never win while at moderateFailure or criticalFailure (see compareRolls' bothMissed guard).
      winAModerateFailure: 0,
      lossAModerateFailure: (lossAModerateFailure / totalOutcomes) * 100,
      winACriticalFailure: 0,
      lossACriticalFailure: (lossACriticalFailure / totalOutcomes) * 100,
      winBCriticalSuccess: (winBCriticalSuccess / totalOutcomes) * 100,
      lossBCriticalSuccess: (lossBCriticalSuccess / totalOutcomes) * 100,
      winBModerateSuccess: (winBModerateSuccess / totalOutcomes) * 100,
      lossBModerateSuccess: (lossBModerateSuccess / totalOutcomes) * 100,
      winBModerateFailure: 0,
      lossBModerateFailure: (lossBModerateFailure / totalOutcomes) * 100,
      winBCriticalFailure: 0,
      lossBCriticalFailure: (lossBCriticalFailure / totalOutcomes) * 100,
    },
  };
}
