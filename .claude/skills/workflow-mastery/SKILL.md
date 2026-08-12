---
name: workflow-mastery
description: >
  Claude Code workflow mastery for this app — parallel git worktrees, plan
  mode strategy, verification loops, auto-formatting hooks, pre-allowed
  npm permissions, prompting techniques, subagent patterns, and context
  discipline (Grep/Glob-first navigation instead of an MCP server, token
  budget management). Load when setting up Claude Code for this project,
  optimizing workflow, running parallel sessions, or when context is
  running low. Triggers: "productivity", "workflow", "parallel",
  "worktree", "plan mode", "permissions", "hooks", "speed up
  development", "context", "tokens", "budget", "running out of context".
  Inspired by tips from Boris Cherny (creator of Claude Code) and the
  Anthropic team, adapted for a small Vite/React/TS app with no MCP server.
---

# Workflow Mastery for TTRPGCalculators

## Core Principles

1. **Parallel over sequential** — Run multiple Claude sessions via git worktrees: build a calculator in one, fix a bug in another, chase an animation-perf issue in a third.
2. **Plan then execute** — For anything non-trivial, `/plan` first, iterate until solid, then let Claude execute with auto-accept.
3. **Verification closes the loop** — `npx tsc --noEmit`, `npx vitest run`, `npm run build` are Claude's proof of correctness, not "it looks right." See `skills/verify`.
4. **Context is a budget** — This is a small app (no giant solution to navigate), but a single 300-line component still costs real tokens to read. Grep/Glob first, per `rules/agents.md`.
5. **Automate the repetitive** — Formatting and antipattern checks are already hooks (`hooks/post-edit-format.sh`, `hooks/pre-commit-antipattern.sh`). Pre-allow safe npm permissions so they don't interrupt flow.
6. **Compound your knowledge** — Every correction becomes a `MEMORY.md` rule via `instinct-system`.

## Patterns

### Parallel Sessions with Git Worktrees

```bash
git worktree add ../TTRPGCalculators-new-calc origin/main
git worktree add ../TTRPGCalculators-a11y-fix origin/main
git worktree add ../TTRPGCalculators-anim-perf origin/main

cd ../TTRPGCalculators-new-calc && claude
cd ../TTRPGCalculators-a11y-fix && claude
cd ../TTRPGCalculators-anim-perf && claude
```

| Worktree | Task |
|---|---|
| `new-calc` | Build a new calculator end-to-end (`skills/scaffold`) |
| `a11y-fix` | Accessibility audit/fix pass (`rules/accessibility.md`) |
| `anim-perf` | Chase a dropped-frame animation issue (`skills/animations`) |
| `deps` | Dependency audit (`skills/outdated`), isolated from feature work |

### Auto-Format and Antipattern Hooks

Already wired in `.claude/settings.json` (see `rules/hooks.md`) — `post-edit-format.sh` runs Prettier/ESLint `--fix` on every write, `pre-commit-antipattern.sh` blocks a commit that introduces a layout-animating CSS property, a stray `any`, or `dangerouslySetInnerHTML`. Nothing to set up here beyond accepting the hooks.

### Pre-Allow Safe npm Permissions

Stop clicking "allow" for routine commands. In `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npm install *)",
      "Bash(npx tsc *)",
      "Bash(npx eslint *)",
      "Bash(npx vitest *)",
      "Bash(npx vite *)",
      "Bash(npx prettier *)"
    ]
  }
}
```

### Plan Mode Strategy

```
1. Enter plan mode (Shift+Tab twice)
2. Describe the task with full context
3. Iterate — challenge assumptions, ask "what about zero dice / max dice pool?"
4. Once solid, switch to normal mode
5. Claude executes with auto-accept
```

**Advanced pattern:** have a second session review the plan: "Review this plan as a senior React engineer. What's missing? Does this respect the pure-logic/view boundary in `rules/architecture.md`?"

**When things go sideways:** the moment implementation deviates from the plan, stop, re-plan, resume — don't push through.

### Verification Loop

See `skills/verify` for the full 7-phase pipeline. The short version: always run `npx tsc --noEmit`, `npx vitest run`, and `npm run build` before declaring anything done.

### Compounding Knowledge via Corrections

See `skills/instinct-system` for the full capture system. Short version: after every correction, generalize it into a `MEMORY.md` rule immediately.

### Prompting Techniques

**Challenge Claude's work:**
```
"Would this pass review against rules/priorities.md? Check: is the math
correct for zero dice and max dice pool, is every input labeled, is the
result type a discriminated union, does the CSS only animate transform/opacity?"
```

**Demand proof:**
```
"Prove this works. Run the tests and show me the output. Then run
npx vite build && npx vite preview and confirm the calculator renders."
```

