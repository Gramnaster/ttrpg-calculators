---
alwaysApply: true
description: >
  Enforces correct interaction with pre-commit, post-edit, and post-test
  hooks. Never bypass hooks; investigate failures instead.
---

# Hook Rules

## Format Hooks

- **DO** auto-accept post-edit format hooks (Prettier/ESLint `--fix` via `hooks/post-edit-format.sh`). They enforce consistent style automatically.
- **DON'T** revert or undo formatting changes applied by hooks.

## Pre-Commit Hooks

- **DON'T** skip pre-commit hooks with `--no-verify`. Ever.
  Rationale: `hooks/pre-commit-format.sh` and `hooks/pre-commit-antipattern.sh` catch formatting drift and the specific antipatterns this project cares about most — layout-triggering CSS animations (see `rules/animations.md`), stray `any` types, and `dangerouslySetInnerHTML`.
- **DO** investigate and fix the root cause when a hook blocks a commit.

## Post-Test Analysis

- **DO** pipe test output through `hooks/post-test-analyze.sh` when running test workflows (`pnpm test 2>&1 | bash hooks/post-test-analyze.sh`) and act on its summary.

## Hook Infrastructure

- **DON'T** interfere with hook configuration. `pre-bash-guard.sh`, `post-edit-format.sh`, and `post-scaffold-install.sh` run automatically via `.claude/settings.json`; pre-commit scripts run via git. See `hooks/README.md` for the full map.
- **DO** wait for `post-scaffold-install.sh` to finish after `package.json` changes before running anything that needs the new dependency — `pnpm install` must complete before the package is resolvable.

## Quick Reference

| Hook | Correct Response |
|---|---|
| Post-edit format | Accept the changes |
| Pre-commit failure | Fix the issue, commit again |
| Post-test-analyze (manual pipe) | Read and act on insights |
| Post-scaffold-install | Wait for completion before running/building |
