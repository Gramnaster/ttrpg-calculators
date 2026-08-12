---
alwaysApply: true
description: >
  Enforces search-before-read tool usage, subagent routing for parallel work,
  and agent selection guidance.
---

# Agent & Tool Usage Rules

## Search and Diagnose Before Reading Whole Files

There's no language-server MCP wired up for this stack (unlike the Roslyn MCP the sibling .NET projects use) — diagnostics come from the toolchain directly.

- **DO** use `Grep`/`Glob` to find a symbol, component, or usage before reading a whole file. A 300-line component costs real context; a targeted grep costs almost nothing.
- **DO** run `pnpm exec tsc --noEmit` for type diagnostics and `pnpm exec eslint .` for lint diagnostics instead of guessing whether something type-checks or lints clean.
- **DO** check `src/calculators/<name>/` structure (via `Glob`) before assuming where a calculator's files live — see `rules/architecture.md` for the expected shape.
- **DON'T** read an entire component file to find one function or one prop. Grep for it first.

## Subagent Routing

- **DO** use subagents for parallel research, exploration, and independent tasks (e.g. researching two unrelated calculators' rules-system math at once).
- **DO** assign one task per subagent for focused execution.
- **DO** route to specialist agents for domain-specific work. Check `AGENTS.md` for the routing table.
- **DON'T** use subagents for trivial, single-step tasks.

## Model Selection

- **DO** use Sonnet for routine tasks: formatting, simple refactors, test generation, boilerplate calculator scaffolding.
- **DO** use Opus for non-trivial architecture decisions, animation/performance trade-offs, and cross-cutting design (e.g. deciding whether a new calculator needs shared state).
- **DO** use model aliases (`fable`, `opus`, `sonnet`, `haiku`) in agent frontmatter — never pinned version IDs, which rot when new versions ship.

## Skill Loading

- **DO** load relevant skills before starting work. Check `AGENTS.md`'s skill maps for the current task domain.
- **DON'T** start implementation without checking if a relevant skill exists — re-discovering patterns already codified in `skills/` wastes time and risks drifting from the app's conventions.

## Quick Reference

| Need | Tool / Approach |
|---|---|
| Find where a component/function is defined | `Grep` |
| Check for type errors | `pnpm exec tsc --noEmit` |
| Check for lint issues | `pnpm exec eslint .` |
| Understand a calculator's folder shape | `Glob` on `src/calculators/<name>/**` |
| Parallel research | Subagent |
| Animation/architecture trade-off | Opus + specialist agent |
| Routine refactor | Sonnet |
