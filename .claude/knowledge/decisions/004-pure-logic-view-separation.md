# ADR-004: Pure TypeScript Calculation Logic, Separate from React Components

## Status

Accepted

## Context

Every calculator has two concerns: the actual math (dice resolution, probability calculation) and the presentation (inputs, results display). These could be combined (math computed inline in event handlers/JSX) or separated (math in a framework-free module, components call into it).

This developer already applies a strict simulation/view separation on the Godot/C# side (see the global instructions: "Serious gameplay rules belong in pure C# simulation and data models. Godot nodes present, collect input, and bridge.") — the same reasoning transfers directly to a React app: calculator math is the "simulation," components are the "presentation," and the two should not be tangled together.

Evaluation:

1. **Testability.** Pure functions test trivially with Vitest alone — no React rendering, no DOM, no `act()` warnings, no component lifecycle to work around. Math tests should be as fast and simple as the math itself.
2. **Portability.** If this app's calculators are ever needed outside React (a CLI tool, a Node script, a different frontend framework entirely), pure logic modules port with zero changes. Logic entangled with JSX does not.
3. **Clarity of what's being tested.** Separating the two means a failing test unambiguously points at either "the math is wrong" (logic test) or "the wiring is wrong" (component test) — never both at once.
4. **Consistency with established practice.** This developer has already validated this exact boundary on Godot projects; reapplying a known-good pattern is lower risk than inventing a new one for this stack.

## Decision

**Every calculator's math lives in a framework-free `logic.ts` module with zero React imports. Components import from `logic.ts`, hold results in state, and render — they never contain probability math or dice-notation parsing inline.**

```ts
// src/calculators/opposed-roll/logic.ts — no React import
export function resolveOpposedRoll(attackerPool: number, defenderPool: number): OpposedRollResult { ... }
```

```tsx
// src/calculators/opposed-roll/OpposedRollCalculator.tsx
import { resolveOpposedRoll } from "./logic";
export function OpposedRollCalculator() {
  const [result, setResult] = useState<OpposedRollResult | null>(null);
  const handleSubmit = (a: number, d: number) => setResult(resolveOpposedRoll(a, d));
  // ...
}
```

See `rules/architecture.md` for the enforceable rule and `rules/testing.md` for how this shapes the test strategy (logic tests first).

## Consequences

### Positive

- Calculator math is trivially unit-testable, fast, and framework-independent.
- A failing test always points clearly at logic or wiring, never both.
- Reuses a design boundary this developer has already validated elsewhere, rather than introducing a new pattern to learn.

### Negative

- Slightly more ceremony than "just write it in the component" for a genuinely trivial calculator — an extra file, an extra import.

### Mitigations

- `skills/scaffold` generates both files together as a matched pair, so the ceremony is one mechanical step, not a decision made fresh each time.
