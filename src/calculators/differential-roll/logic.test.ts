import { describe, it, expect } from "vitest";
import {
  classifyDifferentialOutcome,
  LEVEL_DISPLAY_ORDER,
  resolveDifferentialRoll,
} from "./logic";
import type { SuccessLevel } from "../../shared/successLevel";
import type { DifferentialRollMode, SeWinner } from "./logic";

const CRITICAL: SuccessLevel = "criticalSuccess";
const SUCCESS: SuccessLevel = "moderateSuccess";
const FAILURE: SuccessLevel = "moderateFailure";
const FUMBLE: SuccessLevel = "criticalFailure";

const evenSkill = { skillValue: 50, modifier: 0, useAltCrit: false };

describe("classifyDifferentialOutcome", () => {
  // [mode, defenderLevel, attackerLevel, outcome, seWinner, se]
  const cases: [
    DifferentialRollMode,
    SuccessLevel,
    SuccessLevel,
    string,
    SeWinner,
    number,
  ][] = [
    // --- parry vs. attack ---
    ["parry", CRITICAL, CRITICAL, "parrySucceeds", "none", 0],
    ["parry", CRITICAL, SUCCESS, "parrySucceeds", "defender", 1],
    ["parry", CRITICAL, FAILURE, "attackMisses", "defender", 2],
    ["parry", CRITICAL, FUMBLE, "attackMisses", "defender", 3],
    ["parry", SUCCESS, CRITICAL, "parrySucceeds", "attacker", 1],
    ["parry", SUCCESS, SUCCESS, "parrySucceeds", "none", 0],
    ["parry", SUCCESS, FAILURE, "attackMisses", "defender", 1],
    ["parry", SUCCESS, FUMBLE, "attackMisses", "defender", 2],
    ["parry", FAILURE, CRITICAL, "attackHits", "attacker", 2],
    ["parry", FAILURE, SUCCESS, "attackHits", "attacker", 1],
    ["parry", FAILURE, FAILURE, "attackMisses", "none", 0],
    ["parry", FAILURE, FUMBLE, "attackMisses", "none", 0],
    ["parry", FUMBLE, CRITICAL, "attackHits", "attacker", 3],
    ["parry", FUMBLE, SUCCESS, "attackHits", "attacker", 2],
    ["parry", FUMBLE, FAILURE, "attackMisses", "none", 0],
    ["parry", FUMBLE, FUMBLE, "attackMisses", "none", 0],
    // --- counter vs. attack ---
    ["counter", CRITICAL, CRITICAL, "bothHit", "none", 0],
    ["counter", CRITICAL, SUCCESS, "bothHit", "defender", 1],
    ["counter", CRITICAL, FAILURE, "counterHits", "defender", 2],
    ["counter", CRITICAL, FUMBLE, "counterHits", "defender", 3],
    ["counter", SUCCESS, CRITICAL, "bothHit", "attacker", 2],
    ["counter", SUCCESS, SUCCESS, "bothHit", "none", 0],
    ["counter", SUCCESS, FAILURE, "counterHits", "defender", 1],
    ["counter", SUCCESS, FUMBLE, "counterHits", "defender", 2],
    ["counter", FAILURE, CRITICAL, "attackHits", "attacker", 3],
    ["counter", FAILURE, SUCCESS, "attackHits", "attacker", 2],
    ["counter", FAILURE, FAILURE, "attackMisses", "none", 0],
    ["counter", FAILURE, FUMBLE, "attackMisses", "none", 0],
    ["counter", FUMBLE, CRITICAL, "attackHits", "attacker", 4],
    ["counter", FUMBLE, SUCCESS, "attackHits", "attacker", 3],
    ["counter", FUMBLE, FAILURE, "attackMisses", "none", 0],
    ["counter", FUMBLE, FUMBLE, "attackMisses", "none", 0],
  ];

  it.each(cases)(
    "%s: defender=%s vs attacker=%s -> %s / %s %d SE",
    (mode, defenderLevel, attackerLevel, outcome, seWinner, se) => {
      expect(
        classifyDifferentialOutcome(mode, attackerLevel, defenderLevel),
      ).toEqual({ outcome, seWinner, se });
    },
  );
});

