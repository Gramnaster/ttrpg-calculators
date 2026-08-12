# ADR-003: Vitest + React Testing Library, No E2E Runner

## Status

Accepted

## Context

TTRPGCalculators is a greenfield project — no existing test setup to match. Per this developer's own standing instructions ("Check the testing stack before scaffolding tests... When there's no prior art in the project, ask rather than defaulting"), the choice was made explicitly rather than defaulted silently. Options considered:

- **Vitest + React Testing Library** — unit/component tests only, Vite-native test runner (shares config/transform pipeline with the app's own Vite build).
- **Vitest + RTL + Playwright** — adds full browser E2E tests on top.
- **Jest + RTL** — the older, non-Vite-native alternative; requires a separate transform pipeline (ts-jest or babel-jest) instead of reusing Vite's.

Evaluation criteria:

1. **What actually needs testing.** This app's real risk surface is calculator math (probability/dice-resolution logic) and component wiring (input → result renders) — not multi-step user journeys, not auth flows, not cross-page state (there is none; see ADR-002, each calculator is independent). E2E testing earns its cost when there are real user journeys to protect; a calculator collection doesn't have those yet.
2. **Toolchain fit.** Vitest reads the app's existing `vite.config.ts` and shares its transform pipeline — no second bundler/transform config to maintain alongside Vite, unlike Jest.
3. **Maintenance cost.** A second test runner (Playwright) means a second CI job, browser binaries to manage, and slower feedback loops — worth it when there's something E2E-shaped to test, not by default.

## Decision

**Vitest + React Testing Library, jsdom environment, no E2E runner.**

- Calculator logic (`logic.ts`) gets thorough unit tests — this is where actual bugs live.
- Components get behavior tests via RTL (`getByRole`/`getByLabelText` queries) — verifying wiring, not re-testing the math.
- No Playwright/Cypress in this app for now.

See `rules/testing.md` for the enforceable test-writing rules and `skills/testing` for patterns.

### When to deviate

Revisit if the app grows genuine multi-step user journeys worth protecting end-to-end — e.g. if calculators start sharing state, or a save/share-a-build feature is added that spans multiple screens. A single calculator's input-to-result flow does not meet that bar; it's fully covered by RTL component tests.

## Consequences

### Positive

- One test runner, one config, sharing Vite's own transform pipeline — minimal toolchain surface.
- Fast feedback loop (no browser automation overhead) fits this app's small, math-heavy surface.
- Component tests via RTL's role/label queries double as a lightweight accessibility check (see `rules/accessibility.md`).

### Negative

- No automated verification of the actual deployed GitHub Pages build rendering correctly end-to-end, or of cross-browser rendering quirks.
- If the app does grow real multi-step flows later, E2E coverage will need to be added retroactively rather than already existing.

### Mitigations

- `devops-engineer` agent's CI pipeline includes a manual "confirm the live Pages URL actually renders" verification step (see `skills/ci-cd`) as a lightweight substitute for automated E2E on the deployed artifact.
- Revisit this ADR (mark superseded) if the "when to deviate" trigger above is hit.
