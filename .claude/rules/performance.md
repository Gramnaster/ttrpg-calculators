---
alwaysApply: true
description: >
  Enforces performance discipline for a static Vite + React app — bundle
  budget, render discipline, and measure-before-optimizing. See
  rules/animations.md for animation-specific compositor rules.
---

# Performance Rules

## Measure Before Optimizing

- **This is priority 6 of 6** — see `rules/priorities.md`. Don't add `useMemo`, `React.memo`, `useCallback`, or a state-management library speculatively. Add them when React DevTools Profiler (or a dropped-frame trace) shows a specific component re-rendering expensively, not because "it's good practice."
- A calculator app this size has almost no legitimate hot path outside animation (covered separately in `rules/animations.md`). Dice math for a handful of dice pools runs in microseconds — it is not where performance problems will come from.

## Render Discipline

- **Derived values are computed, not stored.** If a value can be calculated from existing props/state, calculate it during render (or in a plain function) — don't `useState` it and sync with `useEffect`. A `useEffect` that only exists to keep one piece of state in sync with another is almost always deletable.

```tsx
// DO
const successCount = result?.rolls.filter((r) => r >= 6).length ?? 0;

// DON'T
const [successCount, setSuccessCount] = useState(0);
useEffect(() => {
  setSuccessCount(result?.rolls.filter((r) => r >= 6).length ?? 0);
}, [result]);
```

- **Keep state local to the calculator that owns it.** Each calculator's input/result state lives in that calculator's component, not lifted to a shared store. See `skills/state-management` for when (rarely) that changes.

## Bundle Budget (GitHub Pages)

- **Route-level code splitting per calculator.** Each calculator is a separate lazy-loaded chunk (`React.lazy` + route-level `Suspense`) so visiting one calculator doesn't download the others. See `skills/ci-cd` and `skills/animations` for how this pairs with route transitions.
- **Audit bundle size before adding a dependency.** A charting library, a big icon set, or a UI kit can easily outweigh the entire rest of the app. Check the package's bundle size (bundlephobia.com or `npx vite-bundle-visualizer` after adding it) before committing to it. Prefer a dependency-free implementation for anything genuinely small (a stepper input, a simple bar chart for a probability distribution).
- **No heavy runtime dependency for something CSS or a `<canvas>` can do.** A probability distribution bar chart doesn't need a charting library.

## Async and Loading

- **`Suspense` + lazy-loaded routes, not manual `isLoading` booleans**, for route-level code splitting.
- **No network calls on the critical path for a calculator to be usable.** These are static, self-contained calculators — nothing about producing a result should ever depend on a fetch.
