# Common Anti-patterns

> Patterns Claude tends to generate incorrectly in a React + TypeScript + Vite app. Every agent/skill in this kit should protect against these.

## Animating Layout/Paint Properties

**Problem:** `width`, `height`, `top`, `left`, `margin`, `padding`, `background-color`, `box-shadow` force the browser back into Layout or Paint every frame, on the main thread. Directly violates `Plans.txt`'s "Performant transformations only" requirement.

```css
/* BAD — Layout reflow every frame */
.panel { transition: width 200ms ease, top 200ms ease; }

/* GOOD — Composite only */
.panel { transition: transform 120ms cubic-bezier(0.22, 1, 0.36, 1), opacity 120ms ease; }
```

See `rules/animations.md` and `skills/animations` for the full rule set and the `clip-path` alternative to width-based reveals.

## `any` Instead of a Real Type

**Problem:** `any` disables type-checking for that value and everything derived from it — it defeats the entire reason to use TypeScript.

```ts
// BAD
function parseRoll(input: any) { return input.pool * 2; }

// GOOD — unknown forces narrowing
function parseRoll(input: unknown): number {
  if (typeof input !== "object" || input === null || !("pool" in input)) {
    throw new Error("invalid roll input");
  }
  return (input as { pool: number }).pool * 2;
}
```

## Storing Derived State Instead of Computing It

**Problem:** A `useState` that only exists to mirror a value already computable from props/other state adds a sync bug waiting to happen — the two can drift out of sync the moment one update path is missed.

```tsx
// BAD
const [successCount, setSuccessCount] = useState(0);
useEffect(() => {
  setSuccessCount(result?.rolls.filter((r) => r >= 6).length ?? 0);
}, [result]);

// GOOD — computed during render
const successCount = result?.rolls.filter((r) => r >= 6).length ?? 0;
```

## Calculation Logic Inline in Components

**Problem:** Probability/dice math written directly in a component's event handler or JSX can't be unit-tested without rendering React, and it blurs the sim/view boundary this project deliberately maintains (see [ADR-004](decisions/004-pure-logic-view-separation.md)).

```tsx
// BAD — math inline in the component
function handleSubmit(pool: number) {
  const rolls = Array.from({ length: pool }, () => Math.floor(Math.random() * 6) + 1);
  const successes = rolls.filter((r) => r >= 6).length;
  setResult({ rolls, successes });
}

// GOOD — pure function the component calls
import { resolveRoll } from "./logic";
function handleSubmit(pool: number) { setResult(resolveRoll(pool)); }
```

## Throwing for Expected Input Failures

**Problem:** A user typing an invalid dice pool is a normal, expected outcome — not exceptional. Throwing for it forces every caller into `try`/`catch` for the common case. Use a discriminated union instead (`rules/error-handling.md`).

```ts
// BAD
function resolveRoll(pool: number) {
  if (pool <= 0) throw new Error("invalid pool");
}

// GOOD
type RollResult = { kind: "success"; ... } | { kind: "invalidInput"; reason: string };
```

## Missing or Wrong `key` Prop

**Problem:** Using array index as `key` for a list that can reorder or have items inserted/removed causes React to misattribute component state across re-renders — a classic source of "the wrong row updated" bugs.

```tsx
// BAD — breaks if rolls list is ever filtered/reordered
{rolls.map((roll, i) => <DieFace key={i} value={roll} />)}

// GOOD — a stable identity per die
{rolls.map((roll) => <DieFace key={roll.id} value={roll.value} />)}
```

## `dangerouslySetInnerHTML` for Convenience

**Problem:** Bypasses React's default escaping. Even for "safe" static content, it's an easy habit to carry into a spot that later renders something less safe.

```tsx
// BAD
<div dangerouslySetInnerHTML={{ __html: description }} />

// GOOD — render as text, or use a proper markdown component with escaping
<div>{description}</div>
```

## Prop Drilling Past 2-3 Levels

**Problem:** Passing a prop through several components that don't use it themselves, just to reach a deep child, is a sign the state belongs closer to where it's used, or the deep child should be composed differently — not automatically a signal to reach for Context (see `skills/state-management`; most calculators don't need it at all).

## Defensive Memoization Without Measurement

**Problem:** Wrapping components in `React.memo` or values in `useMemo`/`useCallback` "just in case" adds complexity and a dependency array to keep correct, for a performance problem that may not exist. `rules/priorities.md` puts performance last for a reason — this app's actual hot path is animation (covered separately), not React re-renders.

```tsx
// BAD — memoized with no evidence it was ever slow
const MemoizedResult = React.memo(ResultPanel);

// GOOD — plain component, revisit only if the Profiler shows a real cost
function ResultPanel({ result }: ResultPanelProps) { ... }
```
