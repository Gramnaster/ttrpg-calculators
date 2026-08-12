---
name: scaffold
description: >
  Generates a complete new calculator — logic module, component, tests, and
  route wiring — as one unit. Use when: "add a calculator", "new
  calculator", "scaffold", "create a calculator for [system]".
---

# /scaffold — Add a New Calculator

## What

Generates a complete calculator feature: `logic.ts` with tests, a component with tests, and route registration — all four pieces together, never a partial slice. This is the recurring task `Plans.txt` explicitly calls out ("More, but standby on this as you set up").

## When

- "Add a [system name] calculator"
- "New calculator for [dice mechanic]"
- Any time a new TTRPG system's math needs to be added to the app

## How

### Step 1: Clarify the Math

Before writing anything, confirm with the user (skip anything already answered):

1. What's the actual dice mechanic? (e.g. "roll N d6, count successes on 5-6" vs. "roll 2d6 + modifier vs. a target number")
2. What inputs does it need? (pool size, modifiers, target numbers — whatever the system requires)
3. What does a result look like? (success count, pass/fail, a probability distribution to display)
4. What are the edge cases specific to this system? (zero dice? negative modifiers? a cap on pool size?)

Don't guess at TTRPG rules-system math — get it confirmed, since a wrong formula is a silent correctness bug (`rules/priorities.md`: correctness is priority 1).

### Step 2: Name and Place

- Folder name: kebab-case, matching the system/mechanic (`opposed-roll`, `bitd-probability`).
- Confirm it doesn't already exist (`Glob` on `src/calculators/`).

### Step 3: Generate the Logic Module First

```ts
// src/calculators/<name>/logic.ts — no React import (ADR-004)
export type <Name>Result =
  | { kind: "success"; /* result fields */ }
  | { kind: "invalidInput"; reason: string };

export function resolve<Name>(/* typed params */): <Name>Result {
  // validate inputs — return invalidInput for bad input, never throw (rules/error-handling.md)
  // compute the result
}
```

### Step 4: Generate Logic Tests

Cover, at minimum: a typical valid case, the zero/minimum boundary, the maximum/overflow boundary, and any system-specific edge case identified in Step 1. Use a deterministic/injectable random source if the mechanic involves dice rolls (`rules/testing.md`).

### Step 5: Generate the Component

```tsx
// src/calculators/<name>/<Name>Calculator.tsx
import { useState } from "react";
import { resolve<Name>, type <Name>Result } from "./logic";

export function <Name>Calculator() {
  const [result, setResult] = useState<<Name>Result | null>(null);

  function handleSubmit(/* form values */) {
    setResult(resolve<Name>(/* ... */));
  }

  return (
    <section>
      <h2><!-- calculator title --></h2>
      {/* labeled inputs — rules/accessibility.md */}
      <div aria-live="polite" role="status">
        {result?.kind === "success" && <ResultSummary result={result} />}
        {result?.kind === "invalidInput" && <p role="alert">{result.reason}</p>}
      </div>
    </section>
  );
}
```

### Step 6: Generate the Component Test

Query by role/label (`rules/testing.md`) — assert the result renders after valid submission, and the validation message renders (not a crash) after invalid submission.

### Step 7: Wire the Route

Add the lazy import + `<Route>` entry (`skills/project-structure`), and a `<Link viewTransition>` entry in the calculator-selection nav (`rules/animations.md` — every calculator-to-calculator navigation gets `viewTransition`).

### Step 8: Completeness Checklist (MANDATORY)

- [ ] `logic.ts` — pure, no React import, discriminated-union result type
- [ ] `logic.test.ts` — typical case + zero/min boundary + max boundary + system-specific edge case
- [ ] `<Name>Calculator.tsx` — labeled inputs, `aria-live` result region, calls `logic.ts` only (no inline math)
- [ ] `<Name>Calculator.test.tsx` — valid-submission and invalid-submission cases
- [ ] `index.ts` — re-export for the route table
- [ ] Route registered in `App.tsx` with `React.lazy`
- [ ] Nav link added with `viewTransition`

### Step 9: Verify

```bash
npx tsc --noEmit
npx eslint .
npx vitest run src/calculators/<name>
```

Fix and re-run before reporting done.

## Example

```
User: /scaffold a calculator for Powered by the Apocalypse 2d6+stat rolls

Claude: Confirmed mechanic: roll 2d6 + stat modifier.
  6-  = miss, 7-9 = partial success, 10+ = full success.

Created files:
  src/calculators/pbta-roll/logic.ts               -- resolvePbtaRoll, PbtaRollResult union
  src/calculators/pbta-roll/logic.test.ts           -- miss/partial/full + boundary (exactly 6, 7, 10)
  src/calculators/pbta-roll/PbtaRollCalculator.tsx  -- stat modifier input, aria-live result
  src/calculators/pbta-roll/PbtaRollCalculator.test.tsx
  src/calculators/pbta-roll/index.ts

Route added: /pbta-roll (App.tsx)
Nav link added with viewTransition

Checklist: 7/7 | tsc: clean | eslint: clean | vitest: 8 passed
```

## Related

- `project-structure` — the folder shape this scaffold follows
- `state-management` — only relevant if this calculator genuinely needs to share state (rare)
- `testing` — the test patterns behind Step 4 and Step 6
