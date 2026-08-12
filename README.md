# TTRPG Calculators

A collection of dice-probability calculators for tabletop role-playing games. Each calculator solves one system's resolution math and reports the exact odds for every outcome.

Live site: <https://gramnaster.github.io/TTRPGCalculators/>

## Calculators

- **Opposed Roll Calculator** — Compares two d100 skill rolls. It classifies each roll into a success level (Critical Failure, Moderate Failure, Moderate Success, Critical Success) and reports the win, loss, and tie odds for both sides.
- **Differential Roll Calculator** — Resolves a d100 attack roll against a Parry or Counter defense roll. It reports the odds for each outcome: attack misses, parry succeeds, attack hits, both rolls hit, or counter hits.
- **TOR Roll Calculator** — Resolves a *The One Ring* 2e roll: one Feat Die plus a pool of Success Dice, summed against a Target Number. It reports the odds for Failure, Success, Great Success, and Extraordinary Success, plus a reference grid across Target Numbers and dice-pool sizes.

## Stack

| Layer | Choice |
| --- | --- |
| Build tool | Vite 8 |
| UI library | React 19 |
| Language | TypeScript, strict mode |
| Routing | React Router 8 |
| Styling | Tailwind CSS 4 |
| Test runner | Vitest 4, React Testing Library |
| Package manager | pnpm (version pinned in `package.json`) |

## Development

Prerequisites: Node.js 22 or a later version, and pnpm.

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts a local dev server with hot reload.

| Command | Effect |
| --- | --- |
| `pnpm dev` | Starts the local dev server. |
| `pnpm run build` | Type-checks the project, then builds the production bundle into `dist/`. |
| `pnpm test` | Runs the Vitest suite once. |
| `pnpm lint` | Runs ESLint on the project. |
| `pnpm exec tsc --noEmit` | Type-checks the project without emitting output. |
| `pnpm run format` | Formats the project with Prettier. |
| `pnpm preview` | Serves the production build locally. |

## Project structure

```text
src/calculators/<name>/   Pure logic, component, and tests for one calculator.
src/shared/                Code shared by two or more calculators.
src/App.tsx                Route table and navigation.
```

Each calculator keeps its probability math in a `logic.ts` file with no React import. The [architecture rules](.claude/rules/architecture.md) define the full pattern.

## Testing

Each calculator's `logic.ts` file carries its own probability tests. Component tests check that a valid input renders a result and that an invalid input renders a validation message. The [testing rules](.claude/rules/testing.md) define the full pattern.

## Deployment

A GitHub Actions workflow deploys `main` to GitHub Pages on every push. The workflow runs `tsc --noEmit`, `eslint`, and the Vitest suite. It then builds the project and deploys the build to GitHub Pages. See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
