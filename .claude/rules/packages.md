---
alwaysApply: true
description: >
  Enforces latest stable npm package versions and dependency discipline.
  Prevents outdated package references from training data.
---

# Package Management Rules

## Always Use Latest Stable Versions

- **Never hardcode package versions from memory.** Training data goes stale fast in the npm ecosystem — major-version bumps (React 19, React Router 8 dropping `react-router-dom` entirely, Vite 8, Vitest 4) happen faster than most training cutoffs track. Always verify before adding a package.
- **Run `npm install <name>` without a version pin** to pull the latest stable release. This is the safest default.

```bash
# DO — gets latest stable automatically
npm install react-router
npm install -D vitest @testing-library/react @testing-library/jest-dom

# DON'T — hardcoded version likely outdated or, worse, references a removed package
npm install react-router-dom@6.4.0
```

- **`react-router-dom` was removed in React Router v8** — the package is `react-router` now, for all installation modes (Declarative, Data, Framework). If existing code or a tutorial references `react-router-dom`, that's a signal it predates v8; verify against [reactrouter.com](https://reactrouter.com) before following it.
- **When writing a `package.json` dependency by hand**, run the install command first to resolve the correct version, then let npm write it — don't type a version number from memory.

## Version Verification

- If unsure about the latest version, check npmjs.com or run `npm view <package> version`.
- **Never downgrade a package** already in the project unless explicitly asked or there's a known compatibility issue.
- Prefer stable releases over beta/RC unless the project explicitly needs a preview feature.

## Lockfile Discipline

- **`package-lock.json` is committed.** CI and local installs must produce identical dependency trees.
- **CI uses `npm ci`, not `npm install`.** `npm ci` fails fast on a lockfile/`package.json` mismatch instead of silently resolving a different tree.

## Baseline Alignment

As of this kit's writing (verified against current docs, not memory — re-verify before relying on these for a new install):

- Node.js: 22+ (required by React Router v8; also satisfies Vite 8's floor of 20.19+/22.12+)
- Vite: 8.x
- React / React DOM: 19.x
- React Router: 8.x (package `react-router`, no `react-router-dom`)
- TypeScript: current stable, strict mode on
- Vitest: 4.x
- ESLint: flat config (`eslint.config.js`), `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`

Don't treat this list as permanently current — it's a snapshot. Re-verify against official docs (`vite.dev`, `react.dev`, `reactrouter.com`, `vitest.dev`) before a new project init, same as the rule above requires for any single package.
