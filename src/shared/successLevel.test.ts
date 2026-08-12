import { describe, it, expect } from "vitest";
import {
  classifySuccessLevel,
  getEffectiveSkill,
  getSuccessLevelDistribution,
  validateSkillInput,
} from "./successLevel";

describe("getEffectiveSkill", () => {
  it("getEffectiveSkill_negativeModifier_floorsAtFive", () => {
    expect(
      getEffectiveSkill({ skillValue: 1, modifier: -50, useAltCrit: false }),
    ).toBe(5);
  });

  it("getEffectiveSkill_skillPlusModifierExceedsMaximum_isUncapped", () => {
    expect(
      getEffectiveSkill({ skillValue: 100, modifier: 20, useAltCrit: false }),
    ).toBe(120);
  });
});

describe("classifySuccessLevel", () => {
  it("classifySuccessLevel_successfulDouble_isCriticalSuccess", () => {
    expect(classifySuccessLevel(50, 22, false)).toBe("criticalSuccess");
  });

  it("classifySuccessLevel_successfulNonDouble_isModerateSuccess", () => {
    expect(classifySuccessLevel(50, 30, false)).toBe("moderateSuccess");
  });

  it("classifySuccessLevel_failedDouble_isCriticalFailure", () => {
    expect(classifySuccessLevel(10, 99, false)).toBe("criticalFailure");
  });

  it("classifySuccessLevel_failedNonDouble_isModerateFailure", () => {
    expect(classifySuccessLevel(10, 50, false)).toBe("moderateFailure");
  });

  it("classifySuccessLevel_altCritMultipleOfTenSuccess_isCriticalSuccess", () => {
    expect(classifySuccessLevel(50, 40, true)).toBe("criticalSuccess");
  });

  it("classifySuccessLevel_altCritDisabledMultipleOfTenSuccess_isModerateSuccess", () => {
    expect(classifySuccessLevel(50, 40, false)).toBe("moderateSuccess");
  });

  it("classifySuccessLevel_altCritMultipleOfTenFailure_stillModerateFailure", () => {
    // The alt-crit rule only ever expands critical success, never critical failure.
    expect(classifySuccessLevel(50, 90, true)).toBe("moderateFailure");
  });

  it("classifySuccessLevel_rollInAutoFailBandWouldOtherwiseSucceed_isModerateFailure", () => {
    expect(classifySuccessLevel(95, 95, false)).toBe("moderateFailure");
  });

  it("classifySuccessLevel_autoFailBandRollThatWouldBeADouble_isModerateFailureNotCritical", () => {
    expect(classifySuccessLevel(99, 99, false)).toBe("moderateFailure");
  });

  it("classifySuccessLevel_autoFailBandAtMaximumEffectiveSkill_isModerateFailure", () => {
    expect(classifySuccessLevel(100, 100, false)).toBe("moderateFailure");
  });

  it("classifySuccessLevel_naturalDoubleFailureBelowAutoFailBand_isCriticalFailure", () => {
    // Untouched by the auto-fail override -- this roll never would have succeeded.
    expect(classifySuccessLevel(10, 99, false)).toBe("criticalFailure");
  });

  it("classifySuccessLevel_justBelowAutoFailBand_isModerateSuccess", () => {
    expect(classifySuccessLevel(150, 94, false)).toBe("moderateSuccess");
  });
});

describe("getSuccessLevelDistribution", () => {
  it("getSuccessLevelDistribution_skillFifty_matchesHandCountedTally", () => {
    // skill 50: successes are rolls 1-50 (doubles 11/22/33/44 = 4 crits),
    // failures are rolls 51-100 (doubles 55/66/77/88/99 = 5 crits).
    const distribution = getSuccessLevelDistribution({
      skillValue: 50,
      modifier: 0,
      useAltCrit: false,
    });

    expect(distribution).toEqual({
      criticalSuccess: 4,
      moderateSuccess: 46,
      moderateFailure: 45,
      criticalFailure: 5,
    });
  });

  it("getSuccessLevelDistribution_anyInput_sumsToOneHundredPercent", () => {
    const distribution = getSuccessLevelDistribution({
      skillValue: 37,
      modifier: 15,
      useAltCrit: true,
    });

    const total =
      distribution.criticalSuccess +
      distribution.moderateSuccess +
      distribution.moderateFailure +
      distribution.criticalFailure;
    expect(total).toBeCloseTo(100, 10);
  });
});

describe("validateSkillInput", () => {
  it("validateSkillInput_skillBelowMinimum_returnsReason", () => {
    expect(
      validateSkillInput(
        { skillValue: 0, modifier: 0, useAltCrit: false },
        "Attacker",
      ),
    ).toMatch(/Attacker skill must be/);
  });

  it("validateSkillInput_skillAboveMaximum_returnsReason", () => {
    expect(
      validateSkillInput(
        { skillValue: 101, modifier: 0, useAltCrit: false },
        "Attacker",
      ),
    ).toMatch(/Attacker skill must be/);
  });

  it("validateSkillInput_nonIntegerModifier_returnsReason", () => {
    expect(
      validateSkillInput(
        { skillValue: 50, modifier: 2.5, useAltCrit: false },
        "Attacker",
      ),
    ).toMatch(/Attacker modifier must be/);
  });

  it("validateSkillInput_validInput_returnsNull", () => {
    expect(
      validateSkillInput(
        { skillValue: 50, modifier: 0, useAltCrit: false },
        "Attacker",
      ),
    ).toBeNull();
  });
});
