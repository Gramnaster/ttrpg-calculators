import { useState } from "react";
import { resolveOpposedRoll, type SkillInput } from "./logic";
import { SkillSideFields } from "./SkillSideFields";

const DEFAULT_SIDE: SkillInput = {
  skillValue: 50,
  modifier: 0,
  useAltCrit: false,
};

interface StatRowProps {
  label: string;
  value: number;
  isLast?: boolean;
}

function StatRow({ label, value, isLast = false }: StatRowProps) {
  return (
    <div
      className={`flex items-baseline justify-between gap-2 py-1.5 ${
        isLast ? "" : "border-b border-rule"
      }`}
    >
      <dt className="text-ink-muted">{label}</dt>
      <dd className="m-0 font-mono text-base font-semibold text-ink tabular-nums">
        {value.toFixed(2)}%
      </dd>
    </div>
  );
}

export function OpposedRollCalculator() {
  const [sideA, setSideA] = useState<SkillInput>(DEFAULT_SIDE);
  const [sideB, setSideB] = useState<SkillInput>(DEFAULT_SIDE);

  const result = resolveOpposedRoll(sideA, sideB);

  return (
    <section
      aria-labelledby="opposed-roll-heading"
      className="flex max-w-3xl flex-col gap-8"
    >
      <div>
        <h2
          id="opposed-roll-heading"
          className="font-display text-2xl font-semibold text-ink"
        >
          Opposed Roll Calculator
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Compare two percentile skill checks and see the odds before you roll.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SkillSideFields
          legend="Side A"
          idPrefix="side-a"
          value={sideA}
          onChange={setSideA}
        />
        <SkillSideFields
          legend="Side B"
          idPrefix="side-b"
          value={sideB}
          onChange={setSideB}
        />
      </div>
      <div aria-live="polite" role="status">
        {result.kind === "success" && (
          <div className="flex flex-col gap-6 border-t border-rule pt-6">
            <dl>
              <StatRow label="Tie" value={result.probabilities.tie} isLast />
            </dl>
            <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
              <dl className="flex flex-col">
                <StatRow
                  label="Side A wins as CS"
                  value={result.probabilities.winACriticalSuccess}
                />
                <StatRow
                  label="Side A loses as CS"
                  value={result.probabilities.lossACriticalSuccess}
                />
                <StatRow
                  label="Side A wins as MS"
                  value={result.probabilities.winAModerateSuccess}
                />
                <StatRow
                  label="Side A loses as MS"
                  value={result.probabilities.lossAModerateSuccess}
                />
                <StatRow
                  label="Side A loses as MF"
                  value={result.probabilities.lossAModerateFailure}
                />
                <StatRow
                  label="Side A loses as CF"
                  value={result.probabilities.lossACriticalFailure}
                  isLast
                />
              </dl>
              <dl className="flex flex-col">
                <StatRow
                  label="Side B wins as CS"
                  value={result.probabilities.winBCriticalSuccess}
                />
                <StatRow
                  label="Side B loses as CS"
                  value={result.probabilities.lossBCriticalSuccess}
                />
                <StatRow
                  label="Side B wins as MS"
                  value={result.probabilities.winBModerateSuccess}
                />
                <StatRow
                  label="Side B loses as MS"
                  value={result.probabilities.lossBModerateSuccess}
                />
                <StatRow
                  label="Side B loses as MF"
                  value={result.probabilities.lossBModerateFailure}
                />
                <StatRow
                  label="Side B loses as CF"
                  value={result.probabilities.lossBCriticalFailure}
                  isLast
                />
              </dl>
            </div>
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
