# Agent Routing & Orchestration

> This file defines how Claude Code routes queries to specialist agents and how agents coordinate.

## Agent Roster

| Agent | File | Primary Domain |
|---|---|---|
| react-architect | `agents/react-architect.md` | Calculator module structure, routing, state placement |
| animation-specialist | `agents/animation-specialist.md` | Compositor-only CSS, View Transitions, `will-change`, profiling |
| test-engineer | `agents/test-engineer.md` | Vitest + React Testing Library strategy and implementation |
| code-reviewer | `agents/code-reviewer.md` | Multi-dimensional review: correctness, accessibility, animation, conventions |
| build-error-resolver | `agents/build-error-resolver.md` | Autonomous TypeScript/Vite/ESLint error fixing |
| devops-engineer | `agents/devops-engineer.md` | GitHub Actions CI, GitHub Pages deployment |
| refactor-cleaner | `agents/refactor-cleaner.md` | Dead code removal, de-sloppification |

This app has no backend, so there is no `ef-core-specialist`/`api-designer`/`security-auditor`/`performance-analyst` equivalent — see `rules/security.md` and `rules/performance.md` for why those concerns are either out of scope or folded into the agents above.

## Routing Table

Match user intent to agent. When multiple agents could handle a query, the first match wins.

| User Intent Pattern | Primary Agent | Support Agent |
|---|---|---|
| "new calculator", "folder structure", "where should this state live" | react-architect | — |
| "restructure", "shared component", "calculator boundaries" | react-architect | — |
| "animation", "transition", "route change", "result reveal", "hover effect" | animation-specialist | — |
| "janky", "dropped frames", "layout thrashing", "will-change" | animation-specialist | — |
| "write tests", "test strategy", "coverage" | test-engineer | — |
| "Vitest", "React Testing Library", "component test" | test-engineer | — |
| "review this code", "PR review", "code quality" | code-reviewer | — |
| "conventions", "coding style", "detect patterns", "code consistency" | code-reviewer | — |
| "review PR", "review changes", "pre-merge check" | code-reviewer | — |
| "build errors", "won't compile", "type errors", "fix lint" | build-error-resolver | — |
| "deploy", "CI", "GitHub Actions", "GitHub Pages", "pipeline" | devops-engineer | — |
| "clean up", "dead code", "unused code", "de-sloppify", "simplify" | refactor-cleaner | — |
| "scaffold calculator", "create calculator", "add calculator" | react-architect | test-engineer |
| "init project", "setup project", "new project" | react-architect | devops-engineer |
| "accessibility", "a11y", "screen reader", "keyboard nav", "contrast" | code-reviewer | react-architect |
| "refactor" | code-reviewer | react-architect |

## Skill Loading Order

Agents load skills in dependency order. Core skills load first.

### Per-Agent Skill Maps

| Agent | Skills |
|---|---|
| react-architect | project-structure, scaffold, project-setup, state-management + contextual: animations, accessibility |
| animation-specialist | animations (always) + contextual: performance |
| test-engineer | testing, tdd |
| code-reviewer | code-review, convention-learner + contextual: accessibility, animations, error-handling |
| build-error-resolver | build-fix + contextual: state-management |
| devops-engineer | ci-cd, outdated |
| refactor-cleaner | de-sloppify + contextual: testing |

## Search Tool Preferences

