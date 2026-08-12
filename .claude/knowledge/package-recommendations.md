# Package Recommendations

> A snapshot, not a permanent source of truth — `rules/packages.md` requires verifying current versions before install regardless of what's written here. Re-check against official docs before a fresh project init; this list can go stale.

## Core

| Package | Purpose | Why this one |
|---|---|---|
| `react`, `react-dom` | UI runtime | Current stable major, 19.x |
| `react-router` | Client-side routing with View Transitions support | v8 — note `react-router-dom` was removed; install `react-router` only (see [ADR-002](decisions/002-react-router-view-transitions.md)) |
| `vite`, `@vitejs/plugin-react` | Build tool + React fast refresh | Vite's own scaffold (`npm create vite@latest -- --template react-ts`) sets these up correctly — prefer that over hand-assembling |
| `typescript` | Type checking | Strict mode on (see `rules/coding-style.md`) |

## Linting and Formatting

| Package | Purpose |
|---|---|
| `eslint`, `typescript-eslint` | Linting, flat config (`eslint.config.js`) |
| `eslint-plugin-react-hooks` | Rules of Hooks enforcement |
| `eslint-plugin-react-refresh` | Catches Fast Refresh–breaking exports |
| `prettier` | Formatting — kept separate from ESLint's linting concerns |

Vite's own `react-ts` template scaffold already wires up the ESLint flat config with `typescript-eslint` + the two React plugins — start from that rather than assembling from scratch.

## Testing

| Package | Purpose |
|---|---|
| `vitest` | Test runner — reads `vite.config.ts` by default, or a dedicated `vitest.config.ts` |
| `@testing-library/react` | Component testing, queries by role/label |
| `@testing-library/jest-dom` | DOM matcher extensions (`toBeInTheDocument`, etc.) |
| `jsdom` | DOM environment for Vitest (`test.environment: "jsdom"`) — `happy-dom` is a faster alternative with less complete API coverage; prefer `jsdom` unless a measured test-suite runtime problem justifies switching |

Per [ADR-003](decisions/003-vitest-testing-stack.md), no E2E runner (Playwright/Cypress) is included by default.

## Deployment

No package needed for the recommended approach — GitHub's official `actions/upload-pages-artifact` + `actions/deploy-pages` Actions handle GH Pages deployment directly from CI (see `skills/ci-cd`). Avoid the older `gh-pages` npm package + branch-push pattern unless there's a specific reason the Actions-native flow doesn't work (e.g. Pages restricted to legacy branch deployment on a given repo).

## Explicitly Not Included

- **No CSS-in-JS library** (styled-components, Emotion) and **no animation library** (Framer Motion, react-spring). Plain CSS + the View Transitions API cover this app's entire animation surface — see `rules/animations.md`. Adding either would be exactly the kind of unearned dependency `rules/performance.md`'s bundle-budget guidance warns against.
- **No state-management library** (Redux, Zustand, Jotai) by default. Each calculator's state is local. See `skills/state-management` for the (rare) case this changes.
- **No UI component kit** (MUI, Chakra, shadcn) unless the user asks — the monochrome-plus-accent design in `Plans.txt` reads as a small enough surface to hand-build, and a full component kit is a large bundle-size and design-override cost for a handful of calculator forms.
