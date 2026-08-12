---
name: project-setup
description: >
  Interactive project scaffolding and health-check workflows for the Vite +
  React + TS app. Guides initialization (npm create vite, ESLint/Prettier/
  Vitest/GH Pages Actions setup, CLAUDE.md generation) and codebase health
  analysis. Load when: "init project", "setup project", "new project",
  "health check", "analyze project", "project report", "generate CLAUDE.md",
  "scaffold the app".
---

# Project Setup & Workflows

## Core Principles

1. **Interactive over passive** — don't dump a generic template. Confirm the choices this kit already made (see `knowledge/decisions/`) rather than re-asking, but do ask about anything genuinely undecided (a new calculator's name, a package manager preference if it ever comes up).
2. **Verify versions, don't recall them.** Every `npm install` in this workflow installs latest-stable, no hardcoded version numbers (`rules/packages.md`).
3. **Generate, don't template.** Any CLAUDE.md or config file produced should be fully populated for this actual project, not left with `[PLACEHOLDER]` values.
4. **Verify after action.** After scaffolding, actually run the build/lint/test commands to confirm the setup works — don't just assert it will.

## Patterns

### Project Init Workflow

Run once, at the start of the project. Execute in order.

**Step 1: Scaffold via Vite**

```bash
npm create vite@latest . -- --template react-ts
```

(Or into a subdirectory instead of `.` if the current directory isn't meant to be the app root.) This installs React 19.x, TypeScript, and a working ESLint flat config (`typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`) as of the current Vite template — don't hand-assemble these when the official template already does it correctly.

**Step 2: Install the additional stack pieces**

```bash
npm install react-router
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom prettier
```

**Step 3: Configure Vitest**

Add a `test` block to `vite.config.ts` (or a separate `vitest.config.ts`):

```ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
  },
});
```

**Step 4: Establish the folder structure**

Per `rules/architecture.md`:

```
src/
  calculators/
  shared/
  App.tsx
  main.tsx
  setupTests.ts
```

**Step 5: Wire GitHub Pages deployment**

See `skills/ci-cd` for the full GitHub Actions workflow and the `vite.config.ts` `base` path requirement.

**Step 6: Verify**

```bash
npm run build
npx tsc --noEmit
npx eslint .
npx vitest run
```

All four should pass clean before considering setup complete.

### Health Check Workflow

Run when asked "check health", "analyze the project", or "how's the codebase".

**Step 1: Structure scan** — `Glob` on `src/calculators/**`; confirm each calculator has `logic.ts` + a component + tests (per `rules/architecture.md`).

**Step 2: Diagnostics** — `npx tsc --noEmit` and `npx eslint .`; count and categorize issues.

**Step 3: Antipattern scan** — grep for the patterns in `knowledge/common-antipatterns.md` (animating layout properties, `any`, inline math in components, defensive memoization).

**Step 4: Test coverage** — for each calculator folder, confirm a `*.test.ts` exists for `logic.ts` at minimum.

**Step 5: Report card**

```
## Codebase Health Report

### Grade: B+ (85/100)

| Category | Score | Issues |
|----------|-------|--------|
| Architecture | 19/20 | Clean feature-folder separation |
| Type/Lint diagnostics | 20/20 | 0 errors |
| Animation compliance | 16/20 | 1 layout-triggering transition found |
| Test coverage | 15/20 | 1 calculator missing logic tests |
| Accessibility | 15/20 | 2 inputs missing labels |

### Priority Actions
1. Fix the width-based transition in ResultPanel.css — rules/animations.md
2. Add logic.ts tests for the new bitd-probability calculator
3. Add <label> to the two unlabeled number inputs
```

Grading scale: A (90-100) production-ready · B (75-89) good shape · C (60-74) needs attention · D (40-59) prioritize cleanup · F (<40) stop feature work and fix.

## Anti-patterns

### Skipping the Decisions Already Made

```
# BAD — re-deriving architecture from scratch every time
"Should this be a monorepo? Should we use Redux? Let's discuss state management..."
```

```
# GOOD — the decisions already exist, apply them
"Per ADR-001, this is a feature folder. Per ADR-004, logic.ts stays React-free."
```

### Generic Setup With No Verification

```bash
# BAD — scaffold and declare done without checking it works
npm create vite@latest . -- --template react-ts
echo "Setup complete!"
```

```bash
# GOOD — scaffold, then prove it
npm create vite@latest . -- --template react-ts
npm install && npm run build && npx tsc --noEmit
```

## Decision Guide

| Scenario | Workflow |
|----------|----------|
| Brand new repo, nothing scaffolded yet | Project Init |
| "How's our codebase?" | Health Check |
| Onboarding after time away | Health Check, then re-read `knowledge/decisions/` |
| Adding a new calculator | Not this skill — see `skills/scaffold` |
