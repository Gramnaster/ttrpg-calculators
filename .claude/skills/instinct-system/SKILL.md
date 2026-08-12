---
name: instinct-system
description: >
  Unified learning-and-memory system: confidence-scored instincts
  (observe-hypothesize-confirm, stored in .claude/instincts.md), user
  corrections captured as permanent rules in MEMORY.md, and organic
  discoveries logged to .claude/learning-log.md. Includes status, export,
  and import modes. Load this skill when you notice a recurring pattern, a
  user corrects your output, or you discover something non-obvious.
  Triggers: "show instincts", "what have you learned", "list instincts",
  "export instincts", "import instincts", "learn this", "I think they
  always", "notice a pattern", "instinct", "confidence", "learn from
  mistakes", "remember this", "don't do that again", "log this", "gotcha",
  "what did we learn", or at session start.
---

# Instinct System

One learning system, three tiers. Every signal Claude receives during work — an observed pattern, a user correction, a surprising discovery — routes to exactly one store.

## Core Principles

1. **Three tiers, one routing decision** — *Instincts* are unconfirmed hypotheses (`.claude/instincts.md`). *Corrections* are user-confirmed rules (`MEMORY.md`). *Discoveries* are insights that explain the world (`.claude/learning-log.md`). Never mix tiers.
2. **Instincts are hypotheses, not rules** — "One calculator uses `reason` for its invalid-input field" is an instinct at 0.3; "all four calculators do" is a rule at 0.9. Confidence drives behavior: note at 0.3, mention at 0.5, follow at 0.7, promote at 0.9.
3. **A user correction is a confirmed instinct at full confidence** — skip the confirmation cycle. Generalize, capture in `MEMORY.md` with the "why", confirm what was captured. A lost correction is the most expensive mistake this system can make.
4. **Project-scoped, never global** — what holds in this app may not hold elsewhere. Transfers between projects go through export/import with confidence decay.
5. **Review at session start, prune periodically** — read `MEMORY.md` and 0.7+ instincts before writing code. Audit all three stores when they bloat.

## Patterns

### Tier Routing

| Signal | Destination | Lifespan |
|---|---|---|
| Pattern observed, not yet confirmed | `.claude/instincts.md` at 0.3 | Until promoted or discarded |
| User correction | `MEMORY.md` immediately, generalized | Permanent until proven wrong |
| Instinct reaching 0.9 | Promote to `MEMORY.md`, remove from instincts | Permanent |
| Non-obvious discovery (gotcha, workaround, perf finding) | `.claude/learning-log.md` | 3-6 months, then archive or promote |
| Same gotcha logged 3+ times | Promote to `MEMORY.md` | Permanent |
| Session state (done/pending) | Handoff via `wrap-up` — not this system | Until next session |

### Instinct Lifecycle (Observe-Hypothesize-Confirm)

```
1. OBSERVE     — "This calculator's result type uses `reason` not `message`. Convention?"
2. HYPOTHESIZE — Write to .claude/instincts.md at 0.3:
                 - Invalid-input field is named `reason` | confidence: 0.3 | seen: 1 | last: 2026-08-12
3. SEEK        — Grep 2-3 other calculators' logic.ts. Passive observation isn't enough.
4. ADJUST      — Confirmed: raise per the track below. Contradicted: halve. Mixed: hold, note the split.
5. PROMOTE     — At 0.9, present evidence and offer promotion to MEMORY.md.
```

### Instinct Storage Format

`.claude/instincts.md`, grouped by category:

```markdown
# Project Instincts

## Coding Style [0.7]
- Invalid-input field is named `reason`, not `message` | confidence: 0.8 | seen: 5 | last: 2026-08-12
- Result discriminant field is `kind`, not `type` | confidence: 0.9 | seen: 6 | last: 2026-08-10

## Architecture [0.6]
- New shared components land in src/shared/dice/ subfolder | confidence: 0.5 | seen: 2 | last: 2026-08-11
```

Standard categories: Coding Style, Architecture, Naming, Testing, Accessibility, Animation, Tooling.

### Confidence Adjustment Rules

```
CONFIRMATION:  1st -> 0.3 | 2nd -> 0.5 | 3rd -> 0.7 | 4th -> 0.8
               5th+ with zero contradictions -> 0.9 (promotion candidate)

CONTRADICTION: Any contradiction -> halve current confidence (0.7 -> 0.35)
               Two in a row -> 0.1 (effectively dead)

USER OVERRIDE: Explicit confirm -> 0.8 | Explicit correct -> 0.0 (remove,
               capture in MEMORY.md instead) | "Sometimes" -> cap at 0.5

STALENESS:     No observations for 10+ sessions -> flag for review
               Contradicted, unreconfirmed for 5 sessions -> remove
```

### Acting on Instincts by Confidence

```
0.0-0.2 -> IGNORE  — insufficient evidence
0.3-0.4 -> NOTE    — record internally, do not apply
0.5-0.6 -> MENTION — "This app may use [pattern]. Follow it?"
0.7-0.8 -> FOLLOW  — apply by default, mention on first use
0.9     -> PROMOTE — offer to add to MEMORY.md
```

