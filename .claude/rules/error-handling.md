---
alwaysApply: true
description: >
  Enforces discriminated-union results for expected calculator input failures
  and React error boundaries for unexpected render failures.
---

# Error Handling Rules

## Discriminated Unions Over Exceptions for Expected Failures

- **Invalid calculator input is an expected outcome, not an exception.** A dice pool of `-3` or a probability calculator fed a non-numeric string is a normal thing a user can type — return a typed result, don't `throw`.

```ts
// DO
type RollResult =
  | { kind: "success"; successes: number; rolls: number[] }
  | { kind: "invalidInput"; reason: string };

function resolveRoll(pool: number): RollResult {
  if (pool <= 0) return { kind: "invalidInput", reason: "Dice pool must be at least 1." };
  // ...
  return { kind: "success", successes, rolls };
}

// DON'T
function resolveRoll(pool: number): RollResult {
  if (pool <= 0) throw new Error("Dice pool must be at least 1.");
  // ...
}
```

- **Components branch on `result.kind`**, rendering either the result or the validation message — no `try`/`catch` around calculator logic for cases you can predict and type.

## Input Validation at the Boundary

- **Validate where user input enters the system**: the input component (immediate feedback, e.g. disabling the "Roll" button) and the logic function itself (so the logic function is never trusted to have been called correctly — it's the one place that has to be right regardless of what called it).
- **Don't re-validate already-validated data deeper in the call chain.** If `resolveRoll` has already checked `pool > 0`, a helper it calls doesn't need to check again.

## React Error Boundaries for the Unexpected

- **Wrap each calculator route in an error boundary.** A rendering bug in one calculator shouldn't take down the whole app — the boundary shows a fallback ("Something went wrong in this calculator") while the rest of the app (nav, other calculators) keeps working.
- **Error boundaries are for genuinely unexpected failures** (a bug, not a user-input edge case). Expected bad input is handled by the discriminated union above, not by throwing into a boundary.

```tsx
<ErrorBoundary fallback={<CalculatorErrorFallback />}>
  <Suspense fallback={<CalculatorSkeleton />}>
    <OpposedRollCalculator />
  </Suspense>
</ErrorBoundary>
```

## Quick Reference

| Scenario | Approach |
|---|---|
| User typed an invalid dice pool | `RollResult` with `kind: "invalidInput"` |
| A calculator component throws during render | Error boundary fallback |
| A third-party dependency throws | Catch at the narrowest point that can meaningfully recover; otherwise let the boundary catch it |
