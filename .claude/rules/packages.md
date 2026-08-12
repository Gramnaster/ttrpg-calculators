---
alwaysApply: true
description: >
  Enforces latest stable pnpm package versions and dependency discipline.
  Prevents outdated package references from training data.
---

# Package Management Rules

## pnpm, Not npm

- **This project uses pnpm exclusively.** No `npm install`, `npm run`, `npx`, or `package-lock.json` — those are npm-ecosystem commands/artifacts and don't belong in this repo. Use `pnpm`.
- **Corepack pins the exact pnpm version** via the `packageManager` field in `package.json` (currently `pnpm@11.21.0`). Don't bump that field by hand — run `pnpm self-update` from inside the project (it rewrites the pin, it doesn't touch your global pnpm install) or `npm install -g pnpm@latest` for the global CLI itself. See "Updating pnpm Itself" below.

## Always Use Latest Stable Versions

- **Never hardcode package versions from memory.** Training data goes stale fast in the npm ecosystem — major-version bumps (React 19, React Router 8 dropping `react-router-dom` entirely, Vite 8, Vitest 4) happen faster than most training cutoffs track. Always verify before adding a package.
- **Run `pnpm add <name>` without a version pin** to pull the latest stable release. This is the safest default.

```bash
# DO — gets latest stable automatically
pnpm add react-router
pnpm add -D vitest @testing-library/react @testing-library/jest-dom

# DON'T — hardcoded version likely outdated or, worse, references a removed package
pnpm add react-router-dom@6.4.0
```

- **`react-router-dom` was removed in React Router v8** — the package is `react-router` now, for all installation modes (Declarative, Data, Framework). If existing code or a tutorial references `react-router-dom`, that's a signal it predates v8; verify against [reactrouter.com](https://reactrouter.com) before following it.
- **When writing a `package.json` dependency by hand**, run the install command first to resolve the correct version, then let pnpm write it — don't type a version number from memory.

## Command Reference (npm → pnpm)

| npm | pnpm |
|---|---|
| `npm install` | `pnpm install` |
| `npm install <pkg>` | `pnpm add <pkg>` |
| `npm install -D <pkg>` | `pnpm add -D <pkg>` |
| `npm ci` | `pnpm install --frozen-lockfile` |
| `npm run <script>` | `pnpm run <script>` (or `pnpm <script>`) |
| `npx <bin>` | `pnpm exec <bin>` (or `pnpm <bin>` if it's not a pnpm subcommand) |
| `npm audit` | `pnpm audit` |
| `npm view <pkg> version` | `pnpm view <pkg> version` |

`pnpm exec` never auto-installs a missing package (unlike bare `npx`), so it's the correct default for hook scripts and CI — no `--no-install` flag needed.

## Version Verification

- If unsure about the latest version, check npmjs.com or run `pnpm view <package> version`.
- **Never downgrade a package** already in the project unless explicitly asked or there's a known compatibility issue.
- Prefer stable releases over beta/RC unless the project explicitly needs a preview feature.

## Lockfile Discipline

- **`pnpm-lock.yaml` is committed.** CI and local installs must produce identical dependency trees. `package-lock.json` must never reappear — if you see one, an npm command ran somewhere it shouldn't have.
- **CI uses `pnpm install --frozen-lockfile`** (handled automatically by `pnpm/setup` in `.github/workflows/deploy.yml`), not a plain `pnpm install`. A frozen install fails fast on a lockfile/`package.json` mismatch instead of silently resolving a different tree.

## Updating pnpm Itself

- **On Windows, install/update the pnpm CLI via npm** (`npm install -g pnpm@latest`) — this is pnpm's own [documented recommendation](https://pnpm.io/installation) for Windows, since the standalone installer can trigger Windows Defender false positives. This is a one-time global-tool bootstrap, not project package management, so it's the sanctioned exception to "no npm in this repo."
- **`pnpm self-update` only rewrites the `packageManager` pin** in `package.json` when one exists (as it does here) — it does not touch the global CLI install. Use the npm command above to actually move the global binary forward, then bump the `packageManager` field (or let `pnpm self-update` do it) to match.
- Verify the latest stable tag before updating — `npm view pnpm dist-tags` — since pnpm sometimes has a `next-<major>` release-candidate tag ahead of `latest`. Don't install an RC as the project's pin.

## Baseline Alignment

As of this kit's writing (verified against current docs, not memory — re-verify before relying on these for a new install):

- Node.js: 22+ (required by React Router v8; also satisfies Vite 8's floor of 20.19+/22.12+)
- pnpm: 11.x (pinned via `packageManager` in `package.json`; pnpm 12 is RC-only as of this writing — don't adopt until it's `latest`)
- Vite: 8.x
- React / React DOM: 19.x
- React Router: 8.x (package `react-router`, no `react-router-dom`)
- TypeScript: current stable, strict mode on
- Vitest: 4.x
- ESLint: flat config (`eslint.config.js`), `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`

Don't treat this list as permanently current — it's a snapshot. Re-verify against official docs (`vite.dev`, `react.dev`, `reactrouter.com`, `vitest.dev`, `pnpm.io`) before a new project init, same as the rule above requires for any single package.
