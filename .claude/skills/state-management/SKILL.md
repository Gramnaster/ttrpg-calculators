---
name: state-management
description: >
  When (rarely) a calculator needs state beyond local useState — lifting
  state, Context, or a library — and when it doesn't. Use when: "should
  this be global state", "share state between calculators", "add
  Zustand/Redux/Context".
---

# State Management

## Default: Everything Is Local

Per [ADR-001](../knowledge/decisions/001-feature-folder-architecture.md), calculators are independent — an opposed-roll calculator has no reason to know a Blades in the Dark calculator exists. That means almost every calculator's state is a `useState` (or a few) inside its own component, full stop. This skill exists mainly to say: **don't reach for more than that without a real trigger.**

## The Escalation Ladder

Reach for the next rung only when the current one genuinely can't express what's needed — don't start higher than necessary.

### 1. `useState` in the component (default)

Covers essentially every calculator. Input values, the current result, a "show advanced options" toggle — all local.

### 2. Lifting state to a shared parent

Only relevant if two sibling components *within the same calculator* need to coordinate (e.g. a dice-pool input and a modifier input that live in separate components but jointly determine the result). Lift to their common parent — still fully local to that one calculator's folder.

### 3. App-level shared preference (rare, but plausible for this app)

A genuine cross-calculator concern — e.g. "remember the user's last-used dice-rolling convention (ascending/descending sixes) across every calculator that has one." This is state, but it's small and persistent, not reactive app logic. Prefer the simplest tool that fits:

- `localStorage` read/written directly (with a small typed wrapper) if it's truly just persisted preferences.
- A single small Context provider in `src/shared/` only if several components need to *read* it reactively (not just read-once-on-mount).

### 4. A state-management library (Zustand, Redux, Jotai)

**Don't add one preemptively.** This app's calculators don't share reactive state with each other — there's no cart, no auth session, no multi-step wizard spanning components. If a future feature genuinely needs this (unclear what that would be for a calculator collection), the trigger is: multiple, deeply-nested components need to both read *and* write the same piece of state, and prop drilling/lifting has become the actual maintenance problem — not a hypothetical one.

## Anti-pattern: Reaching for Context by Default

```tsx
// BAD — a Context provider for state exactly one component uses
const DicePoolContext = createContext<number>(0);
function App() {
  const [pool, setPool] = useState(0);
  return (
    <DicePoolContext.Provider value={pool}>
      <OpposedRollCalculator />
    </DicePoolContext.Provider>
  );
}

// GOOD — it's local to the one component that uses it
function OpposedRollCalculator() {
  const [pool, setPool] = useState(0);
  // ...
}
```

## Decision Guide

| Situation | Reach For |
|---|---|
| A calculator's own input/result | `useState` in that component |
| Two sibling components in one calculator coordinating | Lift state to their shared parent |
| A preference that should persist and apply across all calculators | `localStorage` + a typed wrapper, or a small shared Context if multiple components must react to it |
| Multiple calculators need to read *and* write the same live state | Stop — this contradicts ADR-001's independence assumption. Confirm with the user this is really the intent before building it |
