---
name: testing
description: >
  Vitest + React Testing Library patterns for calculator logic and
  component tests. Use when: "write tests", "test this", "how do I test",
  "add test coverage".
---

# Testing

Per [ADR-003](../../knowledge/decisions/003-vitest-testing-stack.md): Vitest + React Testing Library, jsdom environment, no E2E runner. This skill covers the concrete patterns; `rules/testing.md` is the enforceable summary.

## Setup Reference

```ts
// src/setupTests.ts
import "@testing-library/jest-dom/vitest";
```

```ts
// vite.config.ts (test block) or vitest.config.ts
export default defineConfig({
  test: { environment: "jsdom", globals: true, setupFiles: "./src/setupTests.ts" },
});
```

## Logic Tests (Priority)

Pure functions, no rendering involved — these are where the actual bugs live.

```ts
import { describe, it, expect } from "vitest";
import { resolveOpposedRoll } from "./logic";

describe("resolveOpposedRoll", () => {
  it("returns a tie when both pools' highest rolls are equal", () => {
    const fixedRandom = () => 0.5; // deterministic — same "roll" every call
    const result = resolveOpposedRoll(4, 4, fixedRandom);
    expect(result.kind).toBe("success");
    if (result.kind === "success") expect(result.outcome).toBe("tie");
  });

  it("returns invalidInput for a zero-size pool", () => {
    const result = resolveOpposedRoll(0, 4);
    expect(result).toEqual({ kind: "invalidInput", reason: expect.any(String) });
  });
});
```

**Inject randomness.** Any function that rolls dice takes an optional random source (`() => number`, defaulting to `Math.random`) so tests can pin exact outcomes instead of asserting only on statistical ranges.

**Cover the edge cases specific to the system**, not just a happy path: zero dice, the maximum supported pool, a boundary roll value (exactly the success threshold), negative/invalid modifiers if the system allows them.

## Component Tests

Query by role/label — this asserts on what a user (or assistive tech) actually perceives, not on implementation details, and doubles as an accessibility check (`rules/accessibility.md`).

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OpposedRollCalculator } from "./OpposedRollCalculator";

it("shows the result after submitting a valid pool", async () => {
  const user = userEvent.setup();
  render(<OpposedRollCalculator />);

  await user.type(screen.getByLabelText(/attacker pool/i), "4");
  await user.type(screen.getByLabelText(/defender pool/i), "3");
  await user.click(screen.getByRole("button", { name: /roll/i }));

  expect(await screen.findByRole("status")).toHaveTextContent(/attacker wins|defender wins|tie/i);
});

it("shows a validation message for an invalid pool, not a crash", async () => {
  const user = userEvent.setup();
  render(<OpposedRollCalculator />);

  await user.type(screen.getByLabelText(/attacker pool/i), "0");
  await user.click(screen.getByRole("button", { name: /roll/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent(/at least 1/i);
});
```

### Query Priority

Prefer, in order: `getByRole` → `getByLabelText` → `getByPlaceholderText`/`getByText` → `getByTestId` (last resort — a signal the markup might not be accessible either).

## What Not to Test

- **Don't re-test the math in a component test.** If `logic.ts` already has a test proving `resolveOpposedRoll(4, 4)` ties, the component test only needs to prove the component calls it and renders *some* result — not re-verify the probability math through a rendered DOM tree.
- **Don't snapshot-test.** A snapshot test doesn't encode intent — it just freezes whatever the output happened to be, and fails on any incidental markup change whether or not behavior actually changed.
- **Don't mock `logic.ts` in component tests.** It's pure, fast, and owned by this codebase — call it directly (`rules/testing.md`: no mocking for code you own).

## Running Tests

```bash
pnpm exec vitest run              # one-shot, CI-style
pnpm exec vitest                  # watch mode, local dev
pnpm exec vitest run 2>&1 | bash .claude/hooks/post-test-analyze.sh   # structured summary
```

## Related

- `tdd` — writing the test before the implementation, well-suited to calculator math
- `rules/testing.md` — the enforceable rule summary
- `rules/error-handling.md` — the discriminated-union result shape these tests assert against
