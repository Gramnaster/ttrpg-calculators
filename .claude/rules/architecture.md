---
alwaysApply: true
description: >
  Enforces the feature-folder-per-calculator structure and the pure-logic /
  view separation for this app's React + TypeScript architecture.
---

# Architecture Rules

See [ADR-001](../knowledge/decisions/001-feature-folder-architecture.md) and
[ADR-004](../knowledge/decisions/004-pure-logic-view-separation.md) for the
full reasoning. This file is the enforceable summary.

## Calculation Logic Is Pure TypeScript, Not React

- **Every calculator's math lives in a framework-free `.ts` module with zero React imports.** Dice pools, probability distributions, roll resolution — all of it is plain functions and types that could run in Node, a Vitest test, or a browser console with no component tree involved.
- **Components present, collect input, and bridge.** A component calls the pure logic function, holds the result in state, and renders it. It does not contain probability math, dice-notation parsing, or statistical calculation inline in JSX or event handlers.
- This mirrors the same simulation/view boundary already used for this developer's Godot projects (serious game logic in pure code, nodes present and bridge) — same principle, different framework.

```ts
// DO — src/calculators/opposed-roll/logic.ts (no React import)
export function resolveOpposedRoll(attackerPool: number, defenderPool: number): OpposedRollResult {
  // pure probability math
}
```

```tsx
// DO — src/calculators/opposed-roll/OpposedRollCalculator.tsx
import { resolveOpposedRoll } from "./logic";

export function OpposedRollCalculator() {
  const [result, setResult] = useState<OpposedRollResult | null>(null);
  const handleSubmit = (attacker: number, defender: number) =>
    setResult(resolveOpposedRoll(attacker, defender));
  // ...render input + result
}
```

```tsx
// DON'T — math inline in the component
function OpposedRollCalculator() {
  const handleSubmit = (attacker: number, defender: number) => {
    // probability calculation written directly in the event handler
  };
}
```

## Feature Folders Per Calculator

- **Each calculator is a self-contained folder under `src/calculators/<name>/`.** Its logic module, component(s), and tests live together. Adding a new calculator never requires editing an existing calculator's files (see `skills/scaffold`).

```
# DO                                    # DON'T
src/calculators/                        src/
  opposed-roll/                           components/
    logic.ts                                OpposedRollCalculator.tsx
    logic.test.ts                           BitdCalculator.tsx
    OpposedRollCalculator.tsx              logic/
    OpposedRollCalculator.test.tsx           opposedRoll.ts
    index.ts                                 bitd.ts
  bitd-probability/
    logic.ts
    logic.test.ts
    BitdProbabilityCalculator.tsx
    BitdProbabilityCalculator.test.tsx
    index.ts
```

- **`src/shared/`** holds only what's genuinely used by two or more calculators — a `NumberStepper` input component, a shared dice-notation type, a results-panel layout. Don't preemptively move something to `shared/` because it *might* be reused; move it when a second calculator actually needs it.
- **`src/routes/`** (or route definitions colocated with `App.tsx`, for an app this size) wires calculator components to React Router paths. Route files import from `calculators/`, never the reverse.

## Dependency Direction

- **Calculators depend on `shared/`, never on each other.** If two calculators need the same logic, promote it to `shared/`, don't import one calculator's `logic.ts` from another's.
- **`shared/` depends on nothing calculator-specific.** It's the lowest layer.

## Adding a New Calculator

New calculators are explicitly expected (`Plans.txt`: "More, but standby on this as you set up"). Follow `skills/scaffold` — it exists specifically so each new calculator arrives with logic, component, tests, and route wiring as one unit, not a half-finished slice.
