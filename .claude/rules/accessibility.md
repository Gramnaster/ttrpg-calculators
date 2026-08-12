---
alwaysApply: true
description: >
  Enforces semantic HTML, keyboard support, and contrast for this public,
  no-auth, no-backend GitHub Pages app — the correctness-adjacent concern
  that replaces auth/authz rules in a stack with no backend.
---

# Accessibility Rules

This app has no auth, no backend, and no user data — the security surface `rules/security.md` would normally cover in a backend-having project is small. What replaces it as a real correctness concern is accessibility: this is a public site, calculator inputs are exactly the kind of form control that's easy to make mouse-only by accident, and the "monochromatic with colours for emphasis" palette from `Plans.txt` needs deliberate contrast checking, not eyeballing.

## Semantic HTML First

- **Real form elements, not styled `<div>`s.** A dice-pool stepper is a `<button>` + `<input type="number">` (or a custom control built from a `<button>` with `role`/keyboard handling if you need something a native input can't do) — never an `onClick` `<div>`.
- **`<label>` (or `aria-label`) on every input.** A number input with only a placeholder is not labeled — placeholders disappear on focus and aren't reliably announced.
- **Semantic landmarks**: `<nav>` for the calculator-selection menu, `<main>` for the active calculator, `<h1>`/`<h2>` hierarchy that reflects the actual structure (app title → calculator name → result sections).

## Keyboard Support

- **Every interactive element is reachable and operable by keyboard alone.** Tab order follows visual order. No `tabindex` values above 0 (they break natural tab order).
- **Visible focus states.** Don't `outline: none` without a replacement focus style — removing the browser default without providing an alternative makes keyboard navigation unusable.
- **The calculator-selection nav is a real list of links/buttons**, operable with Tab/Enter/Space — not a click-only custom widget.

## Dynamic Results

- **Calculator results announce to screen readers.** A result panel that updates in place (no route change) needs `aria-live="polite"` so assistive tech announces the new roll outcome/probability without the user needing to re-find it.

```tsx
<div aria-live="polite" role="status">
  {result && <RollResultSummary result={result} />}
</div>
```

- **Route changes move focus.** When navigating to a different calculator, move focus to that calculator's heading (or a skip-target) so keyboard/screen-reader users aren't left focused on a now-gone element. Pair this with the View Transitions navigation in `rules/animations.md`.

## Color and Contrast

- **The monochrome-plus-accent palette needs a contrast check, not a guess.** Any text-on-background or icon-on-background pairing must hit WCAG AA (4.5:1 for normal text, 3:1 for large text/UI components) — check with a real contrast checker (Chrome DevTools' color picker shows a live ratio) when picking the palette's actual hex values, not just "it looks fine."
- **Never convey meaning by color alone.** A success/failure result distinguished only by green vs. red text fails for colorblind users — pair color with an icon, label, or text ("6 successes" not just a green number).

## Testing

- React Testing Library's `getByRole`/`getByLabelText` queries (see `rules/testing.md`) double as an accessibility check — if a component can't be queried by role or label, it's probably not accessible either. Treat a test that can only pass via `getByTestId` as a signal to fix the markup, not just the test.
