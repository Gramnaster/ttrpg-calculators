import {
  getSuccessLevelDistribution,
  SUCCESS_LEVEL_RANK,
  validateSkillInput,
  type SkillInput,
  type SuccessLevel,
} from "../../shared/successLevel";

export type DifferentialRollMode = "parry" | "counter";

export type DifferentialOutcome =
  "attackMisses" | "parrySucceeds" | "attackHits" | "bothHit" | "counterHits";

export type SeWinner = "attacker" | "defender" | "none";

export interface DifferentialGridCell {
  attackerLevel: SuccessLevel;
  defenderLevel: SuccessLevel;
  outcome: DifferentialOutcome;
  seWinner: SeWinner;
  se: number;
  probability: number;
}

export type DifferentialRollResult =
  | { kind: "success"; rows: DifferentialGridCell[][] }
  | { kind: "invalidInput"; reason: string };

// Row/column display order matches the reference tables -- Critical,
// Success, Failure, Fumble -- not SUCCESS_LEVEL_RANK's ascending order.
export const LEVEL_DISPLAY_ORDER: readonly SuccessLevel[] = [
  "criticalSuccess",
  "moderateSuccess",
  "moderateFailure",
  "criticalFailure",
];

type OutcomeShape = Pick<DifferentialGridCell, "outcome" | "seWinner" | "se">;

function isSuccessTier(level: SuccessLevel): boolean {
  return SUCCESS_LEVEL_RANK[level] >= SUCCESS_LEVEL_RANK.moderateSuccess;
}

function outcomeFor(
  mode: DifferentialRollMode,
  attackerSucceeded: boolean,
  defenderSucceeded: boolean,
): DifferentialOutcome {
  if (mode === "parry") {
    if (!attackerSucceeded) return "attackMisses";
    return defenderSucceeded ? "parrySucceeds" : "attackHits";
  }
  if (attackerSucceeded && defenderSucceeded) return "bothHit";
  if (attackerSucceeded) return "attackHits";
  if (defenderSucceeded) return "counterHits";
  return "attackMisses";
}

// Compares the attacker's and defender's already-rolled success levels and
// determines the narrative outcome plus the Special Effect (SE) magnitude.
//
// Both sides landing in the failure tier (moderateFailure or criticalFailure)
// is always a wash -- SE is 0 regardless of which specific failure level each
// side rolled. Otherwise SE is the raw rank difference, awarded to whichever
// side ranks higher. In counter mode specifically, an attacker who wins the
// exchange gets +1 SE on top of the raw difference -- countering carries
// extra risk that a pure parry doesn't.
export function classifyDifferentialOutcome(
  mode: DifferentialRollMode,
  attackerLevel: SuccessLevel,
  defenderLevel: SuccessLevel,
): OutcomeShape {
  const attackerRank = SUCCESS_LEVEL_RANK[attackerLevel];
  const defenderRank = SUCCESS_LEVEL_RANK[defenderLevel];
  const attackerSucceeded = isSuccessTier(attackerLevel);
  const defenderSucceeded = isSuccessTier(defenderLevel);
  const outcome = outcomeFor(mode, attackerSucceeded, defenderSucceeded);

  if (!attackerSucceeded && !defenderSucceeded) {
    return { outcome, seWinner: "none", se: 0 };
  }
  if (defenderRank === attackerRank) {
    return { outcome, seWinner: "none", se: 0 };
  }

  const rawDiff = Math.abs(defenderRank - attackerRank);
  if (defenderRank > attackerRank) {
    return { outcome, seWinner: "defender", se: rawDiff };
  }
  const counterPenalty = mode === "counter" ? 1 : 0;
  return { outcome, seWinner: "attacker", se: rawDiff + counterPenalty };
}

// Attacker and defender rolls are independent, so each grid cell's exact
// probability is the product of the two sides' per-level distributions --
// no need to enumerate all 100x100 roll pairs.
export function resolveDifferentialRoll(
  mode: DifferentialRollMode,
  attacker: SkillInput,
  defender: SkillInput,
): DifferentialRollResult {
  const errorAttacker = validateSkillInput(attacker, "Attacker");
  if (errorAttacker) return { kind: "invalidInput", reason: errorAttacker };

  const errorDefender = validateSkillInput(defender, "Defender");
  if (errorDefender) return { kind: "invalidInput", reason: errorDefender };

  const attackerDistribution = getSuccessLevelDistribution(attacker);
  const defenderDistribution = getSuccessLevelDistribution(defender);

  const rows = LEVEL_DISPLAY_ORDER.map((defenderLevel) =>
    LEVEL_DISPLAY_ORDER.map((attackerLevel) => ({
      ...classifyDifferentialOutcome(mode, attackerLevel, defenderLevel),
      attackerLevel,
      defenderLevel,
      probability:
        (attackerDistribution[attackerLevel] *
          defenderDistribution[defenderLevel]) /
        100,
    })),
  );

  return { kind: "success", rows };
}