Never silently apply an instinct below 0.7.

### Correction Capture Flow (Tier 2)

```
1. DETECT      — recognize the correction signal
2. ACKNOWLEDGE — "Got it — clip-path, not width, for the bar-fill reveal."
3. GENERALIZE  — Specific: "Don't animate width in ProbabilityBar.tsx"
                 General:  "Always use clip-path for width-based reveals —
                            width forces Layout every frame."
                 Store the broadest correct statement.
4. CHECK       — scan MEMORY.md for overlap; update an existing rule rather than duplicating
5. STORE       — one line, rationale after the dash. Remove the matching instinct if one existed.
6. CONFIRM     — "Added to Memory > Animation: clip-path over width for reveals."
```

MEMORY.md format:

```markdown
## Animation
- Always use clip-path over width for grow/reveal effects — width forces Layout every frame
- Never leave will-change set permanently — costs VRAM once the animation ends
```

### Discovery Logging (Tier 3)

Log to `.claude/learning-log.md` the moment it happens:

```markdown
## 2026-08-12 | Gotcha | Vite base path only breaks at deploy, not build
`pnpm run build` succeeds locally regardless of a wrong `base` in
vite.config.ts — the blank-page/404 symptom only appears once served from
the actual GitHub Pages subpath. `pnpm run preview` doesn't catch it either
unless `base` is set correctly first.
**Files:** vite.config.ts
**Resolution:** Always verify against the deployed Pages URL, not just preview.
```

Log when you hit one of these triggers (use the names verbatim):

```
Bug Root Cause        — the cause was NOT where the error appeared
Architecture Decision — discovered WHY something is built a certain way
Gotcha                — framework/library behaved surprisingly
Performance Discovery — unexpected perf behavior, with the measurement
Pattern Found         — reusable codebase pattern worth remembering
External Service      — an external SRD/reference link behaves unexpectedly
```

Routine changes with nothing surprising don't get logged.

### Session-Start Loading

```
1. Read MEMORY.md — apply rules proactively
2. Read .claude/instincts.md — load 0.7+ as defaults, note 0.5-0.6
3. Scan recent learning-log entries for the calculator/area being worked on
4. Flag stale instincts (10+ sessions without observation) for review
```

## Modes

### Status ("show instincts", "what have you learned")

Read `.claude/instincts.md`, sort by confidence descending, group by category, render a table (instinct | confidence | category | status). Summarize health: count, average confidence, decaying vs. reinforced, any conflicts.

### Export ("export instincts", "share instincts")

Filter to confidence > 0.7, strip project-specific file paths while preserving the pattern, write to `.claude/instincts-export.md`. Report what was exported vs. skipped.

### Import ("import instincts", "load instincts from")

Merge each imported instinct: no local match -> add at confidence decayed by 0.2 (never above 0.7), mark `source: imported from [project]`. Matching instinct -> keep the higher confidence. Conflicting -> present both to the user, never auto-overwrite.

## Anti-patterns

### Over-Eager Pattern Recognition

```
# BAD — first observation treated as a rule
*Reads one calculator* "This app always puts the roll button before the inputs."
*Builds the next 3 calculators that way, contradicting the other 4 existing ones*

# GOOD — hypothesis at 0.3, then active confirmation
"Noticed button-before-inputs in OpposedRollCalculator. Instinct at 0.3.
 Checking 3 more calculators..." *All button-after* -> "Disconfirmed. Discarding."
```

### Fixing Without Capturing

```
# BAD
User: "No, we always use clip-path for this, not width"
Claude: "Fixed." *Next session: same mistake in a different calculator*

# GOOD
Claude: "Fixed. Added to Memory > Animation: clip-path over width for reveals."
```

### Logging Everything

```
# BAD — noise entry
## 2026-08-12 | Pattern Found | Used a NumberStepper Component

# GOOD — only the non-obvious earns an entry
## 2026-08-12 | Gotcha | Vite base path only breaks at deploy, not preview
```

## Decision Guide

| Scenario | Action |
|---|---|
| First time seeing a pattern | Instinct at 0.3, check 2-3 related files |
| Pattern seen 3+ times, no contradictions | Raise to 0.7, follow by default |
| Pattern contradicted | Halve confidence, note the exception |
| User says "we always do X" | Instinct at 0.8 |
| User corrects your code | Generalize -> MEMORY.md immediately; drop any matching instinct |
| User says "remember this" | Capture in MEMORY.md as stated, generalized |
| Same correction given twice | High priority — the rule wasn't captured or reviewed |
| Non-obvious bug/gotcha/perf surprise | Log to learning-log with category + files |
| Same gotcha logged 3+ times | Promote to MEMORY.md |
| Instinct at 0.9 | Present evidence, offer promotion |
| Any store bloats (50+ entries) | Audit: prune, merge, promote |
| Starting a session | Load MEMORY.md, instincts 0.7+, recent log entries |

## Related

- `convention-learner` — detects codebase conventions in bulk; feed its findings in as instincts
- `wrap-up` — end-of-session ritual; routes session learnings into the correct tier