**After a mediocre fix:**
```
"Knowing everything you know now, scrap this and implement the simple
version — no premature abstraction, per rules/priorities.md."
```

### Subagent Patterns

The kit's own agents (`.claude/agents/`) cover this app's specialist needs — see `rules/agents.md`'s routing table:

```
"Use the animation-specialist agent to review this route transition for
layout-property violations."

"Use the code-reviewer agent on my changes before I open a PR."

"Use the test-engineer agent to write logic.test.ts coverage for the
edge cases in this calculator."
```

**When to offload vs. stay in main context:** see Context Discipline below.

## Context Discipline

`rules/agents.md` already mandates Grep/Glob-first navigation over reading whole files. This section is the strategy layer: budgeting, when to offload, how to recover.

### Token Economics

There's no MCP server for this stack — the equivalent discipline is Grep/Glob before Read. A targeted grep for a symbol costs a handful of tokens; reading a 300-line component costs hundreds to a couple thousand. Four grep calls to locate a function, its usages, and its test costs far less than reading all three files in full — read fully only the file(s) you're about to edit.

### Subagent Offloading Decision Matrix

```
OFFLOAD TO A SUBAGENT WHEN:
- Exploring unfamiliar code (>3 files to read)
- Research spanning multiple calculators or docs
- Verbose output (full test runs, lint output, comparisons)

STAY IN MAIN CONTEXT WHEN:
- Modifying a file you've already read
- Quick lookups (1-2 greps)
- Work building on the ongoing conversation with the user
```

### File Reading Prioritization

```
PRIORITY 1 — Files you will edit: read fully
PRIORITY 2 — Shared contracts you must satisfy (a shared component's props): read the interface, skip unrelated internals
PRIORITY 3 — Reference patterns from another calculator: grep first, read only if insufficient
PRIORITY 4 — General context: subagent summarizes; don't read in main context

NEVER READ IN FULL: node_modules, dist/, package-lock.json, unrelated calculators' tests
```

### Budget Planning and Recovery

This app is small — a full context blowout is less likely than in a large solution, but it still happens on a long multi-calculator session.

```
WARNING SIGNS: 10+ files read, forgetting earlier details, re-reading a
file you already saw

RECOVERY: summarize what you know in 5-10 lines -> subagents for remaining
exploration -> suggest a fresh session if still degraded
```

### Lazy Skill Loading

Don't front-load every skill "just in case." Load `animations` or `accessibility` the moment the topic actually comes up, not at session start.

## Anti-patterns

### Don't Skip Plan Mode for Multi-File Work

```
// BAD
"Refactor all calculators to share a result-panel component"
*Claude modifies 6 files, misses that one calculator's result shape doesn't fit*

// GOOD
"Enter plan mode. I want to extract a shared result panel. Let's confirm
which calculators' result shapes are actually compatible first."
```

### Don't Accept the First Solution

```
// BAD
Claude: "Here's the implementation" *works but animates `top` instead of `transform`*
You: "Looks good, ship it"

// GOOD
You: "Does this only animate transform/opacity? Would this pass the
pre-commit-antipattern hook?"
```

### Don't Load Everything Because the App Is Small

```
// BAD — "it's a small app, just read everything"
Read all 6 calculators' logic.ts, all their tests, every shared component
*15k tokens spent before writing a line*

// GOOD — minimum viable context
Grep for the pattern you need, read the 1-2 files you'll actually touch
```

## Decision Guide

| Scenario | Recommendation |
|---|---|
| Task touches 3+ files | `/plan` first |
| Simple bug fix | Just fix it, verify with `npx vitest run` |
| Need to build + test + review | 3 parallel worktrees |
| CI keeps failing on format | Confirm `post-edit-format.sh` hook is active |
| Tired of permission prompts | Pre-allow `npm run *` / `npx vitest *` etc. |
| Claude made a mistake | "Update MEMORY.md so this doesn't recur" |
| Code feels hacky | "Knowing everything you know now, implement the simple version" |
| Want a second opinion on a plan | Spin up a second session as reviewer |
| Repetitive review workflow | Use the `code-reviewer` agent |
| Learning this codebase | `convention-learner` skill |
| Need a symbol's usages | `Grep`, not a full-file read |
| Need to modify a file | Read it fully |
| Exploring unfamiliar code | Spawn a subagent |
| Context feels heavy | Summarize what you know, subagents going forward |
| New topic mid-session | Load the relevant skill on demand |

## Related

- `verify` — the verification pipeline this skill's Verification Loop section points to
- `instinct-system` — the compounding-knowledge system
- `agents.md` — the always-active rule this skill's Context Discipline section elaborates on
