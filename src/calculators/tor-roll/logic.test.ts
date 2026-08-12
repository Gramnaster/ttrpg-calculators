import { describe, it, expect } from "vitest";
import {
  getFeatDieDistribution,
  getSuccessDiceJointDistribution,
  resolveTorRoll,
  GRID_DICE_COUNTS,
  GRID_TARGET_NUMBERS,
  type TorRollInput,
} from "./logic";

const baseInput: TorRollInput = {
  rating: 2,
  attribute: 7,
  targetNumberBase: 20,
  targetNumberModifier: 0,
  diceModifier: 0,
  featDieMode: "normal",
  isWeary: false,
  isMiserable: false,
  isMagicalSuccess: false,
};

describe("getFeatDieDistribution", () => {
  it.each(["normal", "favoured", "illFavoured"] as const)(
    "getFeatDieDistribution_%s_probabilitiesSumToOne",
    (mode) => {
      const distribution = getFeatDieDistribution(mode);
      const total = distribution.reduce(
        (sum, { probability }) => sum + probability,
        0,
      );
      expect(total).toBeCloseTo(1, 10);
    },
  );

  it("getFeatDieDistribution_favoured_matchesMaxOfTwoDrawsClosedForm", () => {
    const distribution = getFeatDieDistribution("favoured");
    expect(distribution[0].probability).toBeCloseTo(1 / 144, 10);
    expect(distribution[11].probability).toBeCloseTo(23 / 144, 10);
  });

  it("getFeatDieDistribution_illFavoured_matchesMinOfTwoDrawsClosedForm", () => {
    const distribution = getFeatDieDistribution("illFavoured");
    expect(distribution[0].probability).toBeCloseTo(23 / 144, 10);
    expect(distribution[11].probability).toBeCloseTo(1 / 144, 10);
  });
});

describe("getSuccessDiceJointDistribution", () => {
  it("getSuccessDiceJointDistribution_zeroDice_isCertainlyZeroSumZeroIcons", () => {
    const dist = getSuccessDiceJointDistribution(0, false);
    expect(dist.probabilityAt[0][0]).toBe(1);
  });

  it.each([1, 3, 6, 12, 20])(
    "getSuccessDiceJointDistribution_%iDiceNotWeary_probabilitiesSumToOne",
    (diceCount) => {
      const dist = getSuccessDiceJointDistribution(diceCount, false);
      const total = dist.probabilityAt.flat().reduce((sum, p) => sum + p, 0);
      expect(total).toBeCloseTo(1, 8);
    },
  );

  it.each([1, 3, 6, 12, 20])(
    "getSuccessDiceJointDistribution_%iDiceWeary_probabilitiesSumToOne",
    (diceCount) => {
      const dist = getSuccessDiceJointDistribution(diceCount, true);
      const total = dist.probabilityAt.flat().reduce((sum, p) => sum + p, 0);
      expect(total).toBeCloseTo(1, 8);
    },
  );
});

