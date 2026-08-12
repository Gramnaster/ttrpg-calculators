# ADR-001: Feature-Folder-Per-Calculator Architecture

## Status

Accepted

## Context

TTRPGCalculators is a collection of independent TTRPG dice/probability calculators (opposed-roll, Blades in the Dark probability, and more planned — `Plans.txt`: "More, but standby on this as you set up") behind a single left-side menu. Two structural options were considered:

- **Layer folders** (`components/`, `hooks/`, `logic/`, mirroring a typical "clean" React starter): all components in one folder, all logic in another. Adding a calculator means touching 3+ separate top-level folders.
- **Feature folders per calculator** (each calculator owns a folder with its logic, component, and tests together): adding a calculator means creating one new folder, touching zero existing files.

Given the explicit expectation of more calculators being added over time by a single developer (not a team), the criteria that mattered most:

1. **Isolation.** Calculators genuinely don't share logic with each other — an opposed-roll resolution and a Blades in the Dark dice-pool probability are unrelated math. Layer folders would force navigating between three folders to understand one calculator; feature folders keep it in one place.
2. **Low ceremony for adding a calculator.** This app will grow by repeated addition of the same shape of thing. The folder structure should make that repetition mechanical (see `skills/scaffold`).
3. **Precedent.** This mirrors the Vertical Slice Architecture default already adopted for this developer's ASP.NET Core work (see the sibling `.NET` projects' `dotnet-claude-kit` import) — same reasoning (context locality, fewer files touched per feature), same shape, applied to a frontend instead of a backend.

## Decision

**Each calculator is a self-contained folder under `src/calculators/<name>/`:**

```
src/calculators/
  opposed-roll/
    logic.ts
    logic.test.ts
    OpposedRollCalculator.tsx
    OpposedRollCalculator.test.tsx
    index.ts
  bitd-probability/
    logic.ts
    logic.test.ts
    BitdProbabilityCalculator.tsx
    BitdProbabilityCalculator.test.tsx
    index.ts
```

`src/shared/` holds only code used by two or more calculators, promoted there when a second calculator actually needs it — not preemptively. See `rules/architecture.md` for the enforceable rules and `skills/scaffold` for the concrete steps to add a new calculator.

## Consequences

### Positive

- Adding a calculator never requires editing an existing calculator's files — purely additive, low risk of regression.
- Everything needed to understand one calculator (math, presentation, tests) is in one folder.
- Matches this developer's existing mental model from VSA on the .NET side — no new architectural vocabulary to learn.

### Negative

- If two calculators ever do need to share non-trivial logic, there's a judgment call about when to promote it to `shared/` versus duplicate a few lines.

### Mitigations

- `rules/architecture.md` states the dependency rule explicitly: calculators depend on `shared/`, never on each other.
- `react-architect` agent is the arbiter for promotion-to-shared decisions when they come up.
