---
name: checkpoint
description: >
  Mid-session save point: a descriptive git commit plus a brief handoff
  note, then keep working. Use before a risky refactor or when switching
  tasks. For the full end-of-session ritual with learning extraction, use
  /wrap-up instead. Use when: "checkpoint", "save progress", "commit and
  handoff", "save state", "pause here", "before a risky change".
---

# /checkpoint

## What

A quick mid-session save that banks the known-good state in two moves:

1. **Descriptive git commit** — stage relevant changes, commit with a message following `rules/git-workflow.md`'s conventional-prefix style.
2. **Brief handoff note** — `.claude/handoff.md`, so a resumed session (or you, after a botched refactor) knows where things stand.

Checkpoint is the mid-session save; `/wrap-up` is the end-of-session ritual — full handoff plus learning extraction into `MEMORY.md`.

## When

- Before a risky refactor (e.g. changing a shared component's props, touching `logic.ts` for a calculator with real edge-case coverage)
- When switching to a different calculator or task mid-session
- After completing a logical unit of work
- User says "checkpoint", "save progress", "pause here"

## How

1. **Assess state** — `git status` and `git diff`.
2. **Stage changes** — specific files, never `git add -A`. Exclude anything that looks like it shouldn't be public (`rules/security.md` — this repo is public).
3. **Commit** — conventional prefix (`feat:`, `fix:`, `refactor:`, `test:`), new commit, never amend. Nothing to commit → skip to the handoff.
4. **Write handoff note** — `.claude/handoff.md`: Completed, Pending (with specific next steps and file paths), Learned (only if non-obvious), Context (branch + commit hash). Single file, always overwritten.
5. **Confirm** — report the commit hash and handoff summary, then resume work.

### Safety Rules

- Never push, force-push, or touch remote branches
- Never commit secrets — this repo is public on GitHub Pages, nothing sensitive belongs in it
- Never amend
- Nothing to commit → update the handoff only

## Example

```
User: /checkpoint — about to refactor the dice-notation parser in src/shared/

Claude: 2 files modified, 1 new.

  Commit a1b2c3d: "feat: add opposed-roll calculator with tie handling"
  - src/calculators/opposed-roll/logic.ts
  - src/calculators/opposed-roll/logic.test.ts
  - src/calculators/opposed-roll/OpposedRollCalculator.tsx (new)

  Handoff updated (.claude/handoff.md):
  ## Completed
  - [x] Opposed roll calculator: logic + tests + component
  ## Pending
  - [ ] Refactor src/shared/diceNotation.ts to support exploding dice (about to attempt)
  ## Context
  - Branch: feature/opposed-roll | Checkpoint: a1b2c3d

  Checkpoint saved — safe to proceed with the parser refactor.
```

## Related

- `wrap-up` — end-of-session ritual: full handoff format plus learning extraction
- `build-fix` — get the build green before checkpointing
