---
name: code-review
description: >
  Structured review process for PRs/diffs — correctness, accessibility,
  animation-rule compliance, and conventions, using Grep/tsc/eslint since
  there's no language-server MCP wired up. Use when: "review this",
  "PR review", "what should I review", "blast radius".
---

# Code Review

## Process

### Step 1: Understand the Change

`git diff` (or the PR diff) first — know what's actually changed before opening files wholesale. `Grep` for symbols the diff introduces or modifies to find their other usages (the "blast radius") rather than reading unrelated files speculatively.

### Step 2: Run Diagnostics

```bash
pnpm exec tsc --noEmit
pnpm exec eslint .
pnpm exec vitest run
```

Any new failure here is a Critical Issue, not a Suggestion — a review that misses a build break isn't a review.

### Step 3: Check Against This Project's Specific Requirements

In priority order (mirrors `rules/priorities.md`):

1. **Correctness** — for a calculator change, does the math actually match the rules system? Are the edge cases from `skills/scaffold` Step 1 covered?
2. **Accessibility** — labeled inputs, keyboard operability, `aria-live` on dynamic results, contrast if colors changed. See `rules/accessibility.md`.
3. **Animation compliance** — `Grep` any changed `.css`/`.tsx` for `transition:`/`animation:` touching non-`transform`/`opacity` properties. This is the one category with near-zero tolerance for exceptions — flag it as Critical, not Suggestion, per `rules/animations.md`.
4. **Simplicity** — is there a speculative abstraction (a Context for one consumer, a `useMemo` with no measured need) that adds complexity without a corresponding requirement? See `knowledge/common-antipatterns.md`.
5. **Testing** — new logic without tests is a gap; check that edge cases are covered, not just the happy path.
6. **Conventions** — matches the feature-folder shape (`rules/architecture.md`), naming (`rules/coding-style.md`), and whatever this specific codebase has already established (`skills/convention-learner`).

### Step 4: Report

```
## Summary
[1-2 sentences]

## Critical Issues
- [animation rule violation / correctness bug / accessibility blocker / build break]

## Suggestions
- [non-blocking improvements]

## Observations
- [minor style points]

## What's Good
- [positive feedback — don't skip this]
```

## Anti-patterns in Reviewing

### Treating an Animation Violation as a Style Nitpick

```
# BAD
"Suggestion: consider using transform instead of top for this transition."

# GOOD
"Critical: this animates `top`, which forces Layout every frame — violates
rules/animations.md. Use transform: translateY() instead. [code]"
```

### Reviewing Without Running Diagnostics

```
# BAD
"This looks like it should type-check fine."

# GOOD
[ran pnpm exec tsc --noEmit] "0 errors. [ran pnpm exec eslint .] 1 warning: unused import
in OpposedRollCalculator.tsx line 3."
```

## Related

- `convention-learner` — detecting what this specific codebase already does before flagging a "violation" that's actually just an established local pattern
- `de-sloppify` — for cleanup work that comes out of a review, not the review itself
