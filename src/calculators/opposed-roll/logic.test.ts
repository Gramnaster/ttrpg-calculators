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
