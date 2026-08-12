---
name: accessibility
description: >
  Full teaching module for semantic HTML, keyboard support, aria-live
  results, and contrast for the monochrome-plus-accent palette. Use when:
  "accessibility", "a11y", "keyboard navigation", "screen reader",
  "contrast", "aria".
---

# Accessibility

This app has no backend and no auth, so the security surface a typical rule set worries about barely exists — see `rules/security.md`. What genuinely matters for a public GitHub Pages calculator collection is accessibility: real people will use these calculators with keyboards, screen readers, and a range of vision. This skill is the deep version of `rules/accessibility.md`.

## Semantic HTML Is the Foundation

Every accessibility feature (keyboard operability, screen-reader announcement, focus management) is either free or much cheaper when built on real HTML elements instead of styled `<div>`s.

```tsx
// DO
<label htmlFor="dice-pool">Dice pool</label>
<input id="dice-pool" type="number" min={1} value={pool} onChange={handleChange} />
<button type="submit">Roll</button>

// DON'T
<div className="input-label">Dice pool</div>
<div className="fake-input" onClick={...}>{pool}</div>
<div className="fake-button" onClick={handleRoll}>Roll</div>
```

A `<div onClick>` gets none of a real `<button>`'s free behavior: keyboard focusability, Enter/Space activation, correct role announcement, disabled-state handling. Reimplementing all of that is far more work than using the native element.

### Landmarks and Headings

```tsx
<nav aria-label="Calculators">
  <ul>
    <li><Link to="/opposed-roll" viewTransition>Opposed Roll</Link></li>
    <li><Link to="/bitd-probability" viewTransition>Blades in the Dark</Link></li>
  </ul>
</nav>
<main>
  <h1>Opposed Roll Calculator</h1>
  {/* ... */}
</main>
```

Heading levels should reflect actual structure — app title (`h1`, once), calculator name (`h1` or `h2` depending on whether the nav counts as separate from `main`), result section headings (`h2`/`h3`) — not chosen for visual size.

## Keyboard Support

- **Tab order follows DOM/visual order.** Don't reorder visually with CSS in a way that breaks the logical tab sequence.
- **No positive `tabindex`.** `tabindex="0"` (include in natural order) or `tabindex="-1"` (programmatically focusable only) are the only values that don't create confusing tab-order jumps.
- **Visible focus states.** If you must customize the default focus ring (e.g. to fit the monochrome palette), replace it with an equally visible alternative — never remove it outright.

```css
/* DO — customized but present */
button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

/* DON'T — invisible to keyboard users */
button:focus { outline: none; }
```

## Dynamic Results

A result that updates without a route change (the common case — submitting a calculator's form) needs to be announced to assistive tech:

```tsx
<div aria-live="polite" role="status">
  {result?.kind === "success" && <RollResultSummary result={result} />}
  {result?.kind === "invalidInput" && <p role="alert">{result.reason}</p>}
</div>
```

`aria-live="polite"` waits for the current speech to finish before announcing; `role="alert"` (implicitly `aria-live="assertive"`) interrupts — reserve the latter for actual errors (invalid input), not routine results.

### Focus on Route Change

When navigating to a different calculator, move focus to that calculator's heading so a keyboard/screen-reader user isn't left focused on a now-unmounted element:

```tsx
function CalculatorPage({ title, children }: { title: string; children: React.ReactNode }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  return (
    <>
      <h1 ref={headingRef} tabIndex={-1}>{title}</h1>
      {children}
    </>
  );
}
```

`tabIndex={-1}` makes the heading programmatically focusable without adding it to the tab order.

## Color and Contrast

`Plans.txt` specifies "monochromatic with colours for emphasis" — a design that's easy to get contrast wrong in, precisely because most of the palette is intentionally low-saturation.

- **WCAG AA minimums**: 4.5:1 for normal text, 3:1 for large text (18pt+/14pt+ bold) and UI component boundaries (input borders, focus rings).
- **Check with a real tool**, not by eye. Chrome DevTools' color picker (click a color swatch in the Styles panel) shows a live contrast ratio against the background it's rendered on.
- **The "emphasis" accent color needs its own contrast check** against both the light and dark ends of the monochrome scale it might appear on — an accent that passes on a near-black background can fail on a mid-gray one.
- **Never encode meaning by color alone.** A success/failure or pass/threshold result distinguished only by a color shift fails for colorblind users. Pair color with text, an icon, or a symbol (✓/✗, "success"/"miss") — the color reinforces, it doesn't carry the information alone.

## Testing as a Forcing Function

React Testing Library's query priority (`getByRole` > `getByLabelText` > `getByText` > ... > `getByTestId` as a last resort) is deliberately aligned with accessibility: if a query can only find an element via `getByTestId`, that's usually a sign the element isn't exposed to assistive tech correctly either. Writing tests with the preferred queries (`rules/testing.md`) doubles as a lightweight accessibility audit.

## Quick Checklist

- [ ] Every input has a `<label>` (or `aria-label` if a visible label truly doesn't fit)
- [ ] Every interactive element is a real button/link/input, not a styled `<div>`
- [ ] Tab order matches visual order, no positive `tabindex`
- [ ] Focus states are visible (default or a customized replacement, never removed)
- [ ] Dynamic results use `aria-live="polite"`, errors use `role="alert"`
- [ ] Route changes move focus to the new calculator's heading
- [ ] Text/UI contrast checked against WCAG AA, not eyeballed
- [ ] No information conveyed by color alone
- [ ] `prefers-reduced-motion` respected (see `skills/animations`)
