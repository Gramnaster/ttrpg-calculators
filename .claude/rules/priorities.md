---
alwaysApply: true
description: >
  Defines the priority order for resolving trade-offs when writing or
  refactoring code — what wins when two concerns pull in different directions.
---

# Priority Order

When a change could be made multiple ways and the "right" approach isn't obvious, resolve it using this order. A higher item wins when it conflicts with a lower one.

1. **Correctness** — the calculator produces the right number for every valid input, including edge cases (zero dice, max dice pool, negative modifiers where the system allows them).
2. **Safety & Accessibility** — no XSS via unsanitized rendering, no secrets/tracking committed to a public repo, no interaction that's mouse-only or invisible to a screen reader.
3. **Simplicity** — the most straightforward implementation that still satisfies 1 and 2. Fewer moving parts over clever abstractions. This is a small app — a `useState` and a pure function usually beats a store, a context, and a reducer.
4. **Readability & Maintainability** — a future reader (including future-you, six months from now when you add the next calculator) understands it without archaeology.
5. **Testability** — calculation logic is structured so it can be unit-tested with no React involved (pure functions in, values out).
6. **Performance** — optimize only where profiling/measurement shows it's needed. Don't guess.

## How to apply

- **DON'T** reach for `useMemo`, `React.memo`, virtualization, or a state-management library unless correctness, accessibility, and simplicity are already settled and a measurement (React DevTools Profiler, a dropped-frame trace) justifies it. `rules/performance.md` and `rules/animations.md` cover the *how*; this ordering governs *when* those rules kick in.
- **DON'T** sacrifice simplicity for a "smarter-looking" abstraction that doesn't change behavior — that's optimizing for a lower-priority concern at the expense of a higher one. A single-file calculator doesn't need a `features/` folder split into five files.
- **DO** default to the plainest working solution, then move down the list only if a concrete requirement (an accessibility gap, a real maintainability pain point, a measured perf problem) forces it.
- When two rule files disagree in a specific case, this ordering is the tiebreaker — e.g. an accessibility requirement (`accessibility.md`) always wins over an animation flourish (`animations.md`).
