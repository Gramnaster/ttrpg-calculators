---
name: verify
description: >
  Run the full pre-PR verification pipeline — typecheck, lint, antipattern
  scan, tests, build, security audit, and format check — each phase
  reporting PASS/WARN/FAIL, short-circuiting on critical failures. Use
  when: "verify", "check everything", "is this ready", "pre-PR check",
  "run all checks", "npm run verify".
---

# /verify — Full Verification Pipeline

## What

Runs `npm run verify` (or the equivalent commands individually) as a sequential pipeline, each phase reporting an explicit PASS, WARN, or FAIL. This app is small enough that the whole pipeline runs in seconds — there's no excuse to skip phases because a change "looks safe." Two phases are critical and short-circuit the pipeline: a codebase that doesn't typecheck or has failing tests makes every later phase meaningless.

| Phase | Command | Catches | Critical |
|---|---|---|---|
| 1. TypeScript | `npx tsc --noEmit` | Type errors, `strict` violations | Yes |
| 2. Lint | `npx eslint .` | Style violations, `react-hooks` rule breaks, `no-explicit-any` | No |
| 3. Antipatterns | grep-based (see below) | Layout-property CSS animation, `any`, `dangerouslySetInnerHTML` | No |
| 4. Tests | `npx vitest run` | Failing logic/component tests | Yes |
| 5. Build | `npm run build` | Import resolution, Vite `base` path issues | Yes |
| 6. Security | `npm audit` | Known vulnerabilities in dependencies | FAIL on high/critical |
| 7. Format | `npx prettier --check .` + diff review | Style drift, accidental/debug changes | No |

## When

- After finishing a calculator, a fix, or a refactor
- Before opening a PR — non-negotiable, full pipeline (`rules/git-workflow.md`)
- After a dependency bump (`skills/outdated`)
- When the user says "verify", "check everything", "is this ready"

### Which Phases to Run

Full pipeline is the default for a PR. For scoped in-session checks:

| Scenario | Phases |
|---|---|
| New calculator / pre-PR | All 7 |
| Bug fix in `logic.ts` | 1, 4 |
| Component-only change | 1, 2, 4 |
| Animation/CSS change | 2, 3 — this is the phase that matters most here |
| Dependency update | 1, 4, 5, 6 |

## How

### Phase 1: TypeScript (CRITICAL)

```bash
npx tsc --noEmit
```

Stop and fix on any error — nothing downstream is meaningful on code that doesn't typecheck.

### Phase 2: Lint

```bash
npx eslint .
```

`react-hooks/exhaustive-deps` and `@typescript-eslint/no-explicit-any` findings are real bugs, not style noise — see `skills/build-fix` for the common fixes.

### Phase 3: Antipattern Detection

The same checks `hooks/pre-commit-antipattern.sh` runs, done here proactively rather than waiting for the commit to be blocked:

- Changed `.css`/`.tsx` `transition`/`animation`/`@keyframes` touching a non-compositor property (`width`, `height`, `top`, `left`, `margin`, `padding`, `background-color`, `box-shadow`) — see `rules/animations.md`.
- `any` outside a justified, commented exception.
- `dangerouslySetInnerHTML` anywhere — see `rules/security.md`.

### Phase 4: Tests (CRITICAL)

```bash
npx vitest run
```

Any failing test is a FAIL. A calculator with no `logic.test.ts` is a WARN, not a FAIL, but flag it — `rules/testing.md` expects thorough coverage for every calculator's math.

### Phase 5: Build (CRITICAL)

```bash
npm run build
```

Catches import resolution issues and the Vite `base`-path misconfiguration that only shows up at build/deploy time, not in dev (`skills/ci-cd`).

### Phase 6: Security

```bash
npm audit
```

PASS / WARN (moderate/low) / FAIL (high/critical) — see `rules/security.md`. For a client-only bundle, a vulnerable dependency still ships to every visitor.

### Phase 7: Format + Diff Review

```bash
npx prettier --check .
```

Then review `git diff --stat` and `git diff` for accidental file changes, debug `console.log`s, and unresolved TODOs.

### Fix-and-Retry Loop

1. Identify which phase failed and the specific error.
2. Make the minimal fix.
3. Re-run from Phase 1 if the fix touched code; otherwise re-run just the failed phase.
4. Repeat until all phases pass or something needs the user's input.

### Final Summary

```
## Verification Results

| Phase | Result | Details |
|---|---|---|
| 1. TypeScript | PASS | 0 errors |
| 2. Lint | PASS | clean |
| 3. Antipatterns | WARN | 1 `any` in DicePoolInput.tsx:22 |
| 4. Tests | PASS | 34 passed |
| 5. Build | PASS | dist/ 118kb |
| 6. Security | PASS | 0 vulnerabilities |
| 7. Format | PASS | clean |

**Verdict: READY FOR REVIEW** (1 non-blocking warning)
```

## Related

- `build-fix` — fixes for common Phase 1/2 failures
- `code-review` — deeper review once verification passes
- `ci-cd` — the same phases running unattended in GitHub Actions
- `outdated` — the dependency audit this pipeline's Phase 6 is a lightweight version of
