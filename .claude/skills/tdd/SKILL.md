---
name: tdd
description: >
  Red-green-refactor workflow using Vitest, well-suited to calculator math
  where the expected output for a given input is often known up front. Use
  when: "TDD", "test first", "write a failing test first".
---

# /tdd — Test-Driven Development

## Why This Fits Calculator Math Well

TTRPG dice/probability math usually has a knowable expected answer before any code exists — "4 dice vs 3 dice, both roll their max, attacker should win" is a fact about the rules system, not something you discover by writing the implementation first. That makes calculator logic an unusually good fit for red-green-refactor: write the test that encodes the rule, watch it fail for the right reason, then make it pass.

## The Loop

### Step 1: Red — Write a Failing Test

Write one test for one specific behavior, using the rules-system fact you already know.

```ts
// logic.test.ts
it("attacker wins when their highest roll beats defender's highest roll", () => {
  const fixedRolls = () => [6, 2, 1]; // attacker's rolls, injected
  const result = resolveOpposedRoll(3, 2, fixedRolls);
  expect(result).toEqual({ kind: "success", outcome: "attackerWins", ... });
});
```

Run it. Confirm it fails — and fails because `resolveOpposedRoll` doesn't exist yet or returns the wrong thing, not because of a typo in the test itself.

```bash
pnpm exec vitest run logic.test.ts
```

### Step 2: Green — Minimum Code to Pass

Write the smallest implementation that makes the test pass. Resist implementing the *next* test's behavior early — one behavior at a time keeps each red-green cycle honest.

```ts
export function resolveOpposedRoll(
  attackerPool: number,
  defenderPool: number,
  rollFn: () => number[] = rollDice,
): OpposedRollResult {
  const attackerRolls = rollFn();
  // ... just enough to satisfy this one test
}
```

Run the test again. Confirm it's green.

### Step 3: Refactor

With a passing test as a safety net, clean up: extract a helper, rename for clarity, remove duplication. Re-run the test after every change — it should stay green throughout. If a refactor requires the test itself to change, that's a signal the refactor changed behavior, not just structure — stop and reconsider.

### Step 4: Repeat

Next test: the next fact about the rules system (a tie, a zero-pool edge case, the maximum pool size). One red-green-refactor cycle per behavior.

## What Makes a Good First Test

Start with the simplest true statement about the system's rules, not the hardest edge case. For an opposed roll: "equal pools with equal highest rolls tie" is a better first test than "what happens with a 47-dice pool" — establish the core mechanic before the edges.

## When TDD Doesn't Fit

- **Component wiring** (does the button call the handler, does the result render) is usually easier to write after the component exists in rough form — TDD-ing JSX structure has a much weaker "I already know the right answer" property than dice math does.
- **Exploratory UI work** (figuring out what a result panel should even look like) isn't a TDD fit — build it, then backfill component tests per `skills/testing`.

## Related

- `testing` — the query patterns and structure for the tests this loop produces
- `scaffold` — Step 4 (logic tests) of a new calculator scaffold is exactly this loop, one edge case at a time
