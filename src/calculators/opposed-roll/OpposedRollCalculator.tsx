import { useState } from "react";
import { resolveOpposedRoll, type SkillInput } from "./logic";
import { SkillSideFields } from "./SkillSideFields";
import "./OpposedRollCalculator.css";

const DEFAULT_SIDE: SkillInput = {
  skillValue: 50,
  modifier: 0,
  useAltCrit: false,
};

export function OpposedRollCalculator() {
  const [sideA, setSideA] = useState<SkillInput>(DEFAULT_SIDE);
  const [sideB, setSideB] = useState<SkillInput>(DEFAULT_SIDE);

  const result = resolveOpposedRoll(sideA, sideB);

  return (
    <section aria-labelledby="opposed-roll-heading">
      <h2 id="opposed-roll-heading">Opposed Roll Calculator</h2>
      <div className="opposed-roll-sides">
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
          <dl className="opposed-roll-stats">
            <div>
              <dt>Side A wins</dt>
              <dd>{result.probabilities.winA.toFixed(2)}%</dd>
            </div>
            <div>
              <dt>Side B wins</dt>
              <dd>{result.probabilities.winB.toFixed(2)}%</dd>
            </div>
            <div>
              <dt>Tie</dt>
              <dd>{result.probabilities.tie.toFixed(2)}%</dd>
            </div>
            <div>
              <dt>Side A critical success wins</dt>
              <dd>{result.probabilities.winACriticalSuccess.toFixed(2)}%</dd>
            </div>
            <div>
              <dt>Side B critical success wins</dt>
              <dd>{result.probabilities.winBCriticalSuccess.toFixed(2)}%</dd>
            </div>
            <div>
              <dt>Side A losses to critical failure</dt>
              <dd>{result.probabilities.lossACriticalFailure.toFixed(2)}%</dd>
            </div>
            <div>
              <dt>Side B losses to critical failure</dt>
              <dd>{result.probabilities.lossBCriticalFailure.toFixed(2)}%</dd>
            </div>
          </dl>
        )}
        {result.kind === "invalidInput" && <p role="alert">{result.reason}</p>}
      </div>
    </section>
  );
}
