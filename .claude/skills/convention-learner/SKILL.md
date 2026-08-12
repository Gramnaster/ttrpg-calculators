---
name: convention-learner
description: >
  Detect and match this codebase's actual established conventions before
  writing new code, rather than imposing a different (even if equally
  valid) pattern. Use when: "match existing style", "what's the convention
  here", "conventions", "code consistency".
---

# Convention Learner

## Why This Exists

`rules/coding-style.md` sets defaults (named exports, `interface` for props, `use`-prefixed hooks), but the first calculator or two written in this app establishes real precedent that later work should match — even in the rare case a rule allows either option. Consistency within the codebase beats a technically-equally-valid alternative.

## Process

Before writing new code in an area with existing files, check what's already there:

1. **`Glob`** the relevant folder (e.g. `src/calculators/*/`) to see what exists.
2. **`Read`** one or two representative existing files (an existing `logic.ts` + component pair) to observe:
   - How is the result type named and shaped? (`RollResult` vs `<Name>Result` vs something else)
   - How are validation failures represented? (confirm it matches `rules/error-handling.md`'s discriminated union, and see what field names/casing are actually used — `reason` vs `message`, `kind` vs `type`)
   - How are components structured? (single file vs. split into subcomponents, where inline styles vs. CSS files are used)
   - Test file conventions (`describe` block naming, whether `it` descriptions use the `function_scenario_result` format or plain sentences)
3. **Match it** in new code, even if a different valid choice was made when writing the very first calculator (that first choice is now the convention).

## What to Do When Conventions Conflict With Rules

If an established local pattern actually violates a `rules/` file (e.g. an existing calculator has an untyped `any` snuck in, or a CSS transition on `top`), that's not a convention to match — it's a pre-existing bug. Flag it (see `skills/code-review`), don't propagate it further.

## What to Do When There's No Precedent Yet

For the first calculator, or the first time a particular pattern is needed (first shared component, first use of `localStorage`), there's nothing to match — follow `rules/` and `skills/scaffold` defaults, and that choice becomes the precedent for next time.

## Anti-pattern: Imposing a "Better" Pattern Mid-Codebase

```
# BAD — codebase consistently uses `reason` for validation messages,
# but this PR introduces `message` because it's "more standard"
type Result = { kind: "invalidInput"; message: string };  // inconsistent with existing calculators

# GOOD — match the established field name
type Result = { kind: "invalidInput"; reason: string };
```

If there's a genuine reason to change an established convention app-wide, that's a deliberate refactor decision to raise explicitly — not something to introduce silently in one new file.
