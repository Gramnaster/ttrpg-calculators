# Hooks

This directory contains three kinds of scripts. Only the first kind runs
automatically through Claude Code.

## Claude Code hooks (declared in `.claude/settings.json`)

These receive the hook payload as JSON on stdin and run automatically while
Claude works (`hooks.json` in this folder is a reference copy of the same
config — `settings.json` is the one Claude Code actually reads):

| Script | Event | Purpose |
|---|---|---|
| `pre-bash-guard.sh` | PreToolUse (Bash) | Blocks destructive commands (force push, `git reset --hard`, unsafe `rm -rf`) |
| `post-edit-format.sh` | PostToolUse (Edit\|Write) | Runs Prettier + ESLint `--fix` on edited `.ts`/`.tsx`/`.css`/`.json`/`.md` files |
| `post-scaffold-install.sh` | PostToolUse (Edit\|Write) | Runs `pnpm install` after `package.json` changes |

## Git pre-commit hooks (install manually)

These are standard git hooks, not Claude Code hooks. Wire them into your
repo's pre-commit hook:

| Script | Purpose |
|---|---|
| `pre-commit-format.sh` | Fails the commit if `prettier --check .` finds issues |
| `pre-commit-antipattern.sh` | Blocks commits with layout-triggering CSS animation, `any` types, stray `console.log`, or `dangerouslySetInnerHTML` in staged files |

```bash
# One-time setup per clone — .git/hooks/pre-commit
#!/usr/bin/env bash
bash .claude/hooks/pre-commit-format.sh && bash .claude/hooks/pre-commit-antipattern.sh
```

## Utility scripts (invoked by commands and workflows)

Run these directly or let kit skills (`verify`, `tdd`) invoke them:

| Script | Usage |
|---|---|
| `pre-build-validate.sh` | `bash hooks/pre-build-validate.sh [project-dir]` — checks project structure (package.json, tsconfig, vite config, eslint config, calculator test coverage) |
| `post-test-analyze.sh` | `pnpm test 2>&1 \| bash hooks/post-test-analyze.sh` — summarizes Vitest results with actionable next steps |
