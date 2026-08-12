import type { ChangeEvent } from "react";
import type { SkillInput } from "./successLevel";

export interface SkillSideFieldsProps {
  legend: string;
  idPrefix: string;
  value: SkillInput;
  onChange: (value: SkillInput) => void;
}

const inputClassName =
  "w-20 border border-rule bg-paper px-2 py-1 text-right font-mono text-ink tabular-nums outline-none focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";

export function SkillSideFields({
  legend,
  idPrefix,
  value,
  onChange,
}: SkillSideFieldsProps) {
  const skillId = `${idPrefix}-skill`;
  const skillLabelId = `${skillId}-label`;
  const skillSliderId = `${idPrefix}-skill-slider`;
  const modifierId = `${idPrefix}-modifier`;
  const modifierLabelId = `${modifierId}-label`;
  const modifierSliderId = `${idPrefix}-modifier-slider`;
  const altCritId = `${idPrefix}-alt-crit`;

  function handleSkillChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, skillValue: event.target.valueAsNumber });
  }

  function handleModifierChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, modifier: event.target.valueAsNumber });
  }

  function handleAltCritChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, useAltCrit: event.target.checked });
  }

  return (
    <fieldset className="flex flex-col gap-3 border border-rule bg-paper-raised px-4 py-4">
      <legend className="px-1 font-display text-base font-semibold text-ink">
        {legend}
      </legend>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <label
            id={skillLabelId}
            htmlFor={skillId}
            className="text-sm text-ink-muted"
          >
            Skill %
          </label>
          <input
            id={skillId}
            type="number"
            min={1}
            max={100}
            value={value.skillValue}
            onChange={handleSkillChange}
            className={inputClassName}
          />
        </div>
        <input
          id={skillSliderId}
          type="range"
          min={1}
          max={100}
          step={1}
          value={value.skillValue}
          onChange={handleSkillChange}
          aria-labelledby={skillLabelId}
          className="w-full accent-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <label
            id={modifierLabelId}
            htmlFor={modifierId}
            className="text-sm text-ink-muted"
          >
            Modifier
          </label>
          <input
            id={modifierId}
            type="number"
            min={-100}
            max={100}
            value={value.modifier}
            onChange={handleModifierChange}
            className={inputClassName}
          />
        </div>
        <input
          id={modifierSliderId}
          type="range"
          min={-100}
          max={100}
          step={10}
          value={value.modifier}
          onChange={handleModifierChange}
          aria-labelledby={modifierLabelId}
          className="w-full accent-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id={altCritId}
          type="checkbox"
          checked={value.useAltCrit}
          onChange={handleAltCritChange}
          className="h-4 w-4 accent-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        <label htmlFor={altCritId} className="text-sm text-ink-muted">
          Crit on multiples of ten
        </label>
      </div>
    </fieldset>
  );
}
