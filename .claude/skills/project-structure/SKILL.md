---
name: project-structure
description: >
  Defines where files belong — feature folders per calculator, shared code,
  routes, and top-level config. Use when: "where does this go", "folder
  structure", "project layout", or when unsure which folder a new file
  belongs in.
---

# Project Structure

## Top-Level Layout

```
TTRPGCalculators/
  .claude/                 # this kit
  .github/workflows/       # CI + GH Pages deploy (skills/ci-cd)
  public/                  # static assets served as-is
  src/
    calculators/           # one folder per calculator (rules/architecture.md)
    shared/                # code used by 2+ calculators — promoted, not preemptive
    App.tsx                # route definitions, top-level layout, nav menu
    main.tsx                # React root, BrowserRouter mount
    setupTests.ts          # Vitest + RTL setup (jest-dom matchers)
  index.html
  vite.config.ts
  tsconfig.json
  eslint.config.js
  package.json
```

## Inside a Calculator Folder

```
src/calculators/opposed-roll/
  logic.ts                          # pure TS, zero React imports (ADR-004)
  logic.test.ts                     # Vitest unit tests for the math
  OpposedRollCalculator.tsx         # component: input, calls logic, renders result
  OpposedRollCalculator.test.tsx    # RTL component test
  index.ts                          # re-exports the component for the route table
```

- `logic.ts` never imports from `react` or any component file.
- The component file imports only from its own `logic.ts` and `src/shared/`.
- `index.ts` exists so route wiring in `App.tsx` imports `./calculators/opposed-roll` rather than reaching into the file directly — one less place to update if the main component file is ever renamed.

## What Goes in `shared/`

Only code actually used by two or more calculators:

- A generic input component (`NumberStepper`, `DicePoolInput` if the shape is truly identical across systems)
- A results-panel layout wrapper, if multiple calculators render results the same way
- Shared types genuinely common across systems (unlikely — most TTRPG dice mechanics are different enough that "shared roll type" is a false abstraction; verify before creating one)

**Don't move something to `shared/` in anticipation of reuse.** Wait until a second calculator actually needs it, per `rules/priorities.md`'s simplicity-first stance.

## Route Wiring

`App.tsx` (or a dedicated `src/routes.tsx` if the route table grows large enough to warrant its own file) is the only place that imports every calculator and maps it to a path:

```tsx
const OpposedRollCalculator = lazy(() => import("./calculators/opposed-roll"));
const BitdProbabilityCalculator = lazy(() => import("./calculators/bitd-probability"));

<Routes>
  <Route path="/opposed-roll" element={<OpposedRollCalculator />} />
  <Route path="/bitd-probability" element={<BitdProbabilityCalculator />} />
</Routes>
```

## Config Files

- `vite.config.ts` — plugins, `test` block for Vitest, `base` path for GH Pages (see `skills/ci-cd`)
- `tsconfig.json` — strict mode on, matches Vite's `react-ts` template baseline
- `eslint.config.js` — flat config, `typescript-eslint` + React hooks/refresh plugins
- `.prettierrc` (or `prettier` key in `package.json`) — formatting rules, kept separate from ESLint

## Related

- `skills/scaffold` — the concrete steps for adding a new calculator to this structure
- `rules/architecture.md` — the enforceable version of this layout
- `knowledge/decisions/001-feature-folder-architecture.md` — why this shape was chosen
