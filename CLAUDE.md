# TTRPGCalculators

A collection of TTRPG dice/probability calculators (opposed rolls, Blades in the Dark-style
probability, more later per `Plans.txt`) — solo, personal project, static site on GitHub Pages.
Governed by this repo's own `.claude/` kit (`rules/*.md`, `skills/*`, `agents/*` — see `AGENTS.md`
for routing). This file adds project-specific state the generic rules don't know about.

## Current State: Kit-Only

As of this file's writing, only `Plans.txt` and this `.claude/` kit exist — **no app code has
been scaffolded yet.** The next step is `skills/project-setup` (Vite + React + TS init, dependency
install, base config) followed by `skills/scaffold` for the first calculator. Don't assume
`src/`, `package.json`, or any config file exists without checking first.

## Architecture: Feature-Folder-Per-Calculator + Pure-Logic/View Split

See [ADR-001](knowledge/decisions/001-feature-folder-architecture.md) and
[ADR-004](knowledge/decisions/004-pure-logic-view-separation.md). One architecture, no
alternatives under consideration — `rules/architecture.md` is the enforceable summary.

```
src/calculators/<name>/    — logic.ts (pure), component(s), tests, all colocated
src/shared/                 — only what 2+ calculators actually use
src/routes/ (or App.tsx)    — wires calculators to React Router paths
```

## Tech Stack (planned, per `Plans.txt` + `rules/packages.md`)

| Concern | Choice | Notes |
|---|---|---|
| Package manager | pnpm 11.x, pinned via `packageManager` in `package.json` | No npm/`npx` — see `rules/packages.md` |
| Build tool | Vite 8.x | Verify current major before init — `rules/packages.md` |
| UI | React 19.x | Function components only, no class components |
| Language | TypeScript, strict mode | `Nullable`-equivalent discipline: no `any` |
| Routing | React Router 8.x (`react-router` package) | Declarative Mode (`<BrowserRouter>`), `viewTransition` on calculator-to-calculator nav — [ADR-002](knowledge/decisions/002-react-router-view-transitions.md) |
| Testing | Vitest 4.x + React Testing Library | No E2E runner — [ADR-003](knowledge/decisions/003-vitest-testing-stack.md) |
| Linting | ESLint flat config + `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` | |
| Formatting | Prettier | Separate from ESLint |
| Deployment | GitHub Actions → GitHub Pages (`actions/upload-pages-artifact` + `actions/deploy-pages`) | `skills/ci-cd` |
| Animation | CSS (`transform`/`opacity` only) + native View Transitions API | No animation library — `rules/animations.md` |

Re-verify every version against live docs before running the actual `pnpm install` — see
`rules/packages.md`. This table is a plan, not a lockfile.

## Compliance Scope

No backend, no auth, no user accounts, no persisted user data, no PII. Most of the standard
web-app security/compliance surface (OWASP auth/session concerns, audit trails, encryption at
rest) doesn't apply — see `rules/security.md` for what's left: no secrets in the public repo,
no XSS via unescaped rendering, dependency hygiene. Treat this as a public hobby project, not a
regulated one, unless its purpose changes.

## Team Size

Solo. Optimize for velocity over process — no PR ceremony, no multi-reviewer gates. Still run
`skills/verify` before merging to `main` since there's no second reviewer to catch drift, and
GitHub Pages is a real public deployment target even for a solo project.

## Calculators (per `Plans.txt`)

Currently scoped: **Opposed Roll Calculator** and **Blades in the Dark Probability Calculator**.
More are explicitly expected later — `Plans.txt`: "More, but standby on this as you set up." Each
new calculator follows `skills/scaffold`; don't add one that isn't in scope without confirming
with the user first, per this app's stated "standby" instruction.