describe("resolveTorRoll", () => {
  it("resolveTorRoll_zeroSuccessDice_successEqualsGandalfRuneChance", () => {
    // TN 16 is out of reach for any numeric Feat Die face (max 10), so only
    // the Gandalf rune (1/12) can succeed.
    const result = resolveTorRoll({ ...baseInput, rating: 0, attribute: 4 });

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.successDice).toBe(0);
    expect(result.anySuccess).toBeCloseTo(100 / 12, 4);
  });

  it("resolveTorRoll_zeroSuccessDiceFavoured_successIsChanceEitherFeatDieIsGandalf", () => {
    const result = resolveTorRoll({
      ...baseInput,
      rating: 0,
      attribute: 4,
      featDieMode: "favoured",
    });

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.anySuccess).toBeCloseTo((23 / 144) * 100, 4);
  });

  const breakdownCases: [string, Partial<TorRollInput>][] = [
    ["zeroRating", { rating: 0, attribute: 5 }],
    ["weary", { rating: 2, attribute: 7, isWeary: true }],
    ["miserable", { rating: 4, attribute: 3, isMiserable: true }],
    ["favoured", { rating: 6, attribute: 9, featDieMode: "favoured" }],
    ["illFavoured", { rating: 3, attribute: 6, featDieMode: "illFavoured" }],
  ];

  it.each(breakdownCases)(
    "resolveTorRoll_%s_breakdownSumsToOneHundredPercent",
    (_label, overrides) => {
      const result = resolveTorRoll({ ...baseInput, ...overrides });

      expect(result.kind).toBe("success");
      if (result.kind !== "success") return;
      const { breakdown } = result;
      expect(
        breakdown.failure +
          breakdown.success +
          breakdown.greatSuccess +
          breakdown.extraordinarySuccess,
      ).toBeCloseTo(100, 6);
    },
  );

  it("resolveTorRoll_miserable_lowersSuccessRelativeToNotMiserable", () => {
    const input: TorRollInput = { ...baseInput, rating: 4, attribute: 8 };

    const notMiserable = resolveTorRoll(input);
    const miserable = resolveTorRoll({ ...input, isMiserable: true });

    expect(notMiserable.kind).toBe("success");
    expect(miserable.kind).toBe("success");
    if (notMiserable.kind !== "success" || miserable.kind !== "success") {
      return;
    }
    expect(miserable.anySuccess).toBeLessThan(notMiserable.anySuccess);
  });

  it("resolveTorRoll_weary_lowersSuccessRelativeToNotWeary", () => {
    const input: TorRollInput = { ...baseInput, rating: 4, attribute: 7 };

    const notWeary = resolveTorRoll(input);
    const weary = resolveTorRoll({ ...input, isWeary: true });

    expect(notWeary.kind).toBe("success");
    expect(weary.kind).toBe("success");
    if (notWeary.kind !== "success" || weary.kind !== "success") return;
    expect(weary.anySuccess).toBeLessThan(notWeary.anySuccess);
  });

  it("resolveTorRoll_favouredAndIllFavoured_bracketNormalSuccess", () => {
    const input: TorRollInput = { ...baseInput, rating: 3, attribute: 6 };

    const normal = resolveTorRoll(input);
    const favoured = resolveTorRoll({ ...input, featDieMode: "favoured" });
    const illFavoured = resolveTorRoll({
      ...input,
      featDieMode: "illFavoured",
    });

    expect(normal.kind).toBe("success");
    expect(favoured.kind).toBe("success");
    expect(illFavoured.kind).toBe("success");
    if (
      normal.kind !== "success" ||
      favoured.kind !== "success" ||
      illFavoured.kind !== "success"
    ) {
      return;
    }
    expect(illFavoured.anySuccess).toBeLessThanOrEqual(normal.anySuccess);
    expect(normal.anySuccess).toBeLessThanOrEqual(favoured.anySuccess);
  });

  it("resolveTorRoll_magicalSuccess_iconBreakdownMatchesBinomial", () => {
    const result = resolveTorRoll({
      ...baseInput,
      rating: 3,
      isMagicalSuccess: true,
    });

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    // Binomial(3, 1/6): P(0)=125/216, P(1)=75/216, P(>=2)=16/216.
    expect(result.breakdown.failure).toBe(0);
    expect(result.breakdown.success).toBeCloseTo(57.8704, 3);
    expect(result.breakdown.greatSuccess).toBeCloseTo(34.7222, 3);
    expect(result.breakdown.extraordinarySuccess).toBeCloseTo(7.4074, 3);
  });

  it("resolveTorRoll_normalRoll_iconOddsGivenSuccessExceedTheBinomialMarginal", () => {
    // The digest claims icon count is independent of whether the total met
    // the TN. It isn't: more 6s means a higher sum, which correlates with
    // clearing the TN, so the icon distribution shifts upward once you
    // condition on success. This is the joint-distribution correction noted
    // in the plan.
    const input: TorRollInput = { ...baseInput, rating: 3, attribute: 6 };
    const result = resolveTorRoll(input);

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    const marginalAtLeastOneIcon = 1 - Math.pow(5 / 6, input.rating);
    const conditionalAtLeastOneIcon =
      (result.breakdown.greatSuccess + result.breakdown.extraordinarySuccess) /
      result.anySuccess;

    expect(conditionalAtLeastOneIcon).toBeGreaterThan(marginalAtLeastOneIcon);
  });

  it("resolveTorRoll_ratingAboveSix_returnsInvalidInput", () => {
    const result = resolveTorRoll({ ...baseInput, rating: 7 });

    expect(result.kind).toBe("invalidInput");
  });

  it("resolveTorRoll_diceModifierBelowNegativeRating_floorsPoolAtZero", () => {
    const result = resolveTorRoll({
      ...baseInput,
      rating: 2,
      diceModifier: -5,
    });

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.successDice).toBe(0);
  });

  it("resolveTorRoll_diceModifierAboveCap_returnsInvalidInput", () => {
    const result = resolveTorRoll({
      ...baseInput,
      rating: 6,
      diceModifier: 20,
    });

    expect(result.kind).toBe("invalidInput");
  });

  it("resolveTorRoll_magicalSuccess_piercingBlowAndGridAreNull", () => {
    const result = resolveTorRoll({ ...baseInput, isMagicalSuccess: true });

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.piercingBlow).toBeNull();
    expect(result.grid).toBeNull();
  });

  it("resolveTorRoll_gridCell_matchesDirectResolveAtThatTargetNumberAndPool", () => {
    const input: TorRollInput = { ...baseInput, rating: 5, attribute: 7 };
    const result = resolveTorRoll(input);

    expect(result.kind).toBe("success");
    if (result.kind !== "success" || result.grid === null) return;

    const targetNumber = GRID_TARGET_NUMBERS[7]; // 17
    const successDice = GRID_DICE_COUNTS[2]; // 2
    const row = result.grid.find((r) => r.targetNumber === targetNumber);
    const cell = row?.cells.find((c) => c.successDice === successDice);
    expect(cell).toBeDefined();

    const direct = resolveTorRoll({
      ...input,
      rating: successDice,
      diceModifier: 0,
      attribute: 20 - targetNumber,
      targetNumberModifier: 0,
    });
    expect(direct.kind).toBe("success");
    if (direct.kind !== "success") return;
    expect(cell?.anySuccess).toBeCloseTo(direct.anySuccess, 6);
  });
});
