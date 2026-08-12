---
name: animations
description: >
  Full teaching module for compositor-only animation and the View
  Transitions API — the deep version of rules/animations.md, distilled from
  this developer's own high-performance-animations reference note (stripped
  of the MapLibre/VTT-specific content that doesn't apply here). Use when:
  "animation", "transition", "how do I animate", "View Transitions",
  "profile animation performance".
---

# Performant Animations

`Plans.txt` states this as a stack requirement, not a preference: **"Performant transformations only."** This skill is the full reasoning behind `rules/animations.md`'s enforceable summary.

## The Mental Model

The browser renders through a pipeline: **JavaScript → Style → Layout → Paint → Composite.** The first four stages run on the main thread — the same thread that runs React's reconciliation and your event handlers. **Composite runs on a separate compositor thread that JavaScript can't block.**

Animating `transform` or `opacity` skips straight to Composite — one stage, a separate thread, effectively free. Animating anything else (`width`, `top`, `background-color`, ...) walks back through Layout and/or Paint, on the main thread, every single frame.

This matters concretely for this app: when a calculator with a lot of inputs mounts, React is doing real reconciliation work on the main thread. A `transform`/`opacity` animation keeps running smoothly through that. A `width` animation stutters exactly when it matters most (mid-navigation, when the new calculator is mounting).

## The Golden Two

Only `transform` (translate/scale/rotate/skew) and `opacity` are compositor-only. Everything else — `width`, `height`, `top`, `left`, `right`, `bottom`, `margin`, `padding`, `border-width`, `font-size`, `background-color`, `color`, `box-shadow` — forces Layout and/or Paint.

```css
/* CORRECT */
.result-card {
  transition: transform 120ms cubic-bezier(0.22, 1, 0.36, 1), opacity 120ms ease;
}
.result-card.is-entering { transform: translateY(-4px); opacity: 0; }

/* WRONG — Layout reflow every frame */
.result-card { transition: top 200ms ease, height 200ms ease; }
```

### The Width-Reveal Replacement

A common instinct — "animate width from 0 to 100% to reveal something" — triggers Layout every frame. `clip-path` gets the same visual effect on the compositor:

```css
@keyframes reveal-bad  { from { width: 0; } to { width: 100%; } }              /* Layout every frame */
@keyframes reveal-good { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0% 0 0); } } /* Composite only */
```

Useful for a probability-distribution bar animating in, or a typewriter-style reveal of a result summary.

## `will-change` Discipline

Promote an element to its own GPU layer *before* the animation starts, and release it when done — leaving it on permanently costs VRAM for elements that aren't animating anymore, for no benefit.

```ts
element.style.willChange = "transform";
element.addEventListener("transitionend", () => { element.style.willChange = "auto"; }, { once: true });
```

Don't apply it to a whole container tree "just in case" — apply it to the specific element that animates.

## Route Transitions: View Transitions API via React Router

Per [ADR-002](../../knowledge/decisions/002-react-router-view-transitions.md), calculator-to-calculator navigation uses the native View Transitions API through React Router's `viewTransition` option — verified against the currently-installed React Router major version's docs at [reactrouter.com/how-to/view-transitions](https://reactrouter.com/how-to/view-transitions), not assumed from memory.

```tsx
// Declarative — on <Link>
<Link to="/bitd-probability" viewTransition>Blades in the Dark</Link>

// Imperative — via useNavigate
const navigate = useNavigate();
navigate("/bitd-probability", { viewTransition: true });
```

This wraps the navigation in `document.startViewTransition()`: the browser snapshots the old view, React mounts the new route underneath, and the crossfade runs on the compositor thread — independent of React's reconciliation work.

### Customizing the Transition

Override the default crossfade with the `::view-transition-old(root)` / `::view-transition-new(root)` pseudo-elements:

```css
::view-transition-old(root) { animation: vt-exit  90ms cubic-bezier(0.4, 0, 1, 1) both; }
::view-transition-new(root) { animation: vt-enter 90ms cubic-bezier(0, 0, 0.2, 1) both; }

@keyframes vt-exit  { to   { opacity: 0; transform: translateY(6px); } }
@keyframes vt-enter { from { opacity: 0; transform: translateY(-6px); } }
```

### Named Transitions for a Shared Element

If an element visually persists across two routes (e.g. a small dice-icon badge that appears both in the calculator nav and at the top of the active calculator), give it a `view-transition-name` so the browser morphs it between positions instead of crossfading two separate elements:

```css
.calculator-icon { view-transition-name: active-calculator-icon; }
```

## Result Reveals and Micro-interactions

Staggered entrance for a list of result rows (e.g. individual dice results), pure CSS:

```css
.die-result {
  animation: fade-up 100ms ease both;
  animation-delay: calc(var(--i, 0) * 18ms);
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

```tsx
{rolls.map((roll, i) => (
  <DieResult key={roll.id} style={{ "--i": i } as React.CSSProperties} {...roll} />
))}
```

## Easing Reference

```
cubic-bezier(0.22, 1, 0.36, 1)    "snap" — most page/panel transitions
cubic-bezier(0.4, 0, 0.2, 1)      standard — general purpose
cubic-bezier(0, 0, 0.2, 1)        decelerate — entering elements
cubic-bezier(0.4, 0, 1, 1)        accelerate — exiting elements
cubic-bezier(0.34, 1.56, 0.64, 1) spring bounce — sparing use, playful moments only
linear                              looping/ambient only
```

## Respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

This is an accessibility requirement (`rules/accessibility.md`), not optional polish.

## Profiling

**Always profile a production build, never the dev server:**

```bash
vite build && vite preview
# profile http://localhost:4173, NOT the :5173 dev server
```

The dev server serves unbundled modules with HMR overhead — animation performance in dev is not representative.

Chrome DevTools workflow:

| Check | Tool | Expect |
|---|---|---|
| Paint Flashing | Rendering panel | No green flashes during a transition |
| Layer Borders | Rendering panel | The animating element has its own orange-bordered layer |
| Long Tasks | Performance panel | No red triangles > 50ms during navigation |
| GPU layer count | Layers panel | Animating elements composited separately, no unintended fragmentation |

## Common Bugs and Fixes

| Symptom | Cause | Fix |
|---|---|---|
| Stutter on calculator switch | React reconciliation competing with a hand-rolled CSS transition | Use `viewTransition` — moves the crossfade to the compositor thread |
| First-frame flash on entrance | `will-change` set after the animation started | Set it before, remove on `transitionend` |
| Transition doesn't fire | Missing `viewTransition` prop/option on the navigation call | Add it — see `rules/animations.md`, every calculator navigation needs it |
| Scroll/interaction feels sluggish | `will-change` left on too many elements | Audit the Layers panel, remove `will-change` from non-animating elements |

## What NOT to Reach For

No animation library (Framer Motion, react-spring, GSAP). CSS + the native View Transitions API cover this app's entire surface — see `knowledge/package-recommendations.md`'s "Explicitly Not Included" section.

## External References

- [web.dev: Rendering Performance](https://web.dev/articles/rendering-performance)
- [web.dev: Stick to Compositor-Only Properties](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count)
- [MDN: View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [MDN: will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)
- [React Router: View Transitions](https://reactrouter.com/how-to/view-transitions)
- [Nielsen Norman Group: Response Time Limits](https://www.nngroup.com/articles/response-times-3-important-limits/)
