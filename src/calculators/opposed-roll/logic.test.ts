import { describe, it, expect } from "vitest";
import { resolveOpposedRoll, type SkillInput } from "./logic";

const evenSkill: SkillInput = {
  skillValue: 50,
  modifier: 0,
  useAltCrit: false,
};

describe("resolveOpposedRoll", () => {
  it("resolveOpposedRoll_symmetricSkills_winProbabilitiesAreEqualAndSumToHundred", () => {
    const result = resolveOpposedRoll(evenSkill, evenSkill);

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.probabilities.winA).toBeCloseTo(result.probabilities.winB, 5);
    expect(
      result.probabilities.winA +
        result.probabilities.winB +
        result.probabilities.tie,
    ).toBeCloseTo(100, 5);
  });

  it("resolveOpposedRoll_higherSkillSide_hasHigherWinProbability", () => {
    const strong: SkillInput = {
      skillValue: 80,
      modifier: 0,
      useAltCrit: false,
    };
    const weak: SkillInput = { skillValue: 20, modifier: 0, useAltCrit: false };

    const result = resolveOpposedRoll(strong, weak);

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.probabilities.winA).toBeGreaterThan(
      result.probabilities.winB,
    );
  });

  it("resolveOpposedRoll_minimumSkillWithLargeNegativeModifier_floorsEffectiveSkillAtFive", () => {
    const flooredSide: SkillInput = {
      skillValue: 1,
      modifier: -50,
      useAltCrit: false,
    };

    const result = resolveOpposedRoll(flooredSide, evenSkill);

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.probabilities.effectiveSkillA).toBe(5);
  });

  it("resolveOpposedRoll_skillPlusModifierExceedsMaximum_effectiveSkillIsUncapped", () => {
    const overCap: SkillInput = {
      skillValue: 100,
      modifier: 20,
      useAltCrit: false,
    };

    const result = resolveOpposedRoll(overCap, evenSkill);

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.probabilities.effectiveSkillA).toBe(120);
  });

  it("resolveOpposedRoll_altCritEnabled_neverDecreasesCriticalSuccessRate", () => {
    const withoutAltCrit = resolveOpposedRoll(evenSkill, evenSkill);
    const withAltCrit = resolveOpposedRoll(
      { ...evenSkill, useAltCrit: true },
      evenSkill,
    );

    expect(withoutAltCrit.kind).toBe("success");
    expect(withAltCrit.kind).toBe("success");
    if (withoutAltCrit.kind !== "success" || withAltCrit.kind !== "success")
      return;
    expect(withAltCrit.probabilities.winACriticalSuccess).toBeGreaterThan(
      withoutAltCrit.probabilities.winACriticalSuccess,
    );
  });

  it("resolveOpposedRoll_effectiveSkillAtOrAboveNinetyFive_stillHasNonZeroFailureChance", () => {
    // Rolls 95-100 always fail (moderate failure), even against an effective
    // skill high enough to otherwise succeed on them.
    const maxedOut: SkillInput = {
      skillValue: 100,
      modifier: 0,
      useAltCrit: false,
    };

    const result = resolveOpposedRoll(maxedOut, maxedOut);

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.probabilities.lossAModerateFailure).toBeGreaterThan(0);
    expect(result.probabilities.lossBModerateFailure).toBeGreaterThan(0);
  });

  it("resolveOpposedRoll_lowSkillNaturalDoubleFailure_stillClassifiesAsCriticalFailure", () => {
    // A roll of 99 that fails on its own merits (not via the 95-00 auto-fail
    // rule) is still a double, so it should still count as a critical failure.
    const lowSkill: SkillInput = {
      skillValue: 10,
      modifier: 0,
      useAltCrit: false,
    };
    const strongSkill: SkillInput = {
      skillValue: 100,
      modifier: 0,
      useAltCrit: false,
    };

    const result = resolveOpposedRoll(lowSkill, strongSkill);

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.probabilities.lossACriticalFailure).toBeGreaterThan(0);
  });

  it("resolveOpposedRoll_anySkills_winBreakdownByLevelSumsToWinTotal", () => {
    const strong: SkillInput = {
      skillValue: 80,
      modifier: 0,
      useAltCrit: false,
    };
    const weak: SkillInput = { skillValue: 20, modifier: 0, useAltCrit: false };

    const result = resolveOpposedRoll(strong, weak);

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    const { probabilities } = result;
    expect(
      probabilities.winACriticalSuccess + probabilities.winAModerateSuccess,
    ).toBeCloseTo(probabilities.winA, 5);
    expect(
      probabilities.winBCriticalSuccess + probabilities.winBModerateSuccess,
    ).toBeCloseTo(probabilities.winB, 5);
  });

  it("resolveOpposedRoll_anySkills_lossBreakdownByLevelSumsToOpponentWinTotal", () => {
    const strong: SkillInput = {
      skillValue: 80,
      modifier: 0,
      useAltCrit: false,
    };
    const weak: SkillInput = { skillValue: 20, modifier: 0, useAltCrit: false };

    const result = resolveOpposedRoll(strong, weak);

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    const { probabilities } = result;
    // Every A-win corresponds to exactly one of B's four success levels.
    expect(
      probabilities.lossBCriticalSuccess +
        probabilities.lossBModerateSuccess +
        probabilities.lossBModerateFailure +
        probabilities.lossBCriticalFailure,
    ).toBeCloseTo(probabilities.winA, 5);
  });

  it("resolveOpposedRoll_anySkills_winningOnAFailedRollIsAlwaysZero", () => {
    const result = resolveOpposedRoll(evenSkill, evenSkill);

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.probabilities.winAModerateFailure).toBe(0);
    expect(result.probabilities.winACriticalFailure).toBe(0);
    expect(result.probabilities.winBModerateFailure).toBe(0);
    expect(result.probabilities.winBCriticalFailure).toBe(0);
  });

  it("resolveOpposedRoll_skillValueBelowMinimum_returnsInvalidInput", () => {
    const result = resolveOpposedRoll(
      { skillValue: 0, modifier: 0, useAltCrit: false },
      evenSkill,
    );

    expect(result.kind).toBe("invalidInput");
  });

  it("resolveOpposedRoll_skillValueAboveMaximum_returnsInvalidInput", () => {
    const result = resolveOpposedRoll(
      { skillValue: 101, modifier: 0, useAltCrit: false },
      evenSkill,
    );

    expect(result.kind).toBe("invalidInput");
  });

  it("resolveOpposedRoll_nonIntegerModifier_returnsInvalidInput", () => {
    const result = resolveOpposedRoll(
      { skillValue: 50, modifier: 2.5, useAltCrit: false },
      evenSkill,
    );

    expect(result.kind).toBe("invalidInput");
  });
});
