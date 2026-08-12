---
name: build-fix
description: >
  Playbook of common TypeScript, Vite, and ESLint error signatures and their
  fixes. Use when: "build errors", "won't compile", "fix build", "type
  errors", "lint errors".
---

# Build Fix

## Process

1. Run the failing command directly — don't guess at the error from memory of a previous run.
2. Read the actual error message and location.
3. Apply the minimum fix for that specific error.
4. Re-run to confirm, then move to the next error if any remain.

```bash
npx tsc --noEmit
npx vite build
npx eslint .
```

## Common TypeScript Errors

### "Property does not exist on type"

Usually a genuine type mismatch, not a TS quirk — read it as a hint the code's assumption about a shape is wrong before reaching for a cast.

```ts
// Error: Property 'reason' does not exist on type 'RollResult'
if (result.reason) { ... }

// Fix: narrow first — the discriminated union needs a kind check
if (result.kind === "invalidInput") { result.reason; }
```

### "Object is possibly 'undefined'"

Strict null checks doing their job. Narrow, don't silence with `!`.

```ts
// Risky — asserts non-null without proof
const first = rolls[0]!;

// Better — handle the empty case explicitly
const first = rolls.at(0);
if (first === undefined) return { kind: "invalidInput", reason: "no rolls" };
```

### "Type 'X' is not assignable to type 'Y'" on a discriminated union

Usually means a literal type got widened. Use `as const` or an explicit return type annotation on the function.

```ts
// Widened to `string`, not the literal "success"
function ok() { return { kind: "success", value: 1 }; }

// Fixed — explicit return type pins the literal
function ok(): RollResult { return { kind: "success", value: 1 }; }
```

## Common Vite Build Errors

### "Failed to resolve import"

Check the import path casing (case-sensitive on Linux CI even if the local Windows filesystem doesn't care) and confirm the file actually exports what's being imported (named vs. default — see `rules/coding-style.md`, this app uses named exports).

### Base path issues after deploy (blank page, 404s on assets)

Not a build failure per se, but the most common "it built fine but doesn't work" issue — see `skills/ci-cd` for the `vite.config.ts` `base` path requirement for GitHub Pages project sites.

## Common ESLint Errors

### `react-hooks/exhaustive-deps`

Usually correct — a missing dependency is a real stale-closure bug waiting to happen. Add the dependency; if that causes an infinite loop, the actual fix is restructuring the effect (often: the effect shouldn't exist at all — see `knowledge/common-antipatterns.md`'s "storing derived state" entry), not suppressing the lint rule.

### `@typescript-eslint/no-explicit-any`

Fix by typing it properly — `unknown` + narrowing, or the actual shape. Don't disable the rule inline unless there's a specific, commented reason (e.g. a third-party type definition gap).

## When to Stop and Report Instead of Continuing to Fix

- The same error persists after a genuine, targeted fix attempt (not just retrying the same thing).
- A fix would require changing behavior, not just types/syntax — that's a design decision, hand it back rather than guessing.
- Three fix attempts on the same error without progress.

## Related

- `de-sloppify` — if the build errors trace back to leftover dead code rather than a genuine bug
- `verify` — the full pre-done pipeline this skill is one stage of
