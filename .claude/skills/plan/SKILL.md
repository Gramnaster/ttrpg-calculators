---
name: plan
description: >
  Enter plan mode for a new calculator or non-trivial change — maps the
  task to logic/component/test/route files within this app's feature-folder
  architecture before any code is written. Use when: "plan", "let's plan",
  "think through", "design this", "how should I implement", or any task
  touching 3+ files.
---

# /plan — Feature-Folder-Aware Planning

## What

A structured pause before implementation. This app has one architecture (feature-folder-per-calculator, pure-logic/view split — `rules/architecture.md`), so planning here isn't about choosing a pattern — it's about mapping the task onto that pattern's pieces precisely: what goes in `logic.ts`, what goes in the component, what's new vs. shared, what the route wiring looks like.

## When

- A new calculator (even with `skills/scaffold` doing the mechanical file creation, plan the math and result shape first)
- A change touching 3+ files, or a refactor that could affect more than one calculator
- Any time the user says "plan", "think through", "how should I approach this"

**Skip for:** single-file fixes, typo corrections, config tweaks.

## How

### Step 1: Understand the Task

Check `docs/specs/` for an approved spec covering this — if one exists, it's the source of truth: map its acceptance criteria directly to plan steps. If the task is spec-worthy (per `skills/spec`'s When section) and no spec exists, recommend `/spec` first rather than planning on assumptions.

### Step 2: Map to the Feature-Folder Shape

For a new calculator, the plan is almost always the same shape (`skills/scaffold` mechanizes this once agreed):

```
src/calculators/<name>/
  logic.ts               — pure math, discriminated union result type
  logic.test.ts           — the calculator's real test coverage
  <Name>Calculator.tsx    — input collection + result rendering
  <Name>Calculator.test.tsx
  index.ts                — re-export
+ route wiring in src/routes (or App.tsx)
+ nav entry
```

For a change to an existing calculator, identify precisely which of those files are touched and whether `src/shared/` is affected — and if so, whether the change could affect other calculators using the same shared piece (`Grep` for other usages first).

### Step 3: Map Affected Areas

- Does this need a new `shared/` component, or does one already exist? (`Glob` `src/shared/` first — don't duplicate.)
- Any accessibility surface this introduces (`rules/accessibility.md`) — a new input needs a label, a new result needs `aria-live`.
- Any animation surface (`rules/animations.md`) — does a new result reveal or route transition need the compositor-only treatment?
- Existing calculators or shared code this could break — `Grep` for usages before assuming a change is isolated.

### Step 4: Produce the Plan

```
## Plan: [Task Title]

**Affected files:** [list]
**New shared code:** [none / what, and why it's genuinely shared]

### Steps
1. [Step] — [file] — [why this order]
2. ...

### Open Questions
- [anything needing user input before proceeding]

### Risks
- [what could go wrong]
```

### Step 5: Iterate

Present the plan: "Does this look right, or should I adjust anything?" Revise until confirmed. Only then implement.

## Example

```
User: /plan add an opposed-roll calculator for a d20 system (attacker vs defender AC)

Claude:
## Plan: Opposed d20 Roll Calculator

**Affected files:**
- src/calculators/d20-opposed/logic.ts (new)
- src/calculators/d20-opposed/logic.test.ts (new)
- src/calculators/d20-opposed/D20OpposedCalculator.tsx (new)
- src/calculators/d20-opposed/D20OpposedCalculator.test.tsx (new)
- src/calculators/d20-opposed/index.ts (new)
- src/App.tsx (route + nav entry)

**New shared code:** none — reuses existing NumberStepper from src/shared/

### Steps
1. Write logic.ts: resolveD20Opposed(attackerRoll, attackerBonus, defenderAC) — pure function first
2. Write logic.test.ts covering hit/miss/crit/crit-fail before the component exists
3. Build D20OpposedCalculator.tsx wiring NumberStepper inputs to the logic function
4. Add aria-live result region per rules/accessibility.md
5. Wire route + nav entry with viewTransition (rules/animations.md)
6. Component test: renders result after valid submission

### Open Questions
- Does a natural 20 auto-hit regardless of AC, per this system's rules?

### Risks
- None — fully isolated new calculator, no shared-code changes
```

## Related

- `spec` — write the spec first for calculators too big to describe in one sentence
- `scaffold` — generates the files this plan lays out
- `verify` — run after implementing the plan
