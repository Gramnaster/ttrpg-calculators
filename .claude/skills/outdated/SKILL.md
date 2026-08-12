---
name: outdated
description: >
  Dependency health check — staleness, known vulnerabilities, and Node/tool
  version drift, worth running periodically on a hobby project that sits
  untouched for months at a time. Use when: "check dependencies",
  "outdated", "pnpm audit", "are we behind on packages".
---

# /outdated — Dependency Health Check

## Why This Matters More for This App Than Most

TTRPGCalculators is a side project likely to sit untouched for weeks or months between sessions (unlike an actively-staffed production app). That makes a periodic, deliberate dependency check worth doing — the alternative is discovering a major version has moved on (see `rules/packages.md`'s note on `react-router-dom` being removed entirely in a major bump) only when something unrelated breaks.

## Checks

### 1. Outdated Packages

```bash
pnpm outdated
```

Distinguish patch/minor bumps (usually safe to take immediately) from major bumps (read the changelog first — a major version can remove or rename packages entirely, as React Router did).

### 2. Known Vulnerabilities

```bash
pnpm audit
```

Address `high`/`critical` findings. For a client-only static bundle, a vulnerable dependency still ships to every visitor — this isn't a "only matters for backends" concern (`rules/security.md`).

### 3. Node Version Drift

Check the Node version pinned in `.github/workflows/deploy.yml` (`pnpm/setup`'s `runtime: node@22` input) against the current LTS and against what the installed packages actually require (`rules/packages.md`'s baseline table — verify it's still current, don't trust it blindly months later).

### 4. License Check (Light Touch)

For a personal open-source-adjacent project this is low-stakes, but a quick scan for anything under a non-permissive license is cheap insurance before it matters:

```bash
pnpm exec license-checker --summary   # if installed, or check manually for anything unusual
```

## Process

1. Run all three checks above.
2. Report findings grouped by urgency (vulnerability > major-version-behind > minor/patch-behind).
3. For anything proposed to upgrade, follow `rules/packages.md`: `pnpm add <name>` without a version pin (not a hand-typed version number), then run the full verify pipeline (`skills/verify`) to confirm nothing broke.
4. **Don't silently mass-upgrade.** A major version bump (React, React Router, Vite, Vitest) can change APIs this kit's own content assumes — flag it and update the relevant `rules/`/`skills/` content if the bump changes something documented here (e.g. if a future React Router version renames `viewTransition`).

## Report Format

```
## Dependency Health

### Vulnerabilities
- [none found] / [package@version: severity, pnpm audit --fix available: yes/no]

### Behind on Major Versions
- [none] / [package: installed X, latest Y — changelog: link]

### Behind on Minor/Patch (safe to take)
- react@19.2.3 → 19.2.8
- vitest@4.1.2 → 4.1.10

### Node Version
- CI pinned to Node 22 — still current LTS as of [check date]
```

## Related

- `rules/packages.md` — the always-active rule this skill's findings should be checked against
- `ci-cd` — where the Node version this skill audits is actually pinned
