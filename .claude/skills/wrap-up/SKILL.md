---
name: wrap-up
description: >
  Owns the session handoff lifecycle: end-of-session capture of completed
  work, pending tasks, and learnings into .claude/handoff.md, and the
  session-start protocol that loads it back. Use when: "wrap up", "done
  for today", "that's all", "end session", "signing off", "handoff" — and
  at session start: "start session", "pick up where we left off", "what
  were we working on".
---

# /wrap-up

## What

The session continuity ritual. Sessions are ephemeral; knowledge is permanent. Wrap-up bridges sessions in both directions:

- **Session END** — capture DONE, PENDING, and LEARNED. Write to `.claude/handoff.md`; flow durable learnings into `MEMORY.md` via `instinct-system`.
- **Session START** — load the handoff, `MEMORY.md`, and instincts, present a resume summary.

## When

- End of a working session — "done for today", "signing off"
- Before switching to a different calculator or task, or after a milestone
- Implicit endings ("thanks" after completed work) — offer the handoff, don't just say goodbye
- Start of a session — "what were we working on"
- For a mid-session save without ending, use `/checkpoint` instead

## How

### Session End

1. **Review the session** — from `git status`/`git diff` and the conversation: files touched, tasks completed vs. unfinished, decisions made and why, corrections the user gave.
2. **Check uncommitted changes** — offer to commit before wrapping.
3. **Write the handoff** — `.claude/handoff.md`, format below. Single file, always overwritten. If it already has pending items from a different thread, ask before overwriting: merge, overwrite, or skip.
4. **Extract learnings** — corrections and discoveries go to `MEMORY.md` / `.claude/instincts.md` via `instinct-system`. The handoff's Learned section is the trigger, not the destination.
5. **Confirm** — summarize the handoff and learnings captured.

### Handoff File Format (`.claude/handoff.md`)

Write for a stranger with zero context — file paths, rationale, specific next steps. "Continue the calculator" is useless; "Finish `logic.ts` for the BitD probability calculator — the crit-on-double-6 case (BitD-04) still needs a test" is actionable.

```markdown
# Session Handoff

> Generated: 2026-08-12 | Branch: feature/bitd-probability

## Completed
- [x] BitD probability logic.ts: standard + zero-dice + max-dice cases (src/calculators/bitd-probability/logic.ts)
- [x] Discriminated union result type wired into the component

## Pending
- [ ] Crit-on-double-6 test case (BitD-04) — logic.ts doesn't yet special-case 2+ sixes
  - Reference: rules/coding-style.md comment example already documents this rule
- [ ] aria-live result region not yet added (rules/accessibility.md)

## Learned
- Vitest 4's jsdom environment needs explicit `environment: "jsdom"` per-file for
  component tests if not set globally in vitest config

## Context
- Branch: feature/bitd-probability | Last commit: "feat: add BitD probability logic"
- Uncommitted changes: no
```

### Learning Extraction Checklist

1. Did the user correct anything? → `MEMORY.md` via `instinct-system`
2. Did we discover something non-obvious? → Learned section
3. Did we decide something with rationale? → document the "why"
4. Did a tool/approach fail? → note it so next session doesn't retry it

Good learning: "Vite's `base` path must match the repo name exactly, confirmed at deploy time not build time." Bad learning: "Worked on the BitD calculator" (vague) or "Used named exports" (already a rule).

### Session Start

1. **Load context** — `.claude/handoff.md` (pending work), `MEMORY.md` (permanent rules), `.claude/instincts.md` (0.7+ patterns). Missing files are fine — start clean, don't block.
2. **Detect the project** — confirm `package.json`/`vite.config.ts` location so `pnpm run` commands resolve from the first prompt.
3. **Present a resume summary** — last session's work, pending tasks, active rules/instincts count. Ask what to work on — never auto-start pending work.

## Example

```
User: /wrap-up

Claude: Wrapping up session...

## Session Summary
- Implemented BitD probability calculator logic + tests
- Wired discriminated union result into the component

## Pending
- [ ] aria-live result region (src/calculators/bitd-probability/BitdProbabilityCalculator.tsx)

## Learnings Captured
- Vitest jsdom environment gotcha → .claude/learning-log.md

Written to .claude/handoff.md. See you next session.
```

## Related

- `checkpoint` — mid-session save without ending the session
- `instinct-system` — confidence-scored pattern capture fed by the Learned section
