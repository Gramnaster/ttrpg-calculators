---
alwaysApply: true
description: >
  Enforces testing strategy, patterns, and naming conventions using Vitest
  and React Testing Library (see ADR-003 for why this stack over Jest/Cypress).
---

# Testing Rules

## Strategy

- **Logic tests first, component tests second.** Every calculator's `logic.ts` gets thorough unit tests — this is where the actual bugs live (off-by-one on dice ranges, wrong probability formula, edge cases like zero dice or max pool size). Component tests verify wiring (input → result renders), not math.
- **No E2E test runner for this app.** Per [ADR-003](../knowledge/decisions/003-vitest-testing-stack.md), Vitest + React Testing Library covers this app's needs — a handful of independent calculators with no auth, no multi-step flows, no cross-page state. Revisit only if the app grows real end-to-end user journeys worth protecting.

## Test Structure

- **AAA pattern with clear separation.** Arrange, Act, Assert — separated by blank lines.

```ts
import { describe, it, expect } from "vitest";
import { resolveOpposedRoll } from "./logic";

describe("resolveOpposedRoll", () => {
  it("returns a tie when both pools roll equal highest values", () => {
    // Arrange
    const seededRandom = () => 0.5;

    // Act
    const result = resolveOpposedRoll(4, 4, seededRandom);

    // Assert
    expect(result.outcome).toBe("tie");
  });
});
```

- **One behavior per test.** You may assert multiple properties of the same result, but don't test two separate behaviors in one `it()`. Separate behaviors need separate tests so failures are specific.
- **Deterministic randomness in tests.** Any function that rolls dice takes an injectable random source (defaulting to `Math.random` in production) so tests can pin exact outcomes instead of asserting only on ranges.

## Naming

- **Test naming: `functionName_scenario_expectedResult`** in the `it()` description, or a plain-English sentence — either is fine as long as a failing test name tells you what broke without opening the file.

```
resolveOpposedRoll_equalPools_returnsTie
resolveOpposedRoll_zeroDice_returnsInvalidInput
"renders the success count after submitting a valid pool"
```

## Component Tests

- **Test behavior, not implementation.** Query by role/label text (`getByRole("button", { name: /roll/i } )`), not by CSS class or component internals. Assert on what the user sees, not on which internal state variable changed.
- **No shallow rendering.** React Testing Library renders the real DOM tree (via jsdom) — use it as intended, don't reach for enzyme-style shallow rendering.
- **Accessibility queries double as a test.** Preferring `getByRole`/`getByLabelText` over `getByTestId` means a passing test suite is also evidence the markup is accessible (see `rules/accessibility.md`). Reach for `getByTestId` only when no accessible query exists.

## Fixtures and Mocking

- **No mocking for code you own.** Calculator logic functions are pure — call them directly, don't mock them in component tests unless isolating a genuinely expensive dependency (none exist yet in this app).
- **`vi.fn()` only for boundaries you don't control** — e.g. asserting `onRoll` was called with the right arguments from a component test.
