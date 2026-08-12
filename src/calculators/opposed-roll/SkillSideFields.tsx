import type { ChangeEvent } from "react";
import type { SkillInput } from "./logic";

export interface SkillSideFieldsProps {
  legend: string;
  idPrefix: string;
  value: SkillInput;
  onChange: (value: SkillInput) => void;
}

export function SkillSideFields({
  legend,
  idPrefix,
  value,
  onChange,
}: SkillSideFieldsProps) {
  const skillId = `${idPrefix}-skill`;
  const modifierId = `${idPrefix}-modifier`;
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
    <fieldset className="skill-side-fields">
      <legend>{legend}</legend>
      <div className="field">
        <label htmlFor={skillId}>Skill %</label>
        <input
          id={skillId}
          type="number"
          min={1}
          max={100}
          value={value.skillValue}
          onChange={handleSkillChange}
        />
      </div>
      <div className="field">
        <label htmlFor={modifierId}>Modifier</label>
        <input
          id={modifierId}
          type="number"
          value={value.modifier}
          onChange={handleModifierChange}
        />
      </div>
      <div className="field field-checkbox">
        <input
          id={altCritId}
          type="checkbox"
          checked={value.useAltCrit}
          onChange={handleAltCritChange}
        />
        <label htmlFor={altCritId}>Crit on multiples of ten</label>
      </div>
    </fieldset>
  );
}
