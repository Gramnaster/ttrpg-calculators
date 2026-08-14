import type { ArmourValueRow } from "./armourValues";
import type { HitLocationArmour } from "./logic";

const VALUE_COLUMNS: readonly { key: keyof ArmourValueRow; label: string }[] = [
  { key: "blunt", label: "B" },
  { key: "slash", label: "S" },
  { key: "pierce", label: "P" },
  { key: "fire", label: "F" },
  { key: "magic", label: "M" },
  { key: "crush", label: "C" },
];

const columnHeaderClassName =
  "border border-rule bg-paper-raised p-2 font-display text-xs font-semibold tracking-wide text-ink uppercase";

export interface HitLocationTableProps {
  rows: readonly HitLocationArmour[];
}

export function HitLocationTable({ rows }: HitLocationTableProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-lg font-semibold text-ink">
        Hit Location Coverage
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <caption className="sr-only">
            Damage modifier, armour totals, Gap percentage, and covering piece
            count for every Hit Location, derived from the current loadout
          </caption>
          <thead>
            <tr>
              <th scope="col" className={columnHeaderClassName}>
                Hit Location
              </th>
              <th scope="col" className={columnHeaderClassName}>
                Dmg Mod
              </th>
              {VALUE_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={columnHeaderClassName}
                >
                  {column.label}
                </th>
              ))}
              <th scope="col" className={columnHeaderClassName}>
                Gap %
              </th>
              <th scope="col" className={columnHeaderClassName}>
                Covered By
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isUncovered = row.coveringItemIds.length === 0;
              return (
                <tr key={row.location}>
                  <th
                    scope="row"
                    className="border border-rule bg-paper-raised p-2 text-left font-display text-xs font-semibold tracking-wide text-ink uppercase"
                  >
                    {row.label}
                  </th>
                  <td className="border border-rule p-2 text-center font-mono text-ink tabular-nums">
                    +{row.dmgMod}
                  </td>
                  {VALUE_COLUMNS.map((column) => (
                    <td
                      key={column.key}
                      className="border border-rule p-2 text-center font-mono text-ink tabular-nums"
                    >
                      {row.totals[column.key]}
                    </td>
                  ))}
                  <td className="border border-rule p-2 text-center font-mono text-ink tabular-nums">
                    {row.gapPercent}%
                  </td>
                  <td
                    className={`border border-rule p-2 text-center ${
                      isUncovered
                        ? "font-medium text-ink-faint"
                        : "font-medium text-ink"
                    }`}
                  >
                    {isUncovered
                      ? "None"
                      : `${row.coveringItemIds.length} ${row.coveringItemIds.length === 1 ? "piece" : "pieces"}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
