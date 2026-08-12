export interface StatRowProps {
  label: string;
  value: number;
  isLast?: boolean;
}

export function StatRow({ label, value, isLast = false }: StatRowProps) {
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
