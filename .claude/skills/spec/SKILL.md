---
name: spec
description: >
  Turn a vague calculator idea into an agreed, persisted specification
  through structured questioning before any code is written. Every gap
  becomes a question, not an assumption. Produces
  docs/specs/<NNN>-<slug>.md that /plan and /scaffold consume. Use when:
  "spec", "write a spec", "spec this out", "requirements", "acceptance
  criteria", "define the calculator", "what should this calculator do".
---

# /spec — Specification Workflow for a New Calculator

## What

Converts a calculator idea ("add a Blades in the Dark probability calculator") into a written, agreed specification before any planning or code. Most calculators in this app are small enough to skip this (see When) — but ones that aren't (a rules system with several interacting mechanics, non-obvious edge cases) benefit from pinning the math and scope down before code exists.

- **Never assume.** A gap in the idea is a question, not a silent decision.
- **Structured rounds**, not one overwhelming dump or a single round that stops too early.
- **Explicit agreement.** Draft → In Review → Approved. Implementation doesn't start from a Draft.
- **Specs are files.** `docs/specs/<NNN>-<slug>.md`, survives the session, referenced by `/plan` and the calculator's own tests.

## When

- A calculator whose math has real edge cases (exploding dice, keep-highest-N-of-M, opposed pools with ties) worth pinning down before code
- A calculator for a rules system not yet represented in this app, where "how does this system actually resolve a roll" isn't obvious from a one-line description
- Trigger phrases: "spec", "requirements", "define the calculator", "acceptance criteria"

**Skip for:** a calculator whose math is a single well-known formula (a flat d20 vs. DC check), a UI-only tweak, a bug fix.

## How

### Step 1: Capture and Restate

Restate the idea in one paragraph — what Claude understood, including the rules system and what a "roll" produces. End with: "Is this the idea? What did I get wrong?" Don't question until this is confirmed.

### Step 2: Questioning Rounds

Work through these dimensions in order, 3–5 highest-value questions per round:

| # | Dimension | What to pin down |
|---|---|---|
| 1 | Problem & source system | Which TTRPG/rules system, what the SRD/reference says, why this calculator vs. the existing ones |
| 2 | Scope | What's IN this calculator, what's explicitly OUT (e.g. "no character sheet integration") |
| 3 | Math model | The exact probability/dice-resolution formula — not "roll some dice and count successes" but the precise rule (see `rules/architecture.md`'s pure-logic requirement — this dimension IS the `logic.ts` spec) |
| 4 | Inputs & result shape | Every input field (dice count, modifiers, thresholds), the discriminated union shape for the result (`rules/error-handling.md`) |
| 5 | Accessibility | Labels for each input, what the `aria-live` result announcement says, keyboard flow (`rules/accessibility.md`) |
| 6 | Edge cases & failure modes | Zero dice, max dice pool, negative modifiers, ties, non-numeric input |
| 7 | Non-functionals | Any performance/animation expectation beyond the app defaults (`rules/animations.md`, `rules/performance.md`) |
| 8 | Integrations | External SRD/reference link (with `rel="noopener noreferrer"` per `rules/security.md`) — nothing else; this app has no network calls on the critical path |
| 9 | Acceptance criteria | Testable Given/When/Then for every behavior in scope |

**Rules of questioning:**

- Record every answer into the draft spec immediately.
- Challenge contradictions on the spot.
- "I don't know" moves to **Deferred Decisions** with a chosen fallback — never silently deferred.
- A dimension is done when a follow-up round produces zero new questions.

### Step 3: Draft the Spec File

```markdown
# Spec NNN: <Calculator Name>

**Status:** Draft
**Date:** <today>

## Problem & Source System
## Scope            <!-- ### In / ### Out -->
## Math Model        <!-- the exact formula/resolution rule -->
## Inputs & Result Shape
## Accessibility
## Edge Cases & Failure Modes
## Non-Functional Requirements
## Integrations
## Acceptance Criteria   <!-- AC-1, AC-2, ... -->
## Deferred Decisions
## Open Questions     <!-- MUST be empty before approval -->
```

### Step 4: Review Loop

Status → In Review. Present the full spec: "Read this end-to-end. What's wrong, missing, or over-engineered?" Repeat until no further changes.

### Step 5: The Agreement Gate

Ask explicitly: "Do you approve this spec?" Open Questions must be empty. On approval: `**Status:** Approved (<date>)`. If implementation later reveals a wrong assumption, set back to In Review and fix the spec first — code never silently diverges from it.

### Step 6: Handoff

- `/plan` maps acceptance criteria to `logic.ts`/component/test/route steps
- `skills/tdd` turns acceptance criteria into the first failing tests in `logic.test.ts`
- `skills/scaffold` generates the feature-folder skeleton the plan calls for

## Example

```
User: /spec add a calculator for Forged in the Dark resistance rolls

Claude: Here's what I understood: a calculator for FitD's resistance roll —
  spend stress to reduce/avoid a consequence, rolling a die pool equal to
  the relevant attribute. Is this the idea? What did I get wrong?

User: yes

Claude: Round 1 — Math model:
  1. Does a 6 reduce stress cost to 0, and what happens on multiple 6s?
  2. Is a 1-3 result "full stress cost" or does it scale with the roll?
  3. Is the die pool capped (FitD systems vary 0-10)?
  ...

[rounds continue through all nine dimensions]

Claude: Spec written to docs/specs/003-fitd-resistance-roll.md (In Review).

User: approved

Claude: Status: Approved (2026-08-12). Next: /plan.
```

## Related

- `plan` — consumes the approved spec
- `tdd` — acceptance criteria become the first failing tests
- `scaffold` — generates the feature-folder files the plan calls for
- `architecture.md` — the pure-logic/view boundary this spec's Math Model section is written against
