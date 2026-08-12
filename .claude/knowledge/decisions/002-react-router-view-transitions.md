# ADR-002: React Router (Declarative Mode) with View Transitions for Calculator Switching

## Status

Accepted

## Context

The app needs a way to switch between calculators from the left-side menu described in `Plans.txt`. Two approaches were considered:

- **Plain state-based tab switching**: a root component holds `activeCalculator` state and conditionally renders the selected calculator. No routing library, no URL structure.
- **React Router with per-calculator URLs**: each calculator gets a real route (`/opposed-roll`, `/bitd-probability`), navigated via `<Link>`/`navigate()`.

Evaluation criteria:

1. **Shareability.** A calculator collection benefits from linkable URLs — a user should be able to bookmark or share a link directly to one calculator, not just "the app" with an implicit default view.
2. **Code splitting.** Route-level `React.lazy` is the natural unit for splitting each calculator into its own chunk (see `rules/performance.md`), keeping the initial bundle small as more calculators are added.
3. **Animation.** `Plans.txt` explicitly requires "performant transformations only," with a full reference note on the View Transitions API for route changes. React Router's `viewTransition` prop (stable as of the version installed for this app — verified against [reactrouter.com](https://reactrouter.com/how-to/view-transitions), not assumed from training data) wraps navigation in `document.startViewTransition()` for a compositor-thread crossfade, for free, on every route change.
4. **Cost.** React Router adds a real dependency and a small amount of setup versus a single `useState`. For an app that's explicitly going to keep growing in calculator count, that cost is worth it once (up front) rather than retrofitted later.

## Decision

**React Router (Declarative Mode — `<BrowserRouter>`, no SSR/framework mode) is used for calculator navigation, with `viewTransition` on every calculator-to-calculator `<Link>`/`navigate()` call.**

```tsx
import { BrowserRouter, Routes, Route, Link } from "react-router";

<Link to="/bitd-probability" viewTransition>Blades in the Dark</Link>
```

Package: `react-router` only — `react-router-dom` was removed as of the major version installed for this app; do not install it (see `rules/packages.md`).

Each route is a `React.lazy`-loaded calculator component wrapped in `Suspense` + an error boundary (see `rules/error-handling.md`, `rules/performance.md`).

### When to deviate

If a future calculator genuinely has no reason to be a separate route (e.g. a settings panel that's always visible alongside the active calculator, not a calculator itself), it doesn't need to be a route — this decision covers calculator-to-calculator navigation specifically, not every piece of UI state in the app.

## Consequences

### Positive

- Shareable/bookmarkable links to individual calculators.
- Natural code-splitting boundary per calculator.
- View Transitions come essentially free from the routing choice — no separate animation library needed for the calculator-switch crossfade.

### Negative

- One more dependency than a bare `useState` tab switcher.
- Slightly more setup for a very small app (route config, lazy-loading boilerplate) — justified by the explicit expectation of ongoing growth ("More [calculators], but standby"), not by the app's size today.

### Mitigations

- `skills/scaffold` folds route registration into the standard "add a calculator" checklist so the routing overhead doesn't need to be re-derived each time.
- `skills/animations` documents the View Transitions integration pattern in full.
