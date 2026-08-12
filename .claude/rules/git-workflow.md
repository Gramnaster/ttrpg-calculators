---
alwaysApply: true
description: >
  Enforces conventional commits, branch naming, atomic commits, and PR
  verification workflow.
---

# Git Workflow Rules

## Commit Messages

- **DO** use conventional commit prefixes: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `style:`, `perf:`.
  Rationale: Enables scannable git history and, if this ever grows changelogs, automated ones.

- **DO** write the commit body to explain "why", not "what". The diff shows what changed.
  Rationale: Future readers need motivation and context, not a narration of the code changes.

- **DON'T** write vague messages like "fix bug" or "update code".
  Rationale: Useless in git log. Every commit message should be greppable and meaningful.

## Branch Naming

- **DO** use prefixed branch names: `feature/`, `fix/`, `refactor/`.
  Rationale: Prefixes make branch purpose obvious in listings.

- **DON'T** use personal or opaque branch names like `my-branch` or `wip`.

## Atomic Commits

- **DO** make one logical change per commit. A calculator's logic and its tests belong together.
  Rationale: Atomic commits enable clean reverts and bisects — especially valuable for isolating which change broke a specific calculator's math.

- **DON'T** bundle unrelated changes (e.g. a new calculator plus an unrelated CI tweak) in a single commit.

## Branch Safety

- **DON'T** force-push to main. Ever.
- **DON'T** skip pre-commit hooks with `--no-verify`.
  Rationale: The pre-commit hooks here (`hooks/pre-commit-format.sh`, `hooks/pre-commit-antipattern.sh`) catch formatting drift and the layout-property-animation antipattern this app specifically cares about (see `rules/animations.md`). Bypassing them defeats the one automated check for that requirement.

## PR Process

- **DO** run `npm run verify` (or the `skills/verify` pipeline: lint + typecheck + test + build) before opening a PR.
- **DO** keep PRs focused — a new calculator, a fix, or a refactor, not a mix.
- **DO** confirm the GitHub Pages preview/build actually renders before merging (this is a visual, deployed app — a green CI run alone doesn't prove the page looks right).

## Quick Reference

| Action | Convention |
|---|---|
| New calculator | `feat: add opposed roll calculator` |
| Bug fix | `fix: correct BitD probability for 0-dice pools` |
| Refactor | `refactor: extract dice-notation parser from logic.ts` |
| Tests only | `test: add edge cases for zero and max dice pools` |
| Branch for feature | `feature/opposed-roll-calculator` |
| Branch for fix | `fix/bitd-zero-dice-probability` |
