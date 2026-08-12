---
alwaysApply: true
description: >
  Enforces compositor-only animation — the "performant transformations only"
  requirement from Plans.txt. Distilled from this developer's own
  high-performance-animations reference note; see skills/animations for the
  full teaching version with profiling workflow.
---

# Animation Rules

`Plans.txt` states this explicitly: **"Performant transformations only."** This is not a nice-to-have — it's a stated stack requirement, enforced the same way `rules/testing.md` or `rules/security.md` are.

## The Golden Two

- **Only animate `transform` and `opacity`.** Every other animatable CSS property (`width`, `height`, `top`, `left`, `margin`, `padding`, `border-width`, `background-color`, `box-shadow`) forces the browser back into Layout or Paint on every frame, on the main thread. `transform`/`opacity` skip straight to Composite, on a separate thread that never blocks on JavaScript.

```css
/* DO — compositor only */
.result-card {
  transition: transform 120ms cubic-bezier(0.22, 1, 0.36, 1), opacity 120ms ease;
}
.result-card.is-entering {
  transform: translateY(-4px);
  opacity: 0;
}

/* DON'T — forces Layout reflow every frame */
.result-card {
  transition: top 200ms ease, height 200ms ease;
}
```

- **The width/height trick has a compositor-only replacement.** A "grow from 0 to full" reveal (e.g. a probability bar chart animating in) uses `clip-path`, not `width`.

```css
/* DON'T — Layout reflow every frame */
@keyframes bar-grow-bad { from { width: 0; } to { width: 100%; } }

/* DO — Composite only */
@keyframes bar-grow-good {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0% 0 0); }
}
```

## `will-change` Discipline

- **Set `will-change` immediately before an animation starts, remove it on `transitionend`.** Leaving it on permanently promotes elements to their own GPU layer indefinitely, which costs VRAM for no benefit once the animation is done.

```ts
element.style.willChange = "transform";
element.addEventListener("transitionend", () => { element.style.willChange = "auto"; }, { once: true });
```

- **Don't blanket-apply `will-change` to every card/panel.** Apply it to the specific element that's animating, not its whole container tree.

## Calculator Switches Use the View Transitions API via React Router

Per [ADR-002](../knowledge/decisions/002-react-router-view-transitions.md), calculator-to-calculator navigation uses React Router's `viewTransition` — this wraps the navigation in `document.startViewTransition()`, which runs the crossfade on the compositor thread while React reconciles the new route underneath, instead of hand-rolled CSS class toggling racing React's render.

```tsx
<Link to="/bitd-probability" viewTransition>Blades in the Dark</Link>

// or imperatively
navigate("/bitd-probability", { viewTransition: true });
```

- **Every calculator-to-calculator navigation gets `viewTransition`.** Don't build a manual CSS-class crossfade for route changes — the native API already does this on the compositor thread. See [React Router: View Transitions](https://reactrouter.com/how-to/view-transitions).
- **`translate3d()` over `translateX()`/`translateY()`** when you want to guarantee GPU-layer promotion rather than leave it to browser heuristics, for anything performance-sensitive (not required for every minor hover effect).

## What NOT to Reach For

- No animation library (Framer Motion, react-spring, GSAP) for this app's needs. CSS transitions/keyframes plus the native View Transitions API cover route changes, hover states, and result reveals — the entire animation surface a calculator collection needs. Reconsider only if a specific interaction genuinely can't be expressed in CSS (e.g. physics-based dragging), not by default.
- No animating layout properties "just this once because it's simpler." The rule has no exceptions for convenience — `clip-path`/`transform` alternatives exist for every common case (see `skills/animations` for more patterns).

## Profiling

- **Always profile against `vite build && vite preview`, never the dev server.** Vite's dev server serves unbundled ES modules with HMR overhead — animation performance in dev looks meaningfully worse than production and isn't representative.
- Chrome DevTools → Rendering → Paint Flashing should show **no green flashes** during a transition. Layers panel should show the animating element on its own composited layer.