describe("resolveDifferentialRoll", () => {
  it.each(["parry", "counter"] as const)(
    "resolveDifferentialRoll_%s_gridSumsToHundredPercent",
    (mode) => {
      const result = resolveDifferentialRoll(mode, evenSkill, evenSkill);

      expect(result.kind).toBe("success");
      if (result.kind !== "success") return;
      const total = result.rows
        .flat()
        .reduce((sum, cell) => sum + cell.probability, 0);
      expect(total).toBeCloseTo(100, 5);
    },
  );

  it("resolveDifferentialRoll_anyInput_producesAFourByFourGridInDisplayOrder", () => {
    const result = resolveDifferentialRoll("parry", evenSkill, evenSkill);

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.rows).toHaveLength(4);
    result.rows.forEach((row, rowIndex) => {
      expect(row).toHaveLength(4);
      row.forEach((cell, colIndex) => {
        expect(cell.defenderLevel).toBe(LEVEL_DISPLAY_ORDER[rowIndex]);
        expect(cell.attackerLevel).toBe(LEVEL_DISPLAY_ORDER[colIndex]);
      });
    });
  });

  it("resolveDifferentialRoll_eachCell_matchesClassifyDifferentialOutcome", () => {
    const mode: DifferentialRollMode = "counter";
    const result = resolveDifferentialRoll(mode, evenSkill, evenSkill);

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    for (const row of result.rows) {
      for (const cell of row) {
        expect(
          classifyDifferentialOutcome(
            mode,
            cell.attackerLevel,
            cell.defenderLevel,
          ),
        ).toEqual({
          outcome: cell.outcome,
          seWinner: cell.seWinner,
          se: cell.se,
        });
      }
    }
  });

  it("resolveDifferentialRoll_evenSkills_criticalVsCriticalCellIsProductOfBothCriticalRates", () => {
    // skill 50 vs skill 50: each side crits on 4/100 rolls (11, 22, 33, 44).
    const result = resolveDifferentialRoll("parry", evenSkill, evenSkill);

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    const cell = result.rows[0][0];
    expect(cell.defenderLevel).toBe(CRITICAL);
    expect(cell.attackerLevel).toBe(CRITICAL);
    expect(cell.probability).toBeCloseTo((4 * 4) / 100, 10);
  });

  it("resolveDifferentialRoll_flooredSkillBothSides_worstCellIsProductOfBothFailureRates", () => {
    const flooredSkill = { skillValue: 1, modifier: -50, useAltCrit: false }; // effective skill floors at 5
    // The skill floor guarantees a 5% success chance, so 95/100 rolls fail --
    // but 9 of those 95 (11, 22, ..., 99) are doubles and land in
    // criticalFailure instead, leaving 86/100 as moderateFailure specifically.
    const result = resolveDifferentialRoll("parry", flooredSkill, flooredSkill);

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    const failureIndex = LEVEL_DISPLAY_ORDER.indexOf(FAILURE);
    const cell = result.rows[failureIndex][failureIndex];
    expect(cell.defenderLevel).toBe(FAILURE);
    expect(cell.attackerLevel).toBe(FAILURE);
    expect(cell.probability).toBeCloseTo((86 * 86) / 100, 10);
  });

  it("resolveDifferentialRoll_invalidAttackerSkill_returnsInvalidInput", () => {
    const result = resolveDifferentialRoll(
      "parry",
      { skillValue: 0, modifier: 0, useAltCrit: false },
      evenSkill,
    );

    expect(result.kind).toBe("invalidInput");
  });

  it("resolveDifferentialRoll_invalidDefenderSkill_returnsInvalidInput", () => {
    const result = resolveDifferentialRoll("parry", evenSkill, {
      skillValue: 101,
      modifier: 0,
      useAltCrit: false,
    });

    expect(result.kind).toBe("invalidInput");
  });
});
