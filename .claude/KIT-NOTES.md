# About this .claude/ kit

## What this is

An original `.claude/` kit for TTRPGCalculators — a Vite + React + TypeScript
+ HTML/CSS static app deployed to GitHub Pages. It follows the same folder
taxonomy as [dotnet-claude-kit](https://github.com/codewithmukesh/dotnet-claude-kit)
(MIT) — `agents/`, `hooks/`, `knowledge/`, `rules/`, `skills/`, a root
`AGENTS.md` routing table — because that shape (always-on rules, contextually
loaded skills, specialist agents, auto-executing hooks) is a good one, as
verified in the sibling `PatientBooking.App` and `HotelListing.App` projects.

**No text was copied.** Every rule, agent, skill, hook script, and knowledge
doc here was written from scratch for this stack. dotnet-claude-kit is
ASP.NET Core / EF Core / Roslyn-MCP specific — none of that content applies to
a client-only React SPA. Only the organizational pattern and frontmatter
conventions (`alwaysApply` for rules, `name`/`description`/`memory` for
agents, `name`/`description` with "Use when:" triggers for skills) were
reused. No upstream LICENSE file is included because no upstream content is
redistributed here.

## What's deliberately different from the .NET kit

- **No MCP server.** dotnet-claude-kit leans on a Roslyn Navigator MCP server
  for symbol lookup, diagnostics, and dependency graphs. There's no TypeScript
  equivalent wired up here — agents and skills use `Grep`/`Glob`/`Read` plus
  `tsc --noEmit` and `eslint` for diagnostics instead.
- **Fewer skills, on purpose.** The .NET kit ships 47 skills covering EF Core,
  Docker, Aspire, messaging, auth, API versioning, etc. — none of it applies
  to a static site with no backend. This kit keeps the skills that are either
  genuinely stack-relevant (animations, accessibility, state-management,
  scaffold, ci-cd) or stack-agnostic Claude Code workflow skills (spec, plan,
  verify, checkpoint, wrap-up) worth keeping regardless of language.
- **Two new first-class concerns the .NET kit had no reason to cover:**
  `rules/animations.md` + `skills/animations/` (compositor-only CSS, View
  Transitions — directly from `Plans.txt`'s "Performant transformations only"
  requirement) and `rules/accessibility.md` + `skills/accessibility/` (no
  backend auth/authz to audit, but a public GH Pages site still needs
  semantic HTML, keyboard support, and contrast — especially given the
  monochrome-plus-accent palette in `Plans.txt`).
- **Stack decisions baked in**, captured as ADRs in `knowledge/decisions/`:
  feature-folder-per-calculator, React Router (Declarative Mode) with View
  Transitions for calculator switches, Vitest + React Testing Library for
  tests, and a pure-TS-logic / React-view boundary — the same "simulation
  code stays framework-free" doctrine already used for this user's Godot/C#
  projects, applied here to calculator math vs. presentation components.

## How to reuse this in another Vite/React project

Copy `.claude/` and the root `AGENTS.md` + `CLAUDE.md`. Adjust
`knowledge/decisions/` and `rules/architecture.md` if the target project's
routing or state-management choices differ — those two are specific to this
app's decisions, not universal defaults.
