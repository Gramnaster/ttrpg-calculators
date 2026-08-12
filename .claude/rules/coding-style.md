---
alwaysApply: true
description: >
  Enforces TypeScript and React coding conventions, naming standards, and
  file organization for all frontend code in this repository.
---

# TypeScript & React Coding Style

## File Organization

- **One component per file.** File name matches the component name exactly (`DicePoolInput.tsx` exports `DicePoolInput`).
- **Named exports, not default exports.** Default exports can be imported under any name, which makes refactors and grep-based navigation harder. The one standard exception: files Vite/React tooling expects a default from (e.g. `vite.config.ts`'s `defineConfig` return isn't affected either way, but lazy-loaded route components via `React.lazy` need a default export — isolate those behind a one-line re-export file if it comes up).

```tsx
// DO
export function DicePoolInput({ value, onChange }: DicePoolInputProps) { ... }

// DON'T
export default function DicePoolInput(...) { ... }
```

- **Colocate what changes together.** A calculator's pure logic, its component, and its test live in the same feature folder (see `rules/architecture.md`), not split across parallel `components/`, `hooks/`, `utils/` trees.

## Types

- **`interface` for component props, `type` for everything else** (unions, function signatures, mapped/utility types). Props interfaces extend cleanly; most other shapes are unions or compositions where `type` reads better. Either is acceptable — the point is picking one per use-case and staying consistent within a file.
- **No `any`.** If the shape is genuinely unknown, use `unknown` and narrow it. `any` defeats the entire reason to use TypeScript and is flagged by `rules/error-handling.md`'s boundary-validation guidance.
- **Discriminated unions for calculator results**, not a single object with a bunch of optional fields.

```ts
// DO
type RollResult =
  | { kind: "success"; successes: number; rolls: number[] }
  | { kind: "invalidInput"; reason: string };

// DON'T
interface RollResult {
  successes?: number;
  rolls?: number[];
  error?: string;
}
```

## Components

- **Function components only.** No class components — hooks cover the full lifecycle a calculator app needs.
- **Props destructured in the signature**, not accessed via a `props.` object inside the body.
- **No inline object/array/function literals as props to memoized children** unless you've actually memoized the child and measured that it matters (see `rules/priorities.md` — performance is priority 6, not priority 1). Don't add `useCallback`/`useMemo` defensively; add them when a profile shows a re-render that costs something.

## Naming

- **PascalCase** for components, types, and interfaces. **camelCase** for variables, functions, and hooks.
- **Hook prefix `use`** for every custom hook (`useDiceRoll`), even trivial ones — it's the signal that Rules of Hooks apply.
- **Handler prefix `handle` for the function, `on` for the prop** — `onRoll` prop calls a locally defined `handleRoll`.
- **Boolean names read as a question**: `isValid`, `hasModifier`, `canReroll` — not `valid`, `modifierFlag`.

```tsx
// DO
function DicePoolInput({ diceCount, onDiceCountChange }: DicePoolInputProps) {
  const handleIncrement = () => onDiceCountChange(diceCount + 1);
  ...
}

// DON'T
function DicePoolInput(props: DicePoolInputProps) {
  function increment() { props.onDiceCountChange(props.diceCount + 1); }
  ...
}
```

## Comments

- Default to no comments. Well-named functions and types already say what the code does.
- Write one when the *why* isn't obvious from the code: a rules-system quirk ("Blades in the Dark counts 6s as a critical only on 2+ sixes, not per-die"), a workaround for a specific browser/library bug, or an invariant a future edit could silently break.
