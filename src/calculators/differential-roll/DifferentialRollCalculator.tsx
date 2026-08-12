import { useState } from "react";
import {
  LEVEL_DISPLAY_ORDER,
  resolveDifferentialRoll,
  type DifferentialGridCell,
  type DifferentialOutcome,
  type DifferentialRollMode,
  type SeWinner,
} from "./logic";
import { SkillSideFields } from "../../shared/SkillSideFields";
import type { SkillInput, SuccessLevel } from "../../shared/successLevel";

const DEFAULT_SIDE: SkillInput = {
  skillValue: 50,
  modifier: 0,
  useAltCrit: false,
};

const OUTCOME_LABEL: Record<DifferentialOutcome, string> = {
  attackMisses: "Attack Misses",
  parrySucceeds: "Parry Succeeds",
  attackHits: "Attack Hits",
  bothHit: "Both Attacks Hit",
  counterHits: "Counter Hits",
};

const LEVEL_LABEL: Record<SuccessLevel, string> = {
  criticalSuccess: "Critical",
  moderateSuccess: "Success",
  moderateFailure: "Failure",
  criticalFailure: "Fumble",
};

const DEFENDER_ROLE_LABEL: Record<DifferentialRollMode, string> = {
  parry: "Defender",
  counter: "Counter",
};

const CELL_BACKGROUND_CLASS: Record<SeWinner, string> = {
  attacker: "bg-accent-soft",
  defender: "bg-favor-soft",
  none: "bg-paper-raised",
};

const CELL_TEXT_CLASS: Record<SeWinner, string> = {
  attacker: "text-accent",
  defender: "text-favor",
  none: "text-ink-muted",
};

const radioClassName =
  "h-4 w-4 accent-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function seLabel(cell: Pick<DifferentialGridCell, "seWinner" | "se">): string {
  if (cell.seWinner === "none") return "No SE";
  const winner = cell.seWinner === "attacker" ? "Attacker" : "Defender";
  return `${winner} ${cell.se} SE`;
}

// A successful parry fully negates the attack, which always benefits the
// defender -- even on the cells where the attacker still wins the SE
// exchange (e.g. a moderate parry against a critical attack). Every other
// outcome's background follows whoever actually won the SE.
function cellBackgroundClass(
  cell: Pick<DifferentialGridCell, "outcome" | "seWinner">,
): string {
  if (cell.outcome === "parrySucceeds") return CELL_BACKGROUND_CLASS.defender;
  return CELL_BACKGROUND_CLASS[cell.seWinner];
}

export function DifferentialRollCalculator() {
  const [mode, setMode] = useState<DifferentialRollMode>("parry");
  const [attacker, setAttacker] = useState<SkillInput>(DEFAULT_SIDE);
  const [defender, setDefender] = useState<SkillInput>(DEFAULT_SIDE);

  const result = resolveDifferentialRoll(mode, attacker, defender);
  const defenderRoleLabel = DEFENDER_ROLE_LABEL[mode];

  return (
    <section
      aria-labelledby="differential-roll-heading"
      className="flex max-w-4xl flex-col gap-8"
    >
      <div>
        <h2
          id="differential-roll-heading"
          className="font-display text-2xl font-semibold text-ink"
        >
          Differential Roll Calculator
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Compare an attacker's roll against a defender's parry or counter and
          see the odds of every outcome.
        </p>
      </div>
      <fieldset className="flex flex-col gap-2 border border-rule bg-paper-raised px-4 py-4">
        <legend className="px-1 font-display text-base font-semibold text-ink">
          Roll Type
        </legend>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="radio"
              name="differential-roll-mode"
              checked={mode === "parry"}
              onChange={() => setMode("parry")}
              className={radioClassName}
            />
            Parry vs. Attack
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="radio"
              name="differential-roll-mode"
              checked={mode === "counter"}
              onChange={() => setMode("counter")}
              className={radioClassName}
            />
            Counter vs. Attack
          </label>
        </div>
      </fieldset>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SkillSideFields
          legend="Attacker"
          idPrefix="differential-attacker"
          value={attacker}
          onChange={setAttacker}
        />
        <SkillSideFields
          legend="Defender"
          idPrefix="differential-defender"
          value={defender}
          onChange={setDefender}
        />
      </div>
      <div aria-live="polite" role="status">
        {result.kind === "success" && (
          <div className="overflow-x-auto border-t border-rule pt-6">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <caption className="sr-only">
                Outcome and probability for every Attacker/{defenderRoleLabel}{" "}
                success-level pairing
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="w-28 border border-rule p-2" />
                  {LEVEL_DISPLAY_ORDER.map((level) => (
                    <th
                      key={level}
                      scope="col"
                      className="border border-rule bg-paper-raised p-2 font-display text-xs font-semibold tracking-wide text-ink uppercase"
                    >
                      Attacker {LEVEL_LABEL[level]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, rowIndex) => {
                  const defenderLevel = LEVEL_DISPLAY_ORDER[rowIndex];
                  return (
                    <tr key={defenderLevel}>
                      <th
                        scope="row"
                        className="border border-rule bg-paper-raised p-2 font-display text-xs font-semibold tracking-wide text-ink uppercase"
                      >
                        {defenderRoleLabel} {LEVEL_LABEL[defenderLevel]}
                      </th>
                      {row.map((cell) => (
                        <td
                          key={cell.attackerLevel}
                          className={`border border-rule p-2 text-center align-top ${cellBackgroundClass(cell)}`}
                        >
                          <div className="font-mono text-base font-semibold text-ink tabular-nums">
                            {cell.probability.toFixed(2)}%
                          </div>
                          <div className="mt-1 text-ink">
                            {OUTCOME_LABEL[cell.outcome]}
                          </div>
                          <div
                            className={`mt-0.5 font-medium ${CELL_TEXT_CLASS[cell.seWinner]}`}
                          >
                            {seLabel(cell)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
