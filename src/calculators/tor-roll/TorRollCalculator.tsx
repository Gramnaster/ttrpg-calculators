import { type ChangeEvent, useState } from "react";
import {
  GRID_DICE_COUNTS,
  MAX_ATTRIBUTE,
  MAX_RATING,
  MIN_ATTRIBUTE,
  MIN_RATING,
  getTargetNumber,
  resolveTorRoll,
  type FeatDieMode,
  type TorRollInput,
} from "./logic";
import { StatRow } from "../../shared/StatRow";

const DEFAULT_INPUT: TorRollInput = {
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

const FEAT_DIE_MODE_LABEL: Record<FeatDieMode, string> = {
  normal: "Normal",
  favoured: "Favoured",
  illFavoured: "Ill-favoured",
};

const numberInputClassName =
  "w-20 border border-rule bg-paper px-2 py-1 text-right font-mono text-ink tabular-nums outline-none focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";

const checkableInputClassName =
  "h-4 w-4 accent-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function TorRollCalculator() {
  const [input, setInput] = useState<TorRollInput>(DEFAULT_INPUT);

  const result = resolveTorRoll(input);

  function handleRatingChange(event: ChangeEvent<HTMLInputElement>) {
    setInput((prev) => ({ ...prev, rating: event.target.valueAsNumber }));
  }

  function handleAttributeChange(event: ChangeEvent<HTMLInputElement>) {
    setInput((prev) => ({ ...prev, attribute: event.target.valueAsNumber }));
  }

  function handleTargetNumberModifierChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setInput((prev) => ({
      ...prev,
      targetNumberModifier: event.target.valueAsNumber,
    }));
  }

  function handleDiceModifierChange(event: ChangeEvent<HTMLInputElement>) {
    setInput((prev) => ({
      ...prev,
      diceModifier: event.target.valueAsNumber,
    }));
  }

  function handleWearyChange(event: ChangeEvent<HTMLInputElement>) {
    setInput((prev) => ({ ...prev, isWeary: event.target.checked }));
  }

  function handleMiserableChange(event: ChangeEvent<HTMLInputElement>) {
    setInput((prev) => ({ ...prev, isMiserable: event.target.checked }));
  }

  function handleMagicalSuccessChange(event: ChangeEvent<HTMLInputElement>) {
    setInput((prev) => ({ ...prev, isMagicalSuccess: event.target.checked }));
  }

  return (
    <section
      aria-labelledby="tor-roll-heading"
      className="flex max-w-4xl flex-col gap-8"
    >
      <div>
        <h2
          id="tor-roll-heading"
          className="font-display text-2xl font-semibold text-ink"
        >
          The One Ring Roll Calculator
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Resolve a Feat Die + Success Dice roll against a Target Number and see
          the odds of every degree of success.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <fieldset className="flex flex-col gap-3 border border-rule bg-paper-raised px-4 py-4">
          <legend className="px-1 font-display text-base font-semibold text-ink">
            The Roll
          </legend>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="tor-roll-rating" className="text-sm text-ink-muted">
              Rating
            </label>
            <input
              id="tor-roll-rating"
              type="number"
              min={MIN_RATING}
              max={MAX_RATING}
              step={1}
              value={input.rating}
              onChange={handleRatingChange}
              className={numberInputClassName}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="tor-roll-attribute"
              className="text-sm text-ink-muted"
            >
              Attribute
            </label>
            <input
              id="tor-roll-attribute"
              type="number"
              min={MIN_ATTRIBUTE}
              max={MAX_ATTRIBUTE}
              step={1}
              value={input.attribute}
              onChange={handleAttributeChange}
              className={numberInputClassName}
            />
          </div>
          <p className="text-sm text-ink-muted">
            Target Number:{" "}
            <span className="font-mono text-ink tabular-nums">
              {getTargetNumber(input)}
            </span>
          </p>
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm text-ink-muted">
              Target Number Base
            </legend>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-ink-muted">
                <input
                  type="radio"
                  name="tor-roll-tn-base"
                  checked={input.targetNumberBase === 20}
                  onChange={() =>
                    setInput((prev) => ({ ...prev, targetNumberBase: 20 }))
                  }
                  className={checkableInputClassName}
                />
                20 (standard)
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-muted">
                <input
                  type="radio"
                  name="tor-roll-tn-base"
                  checked={input.targetNumberBase === 18}
                  onChange={() =>
                    setInput((prev) => ({ ...prev, targetNumberBase: 18 }))
                  }
                  className={checkableInputClassName}
                />
                18 (short campaign)
              </label>
            </div>
          </fieldset>
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="tor-roll-tn-modifier"
              className="text-sm text-ink-muted"
            >
              TN Modifier
            </label>
            <input
              id="tor-roll-tn-modifier"
              type="number"
              step={1}
              value={input.targetNumberModifier}
              onChange={handleTargetNumberModifierChange}
              className={numberInputClassName}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="tor-roll-dice-modifier"
              className="text-sm text-ink-muted"
            >
              Dice Modifier
            </label>
            <input
              id="tor-roll-dice-modifier"
              type="number"
              step={1}
              value={input.diceModifier}
              onChange={handleDiceModifierChange}
              className={numberInputClassName}
            />
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-3 border border-rule bg-paper-raised px-4 py-4">
          <legend className="px-1 font-display text-base font-semibold text-ink">
            Conditions
          </legend>
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm text-ink-muted">Feat Die</legend>
            <div className="flex flex-col gap-1.5">
              {(Object.keys(FEAT_DIE_MODE_LABEL) as FeatDieMode[]).map(
                (mode) => (
                  <label
                    key={mode}
                    className="flex items-center gap-2 text-sm text-ink-muted"
                  >
                    <input
                      type="radio"
                      name="tor-roll-feat-die-mode"
                      checked={input.featDieMode === mode}
                      onChange={() =>
                        setInput((prev) => ({ ...prev, featDieMode: mode }))
                      }
                      className={checkableInputClassName}
                    />
                    {FEAT_DIE_MODE_LABEL[mode]}
                  </label>
                ),
              )}
            </div>
          </fieldset>
          <div className="flex items-center gap-2">
            <input
              id="tor-roll-weary"
              type="checkbox"
              checked={input.isWeary}
              onChange={handleWearyChange}
              className={checkableInputClassName}
            />
            <label htmlFor="tor-roll-weary" className="text-sm text-ink-muted">
              Weary
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="tor-roll-miserable"
              type="checkbox"
              checked={input.isMiserable}
              onChange={handleMiserableChange}
              className={checkableInputClassName}
            />
            <label
              htmlFor="tor-roll-miserable"
              className="text-sm text-ink-muted"
            >
              Miserable
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="tor-roll-magical-success"
              type="checkbox"
              checked={input.isMagicalSuccess}
              onChange={handleMagicalSuccessChange}
              className={checkableInputClassName}
            />
            <label
              htmlFor="tor-roll-magical-success"
              className="text-sm text-ink-muted"
            >
              Magical Success (spend 1 Hope)
            </label>
          </div>
        </fieldset>
      </div>
      <div aria-live="polite" role="status">
        {result.kind === "success" && (
          <div className="flex flex-col gap-6 border-t border-rule pt-6">
            <dl>
              <StatRow
                label="Any success"
                value={result.anySuccess}
                isLast={result.piercingBlow === null}
              />
              {result.piercingBlow !== null && (
                <StatRow
                  label="Piercing Blow"
                  value={result.piercingBlow}
                  isLast
                />
              )}
            </dl>
            <dl>
              <StatRow label="Failure" value={result.breakdown.failure} />
              <StatRow
                label="Success (0 icons)"
                value={result.breakdown.success}
              />
              <StatRow
                label="Great success (1 icon)"
                value={result.breakdown.greatSuccess}
              />
              <StatRow
                label="Extraordinary (2+ icons)"
                value={result.breakdown.extraordinarySuccess}
                isLast
              />
            </dl>
            {result.grid !== null && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <caption className="sr-only">
                    Chance of any success across Target Number and Success Dice
                    pool size
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col" className="w-20 border border-rule p-2" />
                      {GRID_DICE_COUNTS.map((diceCount) => (
                        <th
                          key={diceCount}
                          scope="col"
                          className="border border-rule bg-paper-raised p-2 font-display text-xs font-semibold tracking-wide text-ink uppercase"
                        >
                          {diceCount} {diceCount === 1 ? "Die" : "Dice"}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.grid.map((row) => (
                      <tr key={row.targetNumber}>
                        <th
                          scope="row"
                          className="border border-rule bg-paper-raised p-2 font-display text-xs font-semibold tracking-wide text-ink uppercase"
                        >
                          TN {row.targetNumber}
                        </th>
                        {row.cells.map((cell) => {
                          const isCurrent =
                            row.targetNumber === result.targetNumber &&
                            cell.successDice === result.successDice;
                          return (
                            <td
                              key={cell.successDice}
                              aria-current={isCurrent ? "true" : undefined}
                              className={`border border-rule p-2 text-center font-mono tabular-nums ${
                                isCurrent
                                  ? "bg-accent-soft font-semibold text-ink"
                                  : "text-ink"
                              }`}
                            >
                              {isCurrent && (
                                <span className="sr-only">Current roll: </span>
                              )}
                              {cell.anySuccess.toFixed(2)}%
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {result.kind === "invalidInput" && (
          <p role="alert" className="font-medium text-accent">
            {result.reason}
          </p>
        )}
      </div>
    </section>
  );
}