There is no MCP server for this stack (unlike the sibling .NET projects' Roslyn Navigator) — diagnostics come from the toolchain directly, and navigation is `Grep`/`Glob`-first (`rules/agents.md`).

| Task | Use | Instead Of |
|---|---|---|
| Find where a component/function is defined | `Grep` | Reading files top to bottom |
| Find all usages of a symbol | `Grep` | Reading every file that might reference it |
| Check for type errors | `npx tsc --noEmit` | Guessing from a previous run |
| Check for lint issues | `npx eslint .` | Guessing |
| Understand a calculator's folder shape | `Glob` on `src/calculators/<name>/**` | Reading each file individually |
| Check test coverage for a calculator | `Glob` for `*.test.ts`/`*.test.tsx` alongside `logic.ts` | Manual inspection |
| Find dead exports | `Grep` the export name across `src/` | `npx depcheck` alone (deps only, not exports) |

## Cross-Agent Meta Skills

These meta and productivity skills are not tied to a specific agent — any agent can load them when the context calls for it:

| Skill | When to Load |
|---|---|
| `instinct-system` | After ANY user correction, pattern detection across sessions, logging non-obvious discoveries; includes status/export/import modes |
| `wrap-up` | Session start (load handoff) and session end (write handoff to `.claude/handoff.md`, capture learnings) |
| `checkpoint` | Mid-session save before risky changes or task switches — commit + brief handoff |
| `workflow-mastery` | Context running low, large exploration, parallel workflows, subagent strategy |
| `convention-learner` | Detect and enforce project-specific conventions in new code |

Model selection guidance lives in the always-loaded `.claude/rules/agents.md` — no skill load needed.

### Meta Skill Routing

| User Intent Pattern | Skill |
|---|---|
| "learn from mistakes", "remember this", "log this", "gotcha", "show instincts", "what have you learned" | instinct-system |
| "wrap up", "done for today", "handoff", "start session", "load handoff" | wrap-up |
| "save progress", "checkpoint", "pause here" | checkpoint |
| "context", "running out of tokens", "too many files" | workflow-mastery |
| "review this", "what should I review" | code-review |
| "fix build loop", "keep fixing", "auto-fix" | build-fix |

## Slash Commands

Commands map to skills and agents. Use these as shortcuts for common workflows.

Each workflow skill registers its own slash command and carries its methodology inline.

| Command | Supporting Skills | Primary Agent | Purpose |
|---|---|---|---|
| `/spec` | — | — | Structured questioning → agreed spec in `docs/specs/` |
| `/plan` | project-structure | react-architect | Feature-folder-aware planning (consumes approved specs) |
| `/verify` | — | — | 7-phase verification pipeline |
| `/tdd` | testing | test-engineer | Red-green-refactor workflow |
| `/scaffold` | project-structure | react-architect | Feature-folder scaffolding for a new calculator |
| `/code-review` | convention-learner | code-reviewer | Blast-radius-prioritized code review |
| `/build-fix` | — | build-error-resolver | Bounded build-fix and test-fix loops |
| `/checkpoint` | — | — | Mid-session save (commit + handoff) |
| `/de-sloppify` | — | refactor-cleaner | Systematic code cleanup |
| `/wrap-up` | instinct-system | — | Session handoff lifecycle (end + start) |
| `/outdated` | — | devops-engineer | Dependency health: staleness, CVEs |

Instinct operations (status, export, import) are modes of the `instinct-system` skill — say "show instincts", "export instincts", or "import instincts".

## Conflict Resolution

When two agents could handle a query:

1. **Animation questions always go to animation-specialist**, even when another agent owns the surrounding feature — `Plans.txt`'s "performant transformations only" requirement has almost no exceptions, and this agent is the one enforcing it.
2. **Architecture questions win over implementation** — "where should this calculator's state live" → react-architect, even though the calculator itself might be built by a general session.
3. **Accessibility concerns are always surfaced** — even when another agent is primary, flag accessibility gaps for code-reviewer treatment.
4. **Code review is holistic** — code-reviewer loads skills contextually based on what's in the diff.

## Token Budget Guidance

For detailed context management strategies, see the **`workflow-mastery`** skill (Context Discipline section).

- **Small queries** (single fix, single component): Load 1 skill, grep for context instead of reading whole files
- **Medium queries** (new calculator): Load 2-3 skills (`project-structure`, `animations` or `accessibility` as needed, `testing`)
- **Large queries** (multi-calculator refactor, shared-component extraction): Load all relevant skills, `Grep` broadly across `src/calculators/` before touching anything

## Response Patterns

All agents should:
1. **Start with the recommended approach** — don't enumerate all options equally
2. **Show code first, explain after** — the developer prefers seeing the solution, then the why
3. **Flag anti-patterns proactively** — a layout-property animation or an untyped `any` in existing code gets mentioned even if unrelated to the current task
4. **Reference rules and skills** — point to the specific `rules/*.md` or `skills/*/SKILL.md` a recommendation is grounded in
5. **Grep before reading** — reduce token consumption, per `rules/agents.md`
