import { useState } from "react";
import type { ArmourLevel, ArmourPreset } from "./presets";

const LEVEL_ORDER: readonly ArmourLevel[] = [
  "Unarmoured",
  "Light",
  "Medium",
  "Heavy",
];

const buttonClassName =
  "self-start border border-accent bg-accent px-4 py-2 text-sm font-semibold text-paper outline-none transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

const selectClassName =
  "w-full border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export interface PresetPickerProps {
  presets: readonly ArmourPreset[];
  onApplyPreset: (preset: ArmourPreset) => void;
  lastConflictReason: string | null;
}

export function PresetPicker({
  presets,
  onApplyPreset,
  lastConflictReason,
}: PresetPickerProps) {
  const availableLevels = LEVEL_ORDER.filter((level) =>
    presets.some((preset) => preset.level === level),
  );
  const [selectedLevel, setSelectedLevel] = useState<ArmourLevel>(
    availableLevels[0] ?? "Unarmoured",
  );
  const presetsForLevel = presets.filter(
    (preset) => preset.level === selectedLevel,
  );
  const [selectedChoice, setSelectedChoice] = useState(
    presetsForLevel[0]?.choice ?? "",
  );
  const selectedPreset = presetsForLevel.find(
    (preset) => preset.choice === selectedChoice,
  );

  const handleLevelChange = (level: ArmourLevel) => {
    setSelectedLevel(level);
    const firstPresetForLevel = presets.find(
      (preset) => preset.level === level,
    );
    setSelectedChoice(firstPresetForLevel?.choice ?? "");
  };

  const handleApply = () => {
    if (selectedPreset) onApplyPreset(selectedPreset);
  };

  return (
    <fieldset className="flex flex-col gap-3 border border-rule bg-paper-raised px-4 py-4">
      <legend className="px-1 font-display text-base font-semibold text-ink">
        Load a Premade Set
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="preset-picker-level"
            className="text-sm text-ink-muted"
          >
            Armour Level
          </label>
          <select
            id="preset-picker-level"
            className={selectClassName}
            value={selectedLevel}
            onChange={(event) =>
              handleLevelChange(event.target.value as ArmourLevel)
            }
          >
            {availableLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="preset-picker-choice"
            className="text-sm text-ink-muted"
          >
            Choice
          </label>
          <select
            id="preset-picker-choice"
            className={selectClassName}
            value={selectedChoice}
            onChange={(event) => setSelectedChoice(event.target.value)}
          >
            {presetsForLevel.map((preset) => (
              <option key={preset.choice} value={preset.choice}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {selectedPreset && (
        <p className="text-sm text-ink-muted">
          {selectedPreset.itemIds.length} pieces — replaces your current loadout
          entirely.
        </p>
      )}
      <button type="button" className={buttonClassName} onClick={handleApply}>
        Load Preset
      </button>
      {lastConflictReason && (
        <p role="alert" className="font-medium text-accent">
          {lastConflictReason}
        </p>
      )}
    </fieldset>
  );
}
